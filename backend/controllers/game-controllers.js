const {
  generateRandomString,
  getXRandomItems,
  getRandomKey,
} = require("../controllers/common-controllers.js");
const {
  makeSpotifyRequest,
  clientCredentials,
} = require("../controllers/spotify-controllers.js");

let games = {};

const songQuestionType = "song";
const artistQuestionType = "artist";
const questionTypes = {
  [songQuestionType]: {
    prompt: "What song is this?",
  },
  [artistQuestionType]: {
    prompt: "Which artist(s) sang this song?",
  },
};

function createRoom(req, res) {
  const gameRules = req.body;
  const roomId = generateRandomString(6);
  const game = {
    id: roomId,
    gameRules: gameRules,
    players: {},
    questions: [],
    roundHistory: [],
    songBank: [],
    currentQuestionIndex: 0,
    hostPlayerId: req.cookies.playerId,
  };
  games[roomId] = game;
  console.log(`Created new room. ID: ${roomId}`);
  res.json({ roomId: roomId });
}

function getRoom(req, res) {
  if (!games.hasOwnProperty(req.params.roomId)) {
    return res.status(404).json({ error: "room not found" });
  }
  return res.json({
    id: req.params.roomId,
    gameRules: games[req.params.roomId].gameRules,
  });
}

async function generateGame(roomId) {
  const commonSongIds = new Set();
  let commonArtistIds = new Set();
  for (const [playerId, player] of Object.entries(games[roomId].players)) {
    for (const songId of player.topSongIds) {
      commonSongIds.add(songId);
    }
    for (const artistId of player.topArtistIds) {
      commonArtistIds.add(artistId);
    }
  }

  const accessToken = await clientCredentials();

  const songBankIds = new Set(commonSongIds);
  // Limit number of common artists per game
  commonArtistIds = new Set([...commonArtistIds].slice(0, 10));
  for (const artistId of commonArtistIds) {
    const artistTopTracks = await makeSpotifyRequest(
      `/artists/${artistId}/top-tracks`,
      accessToken,
      { market: "ES" },
    );
    for (const track of artistTopTracks.tracks) {
      songBankIds.add(track.id);
    }
  }

  // Grab up to 50 random songs (Spotify's limit for one single request)
  const selectedSongIds = getXRandomItems(songBankIds, 50);
  const trackResponse = await makeSpotifyRequest("/tracks", accessToken, {
    ids: selectedSongIds.join(","),
  });

  const allowExplicit = games[roomId].gameRules.allowExplicit;
  for (const song of trackResponse.tracks) {
    if (!allowExplicit && song.explicit === true) {
      continue;
    }
    if (song.preview_url !== null) {
      games[roomId].songBank.push({
        id: song.id,
        name: song.name,
        artist: song.artists[0].name,
        mp3Url: song.preview_url,
      });
    }
  }

  const rounds = games[roomId].gameRules.rounds;
  const questionSongs = getXRandomItems(games[roomId].songBank, rounds);
  games[roomId].questions = createQuestions(
    questionSongs,
    games[roomId].songBank,
  );
}

function createQuestions(questionSongs, songBank) {
  const questions = [];
  for (const questionSong of questionSongs) {
    const questionType = getRandomKey(questionTypes);
    // Flatten the song bank to one song per artist so the multiple choice for "artist" questions do not have duplicate answers
    const uniqueArtistSongBank = songBank.reduce(
      (uniqueSongsByArtist, item) => {
        const existingItem = uniqueSongsByArtist.find(
          (obj) => obj.artist === item.artist,
        );
        if (!existingItem) {
          uniqueSongsByArtist.push(item);
        }
        return uniqueSongsByArtist;
      },
      [],
    );
    const otherSongs = getXRandomItems(uniqueArtistSongBank, 3);
    let correctAnswer;
    let otherAnswerChoices;
    if (questionType === songQuestionType) {
      correctAnswer = questionSong.name;
      otherAnswerChoices = otherSongs.map((song) => song.name);
    } else if (questionType === artistQuestionType) {
      correctAnswer = questionSong.artist;
      otherAnswerChoices = otherSongs.map((song) => song.artist);
    }
    questions.push({
      questionType: questionType,
      prompt: questionTypes[questionType].prompt,
      songUrl: questionSong.mp3Url,
      correctAnswer: correctAnswer,
      answerChoices: [...otherAnswerChoices, correctAnswer],
    });
  }
  return questions;
}

async function addPlayerToGame(roomId, player) {
  if (!games.hasOwnProperty(roomId)) {
    throw new Error("Invalid roomId");
  }
  const { playerId, accessToken, displayName } = player;
  const topSongs = await makeSpotifyRequest(`/me/top/tracks`, accessToken, {
    limit: 50,
  });
  const topArtists = await makeSpotifyRequest(`/me/top/artists`, accessToken, {
    limit: 50,
  });
  const topSongIds = topSongs.items.map((song) => song.id);
  const topArtistIds = topArtists.items.map((artist) => artist.id);
  games[roomId].players[playerId] = {
    id: playerId,
    displayName: displayName,
    topSongIds: topSongIds,
    topArtistIds: topArtistIds,
    points: 0,
  };
  console.log(`player ${playerId} joined room ${roomId}`);
}

function getPlayers(roomId) {
  if (!games.hasOwnProperty(roomId)) {
    throw new Error("Invalid roomId");
  }
  const players = Object.values(games[roomId].players);
  // filter out info about players personal listening history
  const playersFiltered = players.map(
    ({ topSongIds, topArtistIds, ...other }) => other,
  );
  return playersFiltered;
}

function getHostPlayerId(roomId) {
  if (!games.hasOwnProperty(roomId)) {
    throw new Error("Invalid roomId");
  }
  return games[roomId].hostPlayerId;
}

function removePlayerFromGame(roomId, playerId) {
  if (games.hasOwnProperty(roomId)) {
    if (games[roomId].players.hasOwnProperty(playerId)) {
      delete games[roomId].players[playerId];
      console.log(`player ${playerId} removed from room ${roomId}`);
    }
  }
}

const startRound = (io, roomId) => {
  const game = games[roomId];
  const currentQuestion = game.questions[game.currentQuestionIndex];
  const sentQuestion = JSON.parse(JSON.stringify(currentQuestion));
  delete sentQuestion["correctAnswer"];
  io.to(roomId).emit("nextQuestion", sentQuestion);

  const roundDuration = game.gameRules.snippetLength;
  let timeLeft = roundDuration;
  const timer = setInterval(() => {
    io.to(roomId).emit("timerTick", { timeLeft });
    timeLeft--;

    if (timeLeft < 0) {
      clearInterval(timer);
      io.to(roomId).emit("roundEnded");

      setTimeout(() => {
        if (game.currentQuestionIndex < game.questions.length - 1) {
          game.currentQuestionIndex++;
          startRound(io, roomId);
        } else {
          endGame(io, roomId);
        }
      }, 5000);
    }
  }, 1000);
};

const endGame = (io, roomId) => {
  // TODO
};

function evaluatePlayerAnswer(roomId, playerId, answer) {
  const game = games[roomId];
  const currentQuestionIndex = game.currentQuestionIndex;
  const question = game.questions[currentQuestionIndex];
  const isCorrect = answer === question.correctAnswer;

  if (isCorrect) {
    if (!game.roundHistory[currentQuestionIndex]) {
      game.roundHistory[currentQuestionIndex] = { playerRankings: [] };
    }

    game.roundHistory[currentQuestionIndex].playerRankings.push(playerId);

    // Calculate points based on player rankings
    const highestPossiblePoints = Object.keys(game.players).length;
    const pointsToEarn =
      highestPossiblePoints -
      game.roundHistory[currentQuestionIndex].playerRankings.length;
    game.players[playerId].points += pointsToEarn;
  }
}

module.exports = {
  createRoom,
  getRoom,
  generateGame,
  addPlayerToGame,
  evaluatePlayerAnswer,
  startRound,
  endGame,
  removePlayerFromGame,
  getPlayers,
  getHostPlayerId,
};

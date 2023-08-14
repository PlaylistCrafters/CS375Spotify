const {
  generateRandomString,
  getXRandomItems,
  getRandomKey,
} = require("../controllers/common-controllers.js");
const { makeSpotifyRequest } = require("../controllers/spotify-controllers.js");

let games = {};

const songQuestionType = "song";
const artistQuestionType = "artist";
const questionTypes = {
  [songQuestionType]: {
    prompt: "What song is this?",
  },
  [artistQuestionType]: {
    prompt: "Which artist sang this song?",
  },
};

function createRoom(req, res) {
  const gameRules = req.gameRules;
  const roomId = generateRandomString(6);
  const game = {
    id: roomId,
    gameRules: gameRules,
    players: {},
    questions: [],
    roundHistory: [],
    songBank: [],
    currentQuestionIndex: 0,
  };
  games[roomId] = game;
  res.json({ roomId: roomId });
}

function generateGame(roomId) {
  // TODO generate questions according to all of the game rules
  // TODO get access token via client credentials flow: https://developer.spotify.com/documentation/web-api/tutorials/client-credentials-flow
  const commonSongIds = new Set();
  const commonArtistIds = new Set();
  for (const player of game[roomId].players) {
    for (const songId of player.topSongIds) {
      commonSongIds.add(songId);
    }
    for (const artistId of player.topArtistIds) {
      commonArtistIds.add(artistId);
    }
  }

  const songBankIds = new Set(commonSongIds);
  for (const artistId of commonArtistIds) {
    const artistTopTracks = makeSpotifyRequest(
      `/artists/${artistId}/top-tracks`,
      null,
      null,
      null,
    );
    for (const track of artistTopTracks) {
      songBankIds.add(track.id);
    }
  }

  // Grab up to 50 random songs (Spotify's limit)
  const selectedSongIds = getXRandomItems(songBankIds, 50);
  const trackResponse = makeSpotifyRequest("/tracks", {
    ids: selectedSongIds.join(","),
  });

  for (const song of trackResponse.tracks) {
    game[roomId].songBank.push({
      id: song.id,
      name: song.name,
      artist: song.artist,
      mp3Url: song.preview_url,
    });
  }

  const rounds = game[roomId].gameRules.rounds;
  const questionSongs = getXRandomItems(game[roomId].songBank, rounds);
  game[roomId].questions = createQuestions(questionSongs);
}

function createQuestions(questionSongs, songBank) {
  for (questionSong of questionSongs) {
    const questionType = getRandomKey(questionTypes);
    const otherSongs = getXRandomItems(songBank, 3);
    let correctAnswer;
    let answerChoices;
    if (questionType === songQuestionType) {
      correctAnswer = questionSong.name;
      answerChoices = otherSongs.map((song) => song.name);
    } else if (questionType === artistQuestionType) {
      correctAnswer = questionSong.artist;
      answerChoices = otherSongs.map((song) => song.artist);
    }
    questions.push({
      questionType: questionType,
      prompt: questionTypes[questionType].prompt,
      songUrl: questionSong.mp3Url,
      correctAnswer: correctAnswer,
      answerChoices: answerChoices,
    });
  }
}

function addPlayerToGame(roomId, player) {
  const { id, accessToken } = player;
  const topSongs = makeSpotifyRequest(
    `/me/top/tracks`,
    null,
    null,
    accessToken,
  );
  const topArtists = makeSpotifyRequest(
    `/me/top/artists`,
    null,
    null,
    accessToken,
  );
  const topSongIds = topSongs.map((song) => song.id);
  const topArtistIds = topArtists.map((artist) => artist.id);
  games[roomId].players[playerId] = {
    id: playerId,
    topSongIds: topSongIds,
    topArtistIds: topArtistIds,
    points: 0,
  };
}

const startRound = (socket, roomId) => {
  const game = games[roomId];
  const currentQuestion = game.questions[game.currentQuestionIndex];
  socket
    .to(roomId)
    .emit("roundStarted", {
      currentQuestionIndex: currentQuestionIndex,
      question: currentQuestion,
    });

  const roundDuration = game.gameRules.snippetLength;
  let timeLeft = roundDuration;
  const timer = setInterval(() => {
    socket.to(roomId).emit("timerTick", { timeLeft });
    timeLeft--;

    if (timeLeft < 0) {
      clearInterval(timer);
      socket.to(roomId).emit("roundEnded");

      setTimeout(() => {
        if (game.currentQuestionIndex < game.questions.length - 1) {
          game.currentQuestionIndex++;
          startRound(socket, roomId);
        } else {
          endGame(socket, roomId);
        }
      }, 5000);
    }
  }, 1000);
};

const endGame = (socket, roomId) => {
  // TODO
};

function evaluatePlayerAnswer(socket, roomId, playerId, answer, questionIndex) {
  const game = games[roomId];
  const question = game.questions[questionIndex];
  const isCorrect = answer === question.correctAnswer;

  if (isCorrect) {
    if (!game.roundHistory[questionIndex]) {
      game.roundHistory[questionIndex] = { playerRankings: [] };
    }

    game.roundHistory[questionIndex].playerRankings.push(playerId);

    // Calculate points based on player rankings
    const highestPossiblePoints = Object.keys(game.players).length;
    const pointsToEarn =
      highestPossiblePoints -
      game.roundHistory[questionIndex].playerRankings.length;
    game.players[playerId].points += pointsToEarn;
  }

  socket.to(roomId).emit("answerEvaluated", {
    playerId: playerId,
    isCorrect: isCorrect,
  });
}

module.exports = {
  createRoom,
  generateGame,
  addPlayerToGame,
  evaluatePlayerAnswer,
  startRound,
  endGame,
};

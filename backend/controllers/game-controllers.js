const {
  generateRandomString,
  getXRandomItems,
  getXRandomItem,
  getRandomKey,
  intersectArrays,
  extractListsByKey,
} = require("../controllers/common-controllers.js");
const {
  makeSpotifyRequest,
  clientCredentials,
} = require("../controllers/spotify-controllers.js");

function log(roomId, message) {
  console.log(`(roomId: ${roomId})`, message);
}

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
  const gameRules = req.body.gameRules;
  const hostPlayerId = req.body.playerId;
  const roomId = generateRandomString(6);
  const game = {
    id: roomId,
    gameRules: gameRules,
    players: {},
    questions: [],
    roundHistory: [],
    songBank: [],
    currentQuestionIndex: 0,
    hostPlayerId: hostPlayerId,
  };
  games[roomId] = game;
  log(roomId, "room created");
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
  log(roomId, "start generating game");

  const game = games[roomId];
  const allowExplicit = game.gameRules.allowExplicit;
  const rounds = game.gameRules.rounds;

  log(roomId, "preparing player songs and artists");
  const playerList = Object.values(game.players);
  const allPlayerTopSongs = extractListsByKey(playerList, "topSongIds");
  const allPlayerArtists = extractListsByKey(playerList, "topArtistIds");

  log(roomId, "getting common player songs and artists");
  const commonSongIds = intersectArrays(allPlayerTopSongs);
  let commonArtistIds = intersectArrays(allPlayerArtists);
  commonArtistIds = commonArtistIds.slice(0, 10); // Limit number of common artists per game to 10

  log(roomId, `${commonSongIds.length} songs in common`);
  log(roomId, `${commonArtistIds.length} artists in common`);

  const songBankIds = new Set(commonSongIds);

  if (commonSongIds.length < rounds || commonArtistIds.length < 6) {
    log(roomId, "getting top 50 US tracks");
    // If not enough song/artist options to choose from, choose from the Top 50 USA playlist
    const topUsPlaylistId = "37i9dQZEVXbLRQDuF5jeBp";
    const topUsPlaylistItems = await makeSpotifyRequest(
      `/playlists/${topUsPlaylistId}`,
      accessToken,
      {
        fields: "tracks.items(track(id))",
      },
    );
    for (const item of topUsPlaylistItems.tracks.items) {
      songBankIds.add(item.track.id);
    }
  }

  log(roomId, "getting common artists' top tracks");
  const accessToken = await clientCredentials();
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

  log(roomId, "getting track data");
  // Grab up to 50 random songs (Spotify's limit for one single request)
  const selectedSongIds = getXRandomItems(songBankIds, 50);
  const trackResponse = await makeSpotifyRequest("/tracks", accessToken, {
    ids: selectedSongIds.join(","),
  });

  log(roomId, "adding to song bank");
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

  log(roomId, "generating questions");
  const questionSongs = getXRandomItems(games[roomId].songBank, rounds);
  games[roomId].questions = createQuestions(
    questionSongs,
    games[roomId].songBank,
    roomId,
  );

  log(roomId, "finished generating game");
}

function createQuestions(questionSongs, songBank, roomId) {
  const questions = [];
  for (const questionSong of questionSongs) {
    log(roomId, `generating question ${questions.length + 1}`);
    const questionType = getRandomKey(questionTypes);
    const answerChoices = new Set();
    let correctAnswer;
    let answerAttr;
    if (questionType === songQuestionType) {
      correctAnswer = questionSong.name;
      answerChoices.add(correctAnswer);
      answerAttr = "name";
    } else if (questionType === artistQuestionType) {
      correctAnswer = questionSong.artist;
      answerChoices.add(correctAnswer);
      answerAttr = "artist";
    }

    log(roomId, `generating question ${questions.length + 1} answer choices`);
    while (answerChoices.size != 4) {
      const item = getXRandomItem(songBank);
      answerChoices.add(item[answerAttr]);
    }

    questions.push({
      questionType: questionType,
      prompt: questionTypes[questionType].prompt,
      songUrl: questionSong.mp3Url,
      correctAnswer: correctAnswer,
      answerChoices: Array.from(answerChoices).sort(() => Math.random() - 0.5), // Shuffle answer choice order
    });
  }
  return questions;
}

async function addPlayerToGame(roomId, player) {
  if (!games.hasOwnProperty(roomId)) {
    throw new Error("Invalid roomId");
  }
  const { playerId, accessToken, displayName } = player;

  let topSongIds;
  let topArtistIds;
  try {
    const topSongs = await makeSpotifyRequest(`/me/top/tracks`, accessToken, {
      limit: 50,
    });
    topSongIds = topSongs.items.map((song) => song.id);
  } catch (error) {
    topSongIds = [];
  }

  try {
    const topArtists = await makeSpotifyRequest(
      `/me/top/artists`,
      accessToken,
      {
        limit: 50,
      },
    );
    topArtistIds = topArtists.items.map((artist) => artist.id);
  } catch (error) {
    topArtistIds = [];
  }

  games[roomId].players[playerId] = {
    id: playerId,
    displayName: displayName,
    topSongIds: topSongIds,
    topArtistIds: topArtistIds,
    points: 0,
  };

  log(roomId, `player ${playerId} joined`);
}

function doesRoomExist(roomId) {
  return games.hasOwnProperty(roomId);
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
      log(roomId, `player ${playerId} left`);

      if (Object.keys(games[roomId].players).length === 0) {
        log(roomId, "no players left in room. removing game");
        delete games[roomId];
      }
    }
  }
}

const startRound = (io, roomId) => {
  if (!doesRoomExist(roomId)) {
    log(roomId, "game room no longer exists, exiting game flow");
    return;
  }
  const game = games[roomId];
  log(roomId, `starting round ${game.currentQuestionIndex + 1}`);
  const currentQuestion = game.questions[game.currentQuestionIndex];
  const sentQuestion = JSON.parse(JSON.stringify(currentQuestion));
  delete sentQuestion["correctAnswer"];
  io.to(roomId).emit("nextQuestion", sentQuestion);

  const roundDuration = game.gameRules.snippetLength;
  let timeLeft = roundDuration;
  const roundTimer = setInterval(() => {
    io.to(roomId).emit("timerTick", { timeLeft });
    timeLeft--;

    if (timeLeft < 0) {
      clearInterval(roundTimer);

      const playerRankings =
        game.roundHistory[game.currentQuestionIndex]?.playerRankings || [];
      const playersArray = Object.values(game.players);
      const updatedPlayers = playersArray.sort((a, b) => b.points - a.points);

      io.to(roomId).emit("roundEnded", {
        updatedPlayers: updatedPlayers,
        roundPlayerRankings: playerRankings,
      });

      let roundTransitionTimeLeft = 10;
      const roundTransitionTimer = setInterval(() => {
        io.to(roomId).emit("timerTick", {
          timeLeft: roundTransitionTimeLeft,
          correctAnswer: currentQuestion.correctAnswer,
        });

        roundTransitionTimeLeft--;

        if (roundTransitionTimeLeft < 0) {
          clearInterval(roundTransitionTimer);

          if (game.currentQuestionIndex < game.questions.length - 1) {
            game.currentQuestionIndex++;
            startRound(io, roomId);
          } else {
            endGame(io, roomId);
          }
        }
      }, 1000);
    }
  }, 1000);
};

function deleteRoom(roomId) {
  delete games[roomId];
}

const endGame = (io, roomId) => {
  deleteRoom(roomId);
  io.to(roomId).emit("finishGame");
  log(roomId, "game over");
};

function evaluatePlayerAnswer(roomId, playerId, answer) {
  const game = games[roomId];
  const currentQuestionIndex = game.currentQuestionIndex;
  const question = game.questions[currentQuestionIndex];
  const isCorrect = answer === question.correctAnswer;

  log(
    roomId,
    `evaluating player ${playerId} answer for round ${
      currentQuestionIndex + 1
    }`,
  );
  if (isCorrect) {
    if (!game.roundHistory[currentQuestionIndex]) {
      game.roundHistory[currentQuestionIndex] = { playerRankings: [] };
    }

    game.roundHistory[currentQuestionIndex].playerRankings.push(playerId);

    // Calculate points based on player rankings
    const highestPossiblePoints = Object.keys(game.players).length + 1;
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
  doesRoomExist,
};

const {
  generateRandomString,
  getXRandomItems,
  getXRandomItem,
  getRandomKey,
} = require("../controllers/common-controllers.js");
const {
  makeSpotifyRequest,
  clientCredentials,
} = require("../controllers/spotify-controllers.js");

let games = {};
let answered = 0;

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
    gameStarted: false,
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

    while (answerChoices.size != 4) {
      const item = getXRandomItem(songBank);
      answerChoices.add(item[answerAttr]);
    }

    questions.push({
      questionType: questionType,
      prompt: questionTypes[questionType].prompt,
      songUrl: questionSong.mp3Url,
      correctAnswer: correctAnswer,
      answerChoices: Array.from(answerChoices).sort(() => Math.random() - 0.5), // Shuffle answer choices
    });
  }
  return questions;
}

async function addPlayerToGame(roomId, player, socketId) {
  if (!games.hasOwnProperty(roomId)) {
    throw new Error("Invalid roomId");
  }
  if (games[roomId].gameStarted) {
    throw new Error("Game is already in prgoress");
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
    socketId: socketId,
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
  let game = games[roomId];
  const currentQuestion = game.questions[game.currentQuestionIndex];
  const sentQuestion = JSON.parse(JSON.stringify(currentQuestion));
  delete sentQuestion["correctAnswer"];
  io.to(roomId).emit("nextQuestion", sentQuestion);
  game["gameStarted"] = true;
  console.log(game["gameStarted"]);

  const roundDuration = game.gameRules.snippetLength;
  let timeLeft = roundDuration;
  const roundTimer = setInterval(() => {
    io.to(roomId).emit("timerTick", { timeLeft });
    timeLeft--;

    if (timeLeft < 0 || answered === Object.values(game.players).length) {
      clearInterval(roundTimer);
      answered = 0;

      const playerRankings =
        game.roundHistory[game.currentQuestionIndex]?.playerRankings || [];
      const playersArray = Object.values(game.players);
      const updatedPlayers = playersArray.sort((a, b) => b.points - a.points);
      io.to(roomId).emit("roundEnded", {
        updatedPlayers: updatedPlayers,
        roundPlayerRankings: playerRankings,
      });

      // Calculate player multipliers based on points
      const playerMultipliers = updatedPlayers.map(
        (player, index) => updatedPlayers.length - index,
      );

      // Determine which player gets a powerup
      let playerWithPowerupIndex = null;
      let highestRoll = -1;

      for (let i = 0; i < playerMultipliers.length; i++) {
        const playerRoll = Math.floor(
          Math.random() * (6 * playerMultipliers[i] + 1),
        );
        if (playerRoll > highestRoll) {
          highestRoll = playerRoll;
          playerWithPowerupIndex = i;
        }
      }

      if (playerWithPowerupIndex !== null) {
        console.log("Player with powerup index:", playerWithPowerupIndex);
        // Determine the powerup type for the chosen player
        const playerId = updatedPlayers[playerWithPowerupIndex].id;
        const powerupType = rollForPowerupType();
        if (powerupType) {
          // Give the chosen player the determined powerup and emit the event
          givePlayerPowerup(io, game, playerId, powerupType);
          
          /*
          const powerupResult = givePlayerPowerup(game, playerId, powerupType);
          if (powerupResult) {
            console.log("Emitting powerupResult to playerReceivedPowerup");
            io.to(playerId).emit("playerReceivedPowerup", powerupResult);
          }
          */
        }
      }

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

const endGame = (io, roomId) => {
  delete games[roomId];
  io.to(roomId).emit("finishGame");
};

function evaluatePlayerAnswer(roomId, playerId, answer) {
  const game = games[roomId];
  const currentQuestionIndex = game.currentQuestionIndex;
  const question = game.questions[currentQuestionIndex];
  const isCorrect = answer === question.correctAnswer;
  answered += 1;

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

const givePlayerPowerup = (game, playerId, powerupType) => {
  console.log("Entering givePlayerPowerup function");
  console.log("powerupType:", powerupType);
  console.log("playerId:", playerId);
  //const player = game.players[playerId];
  //player.powerup = powerupType;
  //return { playerId, powerupType };
  const socketId = game.players[playerId].socketId;
  game.players[playerId].powerup = powerupType;
  io.to(socketId).emit("playerReceivedPowerup", { playerId, powerupType });
};

const rollForPowerupType = () => {
  const d20Roll = Math.floor(Math.random() * 20) + 1;
  if (d20Roll >= 1 && d20Roll <= 14) {
    return "reduceChoices";
  } else if (d20Roll >= 15 && d20Roll <= 19) {
    return "pointMultiplier";
  } else {
    return "matchTopUser";
  }
};

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
  rollForPowerupType,
  givePlayerPowerup,
};

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
  };
  games[roomId] = game;
  res.json({ roomId: roomId });
}

function getRoom(req, res) {
  if (!games.hasOwnProperty(req.params.roomId)) {
    return res.status(404).json({ error: "room not found" });
  }
  return res.json({ id: roomId, gameRules: games[req.query.roomId].gameRules });
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
  if (!game.hasOwnProperty(roomId)) {
    throw new Error("Invalid roomId");
  }
  const accessToken = player.accessToken;
  const playerId = player.id;
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

module.exports = {
  createRoom,
  getRoom,
  addPlayerToGame,
};

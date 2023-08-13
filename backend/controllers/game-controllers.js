const {
  generateRandomString,
  getXRandomItems,
} = require("../controllers/common-controllers.js");
const { makeSpotifyRequest } = require("../controllers/spotify-controllers.js");

let games = {};

function createRoom(req, res) {
  const gameRules = req.gameRules;
  const roomId = generateRandomString(6);
  const game = {
    id: roomId,
    gameRules: gameRules,
    points: {},
    questions: [],
    userData: {},
    songBank: [],
  };
  games[roomId] = game;
  res.json({ roomId: roomId });
}

function generateGame(roomId) {
  // TODO generate questions according to all of the game rules
  // TODO get access token via client credentials flow: https://developer.spotify.com/documentation/web-api/tutorials/client-credentials-flow
  const commonSongIds = new Set();
  const commonArtistIds = new Set();
  for (const userData of game[roomId].userData) {
    for (const songId of userData.topSongIds) {
      commonSongIds.add(songId);
    }
    for (const artistId of userData.topArtistIds) {
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
      previewUrl: song.preview_url,
    });
  }

  const rounds = game[roomId].gameRules.rounds;
  const questionSongs = getXRandomItems(game[roomId].songBank, rounds);
  game[roomId].questions = createQuestions(questionSongs);
}

function createQuestions(questionSongs, songBank) {
  // TODO loop through these questionSongs to create question objects
  // TODO use songBank to get multiple choice options
}

function addPlayerToGame(roomId, player) {
  const { playerId, accessToken } = player;
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
  games[roomId].userData[playerId] = {
    topSongIds: topSongIds,
    topArtistIds: topArtistIds,
  };
}

function evaluatePlayerAnswer(roomId, playerId, answer) {
  // TODO do evaluate player answer, give points if correct
}

module.exports = {
  createRoom,
  addPlayerToGame,
  evaluatePlayerAnswer,
};

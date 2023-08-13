const { generateRandomString } = require("../controllers/common-controllers.js");

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
    }
    games[roomId] = game;
    res.json({roomId: roomId});
};

function generateGame(roomId) {
    // TODO grab common songs from userData "topSongs"
    // TODO grab common artists from userData "topArtists" and get the top songs from those artists
    // TODO generate questions according to the game rules
}

function addPlayerToGame(roomId, playerId) {
    // TODO pull songs from player's top spotify list and artists
    // TODO add a new object to games[roomId].userData: {topSongs: [], topArtists: []}
}

module.exports = {
    createRoom,
};

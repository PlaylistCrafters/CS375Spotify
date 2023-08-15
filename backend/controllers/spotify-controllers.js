const {
  generateRandomString,
} = require("../controllers/common-controllers.js");

const axios = require("axios");
const querystring = require("node:querystring");

const BASE_URL = "https://api.spotify.com/v1";

const client_id = process.env.CLIENT_ID;
const client_secret = process.env.CLIENT_SECRET;
const serverProtocol = process.env.SERVER_PROTOCOL;
const serverHost = process.env.SERVER_HOST;
const serverPort = process.env.SERVER_PORT;
const clientProtocol = process.env.CLIENT_PROTOCOL;
const clientHost = process.env.CLIENT_HOST;
const clientPort = process.env.CLIENT_PORT;
const redirect_uri = `${serverProtocol}${serverHost}:${serverPort}/callback`

async function makeSpotifyRequest(endpoint, accessToken, queryParams = {}) {
  let url = BASE_URL + endpoint;

  if (queryParams !== null || Object.keys(queryParams).length === 0) {
    url += `?${querystring.stringify(queryParams)}`;
  }

  let config = {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  };

  try {
    const response = await axios.get(url, config);
    return response.data;
  } catch (error) {
    console.error("Error fetching data from Spotify API:", error.message);
    throw error;
  }
}

const authorize = (req, res) => {
  const state = generateRandomString(16);
  const scope = "user-read-private user-top-read";

  res.redirect(
    "https://accounts.spotify.com/authorize?" +
      querystring.stringify({
        response_type: "code",
        client_id: client_id,
        scope: scope,
        redirect_uri: redirect_uri,
        state: state,
      }),
  );
};

const callback = async (req, res) => {
  const code = req.query.code || null;
  const state = req.query.code || null;

  if (state === null) {
    res.redirect(
      "/#" +
        querystring.stringify({
          error: "state_mismatch",
        }),
    );
  } else {
    const authOptions = {
      url: "https://accounts.spotify.com/api/token",
      method: "post",
      data: querystring.stringify({
        code: code,
        redirect_uri: redirect_uri,
        grant_type: "authorization_code",
      }),
      headers: {
        Authorization:
          "Basic " +
          Buffer.from(`${client_id}:${client_secret}`).toString("base64"),
        "Content-Type": "application/x-www-form-urlencoded",
      },
    };

    axios(authOptions)
      .then(async (response) => {
        makeSpotifyRequest("/me", response.data.access_token, null)
          .then((userData) => {
            res.cookie("accessToken", response.data.access_token, {
              maxAge: response.data.expires_in * 1000,
              secure: true,
            });
            res.cookie("playerId", userData.id, {
              maxAge: response.data.expires_in * 1000,
              secure: true,
            });
            res.cookie("displayName", userData.display_name, {
              maxAge: response.data.expires_in * 1000,
              secure: true,
            });

            res.redirect(`${clientProtocol}${clientHost}:${clientPort}/`)
          })
          .catch((error) => {
            console.error("Error getting user profile: ", error);
            throw error;
          });
      })
      .catch((error) => {
        console.error("Error connecting with spotify: ", error);
        res.status(500).send("Error connecting with spotify");
      });
  }
};

const clientCredentials = async () => {
  const authOptions = {
    url: "https://accounts.spotify.com/api/token",
    method: "post",
    data: querystring.stringify({
      grant_type: "client_credentials",
    }),
    headers: {
      Authorization:
        "Basic " +
        Buffer.from(`${client_id}:${client_secret}`).toString("base64"),
    },
    json: true,
  };

  try {
    const response = await axios(authOptions);
    return response.data.access_token;
  } catch (error) {
    console.error(
      "Error fetching client credentials access token from Spotify:",
      error.message,
    );
    throw error;
  }
};

module.exports = {
  authorize,
  callback,
  makeSpotifyRequest,
  clientCredentials,
};

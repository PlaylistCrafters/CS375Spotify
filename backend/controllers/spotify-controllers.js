require("dotenv").config();

const client_id = process.env.CLIENT_ID;

const axios = require("axios");

const BASE_URL = "https://api.spotify.com/v1";
const redirect_uri = "http://localhost:3000/";
const querystring = require("node:querystring");

function generateRandomString(len) {
  let text = "";
  let possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (let i = 0; i < len; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }

  return text;
}

function makeSpotifyRequest(endpoint, queryParams, body, accessToken) {
  let url = BASE_URL + "/" + endpoint;
  if (queryParams != null) {
    //let formattedQueryParams = "?" + <queryParams is a object of key/value pairs, format into a string where each key/value pair is separated by &>
    for (const key in queryParams) {
      url += `?${key}=${queryParams[key]}`;
    }
  }
}

const authorize = (req, res) => {
  const state = generateRandomString(16);
  const scope = "user-read-private user-read-email";

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

module.exports = {
  authorize,
};

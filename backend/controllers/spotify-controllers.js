require("dotenv").config();

const client_id = process.env.CLIENT_ID;
const client_secret = process.env.CLIENT_SECRET;

const axios = require("axios");

const BASE_URL = "https://api.spotify.com/v1";
const redirect_uri = "http://localhost:3001/callback";
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
      .then((response) => {
        const access_token = response.data.access_token;

        //TODO: we have the access token now, how do we want to pass/store it

        res.redirect("http://localhost:3000/");
      })
      .catch((error) => {
        console.error("Error getting access token:", error);
        res.status(500).send("Error getting access token");
      });
  }
};

module.exports = {
  authorize,
  callback,
};

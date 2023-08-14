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

const makeSpotifyRequest = (
  endpoint,
  queryParams = {},
  body = {},
  access_token,
) => {
  let url = BASE_URL + endpoint;

  if (queryParams != null) {
    url += querystring.stringify(queryParams);
  }

  let config = {
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
  };

  axios
    .get(url, config)
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      console.error(error);
    });
};

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
      .then((response) => {
        res.cookie("accessToken", response.data.access_token, {
          maxAge: response.data.expires_in,
          secure: true,
        });
        res.redirect("/");
      })
      .catch((error) => {
        console.error("Error getting access token:", error);
        res.status(500).send("Error getting access token");
      });
  }
};

const clientCredentials = () => {
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

  axios(authOptions)
    .then((response) => {
      return response.data.access_token;
    })
    .catch((error) => {
      return null;
    });
};

module.exports = {
  authorize,
  callback,
};

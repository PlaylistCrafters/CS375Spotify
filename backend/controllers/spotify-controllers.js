const axios = require("axios");
const querystring = require("node:querystring");

const BASE_URL = "https://api.spotify.com/v1";

const client_id = process.env.CLIENT_ID;
const client_secret = process.env.CLIENT_SECRET;

async function makeSpotifyRequest(endpoint, accessToken, queryParams = {}) {
  let url = BASE_URL + endpoint;

  if (queryParams !== null && Object.keys(queryParams).length !== 0) {
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
    if (error.response) {
      console.log(error.response.data);
    }
    throw error;
  }
}

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
  makeSpotifyRequest,
  clientCredentials,
};

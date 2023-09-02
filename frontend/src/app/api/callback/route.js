import { NextResponse } from "next/server";
import querystring from "querystring";

const BASE_URL = "https://api.spotify.com/v1";

const client_id = process.env.CLIENT_ID;
const client_secret = process.env.CLIENT_SECRET;
const clientProtocol = process.env.CLIENT_PROTOCOL;
const clientHost = process.env.CLIENT_HOST;
const clientPort = process.env.CLIENT_PORT;
const redirect_uri = `${clientProtocol}${clientHost}:${clientPort}/api/callback`;
const axios = require("axios");

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
    throw error;
  }
}

export async function GET(req, res) {
  let accessToken;
  let playerId;
  let displayName;
  let expiresIn;
  const { searchParams } = new URL(req.url);

  const code = searchParams.get("code");
  const state = searchParams.get("state");

  if (state === null) {
    return NextResponse.redirect(
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

    try {
      const response = await axios(authOptions);
      const userData = await makeSpotifyRequest(
        "/me",
        response.data.access_token,
        null,
      );

      accessToken = response.data.access_token;
      playerId = userData.id;
      displayName = userData.display_name;
      expiresIn = response.data.expires_in;

      const nextRes = NextResponse.redirect(
        `${clientProtocol}${clientHost}:${clientPort}/`,
        { status: 302 },
      );

      nextRes.cookies.set({
        name: "accessToken",
        value: accessToken,
        maxAge: expiresIn * 1000,
        domain: clientHost,
      });
      nextRes.cookies.set({
        name: "playerId",
        value: playerId,
        maxAge: expiresIn * 1000,
        domain: clientHost,
      });
      nextRes.cookies.set({
        name: "displayName",
        value: displayName,
        maxAge: expiresIn * 1000,
        domain: clientHost,
      });

      return nextRes;
    } catch (error) {
      console.error("Error connecting with Spotify: ", error);
      const headers = req.headers;
      const newResponse = NextResponse({
        body: "Error connecting with Spotify",
        status: 500,
        headers,
      });
      return newResponse;
    }
  }
}

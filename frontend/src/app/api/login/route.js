import { NextResponse } from "next/server";
import querystring from "querystring";

const client_id = process.env.CLIENT_ID;
const clientProtocol = process.env.CLIENT_PROTOCOL;
const clientHost = process.env.CLIENT_HOST;
const clientPort = process.env.CLIENT_PORT;
const redirect_uri = `${clientProtocol}${clientHost}:${clientPort}/api/callback`;

function generateRandomString(len) {
  let text = "";
  let possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (let i = 0; i < len; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }

  return text;
}

export async function GET(req, res) {
  const state = generateRandomString(16);
  const scope = "user-read-private user-top-read";

  const authUrl =
    "https://accounts.spotify.com/authorize?" +
    querystring.stringify({
      response_type: "code",
      client_id: client_id,
      scope: scope,
      redirect_uri: redirect_uri,
      state: state,
    });

  return NextResponse.redirect(authUrl);
}

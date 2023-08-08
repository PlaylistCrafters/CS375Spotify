const axios = require("axios");

const BASE_URL = "https://api.spotify.com/v1";

function generateRandomString(len) {
    let text = "";
    let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"

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

        //TODO: Spotify uses Authorization header for auth, set proper headers
    }

    console.log(url);
    // Use axios to make request to Spotify
}

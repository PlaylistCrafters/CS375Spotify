"use client";

import React, { useState, useEffect } from "react";
import styles from "./page.module.css";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const serverProtocol = process.env.SERVER_PROTOCOL;
  const serverHost = process.env.SERVER_HOST;
  const serverPort = process.env.SERVER_PORT;
  const clientProtocol = process.env.CLIENT_PROTOCOL;
  const clientHost = process.env.CLIENT_HOST;
  const clientPort = process.env.CLIENT_PORT;

  useEffect(() => {
    const accessToken = Cookies.get("accessToken");
    setIsAuthenticated(!!accessToken);
    setIsLoading(false);
  }, []);


  let joinAudio = new Audio('https://vgmsite.com/soundtracks/nintendo-switch-sound-effects/kevbxvla/User.mp3');
  let loginAudio = new Audio('https://vgmsite.com/soundtracks/nintendo-switch-sound-effects/cusagemg/Controller.mp3');
  let createAudio = new Audio('https://vgmsite.com/soundtracks/nintendo-switch-sound-effects/ovvkjyda/Home.mp3');

  const handleRedirect = (redirectTo) => {
    if (redirectTo === "/api/login") {
      loginAudio.play();
    }
    else if (redirectTo === '/join') {
      joinAudio.play();
    }
    else {
      createAudio.play();
    }
    router.push(redirectTo);
  };

  if (isLoading) {
    // Returning a blank screen until we have checked if the user is authenticated
    return <div></div>;
  }

  return (
    <main className={styles.main}>
      <div className={styles.header}>Song Showdown</div>
      <div className={styles.subHeader}>
        Invite your friends to a song showdown! Create or join a game room and
        challenge other players. Compete in real-time to see who can correctly
        answer questions about song titles and artists, all while racing against
        the clock.
      </div>

      {isAuthenticated ? (
        <div>
          <button
            className={styles.button}
            id="create"
            onClick={() => handleRedirect("/create")}
          >
            Create Room
          </button>
          <button
            className={styles.button}
            id="join"
            onClick={() => handleRedirect("/join")}
          >
            Join Room
          </button>
        </div>
      ) : (
        <button
          className={styles.button}
          id="login"
          onClick={() => handleRedirect("/api/login")}
        >
          Login with Spotify
        </button>
      )}
    </main>
  );
}

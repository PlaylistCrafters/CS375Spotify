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

  useEffect(() => {
    const accessToken = Cookies.get("accessToken");
    setIsAuthenticated(!!accessToken);
    setIsLoading(false);
  }, []);

  const handleRedirect = (redirectTo) => {
    router.push(redirectTo);
  };

  if (isLoading) {
    // Returning a blank screen until we have checked if the user is authenticated
    return <div></div>;
  }

  return (
    <main className={styles.main}>
      <h1 className={styles.header}>Song Showdown</h1>
      <h2 className={styles.header}>
        Invite your friends to a song showdown! Create or join a game room and
        challenge other players. Compete in real-time to see who can correctly
        answer questions about song titles and artists, all while racing against
        the clock.
      </h2>

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
          id="join"
          onClick={() =>
            handleRedirect(`${serverProtocol}${serverHost}:${serverPort}/login`)
          }
        >
          Login with Spotify
        </button>
      )}
    </main>
  );
}

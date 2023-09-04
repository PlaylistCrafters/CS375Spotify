import styles from "./LobbyScreen.module.css";
import React, { useEffect, useState } from "react";

const LobbyScreen = ({ players, startGameFunc, isHost, roomId }) => {
  const [playerColors, setPlayerColors] = useState([]);
  const [music, setMusic] = useState(null);

  const setRandomColor = () => {
    const colors = [
      "#f6454d",
      "#9267ff",
      "#46c6f7",
      "#50ca8d",
      "#ffd452",
      "#ff9352",
    ];
    var randomIndex = Math.floor(Math.random() * colors.length);
    return colors[randomIndex];
  };

  useEffect(() => {
    const audio = new Audio(
      "https://vgmsite.com/soundtracks/wii-sports-wii/avkrzklape/09%20Tennis%20%28Select%20Position%29.mp3",
    );
    setMusic(audio);

    audio.play();

    return () => {
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
    };
  }, []);

  useEffect(() => {
    const replayMusicOnEnd = () => {
      if (music) {
        music.currentTime = 0;
        music.play();
      }
    };

    if (music) {
      music.addEventListener("ended", replayMusicOnEnd);
    }

    return () => {
      if (music) {
        music.removeEventListener("ended", replayMusicOnEnd);
      }
    };
  }, [music]);

  useEffect(() => {
    let playerJoinAudio = new Audio(
      "https://vgmsite.com/soundtracks/nintendo-switch-sound-effects/kwjiznam/Eshop.mp3",
    );
    const updatedColors = { ...playerColors };

    players.forEach((player) => {
      if (!updatedColors[player.displayName]) {
        updatedColors[player.displayName] = setRandomColor();
        playerJoinAudio.play();
      }
    });

    setPlayerColors(updatedColors);
  }, [players]);

  return (
    <main>
      <div>
        <h1 className={styles.header}>ID: {roomId}</h1>
        <div>
          {isHost && (
            <button onClick={startGameFunc} className={styles.start}>
              Start Game
            </button>
          )}
        </div>
      </div>
      <ul>
        {players.map((player, index) => (
          <li
            className={styles.user}
            style={{ color: playerColors[player.displayName] }}
            key={index}
          >
            {player.displayName}
          </li>
        ))}
      </ul>
    </main>
  );
};

export default LobbyScreen;

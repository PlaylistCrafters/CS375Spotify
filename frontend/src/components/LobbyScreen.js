import styles from "./LobbyScreen.module.css";
import React, { useEffect, useState } from "react";

const LobbyScreen = ({ players, startGameFunc, isHost, roomId }) => {
  const [playerColors, setPlayerColors] = useState([]);

  const setRandomColor = () => {
    const colors = [
      "#f6454d",
      "#9267ff",
      "#46c6f7",
      "#50ca8d",
      " #ffd452",
      " #ff9352",
    ];
    var randomIndex = Math.floor(Math.random() * colors.length);
    return colors[randomIndex];
  };

  useEffect(() => {
    const randomColors = players.map(() => setRandomColor());
    setPlayerColors(randomColors);
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
            style={{ color: playerColors }}
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

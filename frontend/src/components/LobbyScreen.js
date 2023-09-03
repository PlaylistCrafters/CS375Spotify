import styles from "./LobbyScreen.module.css";

const LobbyScreen = ({ players, startGameFunc, isHost, roomId }) => {
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
          <li className={styles.user} key={index}>
            {player.displayName}
          </li>
        ))}
      </ul>
    </main>
  );
};

export default LobbyScreen;

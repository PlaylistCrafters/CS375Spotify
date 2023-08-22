const LobbyScreen = ({ players, startGameFunc, isHost }) => {
  return (
    <div>
      <h1>Lobby Screen</h1>
      <ul>
        {players.map((player, index) => (
          <li key={index}>{player.displayName}</li>
        ))}
      </ul>
      <div>{isHost && <button onClick={startGameFunc}>Start Game</button>}</div>
    </div>
  );
};

export default LobbyScreen;

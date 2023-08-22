const LobbyScreen = ({ players, startGameFunc, isHost }) => {
  // TODO display players
  // TODO if current user is the host, then display a button to start the game

  console.log(isHost);

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

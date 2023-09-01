import "./RoundResultScreen.css";

const RoundResultsScreen = ({
  players,
  roundResult,
  currentUserPlayerId,
  timer,
  correctAnswer,
  powerupStatus,
}) => {
  
  const activatePowerup = () => {
        console.log("Activate Powerup button clicked");
        socket.emit("activatePowerup", {
            playerId: currentUserPlayerId,
            powerupType: powerupStatus,
        });
    };

    const currentPlayer = players.find((player) => player.id === currentUserPlayerId);
    const playerScore = currentPlayer ? currentPlayer.points : 0;
    console.log("powerupStatus:", powerupStatus);
  
  return (
    <div>
      <h2>Round Results</h2>
      <div>Time Left: {timer} seconds</div>
      <div>Correct Answer: {correctAnswer}</div>
      <ul>
        {players.map((player) => (
          <li key={player.id}>
            {player.displayName}: {player.points} points <br />
            {roundResult &&
            player.id === currentUserPlayerId &&
            roundResult.includes(player.id) ? (
              <span className="green-indicator">Correct</span>
            ) : (
              <span className="red-indicator">Incorrect</span>
            )}
          </li>
        ))}
      </ul>
      <p>Your score: {playerScore} points</p>
            {powerupStatus && (
                <button onClick={activatePowerup}>Activate Powerup</button>
            )}
    </div>
  );
};

export default RoundResultsScreen;

import "./RoundResultScreen.css";

const RoundResultsScreen = ({
  players,
  roundResult,
  currentUserPlayerId,
  timer,
  correctAnswer,
}) => {
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
      {currentUserPlayerId && (
        <p>
          Your score:{" "}
          {players.find((player) => player.id === currentUserPlayerId)?.points}
        </p>
      )}
    </div>
  );
};

export default RoundResultsScreen;

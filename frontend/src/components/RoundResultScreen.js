import React from "react";
import "./RoundResultsScreen.css";
const RoundResultsScreen = ({ players, roundResult, currentUserPlayerId, socket }) => {
  // TODO display current leader board and also indicate if the current user got the answer correct
  const sortedPlayers = players.slice().sort((a, b) => b.points - a.points);
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setInterval(() => {
        setCountdown((prevCountdown) => prevCountdown - 1);
      }, 1000);
      
      return () => {
        clearInterval(timer);
      };
    }
  }, [countdown]);

  return (
    <div>
      <h2>Round Results</h2>
      <ul>
        {sortedPlayers.map((player) => (
          <li key={player.id}>
            {player.displayName}: {player.points} points
            {player.id === currentUserPlayerId && roundResult.correctPlayers.includes(player.id) ? (
              <span className="green-indicator">Correct</span>
            ) : (
              <span className="red-indicator">Incorrect</span>
            )}
          </li>
        ))}
      </ul>
      <p>Your score: {players.find((player) => player.id === currentUserPlayerId).points}</p>
    </div>
  );
};

export default RoundResultsScreen;

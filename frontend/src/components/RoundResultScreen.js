import React from "react";
import "./RoundResultsScreen.css";
const RoundResultsScreen = ({ players, roundResult, currentUserPlayerId }) => {
  const sortedPlayers = players.slice().sort((a, b) => b.points - a.points);
  // TODO display current leader board and also indicate if the current user got the answer correct
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

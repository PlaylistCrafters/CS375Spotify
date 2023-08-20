import React from "react";
const RoundResultsScreen = ({ players, roundResult }) => {
  const sortedPlayers = players.slice().sort((a, b) => b.points - a.points);
  // TODO display current leader board and also indicate if the current user got the answer correct
  return <div>Round Results Screen</div>;
};

export default RoundResultsScreen;

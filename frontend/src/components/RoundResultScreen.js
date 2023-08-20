import React from "react";
import "./RoundResultsScreen.css";
const RoundResultsScreen = ({ players, roundResult, currentUserPlayerId, socket }) => {
  // TODO display current leader board and also indicate if the current user got the answer correct
  
  const [countdownNextQuestion, setCountdownNextQuestion] = useState(30);
  useEffect(() => {
    let countdownNextQuestionInterval;

    if (countdownNextQuestion > 0) {
      countdownNextQuestionInterval = setInterval(() => {
        setCountdownNextQuestion((prevCountdown) => prevCountdown - 1);
      }, 1000);
    }

    return () => {
      clearInterval(countdownNextQuestionInterval);
    };
  }, [countdownNextQuestion]);

  useEffect(() => {
    setCountdownNextQuestion(30); 
  }, [roundResult]);

  useEffect(() => {
    const handleNextQuestion = (nextQuestion) => {
      setQuestion(nextQuestion);
      setCountdownNextQuestion(40);
    };
    socket.on("nextQuestion", handleNextQuestion);
    return () => {
      socket.off("nextQuestion", handleNextQuestion);
    };
  }, [socket]);
  
  const sortedPlayers = players.slice().sort((a, b) => b.points - a.points);

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

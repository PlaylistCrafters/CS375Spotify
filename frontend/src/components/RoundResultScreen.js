import React, { useState, useEffect } from "react";
import "./RoundResultScreen.css";

const RoundResultsScreen = ({ players, roundResult, currentUserPlayerId, timer }) => {
    const [timeLeft, setTimeLeft] = useState(timer);
    useEffect(() => {
        setTimeLeft(timer);

        const interval = setInterval(() => {
            setTimeLeft(prevTimeLeft => Math.max(prevTimeLeft - 1, 0));
        }, 1000);

        return () => {
            clearInterval(interval);
        };
    }, [timer]);

    const sortedPlayers = players?.slice().sort((a, b) => b.points - a.points);

    return (
        <div>
            <h2>Round Results</h2>
            <div>Time Left: {timeLeft} seconds</div>
            <ul>
                {sortedPlayers.map((player) => (
                    <li key={player.id}>
                        {player.displayName}: {player.points} points <br />
                        {roundResult && player.id === currentUserPlayerId && roundResult.correctPlayers.includes(player.id) ? (
                            <span className="green-indicator">Correct</span>
                        ) : (
                            <span className="red-indicator">Incorrect</span>
                        )}
                    </li>
                ))}
            </ul>
            {currentUserPlayerId && (
                <p>Your score: {players.find((player) => player.id === currentUserPlayerId)?.points}</p>
            )}
        </div>
    );
};

export default RoundResultsScreen;

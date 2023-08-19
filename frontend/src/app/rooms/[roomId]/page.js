"use client";

import EndScreen from "@/components/EndScreen";
import LobbyScreen from "@/components/LobbyScreen";
import QuestionScreen from "@/components/QuestionScreen";
import RoundResultsScreen from "@/components/RoundResultScreen";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import io from "socket.io-client";

let socket;

const lobbyScreen = "lobbyScreen";
const questionScreen = "questionScreen";
const roundResultsScreen = "roundResultsScreen";
const endScreen = "endScreen";

function Page() {
  const { roomId } = useParams();

  const [screen, setScreen] = useState(null);
  const [question, setQuestion] = useState(null);
  const [players, setPlayers] = useState(null);
  const [roundResult, setRoundResult] = useState(null);

  useEffect(() => {
    // TODO: Use environment variable
    socket = io("http://localhost:3001");
    socket.emit("joinRoom", roomId);

    return () => {
      socket.disconnect();
    };
  }, []);

  const startGameFunc = () => {
    // TODO emit startGame event
  };

  const onSelectAnswer = () => {
    // TODO emit answer event
  };

  const displayScreen = () => {
    switch (screen) {
      case lobbyScreen:
        return <LobbyScreen players={players} startGameFunc={startGameFunc} />;
      case questionScreen:
        return (
          <QuestionScreen question={question} onSelectAnswer={onSelectAnswer} />
        );
      case roundResultsScreen:
        return <RoundResultsScreen roundResult={roundResult} />;
      case endScreen:
        return <EndScreen players={players} />;
      default:
        return null;
    }
  };

  return <div>{displayScreen()}</div>;
}

export default Page;

"use client";

import EndScreen from "@/components/EndScreen";
import LobbyScreen from "@/components/LobbyScreen";
import QuestionScreen from "@/components/QuestionScreen";
import RoundResultsScreen from "@/components/RoundResultScreen";
import { useParams } from "next/navigation";
import Cookies from "js-cookie";
import socket from "@/app/socket";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

const lobbyScreen = "lobbyScreen";
const questionScreen = "questionScreen";
const roundResultsScreen = "roundResultsScreen";
const endScreen = "endScreen";

function Page() {
  const { roomId } = useParams();
  const router = useRouter();

  const [screen, setScreen] = useState(null);
  const [question, setQuestion] = useState(null);
  const [players, setPlayers] = useState(null);
  const [roundResult, setRoundResult] = useState(null);

  useEffect(() => {
    const accessToken = Cookies.get("accessToken");
    const playerId = Cookies.get("playerId");
    const displayName = Cookies.get("displayName");
    socket.io.opts.extraHeaders["accessToken"] = accessToken;
    socket.connect();


    socket.emit("joinRoom", {
      roomId: roomId,
      player: { playerId: playerId, displayName: displayName },
    });

    socket.on("joinRoomError", () => {
      console.log(`Error joining room ${roomId}`);
      console.log("Returning to home page");
      router.push("/");
    });

    socket.on("sentQuestion", (questionData) => {
      console.log(questionData);
      // TODO update question with setQuestion
      console.log("change screen");
      setQuestion(questionData);
      setScreen(questionScreen);
    });

    // TODO delete this code, added for testing purposes
    socket.on("updateLobby", (obj) => {
      console.log("update lobby");
      socket.emit("startGame");
    });

    socket.on("roundEnded", () => {
      setScreen(roundResultsScreen);
    });

    socket.on("startNextRound", () => {
      socket.emit("nextQuestion");
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const startGameFunc = () => {
    // TODO emit startGame event
  };

  const onSelectAnswer = (answer) => {
    console.log(answer);
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
        return (
          <RoundResultsScreen players={players} roundResult={roundResult} />
        );
      case endScreen:
        return <EndScreen players={players} />;
      default:
        return null;
    }
  };

  return <div>{displayScreen()}</div>;
}

export default Page;

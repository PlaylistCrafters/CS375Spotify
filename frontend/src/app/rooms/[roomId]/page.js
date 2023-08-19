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
    toggleHost();
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

    return () => {
      socket.disconnect();
    };
  }, []);

  const startGame = () => {
    if (isHost) {
      socket.emit("startGame", { roomId: roomId });
    }

    router.push("/");
  };

  /*
  const kickPlayer = (playerId) => {
    if (isHost) {
      socket.emit("kickPlayer", { playerId: playerId });
    }
  };
  */

  const toggleHost = () => {
    let hostPlayerId = Cookies.get("hostPlayerId");
    let playerId = Cookies.get("playerId");

    setIsHost(hostPlayerId === playerId);
  };

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

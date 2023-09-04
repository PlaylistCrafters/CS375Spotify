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
import { CLIENT_STATIC_FILES_RUNTIME_REACT_REFRESH } from "next/dist/shared/lib/constants";

const lobbyScreen = "lobbyScreen";
const questionScreen = "questionScreen";
const roundResultsScreen = "roundResultsScreen";
const endScreen = "endScreen";

function Page() {
  const { roomId } = useParams();
  const router = useRouter();

  const [screen, setScreen] = useState(lobbyScreen);
  const [question, setQuestion] = useState(null);
  const [timer, setTimer] = useState(null);
  const [players, setPlayers] = useState([]);
  const [roundResult, setRoundResult] = useState(null);
  const [isHost, setIsHost] = useState(false);
  const [correctAnswer, setCorrectAnswer] = useState(null);
  const [powerupStatus, setPowerupStatus] = useState(null);

  useEffect(() => {
    const playerId = Cookies.get("playerId");
    const displayName = Cookies.get("displayName");
    socket.connect();

    socket.emit("joinRoom", {
      roomId: roomId,
      player: { playerId: playerId, displayName: displayName },
    });

    socket.on("updateLobby", ({ players, hostPlayerId }) => {
      setPlayers(players);
      setIsHost(hostPlayerId === playerId);
    });

    socket.on("joinRoomError", () => {
      console.log(`Error joining room ${roomId}`);
      console.log("Returning to home page");
      router.push("/");
    });

    socket.on("playerReceivedPowerup", ({ playerId, powerupType }) => {
      setPowerupStatus(powerupType);
      console.log("entering playerReceivedPowerup");
      console.log(
        `Received powerup '${powerupType}' for player with ID: ${playerId}`,
      );
    });

    socket.on("powerupActivated", ({ powerupType }) => {
      console.log("client powerupActivated");
      setPowerupStatus(null);
    });
    socket.on("nextQuestion", (questionData) => {
      console.log(questionData);
      setQuestion(questionData);
      setScreen(questionScreen);
    });

    socket.on("timerTick", ({ timeLeft, correctAnswer }) => {
      setTimer(timeLeft);
      setCorrectAnswer(correctAnswer);
    });

    socket.on(
      "roundEnded",
      ({ updatedPlayers, roundPlayerRankings, hasNextRound }) => {
        if (!hasNextRound) {
          setPowerupStatus(null);
        }
        setPlayers(updatedPlayers);
        setRoundResult(roundPlayerRankings);
        setScreen(roundResultsScreen);
        console.log(updatedPlayers);
      },
    );

    socket.on("finishGame", () => {
      console.log(players);
      setScreen(endScreen);
    });

    return () => {
      socket.disconnect();
    };
  }, [roomId]);

  const kickPlayer = (playerId) => {
    if (isHost) {
      socket.emit("kickPlayer", { playerId: playerId });
    }
  };

  const startGameFunc = () => {
    let clickSound = new Audio(
      "https://vgmsite.com/soundtracks/nintendo-switch-sound-effects/dcxoadjr/Popup%20%2B%20Run%20Title.mp3",
    );
    clickSound.play();
    if (isHost) {
      socket.emit("startGame", { roomId: roomId });
    }
  };

  const onSelectAnswer = (answer) => {
    socket.emit("submitAnswer", {
      answer: answer,
    });
  };

  const activatePowerup = (currentUserPlayerId, powerupStatus) => {
    socket.emit("activatePowerup", {
      playerId: currentUserPlayerId,
      powerupType: powerupStatus,
      roomId: roomId,
    });
  };

  const displayScreen = () => {
    switch (screen) {
      case lobbyScreen:
        return (
          <LobbyScreen
            players={players}
            startGameFunc={startGameFunc}
            isHost={isHost}
            roomId={roomId}
          />
        );
      case questionScreen:
        return (
          <QuestionScreen
            question={question}
            onSelectAnswer={onSelectAnswer}
            timer={timer}
          />
        );
      case roundResultsScreen:
        return (
          <RoundResultsScreen
            players={players}
            roundResult={roundResult}
            currentUserPlayerId={Cookies.get("playerId")}
            timer={timer}
            correctAnswer={correctAnswer}
            powerupStatus={powerupStatus}
            activatePowerup={activatePowerup}
          />
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

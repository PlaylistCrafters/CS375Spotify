"use client";

import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import socket from "@/app/socket";
import { useRouter } from "next/navigation";

function Page() {
  const { roomId } = useParams();
  const router = useRouter();
  const [players, setPlayers] = useState([]);
  const [isHost, setIsHost] = useState(false);

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

  return (
    <div>
      <h1>Room {roomId}</h1>
      <div>
        <h2>Players:</h2>
      </div>
      <ul>
        {players.map((player, index) => (
          <li key={index}>{player.name}</li>
        ))}
      </ul>
      <div>{isHost && <button onClick={startGame}>Start Game</button>}</div>
      <div></div>
    </div>
  );
}

export default Page;

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
  const [isHost, setIsHost] = useState(true);

  useEffect(() => {
    const accessToken = Cookies.get("accessToken");
    socket.io.opts.extraHeaders.accessToken = accessToken;
    socket.connect();

    socket.emit("joinRoom", { roomId: roomId });

    socket.on("joinRoomError", () => {
      console.log(`Error joining room ${roomId}}`);
      console.log("Returning to home page");
      router.push("/");
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const startGame = () => {
    if (isHost) {
      router.push("/");
    }
  };

  const kickPlayer = (playerId) => {
    if (isHost) {
      const updatedPlayerList = [];
      socket.emit("kickPlayer", { playerId: playerId });
    }
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

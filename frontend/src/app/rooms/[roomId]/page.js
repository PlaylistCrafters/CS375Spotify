"use client";

import { useParams } from "next/navigation";
import React, { useEffect } from "react";
import Cookies from "js-cookie";
import socket from "@/app/socket";
import { useRouter } from "next/navigation";

function Page() {
  const { roomId } = useParams();
  const router = useRouter();

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

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div>
      <h1>Room {roomId}</h1>
    </div>
  );
}

export default Page;

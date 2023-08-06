"use client";

import { useParams } from "next/navigation";
import React, { useEffect } from "react";
import io from "socket.io-client";

let socket;

function Page() {
  const { roomId } = useParams();

  useEffect(() => {
    // TODO: Use environment variable
    socket = io("http://localhost:3001");
    socket.emit("joinRoom", roomId);

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

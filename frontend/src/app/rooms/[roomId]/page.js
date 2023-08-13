"use client";

import { useParams } from "next/navigation";
import React, { useEffect } from "react";
import socket from "@/app/socket";

function Page() {
  const { roomId } = useParams();

  useEffect(() => {
    socket.connect();
    socket.emit("joinRoom", { roomId: roomId });

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

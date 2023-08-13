"use client";

import { useParams } from "next/navigation";
import React, { useEffect } from "react";
import Cookies from "js-cookies";
import socket from "@/app/socket";
import { useRouter } from "next/router";

function Page() {
  const { roomId } = useParams();
  const router = useRouter();

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

  return (
    <div>
      <h1>Room {roomId}</h1>
    </div>
  );
}

export default Page;

"use client";

import React, { useEffect, useState } from "react";
import io from "socket.io-client";

let socket;

function setDisplay() {}

export default function Home() {
  const [displayQuestion, setDisplay] = useState(true);

  useEffect(() => {
    socket = io("http://localhost:3001");
    socket.emit("test");
  });

  return (
    <div id="body">
      {displayQuestion ? <div></div> : <div>No question</div>}
    </div>
  );
}

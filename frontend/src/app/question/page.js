// TODO delete file and folder
"use client";

import React, { useEffect, useState } from "react";
import io from "socket.io-client";

let socket;

function setDisplay() {}

export default function Home() {
  const [displayQuestion, setDisplay] = useState(true);
  const [emitCount, sendEmit] = useState(0);

  useEffect(() => {
    socket = io("http://localhost:3001");
    socket.emit("test");
  }, []);

  useEffect(() => {
    console.log("emit");
    socket.emit("nextQuestion");
  }, [emitCount]);

  return (
    <div id="body">
      {displayQuestion ? <div></div> : <div>No question</div>}
      <button onClick={() => sendEmit((prevCount) => prevCount + 1)}>
        sned
      </button>
    </div>
  );
}

"use client";

import React, { useEffect, useState } from "react";
import io from "socket.io-client";

let socket;
let roomId = "asv34a";

function setDisplay() {}

export default function Home() {
  const [displayQuestion, setDisplay] = useState(true);
  const [emitCount, sendEmit] = useState(0);


  return (
    <div id="body">
      {displayQuestion ? <div></div> : <div>No question</div>}
      <button onClick={() => sendEmit(prevCount => prevCount + 1)}>sned</button>
    </div>
  );
}

const QuestionScreen = ({ question, onSelectAnswer }) => {
  // TODO display question and answer choices
  // TODO call onSelectAnswer upon clicking answer choice (pass in answer string)
  return <div>Question Screen</div>;
};

//export default QuestionScreen;

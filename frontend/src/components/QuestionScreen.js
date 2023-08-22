"use client";

import React, { useEffect, useState } from "react";
import io from "socket.io-client";

let socket;


export default function Home() {
  const [displayQuestion, setDisplay] = useState(true);
  const [answer, sendAnswer] = useState(null);

  useEffect(() => {

  }, [answer]);


  return (
    <div id="body">
      {displayQuestion ? <div></div> : <div>No question</div>}
      <button onClick={() => sendEmit(prevCount => prevCount + 1)}>sned</button>
    </div>
  );
}

const QuestionScreen = ({ question, onSelectAnswer }) => {
  console.log("from questionScreen " + question);
  // TODO display question and answer choices
  // TODO call onSelectAnswer upon clicking answer choice (pass in answer string)
  return <div>Question Screen</div>;
};

//export default QuestionScreen;

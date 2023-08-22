"use client";

import React, { useEffect, useState } from "react";
import io from "socket.io-client";

let socket;

/*
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
}*/

function test(balh) {
  console.log(balh);

}

const QuestionScreen = ({ question, onSelectAnswer }) => {
  console.log("from questionScreen " + question);
  const prompt = question["prompt"];
  const choices = question["answerChoices"];
  // TODO display question and answer choices
  // TODO call onSelectAnswer upon clicking answer choice (pass in answer string)
  return (
    <div>Question Screen
      <div>{prompt}</div>
      <div>placeholder for mp3player</div>
      <div>
        <button onClick={() => onSelectAnswer(choices[0])}>{choices[0]}</button><br/>
        <button onClick={() => onSelectAnswer(choices[1])}>{choices[1]}</button><br/>
        <button onClick={() => onSelectAnswer(choices[2])}>{choices[2]}</button><br/>
        <button onClick={() => onSelectAnswer(choices[3])}>{choices[3]}</button><br/>

      </div>

    </div>
  );
};

export default QuestionScreen;

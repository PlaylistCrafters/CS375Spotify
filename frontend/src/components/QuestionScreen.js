"use client";

import React, { useEffect, useState } from "react";

const QuestionScreen = ({ question, onSelectAnswer, timer }) => {
  const [hasSelectedAnswer, setHasSelectedAnswer] = useState(false);
  const prompt = question["prompt"];
  const choices = question["answerChoices"];
  const url = question["songUrl"];

  function selectAnswer(answer) {
    onSelectAnswer(answer);
    setHasSelectedAnswer(true);
  }

  if (hasSelectedAnswer) {
    return <div>Waiting for other players...</div>;
  }

  return (
    <div>
      Question Screen
      <div>Time Left: {timer}</div>
      <div>{prompt}</div>
      <div>
        <audio controls={false} autoPlay>
          <source src={url} type="audio/mpeg"></source>
        </audio>
      </div>
      <div>
        <button onClick={() => selectAnswer(choices[0])}>{choices[0]}</button>
        <br />
        <button onClick={() => selectAnswer(choices[1])}>{choices[1]}</button>
        <br />
        <button onClick={() => selectAnswer(choices[2])}>{choices[2]}</button>
        <br />
        <button onClick={() => selectAnswer(choices[3])}>{choices[3]}</button>
        <br />
      </div>
    </div>
  );
};

export default QuestionScreen;

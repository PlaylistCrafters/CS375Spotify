"use client";

import React, { useEffect, useState } from "react";

const QuestionScreen = ({ question, onSelectAnswer, timer }) => {
  console.log("from questionScreen " + question);
  const prompt = question["prompt"];
  const choices = question["answerChoices"];
  const url = question["songUrl"];
  console.log(url);
  // TODO display question and answer choices
  // TODO call onSelectAnswer upon clicking answer choice (pass in answer string)
  return (
    <div>Question Screen
      <div>Time Left: {timer}</div>
      <div>{prompt}</div>
      <div>
        <audio controls autoPlay>
          <source src={url} type="audio/mpeg"></source>
        </audio>
      </div>
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

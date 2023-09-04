"use client";

import React, { useEffect, useState } from "react";
import styles from "./QuestionScreen.module.css";
import { Ubuntu } from "@next/font/google";

const ubuntu = Ubuntu({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
});

const QuestionScreen = ({ question, onSelectAnswer, timer }) => {
  const [hasSelectedAnswer, setHasSelectedAnswer] = useState(false);
  const prompt = question["prompt"];
  const choices = question["answerChoices"];
  const url = question["songUrl"];

  function selectAnswer(answer) {
    if (answer === undefined) {
      return;
    }
    let selectAudio = new Audio(
      "https://vgmsite.com/soundtracks/nintendo-switch-sound-effects/juafgbqe/This%20One.mp3",
    );
    selectAudio.play();
    onSelectAnswer(answer);
    setHasSelectedAnswer(true);
  }

  if (hasSelectedAnswer) {
    return (
      <main className={ubuntu.className}>
        <div className={styles.waiting}>Waiting for other players...</div>
      </main>
    );
  }

  return (
    <main className={ubuntu.className}>
      <div className={styles.wrapper}>
        <div className={styles.count}>Time Left: {timer}</div>
        <div className={styles.prompt}>{prompt}</div>
        <div>
          <audio controls autoPlay>
            <source src={url} type="audio/mpeg"></source>
          </audio>
        </div>
        <div className={styles.buttonGrid}>
          <button
            id={styles.btn1}
            className={styles.ansBtn}
            onClick={() => selectAnswer(choices[0])}
          >
            {choices[0]}
          </button>
          <button
            id={styles.btn2}
            className={styles.ansBtn}
            onClick={() => selectAnswer(choices[1])}
          >
            {choices[1]}
          </button>
          <button
            id={styles.btn3}
            className={styles.ansBtn}
            onClick={() => selectAnswer(choices[2])}
          >
            {choices[2]}
          </button>
          <button
            id={styles.btn4}
            className={styles.ansBtn}
            onClick={() => selectAnswer(choices[3])}
          >
            {choices[3]}
          </button>
        </div>
      </div>
    </main>
  );
};

export default QuestionScreen;

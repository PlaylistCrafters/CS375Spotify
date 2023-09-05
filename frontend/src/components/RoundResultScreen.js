import styles from "./RoundResultScreen.module.css";
import React, { useEffect, useState } from "react";
import { Ubuntu } from "@next/font/google";

const ubuntu = Ubuntu({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
});

const RoundResultsScreen = ({
  players,
  roundResult,
  currentUserPlayerId,
  timer,
  correctAnswer,
  powerupStatus,
  activatePowerup,
}) => {
  const [powerupDesc, setDesc] = useState("");
  const onActivate = () => {
    console.log("Activate Powerup button clicked");
    activatePowerup(currentUserPlayerId, powerupStatus);
  };

  let correctSound = new Audio(
    "https://vgmsite.com/soundtracks/nintendo-switch-sound-effects/zfoeyezf/Jig%200.mp3",
  );
  let incorrectSound = new Audio(
    "https://vgmsite.com/soundtracks/nintendo-switch-sound-effects/lzpzngfl/Jig%201.mp3",
  );

  useEffect(() => {
    if (roundResult.length !== 0) {
      correctSound.play();
    } else {
      incorrectSound.play();
    }

    if (powerupStatus === "reduceChoices") {
      setDesc("Reduce the amount of choices to 3 for the next round");
    } else if (powerupStatus === "pointMultiplier") {
      setDesc("Gain 2x the points next round");
    } else if (powerupStatus === "matchTopUser") {
      setDesc("Match the points of the first place player");
    }
  }, []);
  return (
    <main className={ubuntu.className}>
      <div classname={styles.wrapper}>
        <div className={styles.count}>Time Left: {timer}</div>
        <div className={styles.header}>Round Results</div>
        {roundResult && roundResult.includes(currentUserPlayerId) ? (
          <div className={styles.correct}>Correct</div>
        ) : (
          <div className={styles.incorrect}>Incorrect</div>
        )}
        <div className={styles.answer}>Correct Answer: {correctAnswer}</div>
        <div className={styles.listWrapper}>
          <ul className={styles.playerList}>
            {players.map((player) => (
              <li className={styles.playerList} key={player.id}>
                <span className={styles.playerName}>{player.displayName}:</span>{" "}
                {player.points} points <br />
              </li>
            ))}
          </ul>
        </div>
        {currentUserPlayerId && (
          <p className={styles.yourScore}>
            Your score:{" "}
            {
              players.find((player) => player.id === currentUserPlayerId)
                ?.points
            }
          </p>
        )}
        {powerupStatus && (
          <div className={styles.powerupWrapper}>
            <p className={styles.powerupAnnouncement}>Powerup Gained!</p>
            <p className={styles.powerupDesc}>{powerupDesc}</p>
            <button className={styles.powerupBtn} onClick={() => onActivate()}>
              Activate Powerup
            </button>
          </div>
        )}
      </div>
    </main>
  );
};

export default RoundResultsScreen;

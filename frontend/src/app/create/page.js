"use client";

import { Ubuntu } from "next/font/google";
import { useRouter } from "next/navigation";
import { useState } from "react";
import styles from "./Create.module.css";

const ubuntu = Ubuntu({
  subsets: ['latin'],
  weight: ['300', '400', '500', '700'],
});

export default function Home() {
  const [errorMessage, setErrorMessage] = useState("");
  const serverProtocol = process.env.SERVER_PROTOCOL;
  const serverHost = process.env.SERVER_HOST;
  const serverPort = process.env.SERVER_PORT;

  const router = useRouter();

  const handleSubmit = async (event) => {
    event.preventDefault();

    let errorSound = new Audio('https://vgmsite.com/soundtracks/nintendo-switch-sound-effects/phmumiwe/Error.mp3');
    let settingsSound = new Audio('https://vgmsite.com/soundtracks/nintendo-switch-sound-effects/udkyavrh/Settings.mp3');
    const snippetLength = event.target.sLength.value;
    const rounds = event.target.rounds.value;
    const allowExplicit = event.target.explicit.value;

    if (snippetLength < 15 || snippetLength > 30) {
        setErrorMessage("Snippet length must be between 15-30 seconds");
        errorSound.play();
        return;
    }
    if (rounds < 1 || rounds > 10) {
        setErrorMessage("The amount of rounds must be between 1-10");
        errorSound.play();
        return;
    }
    if (allowExplicit !== "yes" && allowExplicit !== "no") {
        setErrorMessage("The explicit value must be Yes or No");
        errorSound.play();
        return;
    }

    let gameRules = {
      snippetLength: snippetLength,
      rounds: rounds,
      allowExplicit: allowExplicit === "yes",
    };

    const data = JSON.stringify(gameRules);

    const endpoint = "/api/rooms";

    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: data,
      credentials: "include",
    };
    console.log(serverPort);

    const response = await fetch(
      `${serverProtocol}${serverHost}:${serverPort}${endpoint}`,
      options,
    );
    setErrorMessage("");

    if (response.status === 200) {
    settingsSound.play();
      response.json().then((body) => {
        router.push(`/rooms/${body.roomId}`);
      });
    } else {
        errorSound.play();
        setErrorMessage("Unable to create Room");
    }
  };

  return (
    <main className={ubuntu.className}>
    <div className={styles.wrapper}>
      <div id="settings">
        <div className={styles.header}>Settings</div>
        <form onSubmit={handleSubmit}>
            <input className={styles.textInput} id={styles.snippetLabel} type="number" name="sLength" placeholder="Snippet Length (Seconds)"/>
          <br />
            <input className={styles.textInput} id={styles.roundLabel} type="number" name="rounds" placeholder="Number of Rounds"/>
          <br />
          <label className={styles.dropdownInput} id={styles.explicitLabel}>
            Allow Explicit Songs{" "}
            <select id="explicit">
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </label>
          <br />
          <label className={styles.dropdownInput} id={styles.powerupsLabel}>
            Powerups{" "}
            <select id="powerups">
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </label>
          <br />
          <button className={styles.create} id="create" type="submit">
            Create Room
          </button>
        </form>
      </div>
      <div className={styles.error} id="message">{errorMessage}</div>
    </div>
    </main>
  );
}

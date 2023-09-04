"use client";

import styles from "./EndScreen.module.css";
import { useRouter } from "next/navigation";
import { Ubuntu } from "@next/font/google";

const ubuntu = Ubuntu({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
});

const EndScreen = ({ players }) => {
  const router = useRouter();
  if (players.length === 0) {
    return <div></div>;
  }
  let homeSound = new Audio(
    "https://vgmsite.com/soundtracks/nintendo-switch-sound-effects/ovvkjyda/Home.mp3",
  );
  let initialSound = new Audio(
    "https://vgmsite.com/soundtracks/wii-sports-wii/aaeuareqpt/33%20Boxing%20%28Results%29.mp3",
  );

  initialSound.play();

  const goHome = () => {
    homeSound.play();
    router.push(`/`);
    initialSound.pause();
    initialSound.currentTime = 0;
  };

  return (
    <main className={ubuntu.className}>
      <div className={styles.wrapper}>
        <table className={styles.table}>
          <thead className={styles.thead}>
            <tr>
              <th id={styles.rankHead} className={styles.headers}>
                Rank
              </th>
              <th id={styles.playerHead} className={styles.headers}>
                Player
              </th>
              <th id={styles.pointsHead} className={styles.headers}>
                Points
              </th>
            </tr>
          </thead>
          <tbody className={styles.body}>
            {players.map((player, index) => (
              <tr className={styles.row} key={player.id}>
                <td className={styles.rank}>{index + 1}</td>
                <td className={styles.playerName}>{player.displayName}</td>
                <td>{player.points}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <button className={styles.home} onClick={goHome}>
          Home
        </button>
      </div>
    </main>
  );
};

export default EndScreen;

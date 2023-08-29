"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import styles from "./Join.module.css";
import { Ubuntu } from '@next/font/google';

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

  const handleJoin = async (event) => {
    event.preventDefault();

    let code = event.target.code.value;
    const endpoint = `/api/rooms/${code}`;
    const response = await fetch(
      `${serverProtocol}${serverHost}:${serverPort}${endpoint}`,
    );
    setErrorMessage("");
    if (response.status === 200) {
      router.push(`/rooms/${code}`);
    } else {
      setErrorMessage("Invalid Room");
    }
  };

  return (
    <main className={ubuntu.className}>
    <div className={styles.wrapper}>
      <div className={styles.header}>Join Room</div>
      <form onSubmit={handleJoin}>
        <input className={styles.input} id="code" type="text" placeholder="Room Code"/>
        <br/>
        <button className={styles.joinBtn} type="submit">Join</button>
      </form>
      <div className={styles.error}>{errorMessage}</div>
    </div>
    </main>
  );
}

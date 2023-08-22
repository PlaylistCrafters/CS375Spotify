"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

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
    <div>
      <h1>Join Room</h1>
      <form onSubmit={handleJoin}>
        <label>Room code:</label>
        <input id="code" type="text" />
        <button id="join" type="submit">
          Join
        </button>
      </form>
      <div id="message">{errorMessage}</div>
    </div>
  );
}

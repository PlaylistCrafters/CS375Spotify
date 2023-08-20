'use client';

import { useRouter } from 'next/navigation';

export default function Home() {
    const router = useRouter();

    const handleJoin  = async(event) => {
        event.preventDefault();

        let code = document.getElementById("code").value;
        const endpoint = `/rooms/${code}`;
        const response = await fetch(endpoint);
        document.getElementById("message").textContent = "";
        if (response.status === 200) {
            router.push(`/rooms/${code}`);
        }
        else {
            document.getElementById("message").textContent = "Invalid Room";
        }
    }

  return (
            <div>
                <h1>Join Room</h1>
                <div>
                    <label>Room code:</label>
                    <input id="code" type="text"/>
                </div>
                <button id="join" onClick={handleJoin}>Join</button>
                <div id="message">
                </div>
            </div>
  );
}

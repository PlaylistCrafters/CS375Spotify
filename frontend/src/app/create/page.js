'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function Home() {
    const [errorMessage, setErrorMessage] = useState('');
    const serverProtocol = process.env.SERVER_PROTOCOL;
    const serverHost = process.env.SERVER_HOST;
    const serverPort = process.env.SERVER_PORT;

    const router = useRouter();

    const handleSubmit = async(event) => {
        event.preventDefault();
        
        let gameRules = {"snippetLength": event.target.sLength.value,
            "rounds": event.target.rounds.value,
            "allowExplicit": event.target.explicit.value};

        const data = JSON.stringify(gameRules);

        const endpoint = '/api/rooms';

        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: data,
        }
        console.log(serverPort);

        const response = await fetch(`${serverProtocol}${serverHost}:${serverPort}${endpoint}`, options);
        setErrorMessage("");

        if (response.status === 200) {
            response.json().then((body) => {
                router.push(`/rooms/${body.roomId}`)
            });
        }
        else {
            setErrorMessage("Unable to create Room")
        }
    }

    return (
            <div id="pageContainer">
                <div id="settings">
                    <h1>Settings</h1>
                        <form onSubmit={handleSubmit}>
                        <label>Snippet Length (Seconds): <input type="number" name="sLength"/></label><br/>
                        <label>Number of Rounds: <input type="number" name="rounds"/></label><br/>
                        <label>Allow Explicit Songs <select id="explicit"> 
                            <option value="yes">Yes</option>
                            <option value="no">No</option></select>
                        </label><br/>
                        <label>Powerups <select id="powerups"> 
                            <option value="yes">Yes</option>
                            <option value="no">No</option></select>
                        </label><br/>
                        <button id="create" type="submit">Create Room</button>
                        </form>
                </div>
                <div id="message">{errorMessage}</div>
            </div>
    );
    
}
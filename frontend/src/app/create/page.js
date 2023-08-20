'use client';

import { useRouter } from 'next/navigation';

export default function Home() {
    const router = useRouter();

    const handleSubmit = async(event) => {
        event.preventDefault();
        
        let snippetLength = document.getElementsByName("sLength").value;
        let rounds = document.getElementsByName("rounds").value;
        let explicit = document.getElementById("explicit").value;
        let powerups = document.getElementById("powerups").value;
        let gameRules = [snippetLength, rounds, explicit, powerups];
        const data = JSON.stringify({gameRules: gameRules});

        const endpoint = '/api/rooms';

        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: data,
        }

        const response = await fetch(endpoint, options);
        document.getElementById("message").textContent = "";

        if (response.status === 200) {
            router.push(`/rooms/${id}`)
        }
        else {
            document.getElementById("message").textcontent = "unable to create room";
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
                <div id="message"></div>
            </div>
    );
    
}
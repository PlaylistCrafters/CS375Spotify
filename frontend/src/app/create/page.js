'use client';

//TODO Function to update UI to show spotify login success

function handleSubmit() {
   let snippetLength = document.getElementsByName("sLength").value;
   let rounds = document.getElementsByName("rounds").value;
   let explicit = document.getElementById("explicit").value;
   let powerups = document.getElementById("powerups").value;
   let gameRules = [snippetLength, rounds, explicit, powerups];
   let success = false;

   fetch("http://localhost:3000/api/rooms", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({gameRules: gameRules})
   }).then((response) => {
        if (response.status === 200) {
            success = true;
        }
        else {
            success = false;
        }
        return response.json();
   }).then((body) => {
        document.getElementById("message").textContent = "";
        if(success) {
            let id = body.roomId;
            window.location.replace("http://localhost:3000/rooms/" + id);
        }
        else {
            document.getElementById("message").textContent = "Unable to create room";
        }
   })
}

export default function Home() {
    return (
            <div id="pageContainer">
                <div id="settings">
                    <h1>Settings</h1>
                        <form>
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
                        <button id="spotify" type="button">Login to Spotify</button><br/>
                        <button id="create" type="button" onClick={handleSubmit}>Create Room</button>
                        </form>
                </div>
                <div id="message"></div>
            </div>
    );
    
}
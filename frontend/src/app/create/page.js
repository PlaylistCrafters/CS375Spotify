'use client';

//TODO Function to update UI to show spotify login success

function handleSubmit() {
   let snippetLength = document.getElementsByName("sLength").value;
   let rounds = document.getElementsByName("rounds").value;
   let explicit = document.getElementById("explicit").value;
   let powerups = document.getElementById("powerups").value;
   console.log(explicit);
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
            </div>
    );
    
}
'use client';

//TODO Add spotify login checker

function join() {
    let code = document.getElementById("code").value;
    console.log(code);
    
    //Send post request to backend. If backend sends 200 status, redirect to room. Else, display error message

    
}


export default function Home() {
  return (
            <div>
                <h1>Join Room</h1>
                <button id="spotify">Login to Spotify</button>
                <div>
                    <label>Room code:</label>
                    <input id="code" type="text"/>
                </div>
                <button id="join" onClick={join}>Join</button>
                <div id="message">
                </div>
            </div>
  );
}

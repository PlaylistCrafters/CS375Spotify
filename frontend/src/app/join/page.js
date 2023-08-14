'use client';

//TODO Add spotify login checker

function join() {
    let code = document.getElementById("code").value;
    let validRoom = false;

    fetch(`http://localhost:3000/api/rooms/${code}`).then((response) => {
        document.getElementById("message").textContent = "";
        if (response.status === 200) {
            validRoom = true;
        }
        else {
            validRoom = false;
        }
    })
    .then((body) => {
        if (!validRoom) {
            //Need to determine if the server sends an error message
            document.getElementById("message").textContent = "Invalid Room";
        }
    });

    window.location.replace(`http://localhost:3000:rooms/${code}`); 
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
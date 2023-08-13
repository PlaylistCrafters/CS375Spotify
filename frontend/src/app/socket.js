import { io } from "socket.io-client";

// TODO: Use environment variable
const url = "http://localhost:3001";
const socket = io(url, { autoConnect: false });

socket.onAny((event, ...args) => {
  console.log(event, args);
});

export default socket;

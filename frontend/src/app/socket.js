import { io } from "socket.io-client";

const serverProtocol = process.env.SERVER_PROTOCOL;
const serverHost = process.env.SERVER_HOST;
const serverPort = process.env.SERVER_PORT;
const socketUrl = `${serverProtocol}${serverHost}`;
const socket = io(socketUrl, { autoConnect: false, extraHeaders: {} });

socket.onAny((event, ...args) => {
  console.log(event, args);
});

export default socket;

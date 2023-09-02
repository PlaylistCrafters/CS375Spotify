import { io } from "socket.io-client";
import Cookies from "js-cookie";

const serverProtocol = process.env.SERVER_PROTOCOL;
const serverHost = process.env.SERVER_HOST;
const serverPort = process.env.SERVER_PORT;
const socketUrl = `${serverProtocol}${serverHost}`;
const socket = io(socketUrl, {
  autoConnect: false,
  extraHeaders: {},
  transports: ["websocket"],
  auth: (cb) => {
    cb({ token: Cookies.get("accessToken") });
  },
});

socket.onAny((event, ...args) => {
  console.log(event, args);
});

export default socket;

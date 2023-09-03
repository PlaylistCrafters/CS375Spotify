import { io } from "socket.io-client";
import Cookies from "js-cookie";

const serverProtocol = process.env.SERVER_PROTOCOL;
const serverHost = process.env.SERVER_HOST;
const serverPort = process.env.SERVER_PORT;
const socketUrl = `${serverProtocol}${serverHost}:${serverPort}`;
const socket = io(socketUrl, {
  autoConnect: false,
  extraHeaders: {},
  transports: ["websocket", "polling"],
  auth: (cb) => {
    cb({ token: Cookies.get("accessToken") });
  },
});

socket.on("connect_error", () => {
  // revert to classic upgrade
  // reference: https://socket.io/docs/v3/client-initialization/#transports
  socket.io.opts.transports = ["polling", "websocket"];
});

socket.onAny((event, ...args) => {
  console.log(event, args);
});

export default socket;

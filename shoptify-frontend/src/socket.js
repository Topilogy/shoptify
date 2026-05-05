import { io } from "socket.io-client";

const socket = io("http://192.168.1.19:5000", {
  reconnectionAttempts: 5,
  transports: ["websocket"],
});

export default socket;
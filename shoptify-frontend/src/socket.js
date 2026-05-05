import { io } from "socket.io-client";

const socket = io("socket.io")(server, {
  cors: {
    origin: process.env.CLIENT_URL, 
    methods: ["GET", "POST"]
  },
  reconnectionAttempts: 5,
  transports: ["websocket"],
});

export default socket;
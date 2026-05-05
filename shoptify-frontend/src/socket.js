import { io } from "socket.io-client";

const socket = io("socket.io", {
  cors: {
    origin: process.env.CLIENT_URL, 
    methods: ["GET", "POST"]
  }
});

export default socket;
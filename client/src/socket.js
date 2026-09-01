import { io } from "socket.io-client";

const socket = io("https://pothole-detection-system-6usv.onrender.com", {
  transports: ["polling", "websocket"],
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  timeout: 10000,
});

export default socket;
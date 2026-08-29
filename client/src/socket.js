import { io } from "socket.io-client";

const socket = io("https://pothole-detection-system-6usv.onrender.com", {
  transports: ["websocket"],
});

export default socket;
// socket.js
import { io } from "socket.io-client";

let socket = null;

/**
 * Connect to the Socket.IO server.
 * Returns the socket instance.
 */
export function connectSocket(url = "http://localhost:5000") {
  if (!socket) {
    socket = io(url, {
      transports: ["websocket", "polling"],
    });
  }
  return socket;
}

/**
 * Get the existing socket instance.
 */
export function getSocket() {
  return socket;
}

/**
 * Disconnect the socket.
 */
export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

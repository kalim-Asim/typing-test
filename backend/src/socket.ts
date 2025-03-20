import { WebSocketServer, WebSocket } from "ws";
import express from 'express';
const app = express();
import http from "http";
const server = http.createServer(app);
const wss = new WebSocketServer({ server });
const socketMap = new Map<string, WebSocket>(); // Store socketId -> WebSocket mappings
import { Room } from "./model"
import { v4 as uuidv4 } from "uuid"; // to generate unique IDs

const connectSocket = () => {
  wss.on("connection", (socket) => {
      const socketId = uuidv4(); // Generate unique socket ID
      socketMap.set(socketId, socket); // Store WebSocket in map

      socket.on("message", async (message) => {
          const parsedMessage = JSON.parse(message.toString());

          if (parsedMessage.type === "join") {
              const { roomId, username } = parsedMessage.payload;
              
              let room = await Room.findOne({ roomId });
              if (!room) {
                  socket.send(JSON.stringify({ type: "error", message: "Room not found" }));
                  return;
              }

              const userIndex = room.users.findIndex(user => user.username === username);
              if (userIndex === -1) {
                  room.users.push({ username, socketId });
              } else {
                  room.users[userIndex].socketId = socketId;
              }

              await room.save();

              room.users.forEach((user) => {
                  const userSocket = socketMap.get(user.socketId);
                  if (userSocket) {
                      userSocket.send(JSON.stringify({
                          type: "userJoined",
                          message: `${username} joined the room`,
                          users: room.users.map(u => u.username),
                      }));
                  }
              });
          }

          if (parsedMessage.type === "create") {
              const { roomId, username } = parsedMessage.payload;

              let room = await Room.findOne({ roomId });
              if (!room) {
                  socket.send(JSON.stringify({ type: "error", message: "Room not found" }));
                  return;
              }

              // Update socketId for the creator
              const userIndex = room.users.findIndex(user => user.username === username);
              if (userIndex !== -1) {
                  room.users[userIndex].socketId = socketId;
                  await room.save();
              }

              // Notify other users
              room.users.forEach((user) => {
                  const userSocket = socketMap.get(user.socketId);
                  if (userSocket) {
                      userSocket.send(JSON.stringify({
                          type: "userJoined",
                          message: `${username} created and joined the room`,
                          users: room.users.map(u => u.username),
                      }));
                  }
              });
          }

          if (parsedMessage.type === "race") {
              let room = await Room.findOne({ "users.socketId": socketId });

              if (!room) return;

              room.users.forEach(user => {
                  const userSocket = socketMap.get(user.socketId);
                  if (userSocket) {
                      userSocket.send(parsedMessage.payload.message);
                  }
              });
          }
      });

      socket.on("close", async () => {
          socketMap.delete(socketId); 
          await Room.updateMany({}, { $pull: { users: { socketId } } });
      });
  });

}

export default connectSocket;
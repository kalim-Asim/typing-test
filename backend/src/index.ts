import { WebSocketServer, WebSocket } from "ws";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { Room } from "./db";

dotenv.config();

const wss = new WebSocketServer({ port: 8080 });

mongoose
  .connect(process.env.MONGO_URI as string)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("MongoDB connection error:", err));

interface User {
  socket: WebSocket;
  room: string;
  username: string;
}

let allSockets: User[] = [];

wss.on("connection", (socket) => {
  socket.on("message", async (message) => {
    const parsedMessage = JSON.parse(message.toString());

    if (parsedMessage.type === "join") {
      const { roomId, username } = parsedMessage.payload;

      let room = await Room.findOne({ roomId });

      if (!room) {
        socket.send(JSON.stringify({ error: "Room does not exist!" }));
        return;
      }

      console.log(`${username} joined room ${roomId}`);

      allSockets.push({ 
        socket, 
        room: roomId, 
        username 
      });

      room.users.push({ 
        username, 
        socketId: socket.url 
      });
      await room.save();

      // Notify all users in the room
      allSockets.forEach((user) => {
        if (user.room === roomId) {
          user.socket.send(JSON.stringify({ 
            message: `${username} joined room ${roomId}` 
          }));
        }
      });
    }

    if (parsedMessage.type === "create") {
      const { roomId, username } = parsedMessage.payload;

      let existingRoom = await Room.findOne({ roomId });

      if (existingRoom) {
        socket.send(JSON.stringify({ error: "Room already exists!" }));
        return;
      }

      const newRoom = new Room({ roomId, users: [{ username, socketId: socket.url }] });
      await newRoom.save();

      console.log(`${username} created room ${roomId}`);

      allSockets.push({ socket, room: roomId, username });

      socket.send(JSON.stringify({ message: `Room ${roomId} created successfully!` }));
    }

    if (parsedMessage.type === "race") {
      console.log("User wants to race");

      let currentUser = allSockets.find((x) => x.socket === socket);
      if (!currentUser) return;

      let currentRoom = currentUser.room;

      allSockets.forEach((user) => {
        if (user.room === currentRoom) {
          user.socket.send(JSON.stringify({ message: parsedMessage.payload.message }));
        }
      });
    }
  });

  socket.on("close", async () => {
    let userIndex = allSockets.findIndex((user) => user.socket === socket);
    if (userIndex !== -1) {
      const { room, username } = allSockets[userIndex];
      allSockets.splice(userIndex, 1);

      await Room.updateOne({ roomId: room }, { $pull: { users: { username } } });

      allSockets.forEach((user) => {
        if (user.room === room) {
          user.socket.send(JSON.stringify({ message: `${username} left the room.` }));
        }
      });
    }
  });
});

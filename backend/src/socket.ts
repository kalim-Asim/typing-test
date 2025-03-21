import { WebSocketServer, WebSocket } from "ws";
import { Server } from "http";
const socketMap = new Map<string, WebSocket>(); // store socketId -> WebSocket mappings
import { Room } from "./model"
import { v4 as uuidv4 } from "uuid"; // to generate unique IDs

const connectSocket = (server: Server) => {
  const wss = new WebSocketServer({ server });
  wss.on("connection", (socket) => {
      const socketId = uuidv4(); // generate unique socket ID
      socketMap.set(socketId, socket); // store WebSocket in map

      socket.on("message", async (message) => {
          const parsedMessage = JSON.parse(message.toString());
            console.log(" am i runnig ? ")
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

              let existingRoom = await Room.findOne({ roomId });
              if (!existingRoom) {
                  socket.send(JSON.stringify({ 
                    type: "error", 
                    message: "Room already exists" 
                }));
                  return;
              }
            let newRoom = new Room({
                roomId,
                users: [{username, socketId}],
            });
            await newRoom.save();

            socket.send(JSON.stringify({
                type: "roomCreated",
                message: `Room ${roomId} created successfully`,
                users: [username],
            }));
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

          if (parsedMessage.type === "chat") {
            let room = await Room.findOne({ "users.socketId": socketId });
    
            if (!room) return;
    
            const { message } = parsedMessage.payload;
            const sender = room.users.find(user => user.socketId === socketId)?.username || "Unknown";
    
            room.users.forEach(user => {
              const userSocket = socketMap.get(user.socketId);
              if (userSocket) {
                userSocket.send(
                  JSON.stringify({
                    type: "chat",
                    message: `${sender}: ${message}`,
                  })
                );
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
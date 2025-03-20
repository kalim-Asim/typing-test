import express from "express";
import http from "http";
import { WebSocketServer, WebSocket } from "ws";
import cors from "cors";
import { Request, Response } from "express-serve-static-core";
import connectDB from "./db";
import dotenv from "dotenv";
import { Room } from "./model"
import { v4 as uuidv4 } from "uuid"; // to generate unique IDs

dotenv.config();

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

connectDB();
app.use(express.json());
app.use(cors());

// @ts-ignore
app.post("/api/room/create", async (req: Request, res: Response) => {
    const { roomId, username } = req.body;

    if (!roomId || !username) {
        return res.status(400).json({ message: "Room ID and Username are required" });
    }

    try {
        let existingRoom = await Room.findOne({ roomId });
        if (existingRoom) {
            return res.status(400).json({ message: "Room already exists. Choose another Room ID." });
        }

        const newRoom = new Room({
            roomId,
            users: [{ username, socketId: null }],
        });
        await newRoom.save();
        return res.json({ message: `Room ${roomId} created successfully` });
    } catch (error) {
        return res.status(500).json({ message: "Error creating room", error });
    }
});

// @ts-ignore
app.post("/api/room/join", async (req: Request, res: Response) => {
    const { roomId, username } = req.body;

    if (!roomId || !username) {
        return res.status(400).json({ message: "Room ID and Username are required" });
    }

    try {
        let room = await Room.findOne({ roomId });
        if (!room) {
            return res.status(404).json({ message: "Room not found" });
        }

        const userExists = room.users.some(user => user.username === username);
        if (!userExists) {
            room.users.push({ username, socketId: "" });
            await room.save();
        }

        return res.json({ message: `Joined room ${roomId} successfully` });
    } catch (error) {
        return res.status(500).json({ message: "Error joining room", error });
    }
});


const socketMap = new Map<string, WebSocket>(); // Store socketId -> WebSocket mappings

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
        socketMap.delete(socketId); // Remove WebSocket from map
        await Room.updateMany({}, { $pull: { users: { socketId } } });
    });
});




const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

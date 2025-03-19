import express from "express";
import http from "http";
import { WebSocketServer, WebSocket } from "ws";
import cors from "cors";
import { Request, Response } from "express-serve-static-core";
import connectDB from "./db";
const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });
connectDB();
app.use(express.json());
app.use(cors());

interface User {
    socket: WebSocket;
    room: string;
    username: string;
}

interface Room {
    roomId: string;
    users: User[];
}

let rooms: Room[] = [];

// @ts-ignore
app.post("/api/room/create", (req: Request, res: Response) => {
    const { roomId, username } = req.body;

    if (!roomId || !username) {
        return res.status(400).json({ message: "Room ID and Username are required" });
    }

    // Check if room already exists
    let existingRoom = rooms.find((room) => room.roomId === roomId);
    if (existingRoom) {
        return res.status(400).json({ 
            message: "Room already exists. Choose another Room ID." 
        });
    }

    // Create new room
    rooms.push({ roomId, users: [] });
    return res.json({ message: `Room ${roomId} created successfully` });
});

// @ts-ignore
app.post("/api/room/join", (req: Request, res: Response) => {
    const { roomId, username } = req.body;

    if (!roomId || !username) {
        return res.status(400).json({ message: "Room ID and Username are required" });
    }

    // Find the room
    let room = rooms.find((r) => r.roomId === roomId);
    if (!room) {
        return res.status(404).json({ message: "Room not found" });
    }

    return res.json({ 
        message: `Joined room ${roomId} successfully` 
    });
});

wss.on("connection", (socket) => {
    socket.on("message", (message) => {
        const parsedMessage = JSON.parse(message.toString());

        if (parsedMessage.type === "join") {
            const { roomId, username } = parsedMessage.payload;

            console.log(`${username} joined room ${roomId}`);

            let room = rooms.find((r) => r.roomId === roomId);
            if (!room) return;

            room.users.push({ socket, room: roomId, username });

            room.users.forEach((user) => {
                user.socket.send(`${username} joined room ${roomId}`);
            });
        }

        if (parsedMessage.type === "race") {
            let room = rooms.find((r) => r.users.some((u) => u.socket === socket));
            if (!room) return;

            room.users.forEach((user) => {
                user.socket.send(parsedMessage.payload.message);
            });
        }
    });

    socket.on("close", () => {
        rooms.forEach((room) => {
            room.users = room.users.filter((user) => user.socket !== socket);
        });
    });
});


server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

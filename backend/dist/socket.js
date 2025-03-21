"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = require("ws");
const socketMap = new Map(); // Store socketId -> WebSocket mappings
const model_1 = require("./model");
const uuid_1 = require("uuid"); // to generate unique IDs
const connectSocket = (server) => {
    const wss = new ws_1.WebSocketServer({ server });
    wss.on("connection", (socket) => {
        const socketId = (0, uuid_1.v4)(); // Generate unique socket ID
        socketMap.set(socketId, socket); // Store WebSocket in map
        socket.on("message", (message) => __awaiter(void 0, void 0, void 0, function* () {
            var _a;
            const parsedMessage = JSON.parse(message.toString());
            if (parsedMessage.type === "join") {
                const { roomId, username } = parsedMessage.payload;
                let room = yield model_1.Room.findOne({ roomId });
                if (!room) {
                    socket.send(JSON.stringify({ type: "error", message: "Room not found" }));
                    return;
                }
                const userIndex = room.users.findIndex(user => user.username === username);
                if (userIndex === -1) {
                    room.users.push({ username, socketId });
                }
                else {
                    room.users[userIndex].socketId = socketId;
                }
                yield room.save();
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
                let room = yield model_1.Room.findOne({ roomId });
                if (!room) {
                    socket.send(JSON.stringify({ type: "error", message: "Room not found" }));
                    return;
                }
                // Update socketId for the creator
                const userIndex = room.users.findIndex(user => user.username === username);
                if (userIndex !== -1) {
                    room.users[userIndex].socketId = socketId;
                    yield room.save();
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
                let room = yield model_1.Room.findOne({ "users.socketId": socketId });
                if (!room)
                    return;
                room.users.forEach(user => {
                    const userSocket = socketMap.get(user.socketId);
                    if (userSocket) {
                        userSocket.send(parsedMessage.payload.message);
                    }
                });
            }
            if (parsedMessage.type === "chat") {
                let room = yield model_1.Room.findOne({ "users.socketId": socketId });
                if (!room)
                    return;
                const { message } = parsedMessage.payload;
                const sender = ((_a = room.users.find(user => user.socketId === socketId)) === null || _a === void 0 ? void 0 : _a.username) || "Unknown";
                // Broadcast chat message to all users in the room
                room.users.forEach(user => {
                    const userSocket = socketMap.get(user.socketId);
                    if (userSocket) {
                        userSocket.send(JSON.stringify({
                            type: "chat",
                            message: `${sender}: ${message}`,
                        }));
                    }
                });
            }
        }));
        socket.on("close", () => __awaiter(void 0, void 0, void 0, function* () {
            socketMap.delete(socketId);
            yield model_1.Room.updateMany({}, { $pull: { users: { socketId } } });
        }));
    });
};
exports.default = connectSocket;

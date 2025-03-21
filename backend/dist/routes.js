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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const model_1 = require("./model");
//@ts-ignore
router.post("/create", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { roomId, username } = req.body;
    console.log(roomId, username);
    if (!roomId || !username) {
        return res.status(400).json({ message: "Room ID and Username are required" });
    }
    try {
        let existingRoom = yield model_1.Room.findOne({ roomId });
        if (existingRoom) {
            return res.status(400).json({ message: "Room already exists. Choose another Room ID." });
        }
        const newRoom = new model_1.Room({
            roomId,
            users: [{ username, socketId: null }],
        });
        yield newRoom.save();
        return res.json({ message: `Room ${roomId} created successfully` });
    }
    catch (error) {
        return res.status(500).json({ message: "Error creating room", error });
    }
}));
//@ts-ignore
router.post("/join", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { roomId, username } = req.body;
    if (!roomId || !username) {
        return res.status(400).json({ message: "Room ID and Username are required" });
    }
    try {
        let room = yield model_1.Room.findOne({ roomId });
        if (!room) {
            return res.status(404).json({ message: "Room not found" });
        }
        const userExists = room.users.some(user => user.username === username);
        if (!userExists) {
            room.users.push({ username, socketId: "" });
            yield room.save();
        }
        return res.json({ message: `Joined room ${roomId} successfully` });
    }
    catch (error) {
        return res.status(500).json({ message: "Error joining room", error });
    }
}));
exports.default = router;

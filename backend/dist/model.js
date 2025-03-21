"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Room = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const RoomSchema = new mongoose_1.default.Schema({
    roomId: { type: String, required: true, unique: true },
    users: [
        {
            username: { type: String, required: true },
            socketId: { type: String, default: "" },
        },
    ],
});
exports.Room = mongoose_1.default.model("Room", RoomSchema);

import mongoose from "mongoose";

const RoomSchema = new mongoose.Schema({
  roomId: { type: String, required: true, unique: true },
  users: [
    {
      username: { type: String, required: true },
      socketId: { type: String, default: "" },
    },
  ],
});

export const Room = mongoose.model("Room", RoomSchema);

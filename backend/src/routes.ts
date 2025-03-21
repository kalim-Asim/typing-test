import express from "express"
const router = express.Router();
import { Request, Response } from "express-serve-static-core";
import { Room } from "./model"

//@ts-ignore
router.post("/create", async (req: Request, res: Response) => {
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
})

//@ts-ignore
router.post("/join", async (req: Request, res: Response) => {
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

export default router;
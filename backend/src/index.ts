import express from "express";
import cors from "cors";
import connectDB from "./db";
import dotenv from "dotenv";
import userRoutes from "./routes";
import connectSocket from "./socket";
dotenv.config();

const app = express();

connectDB();

app.use(express.json());
app.use(cors());
app.post("/api/room/", userRoutes);

connectSocket();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

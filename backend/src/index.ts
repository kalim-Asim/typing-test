import express from "express";
import cors from "cors";
import connectDB from "./db";
import dotenv from "dotenv";
import userRoutes from "./routes";
import connectSocket from "./socket";
import http from "http";  
const app = express();
const server = http.createServer(app);
dotenv.config();

connectDB();

app.use(express.json());
app.use(cors());
app.use("/api/room", userRoutes);

 
connectSocket(server); 

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

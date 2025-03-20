import mongoose from "mongoose";
import dotenv from "dotenv"
dotenv.config();
// @ts-ignore
const MONGO_URI = "mongodb+srv://asim1306iiit:asim1306iiit@newcluster.vvih8.mongodb.net/typing-arena"; 

const connectDB = async () => {
    try {
        // @ts-ignore
        await mongoose.connect(MONGO_URI);
        console.log("MongoDB connected successfully");
    } catch (error) {
        console.error("MongoDB connection error:", error);
        process.exit(1);
    }
};

export default connectDB;

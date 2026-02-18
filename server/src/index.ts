import express, { Request, Response } from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";

// Load environment variables
dotenv.config();

const app = express();

// Production CORS configuration
const corsOptions = {
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  methods: ["GET", "POST"],
};

app.use(cors(corsOptions));
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: corsOptions,
});

// Database Connection
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/syncboard";

mongoose
  .connect(MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Database Schema
const drawingSchema = new mongoose.Schema({
  roomId: { type: String, required: true, index: true },
  prevPoint: {
    x: Number,
    y: Number,
  },
  currentPoint: {
    x: { type: Number, required: true },
    y: { type: Number, required: true },
  },
  color: { type: String, required: true },
  size: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
});

const Drawing = mongoose.model("Drawing", drawingSchema);

interface User {
  id: string;
  name: string;
  cursor?: { x: number; y: number };
}

// In-memory state for active connections and ephemeral data (cursors)
const activeRooms: Record<string, { users: User[] }> = {};

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on(
    "join-room",
    async ({ roomId, userName }: { roomId: string; userName: string }) => {
      socket.join(roomId);

      if (!activeRooms[roomId]) {
        activeRooms[roomId] = { users: [] };
      }

      const newUser: User = { id: socket.id, name: userName };
      activeRooms[roomId].users.push(newUser);

      try {
        // Fetch history from DB for initial sync
        const history = await Drawing.find({ roomId })
          .sort({ createdAt: 1 })
          .lean();
        socket.emit("get-canvas-state", history);
        socket.emit("room-users", activeRooms[roomId].users);

        // Notify others
        socket.to(roomId).emit("user-joined", newUser);
        console.log(`${userName} joined room: ${roomId}`);
      } catch (error) {
        console.error("Error joining room:", error);
      }
    },
  );

  socket.on(
    "draw-data",
    async ({ roomId, drawData }: { roomId: string; drawData: any }) => {
      // Broadcast to others immediately for low latency
      socket.to(roomId).emit("draw-data", drawData);

      // Persist to DB asynchronously
      try {
        const newDrawing = new Drawing({
          roomId,
          ...drawData,
        });
        await newDrawing.save();
      } catch (error) {
        console.error("Error saving drawing data:", error);
      }
    },
  );

  socket.on(
    "cursor-move",
    ({
      roomId,
      cursor,
    }: {
      roomId: string;
      cursor: { x: number; y: number };
    }) => {
      if (activeRooms[roomId]) {
        const user = activeRooms[roomId].users.find((u) => u.id === socket.id);
        if (user) {
          user.cursor = cursor;
          socket.to(roomId).emit("cursor-move", { userId: socket.id, cursor });
        }
      }
    },
  );

  socket.on("clear-canvas", async (roomId: string) => {
    try {
      // Clear from DB
      await Drawing.deleteMany({ roomId });
      io.to(roomId).emit("clear-canvas");
    } catch (error) {
      console.error("Error clearing canvas:", error);
    }
  });

  socket.on("disconnecting", () => {
    socket.rooms.forEach((roomId) => {
      if (activeRooms[roomId]) {
        activeRooms[roomId].users = activeRooms[roomId].users.filter(
          (u) => u.id !== socket.id,
        );
        socket.to(roomId).emit("user-left", socket.id);
      }
    });
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// Health check endpoint
app.get("/health", (req: Request, res: Response) => {
  res.status(200).send("OK");
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(
    `Server running in ${process.env.NODE_ENV || "development"} mode on port ${PORT}`,
  );
});

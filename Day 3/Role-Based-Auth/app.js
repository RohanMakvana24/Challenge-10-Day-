import express from "express";
import dotenv from "dotenv";
import DBConnect from "./config/database/DBConnect.js";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/authRoutes.js";
import rateLimiter from "./middleware/rateLimiter.js";

// Dotenv config
dotenv.config();

// Databse Config
DBConnect();

// server setup
const port = process.env.PORT || 3000;
const server = express();

// Middleware
server.use(express.json());
server.use(express.urlencoded({ extended: true }));
server.use(cors());
server.use(helmet());
server.use(morgan("dev"));
server.use(cookieParser());
server.use(rateLimiter({ windowState: 60, maxRequest: 5 }));

// Routes
server.use("/api/auth", authRoutes);

// Server Listen
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

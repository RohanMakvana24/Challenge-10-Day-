import express from "express";
import dotenv from "dotenv";
import router from "./routes/index.js";
import { rateLimiter } from "./middlewares/index.js";

// Dotenv Config
dotenv.config();
const app = express();

app.use(rateLimiter({ windowSize: 10, maxRequests: 2 }));
app.use("/", router);

app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});

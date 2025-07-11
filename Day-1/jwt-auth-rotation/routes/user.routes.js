import { Router } from "express";
import { Login, RefreshToken, Signup } from "../middlewares/UserController.js";

const router = Router();

// Register route
router.post("/register", Signup);

// Login route
router.post("/login", Login);

// refresh token route
router.post("/refresh-token", RefreshToken);

export default router;

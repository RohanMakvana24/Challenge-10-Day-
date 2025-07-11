import {Router} from "express";
import {Login, logout, refreshToken, Signup} from "../controllers/userController.js";


const router = Router();

// Register route
router.post("/register", Signup);

// Login route
router.post("/login", Login);

// refresh token route
router.post("/refresh-token", refreshToken);

// logout route
router.get("/logout", logout);

export default router;

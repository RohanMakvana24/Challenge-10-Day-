import {Router} from "express";
import {
    getUser,
    Login,
    logout,
    refreshToken,
    Signup
} from "../controllers/userController.js";
import {isAuthenticated} from "../middlewares/auth.js";


const router = Router();

// Register route
router.post("/register", Signup);

// Login route
router.post("/login", Login);

// refresh token route
router.post("/refresh-token", refreshToken);

// logout route
router.get("/logout", logout);

// Protected Route
router.get("/me", isAuthenticated, getUser)

export default router;

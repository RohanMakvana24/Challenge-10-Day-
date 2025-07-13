import express from "express";

import {LoginVaalidator, SignupValidator} from "../middleware/userValidator.js";
import Validate from "../middleware/Validate.js";
import {
    getUser,
    login,
    Logout,
    refreshToken,
    Signup
} from "../controllers/authController.js";
import {authorizeRole, isAuthenticated} from "../middleware/isAuth.js";


const authRoutes = express.Router();

// `` Signup Route ``
authRoutes.post("/signup", SignupValidator, Validate, Signup);

// `` Login Route ``
authRoutes.post("/login", LoginVaalidator, Validate, login);

// `` Refresh Token Route ``
authRoutes.get("/refresh-token", refreshToken);

// `` Logout Route ``
authRoutes.post("/logout", isAuthenticated, Logout);

// `` Get User Route ``
authRoutes.get("/get-user", isAuthenticated, authorizeRole("admin"), getUser)
export default authRoutes;

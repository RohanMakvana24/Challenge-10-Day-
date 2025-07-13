import express from "express";

import { SignupValidator } from "../middleware/userValidator.js";
import Validate from "../middleware/Validate.js";
import { Signup } from "../controllers/authController.js";

const authRoutes = express.Router();

// `` Login Route ``
authRoutes.post("/signup", SignupValidator, Validate, Signup);

export default authRoutes;

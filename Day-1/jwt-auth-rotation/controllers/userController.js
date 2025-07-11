import User from "../models/UserModel.js";
import { generateAccessToken, generateRefreshToken } from "../utils/token.js";
import redisClient from "../redis/client.js";

// Signup Controller
export const Signup = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const user = await UserfindOne({ email });
  if (user) {
    return res.status(400).json({ message: "User already exists" });
  }

  const newUser = await User.create({ name, email, password });

  //token generatyion
  const accessToken = generateAccessToken({ id: newUser._id });
  const refreshToken = generateRefreshToken({ id: newUser._id });

  res.status(201).json({
    message: "User created successfully",
    user: newUser,
    accessToken,
    refreshToken,
  });
};

// Login Controller
export const Login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(400).json({ message: "User not found" });
  }

  const isPasswordCorrect = await user.comparePassword(password);
  if (!isPasswordCorrect) {
    return res.status(400).json({ message: "Invalid password" });
  }

  const accessToken = generateAccessToken({ id: user._id });
  const refreshToken = generateRefreshToken({ id: user._id });

  res.status(200).json({
    message: "Login successful",
    user: user,
    accessToken,
    refreshToken,
  });
};

// Refresh Token Controller

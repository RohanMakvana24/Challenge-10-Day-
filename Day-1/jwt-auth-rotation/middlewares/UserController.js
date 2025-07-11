import redisClient from "../redis/client.js";
import { generateAccessToken, generateRefreshToken } from "../utils/token.js";
import jwt from "jsonwebtoken";
import User from "../models/UserModel.js";
// Ragister Controller
export const Signup = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;
    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email });
    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists" });
    }

    // Save New User
    const newUser = new User({
      fullName,
      email,
      password,
    });
    await newUser.save();

    // Generate tokens
    const accessToken = generateAccessToken({ id: user._id });
    const refreshToken = generateRefreshToken({ id: user._id });

    // Send response
    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        userId: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    console.log("Error in Signup:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

// Login Controller
export const Login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
    // Check if user exists
    const user = await User.findOne({ email: email });
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "User does not exist" });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid password" });
    }

    // Generate tokens
    const accessToken = generateAccessToken({ id: user._id });
    const refreshToken = generateRefreshToken({ id: user._id });

    // Send response
    return res.status(200).json({
      success: true,
      message: "User logged in successfully",
      data: {
        userId: user._id,
        fullName: user.fullName,
        email: user.email,
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    console.log("Error in Login:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

// Refresh Token Controller
export const RefreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res
        .status(400)
        .json({ success: false, message: "Refresh token is required" });
    }

    const BlackListedToken = await redisClient.get(refreshToken);
    if (BlackListedToken) {
      return res
        .status(403)
        .json({ success: false, message: "Refresh token is blacklisted" });
    }

    // Verify refresh token
    const decode = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const userId = decode.id;

    // store redis token
    await redisClient.set(refreshToken, "blacklistedToken", {
      EX: 7 * 24 * 60 * 60,
    });

    const newAccessToken = generateAccessToken({ id: userId });
    const newRefreshToken = generateRefreshToken({ id: userId });

    // Set new refresh token in cookie
    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "Strict",
      path: "/api/auth/refresh",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({ success: true, accessToken: newAccessToken });
  } catch (error) {
    console.log("Error in RefreshToken:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

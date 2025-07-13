import User from "../models/UserModel.js";
import {generateAccessToken, generateRefreshToken} from "../utils/token.js";
import redisClient from "../redis/client.js";
import jwt from "jsonwebtoken"
// Signup Controller
export const Signup = async (req, res) => {
    try {
        const {name, email, password} = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({message: "All fields are required"});
        }

        const user = await User.findOne({email});
        if (user) {
            return res.status(400).json({message: "User already exists"});
        }

        const newUser = await User.create({name, email, password});

        // token generatyion
        const accessToken = generateAccessToken({id: newUser._id});
        const refreshToken = generateRefreshToken({id: newUser._id});

        res.status(201).json({
            success: true,
            message: "User created successfully",
            user: newUser,
            accessToken,
            refreshToken
        });
    } catch (error) {
        console.log(error)
        return res.status(500).json({success: false, message: "Internal server error"})
    }
};

// Login Controller
export const Login = async (req, res) => {
    try {
        const {email, password} = req.body;
        if (!email || !password) {
            return res.status(400).json({message: "All fields are required"});
        }

        const user = await User.findOne({email});
        if (! user) {
            return res.status(400).json({message: "User not found"});
        }

        const isPasswordCorrect = await user.comparePassword(password);
        if (! isPasswordCorrect) {
            return res.status(400).json({message: "Invalid password"});
        }

        const accessToken = generateAccessToken({id: user._id});
        const refreshToken = generateRefreshToken({id: user._id});

        res.status(200).json({
            success: true,
            message: "Login successful",
            user: user,
            accessToken,
            refreshToken
        });
    } catch (error) {
        console.log(error)
        return res.status(500).json({success: false, message: "Internal server error"})
    }
};

// Refresh Token Controller
export const refreshToken = async (req, res) => {
    try {
        const {refreshToken} = req.body;
        if (! refreshToken) {
            return res.status(400).json({success: false, message: "Refresh token is required"})
        }

        const isBlacklisted = await redisClient.get(`blacklisted:${refreshToken}`);
        if (isBlacklisted) {
            return res.status(403).json({success: false, message: "Token is blacklisted"});
        }

        const decoded = jwt.decode(refreshToken, process.env.REFRESH_TOKEN_SECRET);
        const userId = decoded.id;
        // Blacklist this refresh token
        await redisClient.set(`blacklisted:${refreshToken}`, "true", {
            EX: 7 * 24 * 60 * 60, // 7 days
        });
        const newAccessToken = generateAccessToken({id: userId});

        res.status(200).json({success: true, message: "Token refreshed successfully", accessToken: newAccessToken})

    } catch (error) {
        console.log(error)
        return res.status(500).json({success: false, message: "Internal server error"})
    }
}


// logout controller
export const logout = async (req, res) => {
    try {
        const {refreshToken} = req.body;
        if (! refreshToken) {
            return res.status(400).json({success: false, message: "Refresh token is required"})
        }

        await redisClient.set(`blacklisted:${refreshToken}`, "true", {
            EX: 7 * 24 * 60 * 60
        })
        res.status(200).json({success: true, message: "Logged out successfully"})
    } catch (error) {
        console.log(error)
        return res.status(500).json({success: false, message: "Internal server error"})
    }
}

// ~~ Get User Controller ~~
export const getUser = async (req, res) => {
    try {
        const userId = req.userId;
        const user = await User.findById(userId).select("-password");
        if (! user) {
            return res.status(404).json({success: false, message: "User not found"})
        }
        res.status(200).json({success: true, message: "User fetched successfully", user})
    } catch (error) {
        console.log(error)
        return res.status(504).json({success: false, message: "Internal server error"})
    }
}

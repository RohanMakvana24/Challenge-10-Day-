import redisClient from "../redis/redis.js";
import {generatesAccessToken, generatesRefreshToken} from "../utils/Token.js";
import jwt from "jsonwebtoken";
import UserModel from "../models/userModel.js";

// `` Signup Controller ``
export const Signup = async (req, res) => {
    try {
        const {username, email, password, role} = req.body;

        // Check if user already exists
        const user = await UserModel.findOne({email});
        if (user) {
            return res.status(400).json({message: "User already exists"});
        }

        // Create new user
        const newUser = await UserModel.create({username, email, password, role});

        // Generates Access Token
        const accessToken = generatesAccessToken(newUser._id);
        // Refresh Token
        const refreshToken = generatesRefreshToken(newUser._id);


        // response
        return res.status(201).cookie("accessToken", accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "Strict",
            maxAge: 15 * 60 * 1000, // 15 minutes
        }).cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "Strict",
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        }).json({
            success: true,
            message: "User created successfully",
            user: {
                _id: newUser._id,
                username: newUser.username,
                email: newUser.email,
                role: newUser.role
            },
            accessToken,
            refreshToken
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({success: false, message: "Internal Server Error"});
    }
};

// `` Login Controller ``
export const login = async (req, res) => {
    try {
        const {email, password} = req.body;

        // Check user exist
        const user = await UserModel.findOne({email});
        if (! user) {
            return res.status(400).json({success: false, message: "User not found"});
        }

        // Password Check
        const isPasswordCorrect = await user.comparePassword(password);
        if (! isPasswordCorrect) {
            return res.status(400).json({success: false, message: "Invalid Login Credentials"})
        }

        // generates Access Token
        const accessToken = generatesAccessToken(user._id);

        // generates Refresh Token
        const refreshToken = generatesRefreshToken(user._id);

        // response
        return res.status(200).cookie("accessToken", accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "Strict",
            maxAge: 15 * 60 * 1000, // 15 minutes
        }).cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "Strict",
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        }).json({
            success: true,
            message: "Login Successfully",
            user: {
                _id: user._id
            },
            accessToken,
            refreshToken
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({success: false, message: "Internal Server Error"});
    }
}

// `` Refresh Token Controller ``
export const refreshToken = async (req, res) => {
    try {
        const refreshToken = req.headers ?. authorization ?. split(" ")[1] || req.cookies.refreshToken;
        if (! refreshToken) {
            return res.status(401).json({success: false, message: "Unauthorized"})
        }

        // Check if Refresh Token is blacklisted
        const isBlackListed = await redisClient.get(`RefreshToken:${refreshToken}`);
        if (isBlackListed) {
            return res.status(401).json({success: false, message: "Blacklisted Refresh Token"})
        }

        const decoded = jwt.decode(refreshToken, process.env.REFRESH_TOKEN_SECRET);
        const userId = decoded.id;

        // Store Refresh Token in Redis
        await redisClient.set(`RefreshToken:${refreshToken}`, "true", {
            EX: 60 * 60 * 24 * 7
        })

        // gnerates Access Token
        const accessToken = generatesAccessToken(userId);
        // Set new access token cookie
        res.cookie("accessToken", accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "Strict",
            maxAge: 15 * 60 * 1000, // 15 minutes
        });
        // response
        return res.status(200).json({success: true, message: "Token Refreshed Successfully", accessToken})
    } catch (error) {
        console.log(error)
        return res.status(500).json({success: false, message: "Internal Server Error"})
    }
}

// Logout Controller
export const Logout = async (req, res) => {
    try {
        const refreshToken = req.body.refreshToken;
        if (! refreshToken) {
            return res.status(401).json({success: false, message: "Refresh Token is required"})
        }

        const BlacklistedToken = await redisClient.get(`RefreshToken:${refreshToken}`);
        if (BlacklistedToken) {
            return res.status(401).json({success: false, message: "Blacklisted Refresh Token"})
        }

        await redisClient.set(`RefreshToken:${refreshToken}`, "true", {
            EX: 60 * 60 * 24 * 7
        })
        res.clearCookie("accessToken");
        res.clearCookie("refreshToken");
        // response
        return res.status(200).json({success: true, message: "Logout Successfully"})

    } catch (error) {
        console.log(error)
        return res.status(500).json({success: false, message: "Internal Server Error"})
    }
}


// Get User Controller
export const getUser = async (req, res) => {
    try {
        return res.status(200).json({success: true, message: "User fetched successfully", user: req.user})
    } catch (error) {
        console.log(error)
        return res.status(500).json({success: false, message: "Internal Server Error"})
    }
}

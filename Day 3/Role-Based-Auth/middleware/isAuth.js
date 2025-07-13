import UserModel from "../models/userModel.js";
import jwt from "jsonwebtoken";


// `` Authenticated Using Access Token ``
export const isAuthenticated = async (req, res, next) => {
    try {
        const token = req.headers ?. authorization ?. split(" ")[1] || req.cookies ?. accessToken;
        if (! token) {
            return res.status(401).json({success: false, message: "Unauthorized"})
        }

        const decoded = jwt.decode(token, process.env.ACCESS_TOKEN_SECRET);
        const userId = decoded.id;

        const user = await UserModel.findById(userId);
        if (! user) {
            return res.status(401).json({success: false, message: "Unauthorized"})
        }
        req.user = user;
        next();
    } catch (error) {
        console.log(error)
        return res.status(500).json({success: false, message: error.message})
    }
}

// `` Authorize using the role ``
export const authorizeRole = (...roles) => {
    return(req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({success: false, message: "Role not authorized"})
        }
        next();
    }
}

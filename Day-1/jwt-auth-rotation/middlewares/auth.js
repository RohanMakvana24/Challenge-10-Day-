import jwt from "jsonwebtoken";

export const isAuthenticated = async (req, res, next) => {
    try {
        const token = req.headers.authorization ?. split(" ")[1];
        if (! token) {
            return res.status(401).json({success: false, message: "Please login to access this resource"})
        }
        const decoded = jwt.verify(token, "access_secret");
        req.userId = decoded.id;
        next();

    } catch (error) {
        console.log(error);
        res.status(500).json({success: false, message: error.message})
    }
}

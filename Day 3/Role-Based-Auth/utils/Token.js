import jwt from "jsonwebtoken";

export const generatesAccessToken = (userId) => {
    return jwt.sign({
        id: userId
    }, process.env.ACCESS_TOKEN_SECRET, {expiresIn: "15m"})
}


export const generatesRefreshToken = (userId) => {
    return jwt.sign({
        id: userId
    }, process.env.REFRESH_TOKEN_SECRET, {expiresIn: "7d"})
}

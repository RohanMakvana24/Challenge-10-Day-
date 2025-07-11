import jwt from "jsonwebtoken";

export function generateAccessToken(payload) {
  return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET || "access_secret", {
    expiresIn: "15m",
  });
}

export function generateRefreshToken(payload) {
  return jwt.sign(
    payload,
    process.env.REFRESH_TOKEN_SECRET || "refresh_secret",
    { expiresIn: "7d" }
  );
}

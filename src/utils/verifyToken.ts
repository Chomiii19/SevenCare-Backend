import jwt from "jsonwebtoken";

const verifyToken = (token: string) => {
  if (!process.env.JWT_SECRET_KEY) throw new Error("JWT secret key not found");

  return jwt.verify(token, process.env.JWT_SECRET_KEY);
};

export default verifyToken;
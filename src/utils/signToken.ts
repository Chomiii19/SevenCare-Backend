import jwt, { JwtPayload, SignOptions } from "jsonwebtoken";

const signToken = (payload: JwtPayload): string => {
  if (!process.env.JWT_SECRET_KEY) throw new Error("JWT secret key not found");

  return jwt.sign(payload, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRES_IN as string,
  } as SignOptions);
};

export default signToken;

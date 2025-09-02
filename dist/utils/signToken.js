"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
var signToken = function (payload) {
    if (!process.env.JWT_SECRET_KEY)
        throw new Error("JWT secret key not found");
    return jsonwebtoken_1.default.sign(payload, process.env.JWT_SECRET_KEY, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });
};
exports.default = signToken;

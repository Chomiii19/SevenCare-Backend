import mongoose, { Schema } from "mongoose";

const PasswordResetCodeSchema = new mongoose.Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User" },
  codeHash: String,
  expiresAt: Date,
  createdAt: { type: Date, default: Date.now },
  used: { type: Boolean, default: false },
});

const PasswordResetCode = mongoose.model(
  "passwordResetCode",
  PasswordResetCodeSchema,
);

export default PasswordResetCode;

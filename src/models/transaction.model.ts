import mongoose, { Schema } from "mongoose";
import { ITransactions } from "../@types/interfaces";

const TransactionSchema = new mongoose.Schema<ITransactions>({
  appointmentId: {
    type: Schema.Types.ObjectId,
    ref: "appointment",
    required: true,
  },
  amount: {
    type: Number,
    required: true,
    default: 0,
  },
  modeOfPayment: String,
  status: {
    type: String,
    default: "Pending",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
});

const Transaction = mongoose.model("transaction", TransactionSchema);

export default Transaction;

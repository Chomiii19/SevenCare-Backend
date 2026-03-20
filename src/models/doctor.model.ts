import mongoose from "mongoose";
import { IDoctors } from "../@types/interfaces";

const DoctorSchema = new mongoose.Schema<IDoctors>({
  firstname: {
    type: String,
    required: [true, "Name can't be empty"],
  },
  middlename: {
    type: String,
    required: [true, "Name can't be empty"],
  },
  surname: {
    type: String,
    required: [true, "Name can't be empty"],
  },
  suffix: {
    type: String,
    default: "",
  },
  specialization: {
    type: String,
    required: [true, "Specialization can't be empty"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Doctor = mongoose.model("doctor", DoctorSchema);

export default Doctor;

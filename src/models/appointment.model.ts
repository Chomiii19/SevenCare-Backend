import mongoose, { Schema } from "mongoose";
import validator from "validator";

const AppointmentSchema = new mongoose.Schema({
  patientId: {
    type: Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  medicalDepartment: {
    type: String,
    required: true,
    enum: [
      "Consultation",
      "Vaccination",
      "Medical Certificate",
      "Laboratory",
      "Holistic Care",
      "Circumcision/TULI",
      "Medical Check Up",
      "Prenatal Check Up",
      "Family Planning",
    ],
  },
  schedule: {
    type: Date,
    required: true,
  },
  email: {
    type: String,
    required: [true, "Email field is required"],
    validate: [validator.isEmail, ""],
  },
  phoneNumber: {
    type: String,
    required: [true, "PhoneNumber field is required"],
  },
  status: {
    type: String,
    default: "Pending",
  },
  isPaid: {
    type: Boolean,
    default: false,
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

const Appointment = mongoose.model("Appointment", AppointmentSchema);

export default Appointment;
import mongoose, { Schema } from "mongoose";

const AppointmentSchema = new mongoose.Schema({
  patientId: {
    type: Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  doctorId: {
    type: [{ type: Schema.Types.ObjectId, ref: "doctor" }],
    default: [],
  },
  medicalDepartment: {
    type: [{ type: Schema.Types.ObjectId, ref: "service" }],
    required: true,
    validate: {
      validator: function (v: mongoose.Types.ObjectId[]) {
        return v.length > 0 && v.length <= 3;
      },
      message: "You must select between 1 and 3 departments",
    },
  },
  medicalRecords: {
    type: [{ type: Schema.Types.ObjectId, ref: "medicalrecord" }],
    default: [],
  },
  email: {
    type: String,
    required: true,
  },
  schedule: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    default: "Pending",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  isArchived: {
    type: Boolean,
    default: false,
  },
});

const Appointment = mongoose.model("appointment", AppointmentSchema);

export default Appointment;

import express from "express";
import * as appointmentController from "../controllers/appointment.controller";

const router = express.Router();

router.route("/create").post(appointmentController.createAppointment);
router.route("/").get(appointmentController.getAppointments);

export default router;
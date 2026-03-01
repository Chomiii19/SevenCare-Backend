import { Router } from "express";
import {
  createSchedule,
  getSchedules,
  getSchedule,
  updateSchedule,
  deleteSchedule,
  getTodaySchedules,
  getDoctorsForAppointment,
} from "../controllers/schedule.controller";

const router = Router();

router.get("/today", getTodaySchedules);
router.get("/:appointmentId/doctors-available", getDoctorsForAppointment);
router.get("/:id", getSchedule);
router.patch("/:id", updateSchedule);
router.delete("/:id", deleteSchedule);
router.post("/", createSchedule);
router.get("/", getSchedules);

export default router;

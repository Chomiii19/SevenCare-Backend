import express from "express";
import { upload } from "../middlewares/multer";
import {
  deleteMedicalRecord,
  getAppointmentsWithMedicalRecord,
  uploadMedicalRecord,
} from "../controllers/medicalRecord.controller";

const router = express.Router();

router.get(
  "/appointments/with-medical-record",
  getAppointmentsWithMedicalRecord,
);
router.post("/upload", upload.single("file"), uploadMedicalRecord);
router.delete("/:recordId/appointments/:appointmentId", deleteMedicalRecord);

export default router;

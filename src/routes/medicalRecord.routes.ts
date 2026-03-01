import express from "express";
import { upload } from "../middlewares/multer";
import {
  deleteMedicalRecord,
  uploadMedicalRecords,
  getMedicalRecords,
  getMedicalRecord,
  updateMedicalRecord,
} from "../controllers/medicalRecord.controller";

const router = express.Router();

router.post("/upload", upload.array("files"), uploadMedicalRecords);
router.get("/", getMedicalRecords);
router.get("/:id", getMedicalRecord);
router.patch("/:id", upload.single("file"), updateMedicalRecord);
router.delete("/:recordId/appointments/:appointmentId", deleteMedicalRecord);

export default router;

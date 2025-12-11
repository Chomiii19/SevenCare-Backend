import express from "express";
import { upload } from "../middlewares/multer";
import { uploadMedicalRecord } from "../controllers/medicalRecord.controller";

const router = express.Router();

router.post("/upload", upload.single("file"), uploadMedicalRecord);

export default router;

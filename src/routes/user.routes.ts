import express from "express";
import * as userController from "../controllers/user.controller";

const router = express.Router();

router.route("/my-account").post(userController.myAccount);

export default router;

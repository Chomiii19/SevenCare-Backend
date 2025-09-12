import express from "express";
import * as userController from "../controllers/user.controller";

const router = express.Router();

router.route("/my-account").get(userController.myAccount);
router.route("/update").patch(userController.updateAccount);

export default router;

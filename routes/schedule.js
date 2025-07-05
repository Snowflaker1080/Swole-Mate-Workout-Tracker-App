import express from "express";
import * as scheduleController from "../controllers/schedule.js";
const router = express.Router();

router.get("/", scheduleController.index);
router.get("/schedule", scheduleController.index);
router.post("/assign", scheduleController.assign);

export default router;
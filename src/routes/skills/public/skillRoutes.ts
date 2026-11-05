import express from "express";
import skillController from "../../../controllers/skillController.ts";

const router = express.Router();

router.get("/skills/public", skillController.getAllPublicSkills);

export default router;
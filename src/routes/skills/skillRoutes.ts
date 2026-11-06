import express from "express";
import skillController from "../../controllers/skillController.ts";
import {validatorCreateSkill} from "../../middleware/validators.ts";
import {validatorDeleteSkill} from "../../middleware/validators.ts";
import authMiddleware from "../../middleware/authValidator.ts";

const router = express.Router();

router.get("/skills", skillController.findSkillById);
router.get("/skills", authMiddleware, skillController.getAllMySkills);
router.post("/skills", validatorCreateSkill, authMiddleware, skillController.createSkill);
router.delete("/skills", validatorDeleteSkill, authMiddleware, skillController.deleteSkill);
router.patch("/skills", validatorDeleteSkill, authMiddleware, skillController.updateSkill);

export default router;

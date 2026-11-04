import express from "express";
import * as skillController from "../../controllers/skillController.ts";
import responserModule from "responser";
import {validatorCreateSkill} from "../../middleware/validators.ts";
import {validatorDeleteSkill} from "../../middleware/validators.ts";
import authMiddleware from "../../middleware/authValidator.ts";

const responser = responserModule.default;

const router = express.Router();

router.use(responser);

router.get("/skills", skillController.getAllSkills);
router.post("/skills", validatorCreateSkill, authMiddleware, skillController.createSkill);
router.delete("/skills", validatorDeleteSkill, authMiddleware, skillController.deleteSkill);

export default router;
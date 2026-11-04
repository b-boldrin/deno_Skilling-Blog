import express from "express";
import * as skillController from "../../controllers/skillController.ts";
import responserModule from "responser";
import {validatorCreateSkill} from "../../middleware/validators.ts";
import {validatorDeleteSkill} from "../../middleware/validators.ts";

const responser = responserModule.default;

const router = express.Router();

router.use(responser);

router.get("/skills", skillController.getAllSkills);
router.post("/skills", validatorCreateSkill, skillController.createSkill);
router.delete("/skills", validatorDeleteSkill, skillController.deleteSkill);

export default router;
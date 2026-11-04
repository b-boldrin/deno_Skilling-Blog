import express from "express";
import * as skillController from "../../controllers/skillController.ts";
import responserModule from "responser";
import validateRequest from "../../middleware/validators.ts";

const responser = responserModule.default;

const router = express.Router();

router.use(responser);

router.get("/skills", skillController.getAllSkills);
router.post("/skills", validateRequest, skillController.createSkill);
router.delete("/skills", skillController.deleteSkill);
router.post("/login", skillController.loginUser);

export default router;
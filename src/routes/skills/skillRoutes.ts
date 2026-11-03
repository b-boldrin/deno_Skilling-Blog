import express from "express";
import * as userController from "../../controllers/skillController.ts";
import responserModule from "responser";

const responser = responserModule.default;

const router = express.Router();

router.use(responser);

router.get("/skills", userController.getAllSkills);
router.post("/skills", userController.createSkill);

export default router;
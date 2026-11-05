import express from "express";
import * as skillController from "../../../controllers/skillController.ts";
import responserModule from "responser";
import authMiddleware from "../../../middleware/authValidator.ts";

const responser = responserModule.default;

const router = express.Router();

router.use(responser);

router.get("/skills/public", skillController.getAllPublicSkills);

export default router;
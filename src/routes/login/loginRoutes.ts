import express from "express";
import authController from "../../controllers/authController.ts";
import responserModule from "responser";
import { validatorUserSign } from "../../middleware/validators.ts";

const responser = responserModule.default;

const router = express.Router();

router.use(responser);

router.post("/login", validatorUserSign, authController.login);

export default router;
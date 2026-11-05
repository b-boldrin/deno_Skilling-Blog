import express from "express";
import authController from "../../controllers/authController.ts";
import responserModule from "responser";

const responser = responserModule.default;

const router = express.Router();

router.use(responser);

router.post("/login", authController.login);

export default router;
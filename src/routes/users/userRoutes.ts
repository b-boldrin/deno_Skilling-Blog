import express from "express";
import userController from "../../controllers/userController.ts";
import authMiddleware from "../../middleware/authValidator.ts";
import { validatorUserSign } from "../../middleware/validators.ts";

const router = express.Router();

router.get("/users", userController.getAllUsers);
router.post("/users", validatorUserSign, userController.createUser);
router.patch("/users",  authMiddleware, userController.updateUserPassword);
router.delete("/users",  authMiddleware, userController.deleteHimselfUser);

export default router;
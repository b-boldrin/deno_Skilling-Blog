import express from "express";
import * as userController from "../../controllers/userController.ts";
import responserModule from "responser";
import authMiddleware from "../../middleware/authValidator.ts";

const responser = responserModule.default;

const router = express.Router();

router.use(responser);

router.get("/users", userController.getAllUsers);
router.post("/users", userController.createUser);
router.patch("/users",  authMiddleware, userController.updateUserPassword);
router.delete("/users",  authMiddleware, userController.deleteHimselfUser);

export default router;
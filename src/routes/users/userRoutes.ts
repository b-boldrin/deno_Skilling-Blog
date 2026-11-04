import express from "express";
import * as userController from "../../controllers/userController.ts";
import responserModule from "responser";
import {validatorCreateSkill} from "../../middleware/validators.ts";
import {validatorDeleteSkill} from "../../middleware/validators.ts";

const responser = responserModule.default;

const router = express.Router();

router.use(responser);

router.post("/users", userController.createUser);
router.get("/users", userController.getAllUsers);
router.put("/users", userController.updateUser);
router.delete("/users", userController.deleteUser);

export default router;
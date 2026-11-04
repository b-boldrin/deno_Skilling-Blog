import express from "express";
import skillRouter from "./routes/skills/skillRoutes.ts";
import userRouter from "./routes/users/userRoutes.ts";
import authRouter from "./routes/login/loginRoutes.ts";
import responserModule from "responser"
const responser = responserModule.default

const main = express();

main.use(express.json());
main.use(express.urlencoded({ extended: true }));
main.use(responser);
main.use(skillRouter);
main.use(userRouter);
main.use(authRouter);

export default main;

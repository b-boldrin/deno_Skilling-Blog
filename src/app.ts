import express from "express";
import router from "./routes/skills/skillRoutes.ts";
import responserModule from "responser"
const responser = responserModule.default

const main = express();

main.use(express.json());
main.use(responser);
main.use(router)

export default main;

import express from "express";
import skillRouter from "./routes/skills/skillRoutes.ts";
import skillPublicRouter from "./routes/skills/public/skillRoutes.ts";
import userRouter from "./routes/users/userRoutes.ts";
import authRouter from "./routes/login/loginRoutes.ts";
import responserModule from "responser"

import throwlhosModule from "throwlhos";

const throwlhos = (
  throwlhosModule as unknown as {
    default: {
      middleware: express.RequestHandler;
    };
  }
).default;

const responser = responserModule.default

const main = express();



main.use(express.json());
main.use(express.urlencoded({ extended: true }));

main.use(throwlhos.middleware);
main.use(responser);

main.use(skillRouter);
main.use(userRouter);
main.use(authRouter);
main.use(skillPublicRouter);

main.use((_req : express.Request, res : express.Response , next : express.NextFunction) => {
  next(res.err_notFound("Route not found"));
});

main.use((error: any, _req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (res.headersSent) {
    return next(error);
  }

  const code =
    typeof error.code === "number" &&
    error.code >= 400 &&
    error.code <= 599
      ? error.code
      : 500;

  return res.status(code).json({
    success: false,
    code,
    status: error.status ?? "INTERNAL_SERVER_ERROR",
    message: error.message ?? "Internal Server Error",
    ...(error.errors !== undefined && {
      errors: error.errors
    }),
    ...(error.i18n !== undefined && {
      i18n: error.i18n
    })
  });
});



export default main;

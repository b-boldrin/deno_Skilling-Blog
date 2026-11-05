import express from "express";
import skillRouter from "./routes/skills/skillRoutes.ts";
import skillPublicRouter from "./routes/skills/public/skillRoutes.ts";
import userRouter from "./routes/users/userRoutes.ts";
import authRouter from "./routes/login/loginRoutes.ts";
import responserModule from "responser"
import throwlhosModule from "throwlhos"
import morgan from "morgan"



const throwlhos = (
  throwlhosModule as unknown as {
    default: {
      middleware: express.RequestHandler;
    };
  }
).default;

const responser = responserModule.default

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(morgan("dev"))

app.use(throwlhos.middleware);
app.use(responser);

app.use(skillRouter);
app.use(userRouter);
app.use(authRouter);
app.use(skillPublicRouter);

app.use((_req : express.Request, res : express.Response , next : express.NextFunction) => {
  next(res.err_notFound("Route not found"));
});

app.use((error: any, _req: express.Request, res: express.Response, next: express.NextFunction) => {
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



export default app;

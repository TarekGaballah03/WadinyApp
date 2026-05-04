// src/app.controller.js
import { connectionDB } from "./DB/connectionDB.js";
import userRouter from "./modules/users/user.controller.js";
import { globalErrorHandler } from "./utils/globalErrorHandling/index.js";
import cors from "cors";
import path from "path";

const bootstrap = async (app, express) => {
  app.use(cors());
  app.use("/uploads", express.static(path.resolve("src/uploads")));
  app.use(express.json());

  await connectionDB();

  app.get("/", (req, res) => {
    return res.status(200).json({ message: "Welcome to Wedeny API 🚀" });
  });

  app.use("/users", userRouter);

 app.use((req, res, next) => {
    return next(new Error(`Invalid URL ${req.originalUrl}`, { cause: 404 }));
});

  app.use(globalErrorHandler);
};

export default bootstrap;
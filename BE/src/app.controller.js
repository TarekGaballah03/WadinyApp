// src/app.controller.js
import { connectionDB } from "./DB/connectionDB.js";
import userRouter from "./modules/users/user.controller.js";
import { globalErrorHandler } from "./utils/globalErrorHandling/index.js";
import restaurantRouter from "./modules/restaurants/restaurant.controller.js";
import reviewRouter from "./modules/reviews/review.controller.js";
import aiRouter from "./modules/ai/ai.controller.js";
import postRouter from "./modules/posts/post.controller.js";
import reportRouter from "./modules/reports/report.controller.js";
import bookingRouter from "./modules/bookings/booking.controller.js";
import mapRouter from "./modules/map/map.routes.js";

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
  app.use("/restaurants", restaurantRouter);
  app.use("/reviews", reviewRouter);
  app.use("/ai", aiRouter);
  app.use("/posts", postRouter);
  app.use("/reports", reportRouter);
  app.use("/bookings", bookingRouter);
  app.use("/map", mapRouter);


  app.use((req, res, next) => {
    return next(new Error(`Invalid URL ${req.originalUrl}`, { cause: 404 }));
  });

  app.use(globalErrorHandler);
};

export default bootstrap;
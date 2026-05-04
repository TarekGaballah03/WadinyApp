// BE/index.js
import dotenv from "dotenv";
import path from "path";
import express from "express";
import bootstrap from "./src/app.controller.js";

// load env variables
dotenv.config({ path: path.resolve("src/config/.env") });

const app = express();
const port = process.env.PORT || 3000;

// start the server
bootstrap(app, express);

app.listen(port, () => {
  console.log(`🚀 Server is running on http://localhost:${port}`);
});
// src/modules/ai/ai.controller.js
import { Router } from "express";
import * as AS from "./ai.service.js";
import { authentication } from "../../middleware/auth.js";

const aiRouter = Router();

// Endpoint for AI chat with context injection
aiRouter.post("/chat", authentication, AS.chat);

export default aiRouter;

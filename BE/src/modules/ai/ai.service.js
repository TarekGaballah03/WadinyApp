// src/modules/ai/ai.service.js
import { GoogleGenerativeAI } from "@google/generative-ai";
import { reportModel } from "../../DB/models/report.model.js";
import { restaurantModel } from "../../DB/models/restaurant.model.js";
import { asyncHandler } from "../../utils/globalErrorHandling/index.js";

export const chat = asyncHandler(async (req, res, next) => {
  const { message } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return next(new Error("AI service is currently unavailable (API Key missing)", { cause: 503 }));
  }

  // 1. Fetch Context from MongoDB
  // We fetch the latest 5 active reports and 5 top restaurants to keep the prompt size manageable
  const [reports, restaurants] = await Promise.all([
    reportModel.find({ isDeleted: false, status: "active" }).sort({ createdAt: -1 }).limit(5),
    restaurantModel.find({ isDeleted: false, isActive: true }).sort({ avgRating: -1 }).limit(5)
  ]);

  // 2. Format Context for the AI
  const reportContext = reports.map(r => 
    `- ${r.issueType} at ${r.location || "unknown location"}: ${r.note || "No details"}`
  ).join("\n");

  const restaurantContext = restaurants.map(rest => 
    `- ${rest.name} (${rest.category}) in ${rest.address?.area || rest.location}: Rating ${rest.avgRating}/5. Tags: ${rest.tags?.join(", ") || "none"}`
  ).join("\n");

  // 3. Initialize Gemini
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ 
    model: "gemini-1.5-flash",
    systemInstruction: `You are the Wadiny Assistant, a helpful AI integrated into the Wadiny mapping and social app. 
    Your goal is to help users navigate their city (Alexandria), find great places to eat, and stay safe on the road.
    
    Current App Data (Real-time):
    TRAFFIC & HAZARDS:
    ${reportContext || "No active traffic reports at the moment."}
    
    TOP RECOMMENDED PLACES:
    ${restaurantContext || "Check back later for new recommendations."}
    
    Rules:
    - If a user asks about traffic or hazards, refer to the data provided above.
    - If a user asks for recommendations, suggest the restaurants listed above.
    - If the user asks for something not in the data, answer generally but mention you are specifically the Wadiny Assistant.
    - Be friendly, concise, and helpful.`
  });

  // 4. Generate Response
  try {
    const result = await model.generateContent(message);
    const response = await result.response;
    const text = response.text();

    return res.status(200).json({ 
      success: true, 
      message: text 
    });
  } catch (error) {
    return next(new Error(`AI Generation failed: ${error.message}`, { cause: 500 }));
  }
});

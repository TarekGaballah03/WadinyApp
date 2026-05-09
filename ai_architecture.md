# Wadiny AI Architecture: Context Injection vs. Vector DB

This document explains the strategy for implementing the AI Assistant in the Wadiny application.

## 1. The Chosen Approach: Context Injection (RAG-Lite)

For Wadiny, we have chosen **Context Injection** (also known as Retrieval Augmented Generation or RAG-Lite) over a complex Vector Database.

### How the Flow Works:
1. **User Query**: The user asks, "Are there any traffic issues in Smouha?"
2. **Context Retrieval**: The Backend performs a standard MongoDB query to find the latest reports in Smouha.
3. **Prompt Augmentation**: The Backend creates a detailed prompt for the AI:
   > "You are the Wadiny Assistant. Real-time reports for Smouha: [Report 1: Pothole, Report 2: Heavy Traffic]. User asks: 'Are there any traffic issues?'"
4. **AI Processing**: The Gemini API processes the prompt and the context.
5. **App-Specific Response**: The AI answers based on the *actual* data from our database.

---

## 2. Context Injection vs. Vector Database

| Feature | Context Injection (Our Choice) | Vector Database (Pinecone/Chroma) |
| :--- | :--- | :--- |
| **Data Type** | Dynamic / Real-time (Posts, Reports) | Static / Large-scale (Books, Manuals) |
| **Complexity** | Low (uses your existing MongoDB) | High (requires extra infra & embeddings) |
| **Cost** | Free (integrated with Gemini API) | Paid (usually requires a subscription) |
| **Speed** | Very Fast for specific queries | Fast for similarity searches |
| **Freshness** | Always up-to-date with MongoDB | Needs "Re-indexing" when data changes |

### Why we DON'T need a Vector DB yet:
Wadiny's "knowledge" changes every minute (new traffic reports, new social posts). A Vector DB would require us to convert every single new post into a "vector embedding" and save it to a separate database. For our current scale, querying MongoDB directly and feeding the top results to the AI is more efficient and accurate.

---

## 3. The Implementation Plan

### Backend (BE)
- **Module**: `src/modules/ai`
- **Dependency**: `@google/generative-ai`
- **Logic**:
  - Fetch recent Hazard Reports from `reportModel`.
  - Fetch top-rated Restaurants from `restaurantModel`.
  - Pass this data to Gemini as "Current App State".

### Frontend (FE)
- **Component**: `src/components/ai/AIPage.jsx`
- **Logic**: Call `POST /ai/chat` and display the streaming or final response.

---

## 4. How to Get Started
1. Get a **Gemini API Key** from [Google AI Studio](https://aistudio.google.com/).
2. Add it to your `.env` as `GEMINI_API_KEY`.
3. The AI will immediately start giving answers based on your MongoDB data.

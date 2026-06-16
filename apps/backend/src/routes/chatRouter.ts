// apps/backend/src/routes/chatRouter.ts
import { Router, Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';
// 1. FIXED: Explicitly use the combined import pattern to catch the named export
import yieldRouter, { currentYieldsCache } from './yieldRouter.js';

const chatRouter = Router();

// 2. FIXED: Safeguard the API key extraction to satisfy strict TypeScript definitions
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.warn("⚠️ Warning: GEMINI_API_KEY is not defined in the environment variables configuration.");
}

// Pass a guaranteed string fallback to the constructor
const ai = new GoogleGenAI({ apiKey: apiKey || '' });

chatRouter.post('/chat', async (req: Request, res: Response): Promise<void> => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      res.status(400).json({ error: 'Prompt is required' });
      return;
    }

    const liveYieldsContext = currentYieldsCache || {};

    // Call Gemini with strict JSON schema enforcement
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash', 
      contents: `User Prompt: "${prompt}"\n\nLive Metrics Context: ${JSON.stringify(liveYieldsContext)}`,
      config: {
        systemInstruction: "You are the AlphaRoute Intent Engine. Your sole job is to translate user natural language into a structured transaction strategy JSON object based on the provided live context. Do not include markdown code block formatting backticks—output raw JSON only.",
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            intent: { type: "string", description: "The core action, e.g., yield_optimize, check_balance, rebalance" },
            asset: { type: "string", description: "The token ticker symbol, e.g., SUI, vSUI, USDC" },
            amount: { type: "number", description: "The exact numerical asset volume requested" },
            targetProtocol: { type: "string", description: "The optimized protocol chosen from the context array" },
            reasoning: { type: "string", description: "A brief engineering rationale for this specific routing path" }
          },
          required: ["intent", "asset", "amount", "targetProtocol", "reasoning"]
        }
      }
    });

    // Extract text safely from the response structure
    const responseText = response.text;
    if (!responseText) {
      throw new Error('Empty text payload returned from generative matrix engine.');
    }

    // Parse the structured response directly
    const intentPayload = JSON.parse(responseText);
    
    // Return the response back to your terminal UI view
    res.json({ 
      reply: `[INTENT DETECTED: ${intentPayload.intent}]\nAsset: ${intentPayload.amount} ${intentPayload.asset}\nTarget Route: ${intentPayload.targetProtocol}\n\nStrategy Analysis:\n${intentPayload.reasoning}` 
    });

  } catch (error) {
    console.error('Gemini Intent Parsing Exception:', error);
    res.status(500).json({ error: 'Failed to process agent routing matrix' });
  }
});

export default chatRouter;
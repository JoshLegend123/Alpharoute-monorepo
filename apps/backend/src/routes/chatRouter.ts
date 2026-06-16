// apps/backend/src/routes/chatRouter.ts
import { Router, Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';
import yieldRouter, { currentYieldsCache } from './yieldRouter.js';
// 1. IMPORT YOUR EXISTING COMPILER FROM THE SRC FOLDER
// apps/backend/src/routes/chatRouter.ts

// Change Line 9 to point exactly one folder up, ending in .js:
import { compileYieldIntent } from '../ptbCompiler.js';

const chatRouter = Router();

const apiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey: apiKey || '' });

chatRouter.post('/chat', async (req: Request, res: Response): Promise<void> => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      res.status(400).json({ error: 'Prompt is required' });
      return;
    }

    const liveYieldsContext = currentYieldsCache || {};

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash', 
      contents: `User Prompt: "${prompt}"\n\nLive Metrics Context: ${JSON.stringify(liveYieldsContext)}`,
      config: {
        systemInstruction: "You are the AlphaRoute Intent Engine. Your sole job is to translate user natural language into a structured transaction strategy JSON object based on the provided live context. Do not include markdown code block formatting backticks—output raw JSON only. IMPORTANT: For the asset field, always match the ticker precisely (e.g., vSUI).",
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            intent: { type: "string", description: "The core action, e.g., yield_optimize, check_balance" },
            asset: { type: "string", description: "The token ticker symbol, e.g., SUI, vSUI, USDC" },
            amount: { type: "number", description: "The exact numerical asset volume requested" },
            targetProtocol: { type: "string", description: "The optimized protocol chosen from the context array" },
            reasoning: { type: "string", description: "A brief engineering rationale for this specific routing path" }
          },
          required: ["intent", "asset", "amount", "targetProtocol", "reasoning"]
        }
      }
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error('Empty text payload returned from generative engine.');
    }

    const intentPayload = JSON.parse(responseText);
    
    // 2. CONVERT THE AMOUNT TO MIST (SUI decimals) BEFORE PASSING TO BIGINT
    // This scales the standard number from Gemini up to blockchain integers safely
    const scaledAmount = Math.floor(intentPayload.amount * 1_000_000_000);

    // 3. PASS THE DATA INTO YOUR EXISTING FUNCTION MODULE
    let compiledSuiTxData = '';
    let pipelineStatus = 'Intent mapped successfully. No transaction required.';

    if (intentPayload.intent === 'yield_optimize') {
      try {
        compiledSuiTxData = await compileYieldIntent({
          intent: intentPayload.intent,
          asset: intentPayload.asset,
          amount: scaledAmount, // Scaled for BigInt safety
          protocol: intentPayload.targetProtocol
        });
        pipelineStatus = '🚀 Atomic PTB compiled successfully and attached to response payload.';
      } catch (txError: any) {
        console.error('PTB Compilation error:', txError);
        pipelineStatus = `⚠️ Intent parsed, but PTB compilation failed: ${txError.message}`;
      }
    }

    // 4. RETURN BOTH THE ANALYSIS AND THE BINARY TRANSACTION DATAPACKET
    res.json({ 
      reply: `[INTENT DETECTED: ${intentPayload.intent}]\nAsset: ${intentPayload.amount} ${intentPayload.asset}\nTarget Route: ${intentPayload.targetProtocol}\n\nStrategy Analysis:\n${intentPayload.reasoning}\n\nPipeline Status:\n${pipelineStatus}`,
      txData: compiledSuiTxData 
    });

  } catch (error) {
    console.error('Gemini Intent Parsing Exception:', error);
    res.status(500).json({ error: 'Failed to process agent routing matrix' });
  }
});

export default chatRouter;
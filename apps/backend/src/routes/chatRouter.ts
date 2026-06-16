// apps/backend/src/routes/chatRouter.ts
import { Router, Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';
import { getLiveYieldsCache } from './yieldRouter.js'; // Swapped for the live dynamic function getter
import { compileYieldIntent } from '../ptbCompiler.js'; // Direct relative link with ESM extension

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

    // 1. DYNAMIC CONTEXT EXTRACTION: Grab hot memory cache allocations
    let activeCache = getLiveYieldsCache();

    // 2. EMERGENCY SELF-HEALING FALLBACK: If memory context is empty, pull directly from the active api route
    if (!activeCache || Object.keys(activeCache).length === 0) {
      console.log('[AlphaRoute Matrix] Cache reference isolated. Triggering emergency internal fetch synchronization loop...');
      try {
        // Construct local address mapping using the environment port context natively
        const serverPort = process.env.PORT || 8080;
        const localResponse = await fetch(`http://127.0.0.1:${serverPort}/api/yields`);
        
        if (localResponse.ok) {
          const parsedEnvelope: any = await localResponse.json();
          // Unbox envelope seamlessly if nested under 'data' parameter attributes
          activeCache = parsedEnvelope?.data || parsedEnvelope;
          console.log('[AlphaRoute Matrix] Emergency sync complete. Local context extracted safely.');
        }
      } catch (fetchError) {
        console.error('[AlphaRoute Matrix Failure] Emergency local fetch execution crashed:', fetchError);
      }
    }

    const liveYieldsContext = activeCache && Object.keys(activeCache).length > 0 
      ? activeCache 
      : null;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash', 
      contents: `User Prompt: "${prompt}"\n\nLive Metrics Context Data: ${JSON.stringify(liveYieldsContext || "No active memory cache data available.")}`,
      config: {
        // 3. REINFORCED CASE-INSENSITIVE AGENT DIRECTIVES
        systemInstruction: "You are the AlphaRoute Intent Engine. Translate natural language into a transaction strategy JSON object. Note that keys in the Live Metrics Context Data are uppercase (e.g., 'SUI', 'VSUI', 'USDC'). Match user requests to these keys regardless of case differences (e.g., 'vSUI' or 'vsui' maps directly to the 'VSUI' context metrics array). Analyze the protocols in the array for that asset and choose the one offering the highest numerical 'apy'. If the context data is empty, default to industry-standard protocols (e.g., Navi for SUI/vSUI lending, Cetus for pool pairs) and explain this fallback in your reasoning. Do not include markdown code block backticks—output raw JSON only.",
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            intent: { type: "string", description: "The core action, e.g., yield_optimize, check_balance" },
            asset: { type: "string", description: "The token ticker symbol found in the user prompt, e.g., vSUI, SUI, USDC" },
            amount: { type: "number", description: "The exact numerical asset volume requested" },
            targetProtocol: { type: "string", description: "The optimized protocol chosen from the context metrics array based on highest APY (e.g., Cetus, Navi)" },
            reasoning: { type: "string", description: "A detailed breakdown citing the specific APY metrics from the context data that make this routing path mathematically superior" }
          },
          required: ["intent", "asset", "amount", "targetProtocol", "reasoning"]
        }
      }
    });

    const responseText = response.text;
    if (!responseText) throw new Error('Empty text payload returned from generative engine.');

    const intentPayload = JSON.parse(responseText);
    const scaledAmount = Math.floor(intentPayload.amount * 1_000_000_000);

    let compiledSuiTxData = '';
    let pipelineStatus = 'Intent mapped successfully. No transaction required.';

    if (intentPayload.intent === 'yield_optimize') {
      try {
        compiledSuiTxData = await compileYieldIntent({
          intent: intentPayload.intent,
          asset: intentPayload.asset,
          amount: scaledAmount,
          protocol: intentPayload.targetProtocol
        });
        pipelineStatus = '🚀 Atomic PTB compiled successfully and attached to response payload.';
      } catch (txError: any) {
        console.error('PTB Compilation error:', txError);
        pipelineStatus = `⚠️ Intent parsed, but PTB compilation failed: ${txError.message}`;
      }
    }

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
// apps/backend/src/routes/chatRouter.ts
import { Router } from 'express';
import { GoogleGenAI } from '@google/genai';
import { currentYieldsCache } from './yieldRouter.js';
import { compileYieldIntent } from '../ptbCompiler.js'; // Direct relative link with ESM extension
const chatRouter = Router();
const apiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey: apiKey || '' });
chatRouter.post('/chat', async (req, res) => {
    try {
        const { prompt } = req.body;
        if (!prompt) {
            res.status(400).json({ error: 'Prompt is required' });
            return;
        }
        // 1. DYNAMIC CONTEXT EXTRACTION: Grab live states or fallback safely
        const liveYieldsContext = currentYieldsCache && Object.keys(currentYieldsCache).length > 0
            ? currentYieldsCache
            : null;
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `User Prompt: "${prompt}"\n\nLive Metrics Context: ${JSON.stringify(liveYieldsContext || "No active memory cache data available.")}`,
            config: {
                // 2. REINFORCED AGENT DIRECTIVES: Explicitly prevent "Unknown" fallback states
                systemInstruction: "You are the AlphaRoute Intent Engine. Translate natural language into a transaction strategy JSON. Read the provided Live Metrics Context. If the context is empty or unpopulated, do not leave targetProtocol as unknown; instead, select the industry-optimal standard protocol for that specific asset (e.g., default vSUI or SUI requests to Navi, and LP pair requests to Cetus) and outline that default routing selection inside your reasoning parameter. Do not include markdown formatting backticks—output raw JSON only.",
                responseMimeType: "application/json",
                responseSchema: {
                    type: "object",
                    properties: {
                        intent: { type: "string", description: "The core action, e.g., yield_optimize, check_balance" },
                        asset: { type: "string", description: "The token ticker symbol, e.g., SUI, vSUI, USDC" },
                        amount: { type: "number", description: "The exact numerical asset volume requested" },
                        targetProtocol: { type: "string", description: "The optimized protocol chosen (e.g., Navi, Cetus)" },
                        reasoning: { type: "string", description: "A brief engineering rationale for this specific routing path" }
                    },
                    required: ["intent", "asset", "amount", "targetProtocol", "reasoning"]
                }
            }
        });
        const responseText = response.text;
        if (!responseText)
            throw new Error('Empty text payload returned from generative engine.');
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
            }
            catch (txError) {
                console.error('PTB Compilation error:', txError);
                pipelineStatus = `⚠️ Intent parsed, but PTB compilation failed: ${txError.message}`;
            }
        }
        res.json({
            reply: `[INTENT DETECTED: ${intentPayload.intent}]\nAsset: ${intentPayload.amount} ${intentPayload.asset}\nTarget Route: ${intentPayload.targetProtocol}\n\nStrategy Analysis:\n${intentPayload.reasoning}\n\nPipeline Status:\n${pipelineStatus}`,
            txData: compiledSuiTxData
        });
    }
    catch (error) {
        console.error('Gemini Intent Parsing Exception:', error);
        res.status(500).json({ error: 'Failed to process agent routing matrix' });
    }
});
export default chatRouter;
//# sourceMappingURL=chatRouter.js.map
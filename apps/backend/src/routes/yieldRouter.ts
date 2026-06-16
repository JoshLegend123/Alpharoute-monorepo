// apps/backend/src/routes/yieldRouter.ts
import { Router, Request, Response } from 'express';
import { getUnifiedYieldData } from '../services/yieldService.js'; 
import { TheGuardian } from '../middleware/guardianService.js'; 

const router = Router();

export let currentYieldsCache: any = {
  // Your live object properties/arrays live here...
};
export function getLiveYieldsCache() {
  return currentYieldsCache;
}

// Initialize the Guardian security engine to inspect Testnet execution blocks
const guardian = new TheGuardian('testnet');

/**
 * GET /api/yields
 * Returns unified DeFi yield opportunities for the Sui network.
 * Optional query parameter: ?symbol=SUI
 */
router.get('/yields', async (req: Request, res: Response) => {
  try {
    console.log('[Router] Incoming request to /api/yields...');
    const { symbol } = req.query;
    
    // Call our unified yield service
    const response = await getUnifiedYieldData();
    console.log('[Router] Fetch completed successfully.');

    let finalData = response.data;
    if (symbol && typeof symbol === 'string') {
      const upperSymbol = symbol.toUpperCase();
      if (finalData[upperSymbol]) {
        finalData = { [upperSymbol]: finalData[upperSymbol] };
      } else {
        finalData = {}; 
      }
    }

    const statusCode = response.errors.length > 0 && Object.keys(finalData).length === 0 
      ? 502 
      : response.errors.length > 0 
        ? 207 
        : 200;

    res.status(statusCode).json({
      success: statusCode < 400,
      errors: response.errors,
      timestamp: response.timestamp,
      data: finalData,
    });
  } catch (error: any) {
    console.error('[Router Error]: Handling yield execution failure:', error);
    res.status(500).json({
      success: false,
      error: error?.message || 'Internal server error while parsing live yield fields.',
      timestamp: Date.now(),
    });
  }
});

/**
 * POST /api/validate
 * Intercepts a serialized PTB payload, runs automated safety validation audits,
 * and generates a visual flowchart schema before the user signs via their web wallet.
 */
router.post('/validate', async (req: Request, res: Response) => {
  try {
    console.log('[Guardian Route] Intercepting transaction block for inspection...');
    const { transactionBlock } = req.body;

    if (!transactionBlock) {
      res.status(400).json({
        success: false,
        error: 'Missing field parameter "transactionBlock" in request payload.'
      });
      return;
    }

    // Pass the transaction payload through security checks
    const auditResult = await guardian.validateTransaction(transactionBlock);

    // Align the JSON success property to accurately reflect safety status
    res.status(auditResult.safe ? 200 : 422).json({
      success: auditResult.safe, 
      audit: auditResult
    });
  } catch (error: any) {
    console.error('[Guardian Route Error]:', error);
    res.status(500).json({
      success: false,
      error: error?.message || 'Internal error handling safety validation loops.',
      timestamp: Date.now()
    });
  }
});

export default router;
// apps/backend/src/ptbCompiler.ts
import { Transaction } from '@mysten/sui/transactions';

export async function compileYieldIntent(intentData: {
  intent: string;
  asset: string;
  amount: number;
  protocol: string;
  senderAddress: string; // Destination routing vector address
}): Promise<string> {
  try {
    const { senderAddress } = intentData;

    // Guard clause validation check
    if (!senderAddress) {
      throw new Error("Cannot compile on-chain strategy: Client matrix missing valid sender address vector parameters.");
    }

    // 1. NORMALIZE TRANSFERRED TICKERS: Force all-caps processing
    const normalizedAsset = intentData?.asset ? String(intentData.asset).toUpperCase() : '';

    // ✨ UPDATE: Array containing all supported tracking tokens
    const allowedAssets = ['SUI', 'VSUI', 'CETUS', 'DEEP', 'HAWK'];

    if (intentData.intent === 'yield_optimize' && allowedAssets.includes(normalizedAsset)) {
      const tx = new Transaction();

      // Convert explicitly to a safe number, then drop it into BigInt to satisfy strict type checking
      const cleanAmount = BigInt(Math.floor(Number(intentData.amount)));
      
      // Explicit u64 type serialization mapping
      const [coin] = tx.splitCoins(tx.gas, [tx.pure.u64(cleanAmount)]);

      // Route the cleanly split coin object straight back to the user's validated senderAddress vector
      tx.transferObjects(
        [coin], 
        tx.pure.address(senderAddress)
      );

      // Serialize the transaction to a clean, transparent Base64 string payload
      return await tx.serialize();
    }

    throw new Error(`Unsupported intent framework: intent='${intentData.intent}', asset='${intentData.asset}'`);
  } catch (error) {
    console.error('[PTB Compiler] Failed to compile yield intent:', error);
    throw new Error(`Transaction compilation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
// apps/backend/src/ptbCompiler.ts
import { Transaction } from '@mysten/sui/transactions';

export async function compileYieldIntent(intentData: any): Promise<string> {
  try {
    // 1. NORMALIZE TRANSFERRED TICKERS: Force all-caps processing (e.g., 'vSUI' or 'vsui' -> 'VSUI')
    const normalizedAsset = intentData?.asset ? String(intentData.asset).toUpperCase() : '';

    if (intentData.intent === 'yield_optimize' && normalizedAsset === 'VSUI') {
      const tx = new Transaction();

      // Convert explicitly to a safe number, then drop it into BigInt to satisfy strict type checking
      const cleanAmount = BigInt(Math.floor(Number(intentData.amount)));
      
      // Explicit u64 type serialization mapping
      const [coin] = tx.splitCoins(tx.gas, [tx.pure.u64(cleanAmount)]);


// 🟡 Update your tx.moveCall block to target Navi's Testnet Contracts:
tx.moveCall({
  target: '0xe17f858a2754e0c0363bbbc2e48e02d6b359f1433f486ccf5e3f718aa6fe7d4b::lending::deposit',
  typeArguments: ['0x2::sui::SUI'],
  arguments: [
    tx.object('0x0b240590a07a16f6b1580f089b275bf14a1e948c3b03683bf1e06927da803a62'), // 1. Navi Testnet Pool Storage Object ID
    coin,                                                                         // 2. Your split SUI coin object
    tx.pure.u8(0)                                                                 // 3. Asset ID for SUI in Navi (0 = SUI)
  ],
});

      return await tx.serialize();
    }

    throw new Error(`Unsupported intent framework: intent='${intentData.intent}', asset='${intentData.asset}'`);
  } catch (error) {
    console.error('[PTB Compiler] Failed to compile yield intent:', error);
    throw new Error(`Transaction compilation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
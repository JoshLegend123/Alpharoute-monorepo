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


// 🟢 Replace your mock tx.moveCall block with this verified Navi Mainnet call:
tx.moveCall({
  target: '0xa1967d710e20600a94432a13dc650ee428fa6e0a811bc0beebda40da753b8118::lending::deposit',
  typeArguments: ['0x2::sui::SUI'],
  arguments: [
    tx.object('0x96b0a471012f190e21bc34e6fb2e62438db72c087bb713919e1f5793cb337ad7'), // 1. Navi Storage/Pool Object ID
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
// apps/backend/src/ptbCompiler.ts
import { Transaction } from '@mysten/sui/transactions';
export async function compileYieldIntent(intentData) {
    try {
        if (intentData.intent === 'yield_optimize' && intentData.asset === 'vSUI') {
            const tx = new Transaction();
            // Convert explicitly to a safe number, then drop it into BigInt to satisfy strict type checking
            const cleanAmount = BigInt(Math.floor(Number(intentData.amount)));
            // FIXED: Use explicit u64 type serialization mapping to clear the Uint8Array error
            const [coin] = tx.splitCoins(tx.gas, [tx.pure.u64(cleanAmount)]);
            tx.moveCall({
                target: '0x0000000000000000000000000000000000000000000000000000000000000123::vault::deposit',
                typeArguments: ['0x2::sui::SUI'],
                arguments: [coin],
            });
            // Serialize the transaction block blueprint into a safe string packet
            return await tx.serialize();
        }
        throw new Error(`Unsupported intent framework: intent='${intentData.intent}', asset='${intentData.asset}'`);
    }
    catch (error) {
        console.error('[PTB Compiler] Failed to compile yield intent:', error);
        throw new Error(`Transaction compilation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}
//# sourceMappingURL=ptbCompiler.js.map
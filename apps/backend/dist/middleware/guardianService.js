import { Transaction } from '@mysten/sui/transactions';
/**
 * Configuration for supported networks and their respective whitelisted package IDs.
 * NOTE: In a production environment, verify these Package IDs against the latest
 * official Navi Protocol and Cetus Protocol documentation or on-chain registries.
 */
const PACKAGE_WHITELIST = {
    mainnet: new Set([
        // Cetus Protocol Mainnet (CLMM)
        '0x06864a6f921804860930db6ddbe2e16acdf8504495ea7481637a1c8b9a8fe54b',
        // Navi Protocol Mainnet (Replace with actual verified Navi Mainnet Package ID)
        '0x1f370d1e7e1e5e6e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e',
    ]),
    testnet: new Set([
        // Cetus Protocol Testnet (Example/Placeholder - verify with Cetus docs)
        '0x2c256d2ae030db12c7015aa1617ad928e60094682750d3e4e76e05202b123456',
        // Navi Protocol Testnet (Example/Placeholder - verify with Navi docs)
        '0x3d367e3bf141ec23d8126bb2728be039f711a5793861e4f5f87f16313c234567',
    ]),
};
/**
 * TheGuardian: A security validation middleware for Sui DeFi Programmable Transaction Blocks (PTBs).
 * Ensures transactions only interact with whitelisted protocols and enforces safe slippage limits.
 */
export class TheGuardian {
    whitelist;
    /**
     * @param network The Sui network to validate against ('mainnet' or 'testnet').
     */
    constructor(network = 'mainnet') {
        this.whitelist = PACKAGE_WHITELIST[network];
    }
    /**
     * Validates a constructed or serialized Programmable Transaction Block (PTB).
     *
     * @param ptb The Transaction object from @mysten/sui or a serialized JSON representation.
     * @returns A promise resolving to the validation result containing safety status, reasons, and a flowchart.
     */
    async validateTransaction(ptb) {
        const result = {
            safe: true,
            reasons: [],
            flowchart: [],
        };
        // Normalize input: handle both Transaction instances and plain serialized objects
        const txData = ptb instanceof Transaction ? ptb.getData() : ptb;
        const commands = txData.commands || [];
        const inputs = txData.inputs || [];
        for (let i = 0; i < commands.length; i++) {
            const command = commands[i];
            const stepNumber = i + 1;
            // 1. Generate Flowchart Step
            const flowchartStep = this.generateFlowchartStep(stepNumber, command, inputs);
            result.flowchart.push(flowchartStep);
            // 2. Validate MoveCall Targets
            if (command.kind === 'MoveCall') {
                const target = command.target;
                const packageId = target.split('::')[0];
                if (!this.whitelist.has(packageId)) {
                    result.safe = false;
                    result.reasons.push(`SECURITY WARNING: Unauthorized Move package ID detected: "${packageId}". ` +
                        `Transaction attempts to call "${target}", which is not in the approved whitelist.`);
                    flowchartStep.status = 'danger';
                    flowchartStep.detail += ' [UNAUTHORIZED PACKAGE]';
                }
                // 3. Validate Slippage / Min Output for Swap Commands
                if (target.toLowerCase().includes('swap')) {
                    const slippageCheck = this.validateSlippage(command, inputs);
                    if (!slippageCheck.isSafe) {
                        result.safe = false;
                        result.reasons.push(slippageCheck.reason);
                        flowchartStep.status = 'danger';
                        flowchartStep.detail += ` [${slippageCheck.reason}]`;
                    }
                    else if (slippageCheck.isWarning) {
                        result.reasons.push(slippageCheck.reason);
                        flowchartStep.status = 'warning';
                        flowchartStep.detail += ` [${slippageCheck.reason}]`;
                    }
                }
            }
        }
        return result;
    }
    /**
     * Resolves a PTB argument to its actual value if it references an input.
     */
    resolveArgument(arg, inputs) {
        if (arg && typeof arg === 'object' && arg.kind === 'Input') {
            const input = inputs[arg.index];
            return input ? input.value : undefined;
        }
        return arg; // Return as-is if it's already a pure value or object reference
    }
    /**
     * Heuristically checks swap command arguments for excessive slippage tolerance.
     * Assumes slippage is passed as a pure number in Basis Points (BPS), where 100 BPS = 1%.
     */
    validateSlippage(command, inputs) {
        const MAX_ALLOWED_BPS = 100; // 1% loss tolerance
        for (const arg of command.arguments || []) {
            const resolvedValue = this.resolveArgument(arg, inputs);
            // Heuristic: If the argument is a pure number and falls in a typical BPS range (1 - 10000)
            if (typeof resolvedValue === 'number' && resolvedValue >= 1 && resolvedValue <= 10000) {
                if (resolvedValue > MAX_ALLOWED_BPS) {
                    return {
                        isSafe: false,
                        isWarning: false,
                        reason: `Slippage tolerance exceeds 1% (100 BPS). Detected: ${resolvedValue} BPS.`,
                    };
                }
            }
        }
        // If no explicit slippage argument is found, we can't guarantee safety, so we warn.
        // In a production system, you might want to query the pool for expected output to verify `min_amount_out`.
        return {
            isSafe: true,
            isWarning: true,
            reason: 'Slippage parameter not explicitly detected in PTB inputs. Ensure min_output_amount is safely calculated off-chain.',
        };
    }
    /**
     * Generates a human-readable flowchart step for a given PTB command.
     */
    generateFlowchartStep(step, command, inputs) {
        let action = 'Unknown Action';
        let detail = 'No details available';
        let status = 'safe';
        switch (command.kind) {
            case 'MoveCall': {
                action = 'Smart Contract Call';
                const target = command.target;
                const [pkg, module, func] = target.split('::');
                detail = `Calling ${module}::${func} on package ${pkg.slice(0, 8)}...${pkg.slice(-4)}`;
                // Attempt to extract a coin amount if it's a known split/transfer pattern
                const amountArg = command.arguments?.find((arg) => {
                    const val = this.resolveArgument(arg, inputs);
                    return typeof val === 'number' && val > 0;
                });
                if (amountArg) {
                    const val = this.resolveArgument(amountArg, inputs);
                    detail += ` (Amount param: ${val})`;
                }
                break;
            }
            case 'SplitCoins': {
                action = 'Split Coin';
                const amountArg = command.arguments?.[1]; // Second argument is usually the amount array
                if (amountArg) {
                    const val = this.resolveArgument(amountArg, inputs);
                    detail = Array.isArray(val)
                        ? `Isolating ${val.length} coin amounts`
                        : `Isolating amount: ${val} MIST`;
                }
                else {
                    detail = 'Isolating a portion of coins';
                }
                break;
            }
            case 'MergeCoins': {
                action = 'Merge Coins';
                detail = 'Combining multiple coin objects into a single target coin';
                break;
            }
            case 'TransferObjects': {
                action = 'Transfer Objects';
                detail = 'Sending assets to a specified recipient address';
                break;
            }
            case 'MakeMoveVec': {
                action = 'Create Vector';
                detail = 'Grouping objects into a Move vector for batch operations';
                break;
            }
            case 'Publish': {
                action = 'Publish Package';
                detail = 'Deploying a new Move package to the network';
                status = 'warning'; // Publishing is inherently risky in automated flows
                break;
            }
            case 'Upgrade': {
                action = 'Upgrade Package';
                detail = 'Upgrading an existing Move package';
                status = 'warning';
                break;
            }
            default:
                action = command.kind;
                detail = 'Custom or unrecognized command type';
                break;
        }
        return { step, action, detail, status };
    }
}
//# sourceMappingURL=guardianService.js.map
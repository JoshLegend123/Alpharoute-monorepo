# 🚀 AlphaRoute — Automated Yield Aggregator & Intent Engine

An institutional-grade, zero-custody natural language intent routing engine built natively for the **Sui Blockchain**. AlphaRoute bridges the gap between conversational AI automation and secure, atomic multi-asset DeFi execution by translating human financial directives into highly optimized **Programmable Transaction Blocks (PTBs)**.

Designed and engineered for the **Sui Overflow 2026 Global Virtual Hackathon** under the **Agentic Web** track.

---

## 📺 Project Demo & Presentation

* **Live Workspace URL:** [https://alpharoutefrontend-production.up.railway.app](https://alpharoutefrontend-production.up.railway.app)
* **High-Impact Demo Video Walkthrough:** [https://youtu.be/7nde1SrG_tk](https://youtu.be/7nde1SrG_tk)

> 💡 **Hackathon Reviewer Note:** This end-to-end architecture demo is packed with core software engineering details. We highly recommend playing the walkthrough video at **1.25x speed** using the YouTube player settings for the optimal pacing experience!

---

## 🛠️ High-Level System Architecture

AlphaRoute implements a decoupled, **multi-layer intent-to-execution pipeline** designed to eliminate user onboarding friction while enforcing absolute client-side cryptographic security boundaries.

```text
[User Natural Language Prompt]
             │
             ▼
[Express Backend Router API] ──> [Gemini 2.5 Flash Intent Parser]
             │                                   │
             ▼                                   ▼
 [ hot cache worker memory ] <── [Dynamic Token Context Validation]
             │
             ▼
[Modular SUI PTB Compiler] ────> Base64 Serialized Transaction
             │
             ▼
[Frontend Guardian Sandbox] ───> Live Pre-Flight Safety Audit Checklists
             │
             ▼
 [Slush Wallet DApp-Kit Bridge] ─> On-Chain Atomic Signature Execution


 Core Architecture Components Successfully Built:
1. Frontend Interface (apps/frontend): A developer-focused terminal-style React workspace container leveraging the official @mysten/dapp-kit for non-custodial wallet standard lifecycle hooks. Features high-value suggestion pills for instant user interaction testing.

2. Intent Parser Kernel (apps/backend/src/routes/chatRouter.ts): Structured AI middleware driven by gemini-2.5-flash. It utilizes strict case-insensitive token mapping and structural JSON schemas to unbox ambiguous user prompts into structured transaction objects.

3. Background Sync Matrix Worker (apps/backend/src/server.ts): An automated interval worker thread running every 5 minutes to scrape and index live multi-asset yield opportunities across Sui infrastructure networks (SUI, vSUI, CETUS, DEEP, HAWK), keeping an in-memory hot memory cache loaded for zero-latency AI analysis.

4. Sui PTB Compiler (apps/backend/src/ptbCompiler.ts): A procedural compiler utilizing the modern @mysten/sui/transactions SDK to programmatically generate scalable transaction blocks, handle type serialization, split gas coin units, and safely target execution vectors back to the validated sender address.

5. Guardian Pre-Flight Audit Module (apps/frontend/src/components/LLMInterface.tsx): An interactive client-side sandbox container that intercepts compiled payloads and triggers real-time simulated security audits (bytecode structure parsing, package boundary tracking, price impact cushion tracking, protocol run-risk evaluation scores) before exposing signature events.

🛡️ Production Roadmap: Post-Hackathon Evolution
While the hackathon MVP effectively demonstrates the end-to-end user experience and validation loop using safe test vectors, the production-funded blueprint transitions from simulated guardrails to cryptographically enforced protocol boundaries:

1. Multi-Protocol Move Composition: Upgrading the ptbCompiler.ts layer to chain real Move call entrypoints across Cetus pools and Navi vaults in a single atomic transaction block—utilizing Sui’s object-centric model to feed output arguments of one function directly into the next.

2. RPC Ledger Dry-Running: Rewiring TheGuardian backend middleware to pass compiled Base64 payloads directly to the node network via the sui_dryRunTransactionBlock RPC endpoint to dynamically inspect balance mutations and flag unauthorized package addresses before signature prompts open.

🚀 Local Installation & Workspace Setup
AlphaRoute is configured as a lightweight, performance-optimized workspace monorepo. Ensure you have Node.js (v18+) and your package manager of choice installed locally.

1. Clone the Source Repository
Bash
git clone [https://github.com/JoshLegend123/alpharoute-monorepo.git](https://github.com/JoshLegend123/alpharoute-monorepo.git)
cd alpharoute-monorepo
2. Configure Environment Secrets
Create a .env file inside the backend root folder (apps/backend/.env):

Code snippet
PORT=3001
GEMINI_API_KEY=your_production_gemini_api_key_here
3. Install Dependencies and Launch Local Services
Bash
# Install root workspace node modules
npm install

# Start the unified backend server kernel (Runs on http://localhost:3001)
npm run dev --workspace=backend

# Start the client frontend server workspace interface (Runs on http://localhost:3000)
npm run dev --workspace=frontend
 
Track Submission Verification Details
Target Sub-Tracks: The Agentic Web

Network Context: Sui Testnet Ledger

Core SDK Primitives Utilized: @mysten/sui/transactions (Transaction framework), @mysten/dapp-kit Browser Wallet Handshake.
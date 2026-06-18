// apps/backend/src/server.ts
import express from 'express';
import cors from 'cors';
import yieldRouter from './routes/yieldRouter.js';
import chatRouter from './routes/chatRouter.js';

// ✨ IMPORT: Grab the unified service fetcher directly to fuel the background worker
import { getUnifiedYieldData } from './services/yieldService.js';
import { currentYieldsCache } from './routes/yieldRouter.js';

const app = express();

app.use(cors({
  origin: [
    'https://alpharoutefrontend-production.up.railway.app',
    'https://alpharoute-frontend-production.up.railway.app',
    'http://localhost:3000'
  ],
  methods: ['GET', 'POST'],
  credentials: true
}));

app.use(express.json());

app.use('/api', yieldRouter);
app.use('/api', chatRouter);

// ===================================================================================
// ✨ BACKGROUND MATRIX WORKER: Keeps your multi-asset yield data hot and fast
// ===================================================================================
async function runBackgroundSyncWorker() {
  try {
    console.log('[Cron Framework] Syncing hot allocations for SUI, VSUI, CETUS, DEEP, HAWK...');
    const freshYields = await getUnifiedYieldData();
    
    if (freshYields && freshYields.data) {
      // Mutate the imported cache object instantly
      Object.assign(currentYieldsCache, freshYields.data);
      console.log('[Cron Framework] Multi-asset memory cache matrix updated successfully.');
    }
  } catch (err) {
    console.error('[Cron Framework Failure] Error running background token sync:', err);
  }
}

// Fire once immediately on server boot up
runBackgroundSyncWorker();

// Automatically update every 5 minutes (300,000 ms)
setInterval(runBackgroundSyncWorker, 300000);
// ===================================================================================

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Production server running securely on port ${PORT}`);
});
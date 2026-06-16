// apps/backend/src/server.ts
import express from 'express';
import cors from 'cors';
import yieldRouter from './routes/yieldRouter.js';
// 1. IMPORT: Register your new Gemini intent compiler route module here
import chatRouter from './routes/chatRouter.js';

const app = express();

// Configure CORS with your exact, character-perfect frontend origins
app.use(cors({
  origin: [
    'https://alpharoutefrontend-production.up.railway.app',   // <-- Match your exact browser origin perfectly
    'https://alpharoute-frontend-production.up.railway.app',  // Alternate layout fallback
    'http://localhost:3000'                                   // Local development fallback
  ],
  methods: ['GET', 'POST'],
  credentials: true
}));

app.use(express.json());

// Target routes setup
app.use('/api', yieldRouter);
// 2. MOUNT: Explicitly map your intent engine so it listens securely for /api/chat requests
app.use('/api', chatRouter);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Production server running securely on port ${PORT}`);
});
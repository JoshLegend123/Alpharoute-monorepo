// apps/backend/src/server.ts
import express, { type Request, type Response, type NextFunction } from 'express';
import cors from 'cors';
import yieldRouter from './routes/yieldRouter'; 

const app = express();
const PORT = Number(process.env.PORT) || 3001;

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());

// Main Health Check
app.get('/api/health', (_req: Request, res: Response) => {
  res.status(200).json({ 
    status: 'ok', 
    message: 'Express is working perfectly',
    timestamp: new Date().toISOString()
  });
});

// Mount the Yield Router
app.use('/api', yieldRouter);

// Global Error Catching Middleware (Stops the server from freezing on internal errors)
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[Global Error Guard]:', err);
  res.status(500).json({
    success: false,
    error: err?.message || 'Internal Server Error Error inside route pipeline.',
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 [Backend] Server running smoothly at http://127.0.0.1:${PORT}`);
  console.log(`📊 [Backend] Testing endpoint: http://127.0.0.1:${PORT}/api/yields`);
});
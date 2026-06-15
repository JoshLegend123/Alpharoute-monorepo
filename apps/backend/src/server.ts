import express from 'express';
import cors from 'cors';
import yieldRouter from './routes/yieldRouter.js';

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

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Production server running securely on port ${PORT}`);
});
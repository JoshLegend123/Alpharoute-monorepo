import express from 'express';
import cors from 'cors'; // <-- Ensure this is imported
import yieldRouter from './routes/yieldRouter.js';

const app = express();

// Configure CORS to whitelist your live frontend URL
app.use(cors({
  origin: [
    'https://alpharoutefrontend-production.up.railway.app/', // <-- Swap this with your actual live frontend link!
    'http://localhost:3000' // Keeps local development working perfectly too
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
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import { initCronJobs } from './services/cronService.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import periodRoutes from './routes/periodRoutes.js';
import flowRoutes from './routes/flowRoutes.js';
import insightRoutes from './routes/insightRoutes.js';
import predictionRoutes from './routes/predictionRoutes.js';
import aiRoutes from './routes/aiRoutes.js';

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

// Initialize background cron tasks
initCronJobs();

const app = express();

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'HerFlow API', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', authRoutes); // Compatibility for /api/user/me & /api/user/email-preference
app.use('/api/periods', periodRoutes);
app.use('/api/flows', flowRoutes);
app.use('/api/flow', flowRoutes); // Alias
app.use('/api/insights', insightRoutes);
app.use('/api/predictions', predictionRoutes);
app.use('/api/ai', aiRoutes);

// 404 Handler
app.use((req, res, next) => {
  res.status(404).json({ error: `Route ${req.originalUrl} not found` });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Unhandled Error]', err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {}),
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🌸 HerFlow Backend API running on http://localhost:${PORT}`);
});

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import connectDB from './config/db.js';
import authRoutes from './routes/auth.js';
import jobRoutes from './routes/jobs.js';      
import applicationRoutes from './routes/applications.js';
import userRoutes from './routes/users.js';

const app = express();

// ── Connect database ───────────────────────────────────
connectDB();

// ── Core Middleware ────────────────────────────────────
app.use(cors({
  origin: ['http://localhost:3000', 'https://job-application-portal-theta.vercel.app'], // Replace with your actual Vercel URL
  credentials: true
}));
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ── Routes ─────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);

// ── Health check ───────────────────────────────────────
app.get('/api/health', (_, res) => res.json({ status: 'ok', timestamp: new Date() }));
app.use('/api/users', userRoutes);

// ── Global error handler ───────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal server error',
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
import express from 'express';
import cors from 'cors';
import stockRoutes from './routes/stockRoutes';
import authRoutes from './routes/authRoutes';
import tickerRoutes from './routes/tickerRoutes';
import oldStockRoutes from './routes/oldStockRoutes';
import commentRoutes from './routes/commentRoutes';
import analyticsRoutes from './routes/analyticsRoutes';
import scraperTasksRoutes from './routes/scraperTasksRoutes';
import { requestLogger } from './middleware/requestLogger';
import { errorHandler } from './middleware/errorHandler';
import { testConnection } from './config/db';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
// CORS is handled by nginx proxy, so we don't need it here
// app.use(cors());
app.use(express.json());
app.use(requestLogger);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/stocks', stockRoutes);
app.use('/api/tickers', tickerRoutes);
app.use('/api/oldstock', oldStockRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/scraper-tasks', scraperTasksRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    const dbConnected = await testConnection();
    
    if (!dbConnected) {
      console.error('Failed to connect to database. Server will not start.');
      process.exit(1);
    }
    
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Error starting server:', error);
    process.exit(1);
  }
};

startServer();
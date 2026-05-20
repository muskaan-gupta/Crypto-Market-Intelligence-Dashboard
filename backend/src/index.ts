import express, { Request, Response } from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import logger from './utils/logger';
import { initializeDb } from './utils/db';
import { initializeRedis } from './services/priceService';
import { errorHandler } from './middleware';
import 'dotenv/config';
import { setIo } from './socket';
// Routes
import authRoutes from './routes/auth';
import pricesRoutes from './routes/prices';
import alertsRoutes from './routes/alerts';
import portfolioRoutes from './routes/portfolio';
import adminRoutes from './routes/admin';

const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Set the Socket.IO instance
setIo(io);

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Socket.IO connections
io.on('connection', (socket) => {
  logger.info(`Client connected: ${socket.id}`);

  socket.on('disconnect', () => {
    logger.info(`Client disconnected: ${socket.id}`);
  });

  socket.on('error', (error) => {
    logger.error(`Socket error for ${socket.id}:`, error);
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/prices', pricesRoutes);
app.use('/api/alerts', alertsRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

// Error handling
app.use(errorHandler);

// Export for worker access
export { io };

const PORT = process.env.PORT || 4000;

async function startServer() {
  try {
    await initializeDb();
    await initializeRedis();

    server.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
    });
  } catch (err) {
    logger.error('Failed to start server', err);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
});

startServer();

export default server;

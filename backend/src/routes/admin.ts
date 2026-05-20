import { Router, Request, Response } from 'express';
import logger from '../utils/logger';
import { getDb } from '../utils/db';

const router = Router();

router.get('/health', async (_req: Request, res: Response) => {
  try {
    const client = await getDb();
    await client.query('SELECT NOW()');
    client.release();

    res.json({
      status: 'healthy',
      timestamp: new Date(),
      database: 'connected',
      uptime: process.uptime(),
    });
  } catch (err: any) {
    logger.error('Health check failed', err);
    res.status(503).json({
      status: 'unhealthy',
      error: err.message,
    });
  }
});

export default router;

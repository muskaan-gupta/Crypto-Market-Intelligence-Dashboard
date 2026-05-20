import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware';
import {
  createAlert,
  getAlertsByUserId,
  deleteAlert,
} from '../services/alertService';
import { createAlertSchema, validate } from '../utils/validation';
import logger from '../utils/logger';

interface AuthRequest extends Request {
  userId?: string;
}

const router = Router();

router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { coinId, coinName, condition, targetPrice } = await validate(
      createAlertSchema,
      req.body
    );

    const alert = await createAlert(
      req.userId!,
      coinId,
      coinName,
      condition,
      targetPrice
    );

    res.status(201).json({
      message: 'Alert created successfully',
      data: alert,
    });
  } catch (err: any) {
    logger.error('Error creating alert', err);
    res.status(400).json({ error: err.message });
  }
});

router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const alerts = await getAlertsByUserId(req.userId!);

    res.json({
      data: alerts,
    });
  } catch (err: any) {
    logger.error('Error fetching alerts', err);
    res.status(500).json({ error: 'Failed to fetch alerts' });
  }
});

router.delete('/:alertId', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { alertId } = req.params;

    await deleteAlert(alertId, req.userId!);

    res.json({ message: 'Alert deleted successfully' });
  } catch (err: any) {
    logger.error('Error deleting alert', err);
    res.status(500).json({ error: 'Failed to delete alert' });
  }
});

export default router;

import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware';
import {
  createPortfolioPosition,
  getPortfolio,
  deletePortfolioPosition,
} from '../services/portfolioService';
import { portfolioPositionSchema, validate } from '../utils/validation';
import { getLatestPrices } from '../services/priceService';
import logger from '../utils/logger';

interface AuthRequest extends Request {
  userId?: string;
}

const router = Router();

router.post('/positions', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { coinId, coinName, quantity, purchasePrice } = await validate(
      portfolioPositionSchema,
      req.body
    );

    const position = await createPortfolioPosition(
      req.userId!,
      coinId,
      coinName,
      quantity,
      purchasePrice
    );

    res.status(201).json({
      message: 'Position added successfully',
      data: position,
    });
  } catch (err: any) {
    logger.error('Error creating portfolio position', err);
    res.status(400).json({ error: err.message });
  }
});

router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const prices = await getLatestPrices();
    const priceMap = new Map(prices.map((p) => [p.coinId, p.price]));

    const portfolio = await getPortfolio(req.userId!, priceMap);

    res.json({
      data: portfolio,
    });
  } catch (err: any) {
    logger.error('Error fetching portfolio', err);
    res.status(500).json({ error: 'Failed to fetch portfolio' });
  }
});

router.delete('/positions/:positionId', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { positionId } = req.params;

    await deletePortfolioPosition(positionId, req.userId!);

    res.json({ message: 'Position deleted successfully' });
  } catch (err: any) {
    logger.error('Error deleting portfolio position', err);
    res.status(500).json({ error: 'Failed to delete position' });
  }
});

export default router;

import { Router, Request, Response } from 'express';
import { getLatestPrices, getPriceHistory } from '../services/priceService';
import logger from '../utils/logger';



const router = Router();

router.get('/live', async (_req: Request, res: Response) => {
  try {
    const prices = await getLatestPrices();

    res.json({
      data: prices,
      timestamp: new Date(),
    });
  } catch (err: any) {
    logger.error('Error fetching live prices', err);
    res.status(500).json({ error: 'Failed to fetch prices' });
  }
});

router.get('/history/:coinId', async (req: Request, res: Response) => {
  try {
    const { coinId } = req.params;
    const days = req.query.days ? parseInt(req.query.days as string) : 7;

    if (days < 1 || days > 365) {
      res.status(400).json({ error: 'Days must be between 1 and 365' });
      return;
    }

    const history = await getPriceHistory(coinId, days);

    res.json({
      coinId,
      days,
      data: history,
    });
  } catch (err: any) {
    logger.error('Error fetching price history', err);
    res.status(500).json({ error: 'Failed to fetch price history' });
  }
});

export default router;

import dotenv from 'dotenv';
dotenv.config();

import logger from './utils/logger';
import { initializeDb } from './utils/db';
import {
  fetchCryptoPrices,
  storePriceSnapshots,
  initializeRedis,
  getLatestPrices,
} from './services/priceService';
import { checkAndTriggerAlerts } from './services/alertService';
import { getIo } from './socket';

let isRunning = false;
let interval: NodeJS.Timeout | null = null;

async function runWorker(): Promise<void> {
  if (isRunning) {
    logger.debug('Worker already running, skipping');
    return;
  }

  isRunning = true;

  try {
    // Fetch prices from CoinGecko
    const prices = await fetchCryptoPrices();
    logger.debug(`Fetched ${prices.length} cryptocurrency prices`);

    // Store in database
    await storePriceSnapshots(prices);

    // Check and trigger alerts
    const priceMap = new Map(prices.map((p) => [p.id, p.current_price]));
    const triggeredAlerts = await checkAndTriggerAlerts(priceMap);

    const io = getIo();

    if (triggeredAlerts.length > 0) {
      logger.info(`Triggered ${triggeredAlerts.length} alerts`);

      if (io) {
        triggeredAlerts.forEach((alert) => {
          io.emit('alert:triggered', {
            alertId: alert.id,
            coinId: alert.coinId,
            coinName: alert.coinName,
            condition: alert.condition,
            targetPrice: alert.targetPrice,
            timestamp: new Date(),
          });
        });
      }
    }

    // Broadcast latest prices to all clients
    if (io) {
      const latestPrices = await getLatestPrices();
      io.emit('prices:updated', {
        prices: latestPrices,
        timestamp: new Date(),
      });
    }
  } catch (err) {
    logger.error('Error in worker cycle', err);
  } finally {
    isRunning = false;
  }
}

async function startWorker(): Promise<void> {
  try {
    await initializeDb();
    await initializeRedis();

    logger.info('Price worker started');

    // Run immediately
    await runWorker();

    // Then every 10 seconds
    interval = setInterval(() => {
      void runWorker();
    }, parseInt(process.env.PRICE_FETCH_INTERVAL || '10000', 10));

    // Graceful shutdown
    const shutdown = () => {
      logger.info('Shutting down worker');
      if (interval) clearInterval(interval);
      process.exit(0);
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  } catch (err) {
    logger.error('Failed to start worker', err);
    process.exit(1);
  }
}

void startWorker();
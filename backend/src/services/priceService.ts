import axios from 'axios';
import { createClient, type RedisClientType } from 'redis';
import logger from '../utils/logger';
import { exponentialBackoff } from '../utils/math';
import { CoinData, PriceSnapshot } from '../types';
import { query } from '../utils/db';

let redisClient: RedisClientType;
const CACHE_DURATION = 60; // seconds

export async function initializeRedis(): Promise<void> {
  try {
    redisClient = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
    });

    redisClient.on('error', (err: Error) => {
      logger.error('Redis client error', err);
    });

    await redisClient.connect();
    logger.info('Redis connected successfully');
  } catch (err) {
    logger.warn('Redis not available, continuing without cache', err);
  }
}

export async function getRedisClient(): Promise<RedisClientType> {
  return redisClient;
}

export async function getCachedData(key: string): Promise<any> {
  if (!redisClient) return null;

  try {
    const data = await redisClient.get(key);
    return data ? JSON.parse(data) : null;
  } catch (err) {
    logger.error('Error reading from cache', err);
    return null;
  }
}

export async function setCachedData(
  key: string,
  data: any,
  duration: number = CACHE_DURATION
): Promise<void> {
  if (!redisClient) return;

  try {
    await redisClient.setEx(key, duration, JSON.stringify(data));
  } catch (err) {
    logger.error('Error writing to cache', err);
  }
}



const CRYPTO_COINS = [
  'bitcoin',
  'ethereum',
  'cardano',
  'solana',
  'ripple',
  'polkadot',
  'dogecoin',
  'polygon',
  'chainlink',
  'uniswap',
];


const url =
  `${process.env.COINGECKO_API_URL}/coins/markets` +
  `?vs_currency=usd&ids=${CRYPTO_COINS.join(',')}` +
  `&x_cg_demo_api_key=${process.env.COINGECKO_API_KEY}`;

export async function fetchCryptoPrices(): Promise<CoinData[]> {
  const cacheKey = 'crypto_prices';
  const cached = await getCachedData(cacheKey);

  if (cached) {
    logger.debug('Returning cached crypto prices');
    return cached;
  }

  try {
    const prices = await exponentialBackoff(async () => {
      const response = await axios.get(url, {
  timeout: 10000,
       });

      return response.data.map((coin: any) => ({
  id: coin.id,
  symbol: coin.symbol,
  name: coin.name,
  current_price: coin.current_price || 0,
  price_change_percentage_24h:
    coin.price_change_percentage_24h || 0,
  high_24h: coin.high_24h || 0,
  low_24h: coin.low_24h || 0,
  total_volume: coin.total_volume || 0,
  market_cap: coin.market_cap || 0,
}));
    }, 3, 1000);

    await setCachedData(cacheKey, prices, 30); // Cache for 30 seconds
    logger.info('Fetched and cached crypto prices');
    return prices;
  } catch (err) {
    logger.error('Error fetching crypto prices', err);
    throw new Error('Failed to fetch cryptocurrency prices');
  }
}

export async function storePriceSnapshots(prices: CoinData[]): Promise<void> {
  try {
    const values = prices
      .map((coin) => [
        coin.id,
        coin.name,
        coin.symbol,
        coin.current_price,
        coin.price_change_percentage_24h,
        coin.high_24h,
        coin.low_24h,
        coin.total_volume,
        coin.market_cap,
      ])
      .flat();

    const placeholders = prices
      .map((_, i) => {
        const offset = i * 9;
        return `($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4}, $${offset + 5}, $${offset + 6}, $${offset + 7}, $${offset + 8}, $${offset + 9})`;
      })
      .join(',');

    await query(
      `
      INSERT INTO price_snapshots (
        coin_id, coin_name, symbol, price, change_24h, high_24h, low_24h, volume_24h, market_cap
      ) VALUES ${placeholders}
      `,
      values
    );

    for (const coin of prices) {
      await query(
        `INSERT INTO price_histories (coin_id, price) VALUES ($1, $2)`,
        [coin.id, coin.current_price]
      );
    }

    logger.debug('Stored price snapshots and history');
  } catch (err) {
    logger.error('Error storing price snapshots', err);
  }
}

export async function getLatestPrices(): Promise<PriceSnapshot[]> {
  try {
    const result = await query(`
      SELECT DISTINCT ON (coin_id)
        id, coin_id, coin_name, symbol, price, change_24h, high_24h, low_24h, volume_24h, market_cap, timestamp
      FROM price_snapshots
      ORDER BY coin_id, timestamp DESC
    `);

    return result.rows.map((row: any) => ({
      id: row.id,
      coinId: row.coin_id,
      coinName: row.coin_name,
      symbol: row.symbol,
      price: parseFloat(row.price),
      change24h: parseFloat(row.change_24h),
      high24h: parseFloat(row.high_24h),
      low24h: parseFloat(row.low_24h),
      volume24h: parseFloat(row.volume_24h),
      marketCap: parseFloat(row.market_cap),
      timestamp: row.timestamp,
    }));
  } catch (err) {
    logger.error('Error fetching latest prices', err);
    throw err;
  }
}

export async function getPriceHistory(coinId: string, days: number = 7): Promise<any[]> {
  try {
    const result = await query(
      `
      SELECT price, timestamp
      FROM price_histories
      WHERE coin_id = $1 AND timestamp > NOW() - INTERVAL '${days} days'
      ORDER BY timestamp ASC
      `,
      [coinId]
    );

    return result.rows.map((row: any) => ({
      price: parseFloat(row.price),
      timestamp: row.timestamp,
    }));
  } catch (err) {
    logger.error('Error fetching price history', err);
    throw err;
  }
}

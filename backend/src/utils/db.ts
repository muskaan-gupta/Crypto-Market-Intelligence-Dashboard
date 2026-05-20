import { Pool, PoolClient } from 'pg';
import logger from './logger';

let pool: Pool | null = null;

export async function initializeDb(): Promise<void> {
  if (pool) {
    return;
  }

  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  });

  pool.on('error', (err: Error) => {
    logger.error('Unexpected error on idle client', err);
  });

  try {
    const client = await pool.connect();
    await client.query('SELECT NOW()');
    client.release();
    logger.info('Database connected successfully');
    await createTables();
  } catch (err) {
    logger.error('Failed to connect to database', err);
    throw err;
  }
}

export async function createTables(): Promise<void> {
  const client = await getDb();

  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS price_snapshots (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        coin_id VARCHAR(100) NOT NULL,
        coin_name VARCHAR(255) NOT NULL,
        symbol VARCHAR(10) NOT NULL,
        price DECIMAL(20, 8) NOT NULL,
        change_24h DECIMAL(10, 4),
        high_24h DECIMAL(20, 8),
        low_24h DECIMAL(20, 8),
        volume_24h DECIMAL(20, 2),
        market_cap DECIMAL(30, 2),
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS price_histories (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        coin_id VARCHAR(100) NOT NULL,
        price DECIMAL(20, 8) NOT NULL,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS alerts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        coin_id VARCHAR(100) NOT NULL,
        coin_name VARCHAR(255) NOT NULL,
        condition VARCHAR(10) NOT NULL CHECK(condition IN ('above', 'below')),
        target_price DECIMAL(20, 8) NOT NULL,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        triggered_at TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS alert_histories (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        alert_id UUID NOT NULL REFERENCES alerts(id) ON DELETE CASCADE,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        coin_id VARCHAR(100) NOT NULL,
        coin_name VARCHAR(255) NOT NULL,
        trigger_price DECIMAL(20, 8) NOT NULL,
        triggered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS portfolio_positions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        coin_id VARCHAR(100) NOT NULL,
        coin_name VARCHAR(255) NOT NULL,
        quantity DECIMAL(20, 8) NOT NULL,
        purchase_price DECIMAL(20, 8) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_price_snapshots_coin_id ON price_snapshots(coin_id);
      CREATE INDEX IF NOT EXISTS idx_price_snapshots_timestamp ON price_snapshots(timestamp);
      CREATE INDEX IF NOT EXISTS idx_price_histories_coin_id ON price_histories(coin_id);
      CREATE INDEX IF NOT EXISTS idx_price_histories_timestamp ON price_histories(timestamp);
      CREATE INDEX IF NOT EXISTS idx_alerts_user_id ON alerts(user_id);
      CREATE INDEX IF NOT EXISTS idx_alerts_coin_id ON alerts(coin_id);
      CREATE INDEX IF NOT EXISTS idx_portfolio_user_id ON portfolio_positions(user_id);
    `);

    logger.info('Database tables created/verified successfully');
  } catch (err) {
    logger.error('Error creating tables', err);
    throw err;
  }
}

export async function getDb(): Promise<PoolClient> {
  if (!pool) {
    throw new Error('Database not initialized');
  }
  return pool.connect();
}

export async function query(text: string, params?: any[]): Promise<any> {
  if (!pool) {
    throw new Error('Database not initialized');
  }
  return pool.query(text, params);
}

export async function closeDb(): Promise<void> {
  if (pool) {
    await pool.end();
    logger.info('Database pool closed');
  }
}

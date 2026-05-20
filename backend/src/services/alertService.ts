import logger from '../utils/logger';
import { query } from '../utils/db';
import { Alert} from '../types';

export async function createAlert(
  userId: string,
  coinId: string,
  coinName: string,
  condition: 'above' | 'below',
  targetPrice: number
): Promise<Alert> {
  try {
    const result = await query(
      `
      INSERT INTO alerts (user_id, coin_id, coin_name, condition, target_price)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, user_id, coin_id, coin_name, condition, target_price, is_active, created_at, triggered_at
      `,
      [userId, coinId, coinName, condition, targetPrice]
    );

    const row = result.rows[0];
    return {
      id: row.id,
      userId: row.user_id,
      coinId: row.coin_id,
      coinName: row.coin_name,
      condition: row.condition,
      targetPrice: parseFloat(row.target_price),
      isActive: row.is_active,
      createdAt: row.created_at,
      triggeredAt: row.triggered_at,
    };
  } catch (err) {
    logger.error('Error creating alert', err);
    throw err;
  }
}

export async function getAlertsByUserId(userId: string): Promise<Alert[]> {
  try {
    const result = await query(
      `SELECT id, user_id, coin_id, coin_name, condition, target_price, is_active, created_at, triggered_at
       FROM alerts
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [userId]
    );

    return result.rows.map((row: any) => ({
      id: row.id,
      userId: row.user_id,
      coinId: row.coin_id,
      coinName: row.coin_name,
      condition: row.condition,
      targetPrice: parseFloat(row.target_price),
      isActive: row.is_active,
      createdAt: row.created_at,
      triggeredAt: row.triggered_at,
    }));
  } catch (err) {
    logger.error('Error fetching alerts', err);
    throw err;
  }
}

export async function getActiveAlerts(): Promise<Alert[]> {
  try {
    const result = await query(
      `SELECT id, user_id, coin_id, coin_name, condition, target_price, is_active, created_at, triggered_at
       FROM alerts
       WHERE is_active = true`
    );

    return result.rows.map((row: any) => ({
      id: row.id,
      userId: row.user_id,
      coinId: row.coin_id,
      coinName: row.coin_name,
      condition: row.condition,
      targetPrice: parseFloat(row.target_price),
      isActive: row.is_active,
      createdAt: row.created_at,
      triggeredAt: row.triggered_at,
    }));
  } catch (err) {
    logger.error('Error fetching active alerts', err);
    throw err;
  }
}

export async function triggerAlert(
  alertId: string,
  userId: string,
  coinId: string,
  coinName: string,
  triggerPrice: number
): Promise<void> {
  try {
    await query(
      `UPDATE alerts SET is_active = false, triggered_at = NOW() WHERE id = $1`,
      [alertId]
    );

    await query(
      `INSERT INTO alert_histories (alert_id, user_id, coin_id, coin_name, trigger_price)
       VALUES ($1, $2, $3, $4, $5)`,
      [alertId, userId, coinId, coinName, triggerPrice]
    );

    logger.info(`Alert ${alertId} triggered for ${coinName} at ${triggerPrice}`);
  } catch (err) {
    logger.error('Error triggering alert', err);
    throw err;
  }
}

export async function deleteAlert(alertId: string, userId: string): Promise<void> {
  try {
    await query(
      `DELETE FROM alerts WHERE id = $1 AND user_id = $2`,
      [alertId, userId]
    );
  } catch (err) {
    logger.error('Error deleting alert', err);
    throw err;
  }
}

export async function checkAndTriggerAlerts(currentPrices: Map<string, number>): Promise<Alert[]> {
  try {
    const alerts = await getActiveAlerts();
    const triggeredAlerts: Alert[] = [];

    for (const alert of alerts) {
      const currentPrice = currentPrices.get(alert.coinId);

      if (!currentPrice) continue;

      const shouldTrigger =
        (alert.condition === 'above' && currentPrice >= alert.targetPrice) ||
        (alert.condition === 'below' && currentPrice <= alert.targetPrice);

      if (shouldTrigger) {
        await triggerAlert(alert.id, alert.userId, alert.coinId, alert.coinName, currentPrice);
        triggeredAlerts.push(alert);
      }
    }

    return triggeredAlerts;
  } catch (err) {
    logger.error('Error checking alerts', err);
    return [];
  }
}

import logger from '../utils/logger';
import { query } from '../utils/db';
import { PortfolioPosition, Portfolio } from '../types';

export async function createPortfolioPosition(
  userId: string,
  coinId: string,
  coinName: string,
  quantity: number,
  purchasePrice: number
): Promise<PortfolioPosition> {
  try {
    const result = await query(
      `
      INSERT INTO portfolio_positions (user_id, coin_id, coin_name, quantity, purchase_price)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, user_id, coin_id, coin_name, quantity, purchase_price, created_at
      `,
      [userId, coinId, coinName, quantity, purchasePrice]
    );

    const row = result.rows[0];
    return {
      id: row.id,
      userId: row.user_id,
      coinId: row.coin_id,
      coinName: row.coin_name,
      quantity: parseFloat(row.quantity),
      purchasePrice: parseFloat(row.purchase_price),
      createdAt: row.created_at,
    };
  } catch (err) {
    logger.error('Error creating portfolio position', err);
    throw err;
  }
}

export async function getPortfolioPositions(userId: string): Promise<PortfolioPosition[]> {
  try {
    const result = await query(
      `
      SELECT id, user_id, coin_id, coin_name, quantity, purchase_price, created_at
      FROM portfolio_positions
      WHERE user_id = $1
      ORDER BY created_at DESC
      `,
      [userId]
    );

    return result.rows.map((row: any) => ({
      id: row.id,
      userId: row.user_id,
      coinId: row.coin_id,
      coinName: row.coin_name,
      quantity: parseFloat(row.quantity),
      purchasePrice: parseFloat(row.purchase_price),
      createdAt: row.created_at,
    }));
  } catch (err) {
    logger.error('Error fetching portfolio positions', err);
    throw err;
  }
}

export async function getPortfolio(userId: string, currentPrices: Map<string, number>): Promise<Portfolio> {
  try {
    const positions = await getPortfolioPositions(userId);

    let totalValue = 0;
    let totalInvested = 0;

    const positionsWithValue = positions.map((pos) => {
      const currentPrice = currentPrices.get(pos.coinId) || pos.purchasePrice;
      const invested = pos.quantity * pos.purchasePrice;
      const value = pos.quantity * currentPrice;

      totalInvested += invested;
      totalValue += value;

      return { ...pos, currentPrice, value, invested };
    });

    const totalPnl = totalValue - totalInvested;
    const totalPnlPercent = totalInvested > 0 ? (totalPnl / totalInvested) * 100 : 0;

    return {
      positions: positionsWithValue as any,
      totalValue,
      totalInvested,
      totalPnl,
      totalPnlPercent,
    };
  } catch (err) {
    logger.error('Error calculating portfolio', err);
    throw err;
  }
}

export async function deletePortfolioPosition(positionId: string, userId: string): Promise<void> {
  try {
    await query(
      `DELETE FROM portfolio_positions WHERE id = $1 AND user_id = $2`,
      [positionId, userId]
    );
  } catch (err) {
    logger.error('Error deleting portfolio position', err);
    throw err;
  }
}

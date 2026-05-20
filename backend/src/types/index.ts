export interface User {
  id: string;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PriceSnapshot {
  id: string;
  coinId: string;
  coinName: string;
  symbol: string;
  price: number;
  change24h: number;
  high24h: number;
  low24h: number;
  volume24h: number;
  marketCap: number;
  timestamp: Date;
}

export interface PriceHistory {
  id: string;
  coinId: string;
  price: number;
  timestamp: Date;
}

export interface Alert {
  id: string;
  userId: string;
  coinId: string;
  coinName: string;
  condition: 'above' | 'below';
  targetPrice: number;
  isActive: boolean;
  createdAt: Date;
  triggeredAt: Date | null;
}

export interface AlertHistory {
  id: string;
  alertId: string;
  userId: string;
  coinId: string;
  coinName: string;
  triggerPrice: number;
  triggeredAt: Date;
}

export interface PortfolioPosition {
  id: string;
  userId: string;
  coinId: string;
  coinName: string;
  quantity: number;
  purchasePrice: number;
  createdAt: Date;
}

export interface Portfolio {
  positions: PortfolioPosition[];
  totalValue: number;
  totalInvested: number;
  totalPnl: number;
  totalPnlPercent: number;
}

export interface CoinData {
  id: string;
  name: string;
  symbol: string;
  current_price: number;
  price_change_percentage_24h: number;
  high_24h: number;
  low_24h: number;
  total_volume: number;
  market_cap: number;
}

export interface JwtPayload {
  userId: string;
  email: string;
}

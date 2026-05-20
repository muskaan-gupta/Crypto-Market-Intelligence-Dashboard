export interface User {
  id: string;
  email: string;
}

export interface AuthToken {
  token: string;
  user: User;
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
  price: number;
  timestamp: Date;
}

export interface Alert {
  id: string;
  coinId: string;
  coinName: string;
  condition: 'above' | 'below';
  targetPrice: number;
  isActive: boolean;
  createdAt: Date;
  triggeredAt: Date | null;
}

export interface PortfolioPosition {
  id: string;
  coinId: string;
  coinName: string;
  quantity: number;
  purchasePrice: number;
  currentPrice?: number;
  value?: number;
  invested?: number;
  createdAt: Date;
}

export interface Portfolio {
  positions: PortfolioPosition[];
  totalValue: number;
  totalInvested: number;
  totalPnl: number;
  totalPnlPercent: number;
}

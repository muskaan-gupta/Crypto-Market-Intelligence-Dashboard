import React, { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { usePriceStore } from '../store/priceStore';
import { pricesApi } from '../utils/api';
import { Button, Card, Loading, ErrorMessage } from '../components/shared';
import { PriceHistory } from '../types';

interface CoinDetailProps {
  coinId: string | null;
  onBack: () => void;
  onCreateAlert: (coinId: string, coinName: string) => void;
}

export const CoinDetail: React.FC<CoinDetailProps> = ({ coinId, onBack, onCreateAlert }) => {
  const { prices } = usePriceStore();
  const [history, setHistory] = useState<PriceHistory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const coin = prices.find((p) => p.coinId === coinId);

  useEffect(() => {
    if (!coinId) return;

    const fetchHistory = async () => {
      try {
        setIsLoading(true);
        const response = await pricesApi.getHistory(coinId, 7);
        setHistory(response.data.data);
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch history');
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, [coinId]);

  if (!coin) {
    return (
      <div className="space-y-4">
        <Button onClick={onBack} variant="secondary">
          ← Back
        </Button>
        <ErrorMessage error="Coin not found" />
      </div>
    );
  }

  const chartData = history.map((h) => ({
    time: new Date(h.timestamp).toLocaleDateString(),
    price: h.price,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button onClick={onBack} variant="secondary">
          ← Back
        </Button>
        <h2 className="text-3xl font-bold text-gray-900">{coin.coinName}</h2>
        <Button
          onClick={() => onCreateAlert(coin.coinId, coin.coinName)}
          variant="primary"
        >
          Set Alert
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <p className="text-sm text-gray-600">Current Price</p>
          <p className="text-2xl font-bold text-gray-900">${coin.price.toFixed(2)}</p>
        </Card>
        <Card>
          <p className="text-sm text-gray-600">High (24h)</p>
          <p className="text-2xl font-bold text-gray-900">${coin.high24h.toFixed(2)}</p>
        </Card>
        <Card>
          <p className="text-sm text-gray-600">Low (24h)</p>
          <p className="text-2xl font-bold text-gray-900">${coin.low24h.toFixed(2)}</p>
        </Card>
      </div>

      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">7-Day Price Chart</h3>
        {isLoading && <Loading />}
        {error && <ErrorMessage error={error} />}
        {!isLoading && chartData.length > 0 && (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="price"
                stroke="#3b82f6"
                dot={false}
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </Card>

      <div className="grid grid-cols-2 gap-6">
        <Card>
          <p className="text-sm text-gray-600">24h Change</p>
          <p className={`text-2xl font-bold ${coin.change24h >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {coin.change24h >= 0 ? '+' : ''}{coin.change24h.toFixed(2)}%
          </p>
        </Card>
        <Card>
          <p className="text-sm text-gray-600">Market Cap</p>
          <p className="text-2xl font-bold text-gray-900">
            ${(coin.marketCap / 1e9).toFixed(2)}B
          </p>
        </Card>
      </div>
    </div>
  );
};

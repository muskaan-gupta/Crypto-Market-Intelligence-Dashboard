import React from 'react';
import { usePriceStore } from '../store/priceStore';
import { Card,  EmptyState } from '../components/shared';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,

  ResponsiveContainer,

} from 'recharts';


export const Analytics: React.FC = () => {
  const { prices } = usePriceStore();

  if (prices.length === 0) {
    return <EmptyState message="No data available for analytics" />;
  }

  // Calculate volatility for each coin (using price change as proxy)
  const volatilityData = prices.slice(0, 10).map((coin) => ({
    name: coin.symbol.toUpperCase(),
    volatility: Math.abs(coin.change24h),
  }));

  // Create correlation matrix
  const correlationData: any[] = [];
  for (let i = 0; i < Math.min(prices.length, 5); i++) {
    for (let j = i + 1; j < Math.min(prices.length, 5); j++) {
      // Simplified correlation based on price change similarity
      const correlation =
        Math.abs(prices[i].change24h - prices[j].change24h) < 2 ? 0.8 : 0.3;
      correlationData.push({
        coin1: prices[i].symbol.toUpperCase(),
        coin2: prices[j].symbol.toUpperCase(),
        correlation: (correlation * 100).toFixed(0),
      });
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h2>

      <Card>
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          Volatility Comparison
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={volatilityData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="volatility" fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <Card>
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          Correlation Matrix
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-semibold">
                  Coin Pair
                </th>
                <th className="px-4 py-2 text-left text-sm font-semibold">
                  Correlation
                </th>
              </tr>
            </thead>
            <tbody>
              {correlationData.map((item, idx) => (
                <tr key={idx} className="border-t">
                  <td className="px-4 py-2 text-gray-900">
                    {item.coin1} ↔ {item.coin2}
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex items-center">
                      <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                        <div
                          className={`h-2 rounded-full ${
                            parseInt(item.correlation) > 60
                              ? 'bg-green-600'
                              : 'bg-gray-400'
                          }`}
                          style={{
                            width: `${item.correlation}%`,
                          }}
                        />
                      </div>
                      <span className="text-sm text-gray-600">
                        {item.correlation}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card>
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Market Overview</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {prices.slice(0, 8).map((coin) => (
            <div key={coin.coinId} className="text-center">
              <p className="text-sm text-gray-600">{coin.symbol.toUpperCase()}</p>
              <p className="text-lg font-semibold text-gray-900 mt-1">
                ${coin.price.toFixed(0)}
              </p>
              <p
                className={`text-sm mt-1 ${
                  coin.change24h >= 0 ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {coin.change24h >= 0 ? '+' : ''}{coin.change24h.toFixed(2)}%
              </p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

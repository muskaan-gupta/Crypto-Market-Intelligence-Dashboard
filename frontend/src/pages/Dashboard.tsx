import React, { useEffect, useState } from 'react';
import { usePriceStore } from '../store/priceStore';
import { pricesApi } from '../utils/api';
import { PriceTable, Loading, ErrorMessage, EmptyState } from '../components/shared';
import { getSocket } from '../utils/socket';


interface DashboardProps {
  onCoinSelect: (coinId: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onCoinSelect }) => {
  const { prices, isLoading, error, setPrices, setLoading, setError } = usePriceStore();
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        setLoading(true);
        const response = await pricesApi.getLive();
        const pricesData = response.data.data.map((p: any) => ({
          ...p,
          timestamp: new Date(p.timestamp),
        }));
        setPrices(pricesData);
        setLastUpdate(new Date());
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch prices');
      } finally {
        setLoading(false);
      }
    };

    fetchPrices();

    // Subscribe to real-time updates
    const socket = getSocket();
    const handlePriceUpdate = (data: any) => {
      const updatedPrices = data.prices.map((p: any) => ({
        ...p,
        timestamp: new Date(p.timestamp),
      }));
      setPrices(updatedPrices);
      setLastUpdate(new Date());
    };

    socket.on('prices:updated', handlePriceUpdate);

    return () => {
      socket.off('prices:updated', handlePriceUpdate);
    };
  }, [setPrices, setLoading, setError]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-900">Live Market Dashboard</h2>
        {lastUpdate && (
          <p className="text-sm text-gray-500">
            Last updated: {lastUpdate.toLocaleTimeString()}
          </p>
        )}
      </div>

      <ErrorMessage error={error} />

      {isLoading && <Loading />}

      {!isLoading && prices.length === 0 && (
        <EmptyState message="No price data available" />
      )}

      {!isLoading && prices.length > 0 && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <PriceTable prices={prices} onCoinClick={onCoinSelect} />
        </div>
      )}
    </div>
  );
};

import React, { useEffect, useState } from 'react';
import { usePortfolioStore, useNotificationStore } from '../store';
import { portfolioApi } from '../utils/api';
import { Button, Card, Loading, EmptyState } from '../components/shared';
import { Trash2 } from 'lucide-react';


export const Portfolio: React.FC = () => {
  const { portfolio, isLoading, setPortfolio, setLoading, setError } = usePortfolioStore();
  const { addNotification } = useNotificationStore();
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    coinId: '',
    coinName: '',
    quantity: '',
    purchasePrice: '',
  });

  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        setLoading(true);
        const response = await portfolioApi.getPortfolio();
        setPortfolio(response.data.data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch portfolio');
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolio();
  }, [setPortfolio, setLoading, setError]);

  const handleAddPosition = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.coinId || !formData.quantity || !formData.purchasePrice) {
      addNotification('error', 'Please fill in all fields');
      return;
    }

    try {
      await portfolioApi.addPosition(
        formData.coinId,
        formData.coinName,
        parseFloat(formData.quantity),
        parseFloat(formData.purchasePrice)
      );

      // Refresh portfolio
      const response = await portfolioApi.getPortfolio();
      setPortfolio(response.data.data);

      addNotification('success', 'Position added successfully');
      setShowAddForm(false);
      setFormData({ coinId: '', coinName: '', quantity: '', purchasePrice: '' });
    } catch (err: any) {
      addNotification('error', err.message || 'Failed to add position');
    }
  };

  const handleDeletePosition = async (positionId: string) => {
    try {
      await portfolioApi.deletePosition(positionId);

      // Refresh portfolio
      const response = await portfolioApi.getPortfolio();
      setPortfolio(response.data.data);

      addNotification('success', 'Position deleted successfully');
    } catch (err: any) {
      addNotification('error', 'Failed to delete position');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-900">Portfolio Tracker</h2>
        {!showAddForm && (
          <Button onClick={() => setShowAddForm(true)} variant="primary">
            Add Position
          </Button>
        )}
      </div>

      {showAddForm && (
        <Card>
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Add Position</h3>
          <form onSubmit={handleAddPosition} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Coin ID"
                value={formData.coinId}
                onChange={(e) =>
                  setFormData({ ...formData, coinId: e.target.value })
                }
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
              <input
                type="text"
                placeholder="Coin Name"
                value={formData.coinName}
                onChange={(e) =>
                  setFormData({ ...formData, coinName: e.target.value })
                }
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="number"
                placeholder="Quantity"
                step="0.00000001"
                value={formData.quantity}
                onChange={(e) =>
                  setFormData({ ...formData, quantity: e.target.value })
                }
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
              <input
                type="number"
                placeholder="Purchase Price"
                step="0.01"
                value={formData.purchasePrice}
                onChange={(e) =>
                  setFormData({ ...formData, purchasePrice: e.target.value })
                }
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div className="flex gap-4">
              <Button type="submit" variant="primary">
                Add Position
              </Button>
              <Button
                type="button"
                onClick={() => setShowAddForm(false)}
                variant="secondary"
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {isLoading && <Loading />}

      {!isLoading && portfolio && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <p className="text-sm text-gray-600">Total Value</p>
              <p className="text-2xl font-bold text-gray-900">
                ${portfolio.totalValue.toFixed(2)}
              </p>
            </Card>
            <Card>
              <p className="text-sm text-gray-600">Total Invested</p>
              <p className="text-2xl font-bold text-gray-900">
                ${portfolio.totalInvested.toFixed(2)}
              </p>
            </Card>
            <Card>
              <p className="text-sm text-gray-600">Total P&L</p>
              <p
                className={`text-2xl font-bold ${
                  portfolio.totalPnl >= 0 ? 'text-green-600' : 'text-red-600'
                }`}
              >
                ${portfolio.totalPnl.toFixed(2)}
              </p>
            </Card>
            <Card>
              <p className="text-sm text-gray-600">P&L %</p>
              <p
                className={`text-2xl font-bold ${
                  portfolio.totalPnlPercent >= 0 ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {portfolio.totalPnlPercent >= 0 ? '+' : ''}
                {portfolio.totalPnlPercent.toFixed(2)}%
              </p>
            </Card>
          </div>

          {portfolio.positions.length === 0 && (
            <EmptyState message="No positions yet. Add one to get started!" />
          )}

          {portfolio.positions.length > 0 && (
            <div className="space-y-4">
              {portfolio.positions.map((position) => (
                <Card key={position.id}>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {position.coinName}
                      </h3>
                      <p className="text-gray-600 mt-2">
                        {position.quantity} @ ${position.purchasePrice.toFixed(2)}
                      </p>
                      <div className="grid grid-cols-3 gap-4 mt-4 text-sm">
                        <div>
                          <p className="text-gray-600">Invested</p>
                          <p className="font-semibold text-gray-900">
                            ${(position.invested || 0).toFixed(2)}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Current Value</p>
                          <p className="font-semibold text-gray-900">
                            ${(position.value || 0).toFixed(2)}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">P&L</p>
                          <p
                            className={`font-semibold ${
                              ((position.value || 0) - (position.invested || 0)) >= 0
                                ? 'text-green-600'
                                : 'text-red-600'
                            }`}
                          >
                            ${(
                              (position.value || 0) - (position.invested || 0)
                            ).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeletePosition(position.id)}
                      className="text-red-600 hover:text-red-700 transition-colors"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

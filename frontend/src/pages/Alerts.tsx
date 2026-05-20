import React, { useEffect, useState } from 'react';
import { useAlertStore, useNotificationStore } from '../store';
import { alertsApi } from '../utils/api';
import { Button, Card, Loading, ErrorMessage, EmptyState } from '../components/shared';
import { getSocket } from '../utils/socket';
import { Trash2 } from 'lucide-react';

interface AlertsProps {
  selectedCoinId?: string;
  selectedCoinName?: string;
  onBackFromCreate?: () => void;
}

export const Alerts: React.FC<AlertsProps> = ({
  selectedCoinId,
  selectedCoinName,
  onBackFromCreate,
}) => {
  const { alerts, isLoading, setAlerts, removeAlert, setLoading } = useAlertStore();
  const { addNotification } = useNotificationStore();
  const [showCreateForm, setShowCreateForm] = useState(!!selectedCoinId);
  const [formData, setFormData] = useState({
    coinId: selectedCoinId || '',
    coinName: selectedCoinName || '',
    condition: 'above' as 'above' | 'below',
    targetPrice: '',
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        setLoading(true);
        const response = await alertsApi.getAll();
        setAlerts(response.data.data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch alerts');
      } finally {
        setLoading(false);
      }
    };

    fetchAlerts();

    // Subscribe to alert triggers
    const socket = getSocket();
    const handleAlertTriggered = (data: any) => {
      addNotification(
        'success',
        `Alert triggered! ${data.coinName} ${data.condition} $${data.targetPrice}`
      );
    };

    socket.on('alert:triggered', handleAlertTriggered);

    return () => {
      socket.off('alert:triggered', handleAlertTriggered);
    };
  }, [setAlerts, setLoading, addNotification]);

  const handleCreateAlert = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.coinId || !formData.targetPrice) {
      setError('Please fill in all fields');
      return;
    }

    try {
      const response = await alertsApi.create(
        formData.coinId,
        formData.coinName,
        formData.condition,
        parseFloat(formData.targetPrice)
      );

      useAlertStore.getState().addAlert(response.data.data);
      addNotification('success', 'Alert created successfully');
      setShowCreateForm(false);
      setFormData({
        coinId: '',
        coinName: '',
        condition: 'above',
        targetPrice: '',
      });
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to create alert');
    }
  };

  const handleDeleteAlert = async (alertId: string) => {
    try {
      await alertsApi.delete(alertId);
      removeAlert(alertId);
      addNotification('success', 'Alert deleted successfully');
    } catch (err: any) {
      addNotification('error', 'Failed to delete alert');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-900">Price Alerts</h2>
        {!showCreateForm && (
          <Button onClick={() => setShowCreateForm(true)} variant="primary">
            Create Alert
          </Button>
        )}
      </div>

      {showCreateForm && (
        <Card>
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Create New Alert</h3>
          <form onSubmit={handleCreateAlert} className="space-y-4">
            {error && <ErrorMessage error={error} />}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Coin ID (e.g., bitcoin)"
                value={formData.coinId}
                onChange={(e) =>
                  setFormData({ ...formData, coinId: e.target.value })
                }
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
              <input
                type="text"
                placeholder="Coin Name (e.g., Bitcoin)"
                value={formData.coinName}
                onChange={(e) =>
                  setFormData({ ...formData, coinName: e.target.value })
                }
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <select
                value={formData.condition}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    condition: e.target.value as 'above' | 'below',
                  })
                }
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="above">Alert when ABOVE</option>
                <option value="below">Alert when BELOW</option>
              </select>
              <input
                type="number"
                placeholder="Target Price"
                step="0.01"
                value={formData.targetPrice}
                onChange={(e) =>
                  setFormData({ ...formData, targetPrice: e.target.value })
                }
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div className="flex gap-4">
              <Button type="submit" variant="primary">
                Create Alert
              </Button>
              <Button
                type="button"
                onClick={() => {
                  setShowCreateForm(false);
                  onBackFromCreate?.();
                }}
                variant="secondary"
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {isLoading && <Loading />}

      {!isLoading && alerts.length === 0 && (
        <EmptyState message="No alerts yet. Create one to get started!" />
      )}

      {!isLoading && alerts.length > 0 && (
        <div className="space-y-4">
          {alerts.map((alert) => (
            <Card key={alert.id}>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {alert.coinName}
                  </h3>
                  <p className="text-gray-600 mt-1">
                    Alert when price goes{' '}
                    <span className="font-semibold">{alert.condition}</span> $
                    {alert.targetPrice.toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    Status:{' '}
                    <span
                      className={
                        alert.isActive ? 'text-green-600' : 'text-red-600'
                      }
                    >
                      {alert.isActive ? 'Active' : 'Triggered'}
                    </span>
                  </p>
                </div>
                <button
                  onClick={() => handleDeleteAlert(alert.id)}
                  className="text-red-600 hover:text-red-700 transition-colors"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

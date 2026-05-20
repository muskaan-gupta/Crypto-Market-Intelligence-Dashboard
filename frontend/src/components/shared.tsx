import React from 'react';
import { X } from 'lucide-react';
import { useNotificationStore } from '../store';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  children,
  disabled,
  className = '',
  ...props
}) => {
  const variants = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    danger: 'btn-danger',
    success: 'btn-success',
    outline: 'btn-outline',
    ghost: 'btn-ghost',
  };
  
  const sizes = {
    sm: 'btn-sm',
    md: '',
    lg: 'btn-lg',
  };
  
  return (
    <button
      className={`${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="inline-flex items-center gap-2">
          <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          Loading...
        </span>
      ) : (
        children
      )}
    </button>
  );
};

export const Card: React.FC<{ children: React.ReactNode; className?: string; variant?: 'default' | 'lg' | 'accent' | 'elevated' }> = ({
  children,
  className = '',
  variant = 'default',
}) => {
  const variants = {
    default: 'card',
    lg: 'card-lg',
    accent: 'card-accent',
    elevated: 'card-elevated',
  };
  
  return (
    <div className={`${variants[variant]} ${className}`}>
      {children}
    </div>
  );
};

export const Badge: React.FC<{ children: React.ReactNode; variant?: 'success' | 'danger' | 'warning' | 'info' | 'primary' }> = ({
  children,
  variant = 'success',
}) => {
  const colors = {
    success: 'badge-success',
    danger: 'badge-danger',
    warning: 'badge-warning',
    info: 'badge-info',
    primary: 'badge-primary',
  };
  
  return (
    <span className={`badge ${colors[variant]}`}>
      {children}
    </span>
  );
};

export const Loading: React.FC = () => (
  <div className="flex flex-col justify-center items-center h-64 gap-4">
    <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-blue-600 shadow-glow"></div>
    <p className="text-gray-600 font-semibold animate-fade-in">Loading...</p>
  </div>
);

export const ErrorMessage: React.FC<{ error: string | null }> = ({ error }) => {
  if (!error) return null;
  
  return (
    <div className="bg-gradient-to-r from-red-50 to-red-100 border-l-4 border-red-600 rounded-lg p-4 text-red-700 shadow-md animate-slide-in">
      <div className="flex items-center gap-3">
        <div className="text-2xl">⚠️</div>
        <div>
          <p className="font-semibold">Error</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    </div>
  );
};

export const EmptyState: React.FC<{ message: string }> = ({ message }) => (
  <div className="flex flex-col justify-center items-center h-64 text-gray-500 gap-3 animate-fade-in">
    <div className="text-6xl opacity-30">📭</div>
    <p className="font-semibold">{message}</p>
  </div>
);

export const Toast: React.FC = () => {
  const { notifications, removeNotification } = useNotificationStore();

  return (
    <div className="fixed top-4 right-4 space-y-3 z-50">
      {notifications.map((notification) => {
        const getGradient = () => {
          switch (notification.type) {
            case 'success':
              return 'bg-gradient-to-r from-emerald-100 to-green-100 border-l-4 border-emerald-600 text-emerald-800';
            case 'error':
              return 'bg-gradient-to-r from-red-100 to-rose-100 border-l-4 border-red-600 text-red-800';
            default:
              return 'bg-gradient-to-r from-blue-100 to-cyan-100 border-l-4 border-blue-600 text-blue-800';
          }
        };

        return (
          <div
            key={notification.id}
            className={`p-4 rounded-lg shadow-lg flex items-center justify-between min-w-80 animate-slide-in ${getGradient()}`}
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">
                {notification.type === 'success' && '✓'}
                {notification.type === 'error' && '✕'}
                {notification.type === 'info' && 'ℹ'}
              </span>
              <span className="font-semibold">{notification.message}</span>
            </div>
            <button
              onClick={() => removeNotification(notification.id)}
              className="ml-4 hover:bg-black/10 rounded-full p-1 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        );
      })}
    </div>
  );
};

interface PriceTableProps {
  prices: any[];
  onCoinClick?: (coinId: string) => void;
}

export const PriceTable: React.FC<PriceTableProps> = ({ prices, onCoinClick }) => (
  <div className="overflow-x-auto rounded-xl">
    <table className="w-full">
      <thead className="bg-gradient-to-r from-gray-100 to-gray-50">
        <tr>
          <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Coin</th>
          <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Price</th>
          <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">24h Change</th>
          <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">High/Low</th>
          <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Market Cap</th>
        </tr>
      </thead>
      <tbody>
        {prices.map((price, index) => (
          <tr
            key={price.coinId}
            onClick={() => onCoinClick?.(price.coinId)}
            className={`border-b border-gray-100 hover:bg-blue-50 cursor-pointer transition-all duration-200 ${
              index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
            }`}
          >
            <td className="px-6 py-4">
              <div className="font-bold text-gray-900">{price.coinName}</div>
              <div className="text-xs text-gray-500 uppercase tracking-widest font-semibold">{price.symbol}</div>
            </td>
            <td className="px-6 py-4 font-bold text-gray-900">
              <span className="text-lg">${price.price.toFixed(2)}</span>
            </td>
            <td className="px-6 py-4">
              <span className={`inline-flex items-center gap-1 font-bold ${
                price.change24h >= 0 ? 'text-emerald-600' : 'text-red-600'
              }`}>
                {price.change24h >= 0 ? '📈' : '📉'}
                {price.change24h >= 0 ? '+' : ''}{price.change24h.toFixed(2)}%
              </span>
            </td>
            <td className="px-6 py-4 text-gray-700">
              <div className="font-semibold">${price.high24h.toFixed(2)}</div>
              <div className="text-sm text-gray-500">${price.low24h.toFixed(2)}</div>
            </td>
            <td className="px-6 py-4 font-semibold text-gray-900">
              <span className="bg-gradient-to-r from-blue-100 to-cyan-100 px-3 py-1 rounded-full">
                ${(price.marketCap / 1e9).toFixed(2)}B
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export const Navigation: React.FC<{ currentPage: string; onNavigate: (page: string) => void }> = ({
  currentPage,
  onNavigate,
}) => {
  const pages = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'alerts', label: 'Alerts', icon: '🔔' },
    { id: 'portfolio', label: 'Portfolio', icon: '💼' },
    { id: 'analytics', label: 'Analytics', icon: '📈' },
  ];

  return (
    <nav className="sticky top-0 z-40 bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-700 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-3">
            <span className="text-3xl">💰</span>
            <h1 className="text-2xl font-bold text-white tracking-tight">Crypto Dashboard</h1>
          </div>
          <div className="flex space-x-2">
            {pages.map((page) => (
              <button
                key={page.id}
                onClick={() => onNavigate(page.id)}
                className={`py-2 px-4 rounded-lg transition-all duration-300 font-semibold flex items-center gap-2 ${
                  currentPage === page.id
                    ? 'bg-white text-blue-600 shadow-lg scale-105'
                    : 'text-white hover:bg-white/20 hover:translate-y-[-2px]'
                }`}
              >
                <span>{page.icon}</span>
                {page.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};

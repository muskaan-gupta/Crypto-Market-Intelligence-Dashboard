import { create } from 'zustand';
import { Alert, Portfolio } from '../types';

interface NotificationStore {
  notifications: Array<{
    id: string;
    type: 'success' | 'error' | 'info';
    message: string;
  }>;
  addNotification: (type: 'success' | 'error' | 'info', message: string) => void;
  removeNotification: (id: string) => void;
}

export const useNotificationStore = create<NotificationStore>((set) => ({
  notifications: [],
  
  addNotification: (type, message) => {
    const id = Math.random().toString(36).substr(2, 9);
    set((state) => ({
      notifications: [...state.notifications, { id, type, message }],
    }));
    
    setTimeout(() => {
      set((state) => ({
        notifications: state.notifications.filter((n) => n.id !== id),
      }));
    }, 5000);
  },
  
  removeNotification: (id) => {
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    }));
  },
}));

interface AlertStore {
  alerts: Alert[];
  isLoading: boolean;
  setAlerts: (alerts: Alert[]) => void;
  addAlert: (alert: Alert) => void;
  removeAlert: (alertId: string) => void;
  setLoading: (loading: boolean) => void;
}

export const useAlertStore = create<AlertStore>((set) => ({
  alerts: [],
  isLoading: false,
  
  setAlerts: (alerts) => set({ alerts }),
  addAlert: (alert) => set((state) => ({ alerts: [alert, ...state.alerts] })),
  removeAlert: (alertId) =>
    set((state) => ({
      alerts: state.alerts.filter((a) => a.id !== alertId),
    })),
  setLoading: (isLoading) => set({ isLoading }),
}));

interface PortfolioStore {
  portfolio: Portfolio | null;
  isLoading: boolean;
  error: string | null;
  setPortfolio: (portfolio: Portfolio) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const usePortfolioStore = create<PortfolioStore>((set) => ({
  portfolio: null,
  isLoading: false,
  error: null,
  
  setPortfolio: (portfolio) => set({ portfolio }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}));

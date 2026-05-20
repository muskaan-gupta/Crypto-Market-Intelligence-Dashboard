import { create } from 'zustand';
import { PriceSnapshot, PriceHistory } from '../types';

interface PriceStore {
  prices: PriceSnapshot[];
  selectedCoinHistory: PriceHistory[];
  selectedCoinId: string | null;
  isLoading: boolean;
  error: string | null;
  setPrices: (prices: PriceSnapshot[]) => void;
  setSelectedCoinHistory: (history: PriceHistory[]) => void;
  setSelectedCoinId: (coinId: string | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const usePriceStore = create<PriceStore>((set) => ({
  prices: [],
  selectedCoinHistory: [],
  selectedCoinId: null,
  isLoading: false,
  error: null,
  
  setPrices: (prices) => set({ prices }),
  setSelectedCoinHistory: (selectedCoinHistory) => set({ selectedCoinHistory }),
  setSelectedCoinId: (selectedCoinId) => set({ selectedCoinId }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}));

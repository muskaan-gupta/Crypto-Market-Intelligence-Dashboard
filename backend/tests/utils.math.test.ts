import { calculateVolatility, calculatePriceChange, calculateCorrelation } from '../src/utils/math';

describe('Math utilities', () => {
  describe('calculateVolatility', () => {
    it('should calculate volatility correctly', () => {
      const prices = [100, 102, 101, 103, 99, 100];
      const volatility = calculateVolatility(prices);
      expect(volatility).toBeGreaterThan(0);
    });

    it('should return 0 for single price', () => {
      const prices = [100];
      const volatility = calculateVolatility(prices);
      expect(volatility).toBe(0);
    });

    it('should return 0 for identical prices', () => {
      const prices = [100, 100, 100, 100];
      const volatility = calculateVolatility(prices);
      expect(volatility).toBe(0);
    });
  });

  describe('calculatePriceChange', () => {
    it('should calculate positive price change', () => {
      const change = calculatePriceChange(100, 120);
      expect(change).toBe(20);
    });

    it('should calculate negative price change', () => {
      const change = calculatePriceChange(100, 80);
      expect(change).toBe(-20);
    });

    it('should handle zero old price', () => {
      const change = calculatePriceChange(0, 100);
      expect(change).toBe(Infinity);
    });
  });

  describe('calculateCorrelation', () => {
    it('should calculate perfect positive correlation', () => {
      const arr1 = [1, 2, 3, 4, 5];
      const arr2 = [2, 4, 6, 8, 10];
      const correlation = calculateCorrelation(arr1, arr2);
      expect(Math.abs(correlation - 1)).toBeLessThan(0.0001);
    });

    it('should calculate perfect negative correlation', () => {
      const arr1 = [1, 2, 3, 4, 5];
      const arr2 = [5, 4, 3, 2, 1];
      const correlation = calculateCorrelation(arr1, arr2);
      expect(Math.abs(correlation + 1)).toBeLessThan(0.0001);
    });

    it('should return 0 for no correlation', () => {
      const arr1 = [1, 1, 1, 1, 1];
      const arr2 = [1, 2, 3, 4, 5];
      const correlation = calculateCorrelation(arr1, arr2);
      expect(correlation).toBe(0);
    });
  });
});

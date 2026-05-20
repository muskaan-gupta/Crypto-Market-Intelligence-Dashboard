export async function exponentialBackoff(
  fn: () => Promise<any>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<any> {
  let lastError: any;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (i < maxRetries - 1) {
        const delay = baseDelay * Math.pow(2, i);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
}

export function calculateVolatility(prices: number[]): number {
  if (prices.length < 2) return 0;

  const mean = prices.reduce((a, b) => a + b, 0) / prices.length;
  const squareDiffs = prices.map((price) => Math.pow(price - mean, 2));
  const variance = squareDiffs.reduce((a, b) => a + b, 0) / prices.length;
  return Math.sqrt(variance);
}

export function calculatePriceChange(oldPrice: number, newPrice: number): number {
  return ((newPrice - oldPrice) / oldPrice) * 100;
}

export function calculateCorrelation(arr1: number[], arr2: number[]): number {
  if (arr1.length < 2 || arr2.length < 2 || arr1.length !== arr2.length) {
    return 0;
  }

  const mean1 = arr1.reduce((a, b) => a + b, 0) / arr1.length;
  const mean2 = arr2.reduce((a, b) => a + b, 0) / arr2.length;

  const covariance = arr1.reduce((sum, val, i) => {
    return sum + (val - mean1) * (arr2[i] - mean2);
  }, 0) / arr1.length;

  const std1 = Math.sqrt(
    arr1.reduce((sum, val) => sum + Math.pow(val - mean1, 2), 0) / arr1.length
  );
  const std2 = Math.sqrt(
    arr2.reduce((sum, val) => sum + Math.pow(val - mean2, 2), 0) / arr2.length
  );

  if (std1 === 0 || std2 === 0) return 0;
  return covariance / (std1 * std2);
}

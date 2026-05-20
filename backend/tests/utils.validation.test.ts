import { validate, registerSchema, loginSchema, createAlertSchema } from '../src/utils/validation';

describe('Validation utilities', () => {
  describe('registerSchema', () => {
    it('should validate correct registration data', async () => {
      const data = { email: 'test@example.com', password: 'password123' };
      const validated = await validate(registerSchema, data);

      expect(validated.email).toBe('test@example.com');
      expect(validated.password).toBe('password123');
    });

    it('should reject invalid email', async () => {
      const data = { email: 'invalid-email', password: 'password123' };

      await expect(validate(registerSchema, data)).rejects.toThrow();
    });

    it('should reject short password', async () => {
      const data = { email: 'test@example.com', password: 'pass' };

      await expect(validate(registerSchema, data)).rejects.toThrow();
    });
  });

  describe('loginSchema', () => {
    it('should validate correct login data', async () => {
      const data = { email: 'test@example.com', password: 'password123' };
      const validated = await validate(loginSchema, data);

      expect(validated.email).toBe('test@example.com');
    });

    it('should reject missing password', async () => {
      const data = { email: 'test@example.com' };

      await expect(validate(loginSchema, data)).rejects.toThrow();
    });
  });

  describe('createAlertSchema', () => {
    it('should validate correct alert data', async () => {
      const data = {
        coinId: 'bitcoin',
        coinName: 'Bitcoin',
        condition: 'above',
        targetPrice: 50000,
      };
      const validated = await validate(createAlertSchema, data);

      expect(validated.coinId).toBe('bitcoin');
      expect(validated.condition).toBe('above');
    });

    it('should reject invalid condition', async () => {
      const data = {
        coinId: 'bitcoin',
        coinName: 'Bitcoin',
        condition: 'between',
        targetPrice: 50000,
      };

      await expect(validate(createAlertSchema, data)).rejects.toThrow();
    });

    it('should reject negative target price', async () => {
      const data = {
        coinId: 'bitcoin',
        coinName: 'Bitcoin',
        condition: 'above',
        targetPrice: -1000,
      };

      await expect(validate(createAlertSchema, data)).rejects.toThrow();
    });
  });
});

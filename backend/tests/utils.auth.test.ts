import { hashPassword, comparePassword, generateToken, verifyToken } from '../src/utils/auth';

describe('Auth utilities', () => {
  describe('Password hashing', () => {
    it('should hash password correctly', async () => {
      const password = 'test-password-123';
      const hashedPassword = await hashPassword(password);

      expect(hashedPassword).not.toBe(password);
      expect(hashedPassword.length).toBeGreaterThan(0);
    });

    it('should compare password correctly', async () => {
      const password = 'test-password-123';
      const hashedPassword = await hashPassword(password);
      const isMatch = await comparePassword(password, hashedPassword);

      expect(isMatch).toBe(true);
    });

    it('should not match wrong password', async () => {
      const password = 'test-password-123';
      const hashedPassword = await hashPassword(password);
      const isMatch = await comparePassword('wrong-password', hashedPassword);

      expect(isMatch).toBe(false);
    });
  });

  describe('JWT tokens', () => {
    it('should generate valid token', () => {
      const payload = { userId: 'test-user-id', email: 'test@example.com' };
      const token = generateToken(payload);

      expect(token).toBeTruthy();
      expect(typeof token).toBe('string');
    });

    it('should verify token correctly', () => {
      const payload = { userId: 'test-user-id', email: 'test@example.com' };
      const token = generateToken(payload);
      const verified = verifyToken(token);

      expect(verified.userId).toBe(payload.userId);
      expect(verified.email).toBe(payload.email);
    });

    it('should throw error for invalid token', () => {
      expect(() => verifyToken('invalid-token')).toThrow();
    });
  });
});

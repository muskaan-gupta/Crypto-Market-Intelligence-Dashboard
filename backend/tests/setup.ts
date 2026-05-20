// Setup file for tests
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/crypto_dashboard_test';
process.env.JWT_SECRET = 'test-secret';

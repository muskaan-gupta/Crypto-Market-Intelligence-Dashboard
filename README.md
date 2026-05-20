# Crypto Market Intelligence Dashboard

A production-grade real-time cryptocurrency market intelligence platform built with Node.js, React, PostgreSQL, and Socket.io.

## Overview

This full-stack application fetches live cryptocurrency prices from the CoinGecko API every 10 seconds, processes the data in a background worker, stores historical data in PostgreSQL, and broadcasts real-time updates to connected clients via WebSocket. Users can create price alerts, track their portfolio with P&L calculations, view analytics with volatility charts and correlation matrices, and see live price movements without page refresh.

## Tech Stack

- **Backend:** Node.js + Express.js + TypeScript
  - Used for robust, type-safe backend development with excellent ecosystem support
- **Database:** PostgreSQL
  - Chosen for reliable time-series data storage with excellent indexing capabilities
- **Cache:** Redis
  - Implements caching to avoid hitting CoinGecko rate limits (30 calls/min)
- **Real-time:** Socket.io
  - Provides WebSocket support for real-time price updates and alert notifications
- **Frontend:** React 18 + TypeScript + Tailwind CSS
  - Modern, responsive UI with component-based architecture
- **Charts:** Recharts
  - Interactive data visualization for price charts, volatility, and correlations
- **State Management:** Zustand
  - Lightweight and efficient state management solution
- **Testing:** Jest
  - Comprehensive testing framework for backend logic

## Architecture

```
┌─────────────────┐
│ CoinGecko API   │ (External - rate limited)
└────────┬────────┘
         │ Every 10s
    ┌────▼─────────────────┐
    │ Background Worker    │ (Separate Node process)
    │ - Fetch prices       │
    │ - Check alerts       │
    │ - Calculate stats    │
    └────┬────────────────┘
         │
    ┌────▼──────────────┐
    │ PostgreSQL        │ (Persistent storage)
    │ + Redis Cache     │ (Rate limit bypass)
    └────┬──────────────┘
         │
    ┌────▼──────────────────┐
    │ REST API + WebSocket  │ (Main server)
    │ - HTTP endpoints      │
    │ - Real-time updates   │
    └────┬──────────────────┘
         │
    ┌────▼────────────────┐
    │ React Frontend       │ (User interface)
    │ - Live dashboard     │
    │ - Price charts       │
    │ - Alerts management  │
    │ - Portfolio tracker  │
    └─────────────────────┘
```

## Setup Instructions

### Prerequisites

- Docker and Docker Compose installed
- Node.js 18+ (for local development)
- PostgreSQL 15+ (for local development)
- Redis (for local development)

## Demo Credentials

- **Email:** demo@kuvaka.io
- **Password:** demo123

## API Documentation

### Authentication Endpoints

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Price Endpoints

- `GET /api/prices/live` - Get latest prices for all tracked cryptocurrencies
- `GET /api/prices/history/:coinId` - Get 7-day price history (configurable)

### Alert Endpoints

- `POST /api/alerts` - Create price alert
- `GET /api/alerts` - Get user's alerts
- `DELETE /api/alerts/:alertId` - Delete alert

### Portfolio Endpoints

- `POST /api/portfolio/positions` - Add portfolio position
- `GET /api/portfolio` - Get portfolio with P&L calculation
- `DELETE /api/portfolio/positions/:positionId` - Remove position

### Admin Endpoints

- `GET /api/admin/health` - System health check

## Real-Time Events (WebSocket)

- `prices:updated` - Emitted every 10s with latest prices
- `alert:triggered` - Emitted when a price alert is triggered

## Features Implemented

### Core Features
- ✅ Real-time price dashboard with 10+ cryptocurrencies
- ✅ 7-day interactive price charts
- ✅ Price alert system (above/below threshold)
- ✅ Portfolio tracker with P&L calculations
- ✅ Analytics dashboard with volatility and correlations
- ✅ JWT authentication with password hashing
- ✅ Real-time WebSocket updates
- ✅ Professional, responsive UI (not generic Bootstrap)

### Backend
- ✅ Background worker fetching prices every 10 seconds
- ✅ Redis caching to avoid rate limits
- ✅ Database connection pooling
- ✅ Input validation on all endpoints
- ✅ Exponential backoff retry logic
- ✅ Structured logging
- ✅ 10+ unit tests for critical paths
- ✅ Docker containerization

### Frontend
- ✅ 5 core pages (Dashboard, Coin Detail, Alerts, Portfolio, Analytics)
- ✅ Responsive design (mobile 320px to desktop 1920px)
- ✅ Loading, empty, and error states
- ✅ Toast notifications
- ✅ Real-time price updates
- ✅ Zustand state management
- ✅ TypeScript throughout
- ✅ Reusable components

## Known Limitations

- Price correlations are simplified based on 24h change similarities
- Real-time updates every 10 seconds (CoinGecko free tier limit)
- Single-user portfolio tracking (no sharing features)
- No advanced charting features (limited to 7-day history)
- Alert history not persisted after 30 days (configurable)

## Future Improvements

With more time, the following enhancements could be implemented:

1. **Advanced Analytics**
   - ML-based price predictions
   - Automated portfolio rebalancing
   - Risk assessment models

2. **Social Features**
   - Share portfolios with friends
   - Social alerts and discussions
   - Community leaderboards

3. **Mobile App**
   - Native iOS/Android apps
   - Push notifications
   - Offline support

4. **Enhanced Security**
   - 2FA authentication
   - API key management
   - Audit logs

5. **Performance**
   - GraphQL API
   - WebSocket compression
   - Database query optimization

6. **Deployment**
   - AWS/GCP deployment
   - CI/CD pipeline
   - Performance monitoring

## Testing

Backend tests are included and can be run with:

```bash
cd backend
npm test
```

Tests cover:
- Authentication and password hashing
- Price calculations and volatility
- Alert triggering logic
- Portfolio P&L calculations
- Input validation

## Troubleshooting

### Port Already in Use

```bash
# On Linux/Mac
lsof -i :3000
lsof -i :4000

# Kill the process
kill -9 <PID>
```

### Database Connection Issues

Ensure PostgreSQL is running and accessible:

```bash
psql postgresql://postgres:postgres@localhost:5432/crypto_dashboard
```

### WebSocket Connection Issues

Check that the backend is running and accessible:

```bash
curl http://localhost:4000/health
```

## Performance Considerations

- Database indexes on frequently queried fields (coin_id, timestamp)
- Redis caching for API responses (30-second TTL)
- Connection pooling for database (max 20 connections)
- Efficient WebSocket broadcasting to all connected clients
- No N+1 queries

## Security

- JWT tokens for authentication
- Password hashing with bcrypt (10 rounds)
- CORS protection
- Input validation with Joi
- No hardcoded secrets (use environment variables)
- Error messages don't leak sensitive information



For questions or support, contact: hiring@kuvaka.io

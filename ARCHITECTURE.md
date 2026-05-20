# System Architecture

## High-Level Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         External Systems                             │
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │ CoinGecko API (https://api.coingecko.com/api/v3)            │   │
│  │ - Provides real-time cryptocurrency prices                   │   │
│  │ - Rate limited: 30 calls/minute (free tier)                 │   │
│  └──────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
                                    ▲
                                    │
                    ┌───────────────┼───────────────┐
                    │               │               │
                    │         (Every 10s)           │
                    │               │               │
                    ▼               ▼               ▼
┌───────────────────────────────────────────────────────────────────────┐
│                      Backend Services                                  │
│                                                                        │
│  ┌─────────────────────────────────────────────────────────────────┐ │
│  │ Background Worker (Separate Node Process)                       │ │
│  │                                                                  │ │
│  │ Functions:                                                       │ │
│  │  • Fetch latest prices from CoinGecko (every 10s)              │ │
│  │  • Check for triggered alerts                                  │ │
│  │  • Calculate price statistics (volatility, changes)            │ │
│  │  • Store price snapshots and history                           │ │
│  │  • Emit real-time updates via Socket.io                        │ │
│  │                                                                  │ │
│  │ Process Flow:                                                    │ │
│  │  1. Fetch prices from CoinGecko (with exponential backoff)     │ │
│  │  2. Cache response in Redis (30-second TTL)                    │ │
│  │  3. Store snapshots in PostgreSQL                              │ │
│  │  4. Store price history for charting                           │ │
│  │  5. Check active alerts against current prices                 │ │
│  │  6. Trigger alerts if conditions met                           │ │
│  │  7. Broadcast updated prices to all connected clients          │ │
│  └─────────────────────────────────────────────────────────────────┘ │
│                                                                        │
│  ┌─────────────────────────────────────────────────────────────────┐ │
│  │ REST API Server (Express.js + TypeScript)                      │ │
│  │                                                                  │ │
│  │ Endpoints:                                                       │ │
│  │  POST   /api/auth/register          - User registration        │ │
│  │  POST   /api/auth/login             - User authentication      │ │
│  │  GET    /api/prices/live            - Current prices           │ │
│  │  GET    /api/prices/history/:coinId - Price history (7d)       │ │
│  │  POST   /api/alerts                 - Create alert             │ │
│  │  GET    /api/alerts                 - Get user alerts          │ │
│  │  DELETE /api/alerts/:alertId        - Delete alert             │ │
│  │  POST   /api/portfolio/positions    - Add portfolio position   │ │
│  │  GET    /api/portfolio              - Get portfolio + P&L      │ │
│  │  DELETE /api/portfolio/positions/:id - Remove position        │ │
│  │  GET    /api/admin/health           - Health check             │ │
│  │                                                                  │ │
│  │ Middleware:                                                      │ │
│  │  • JWT authentication                                           │ │
│  │  • Input validation (Joi)                                       │ │
│  │  • Error handling                                               │ │
│  │  • CORS                                                         │ │
│  │  • Logging                                                      │ │
│  └─────────────────────────────────────────────────────────────────┘ │
│                                                                        │
│  ┌─────────────────────────────────────────────────────────────────┐ │
│  │ WebSocket Server (Socket.io)                                   │ │
│  │                                                                  │ │
│  │ Events:                                                          │ │
│  │  • prices:updated        - Broadcast every 10s                 │ │
│  │  • alert:triggered       - When condition is met               │ │
│  │  • connection/disconnect - Client lifecycle                    │ │
│  └─────────────────────────────────────────────────────────────────┘ │
└───────────────────────────────────────────────────────────────────────┘
                              ▲    ▲    ▲
                              │    │    │
                ┌─────────────┼────┼────┼──────────┐
                │             │    │    │          │
                ▼             ▼    ▼    ▼          ▼
┌────────────────────────────────────────────────────────────────────────┐
│                      Data Storage Layer                                 │
│                                                                         │
│  ┌──────────────────────────┐   ┌──────────────────────────────────┐  │
│  │ PostgreSQL Database      │   │ Redis Cache                      │  │
│  │                          │   │                                  │  │
│  │ Tables:                  │   │ Keys:                            │  │
│  │  • users                 │   │  • crypto_prices (30s TTL)      │  │
│  │  • price_snapshots       │   │  • user_alerts:<userId>        │  │
│  │  • price_histories       │   │  • portfolio:<userId>           │  │
│  │  • alerts                │   │  • cache:*                      │  │
│  │  • alert_histories       │   │                                  │  │
│  │  • portfolio_positions   │   │ Purpose:                         │  │
│  │                          │   │  • Cache API responses           │  │
│  │ Indexes:                 │   │  • Reduce CoinGecko rate limit  │  │
│  │  • coin_id, timestamp    │   │  • Speed up queries             │  │
│  │  • user_id               │   │  • Session storage              │  │
│  │  • created_at            │   │                                  │  │
│  └──────────────────────────┘   └──────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────┘
                                    ▲
                                    │
┌───────────────────────────────────┼──────────────────────────────────┐
│                                   │                                  │
│                        Frontend Client (React)                        │
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │ Pages:                                                        │   │
│  │  1. Live Market Dashboard                                    │   │
│  │     - Real-time price table (10+ coins)                      │   │
│  │     - Auto-refresh via WebSocket (no manual refresh)         │   │
│  │     - Color-coded changes (green/red)                        │   │
│  │     - Click to view detailed coin                            │   │
│  │                                                              │   │
│  │  2. Detailed Coin View                                       │   │
│  │     - 7-day interactive price chart                          │   │
│  │     - High/Low/Volatility stats                              │   │
│  │     - "Set Alert" button                                     │   │
│  │                                                              │   │
│  │  3. Price Alerts                                             │   │
│  │     - Create alerts (above/below threshold)                  │   │
│  │     - List active alerts                                     │   │
│  │     - Toast notifications on trigger                         │   │
│  │     - Delete alerts                                          │   │
│  │                                                              │   │
│  │  4. Portfolio Tracker                                        │   │
│  │     - Add positions (coin, quantity, purchase price)         │   │
│  │     - Display positions with current value                   │   │
│  │     - Calculate P&L per position                             │   │
│  │     - Show total portfolio value/P&L                         │   │
│  │                                                              │   │
│  │  5. Analytics Dashboard                                      │   │
│  │     - Volatility comparison chart                            │   │
│  │     - Correlation heatmap (which coins move together)       │   │
│  │     - Market overview stats                                  │   │
│  │                                                              │   │
│  ├──────────────────────────────────────────────────────────────┤   │
│  │ State Management (Zustand):                                  │   │
│  │  • AuthStore  - User session, token                          │   │
│  │  • PriceStore - Live prices, selected coin                   │   │
│  │  • AlertStore - User's alerts                                │   │
│  │  • PortfolioStore - Holdings and P&L                         │   │
│  │  • NotificationStore - Toast messages                        │   │
│  │                                                              │   │
│  ├──────────────────────────────────────────────────────────────┤   │
│  │ WebSocket Client (Socket.io):                                │   │
│  │  • Auto-reconnect with exponential backoff                   │   │
│  │  • Listen for prices:updated events                          │   │
│  │  • Listen for alert:triggered events                         │   │
│  │  • Update UI in real-time                                    │   │
│  │                                                              │   │
│  ├──────────────────────────────────────────────────────────────┤   │
│  │ UI Components (React + TypeScript):                          │   │
│  │  • Button, Card, Badge components                            │   │
│  │  • Loading spinners                                          │   │
│  │  • Error messages                                            │   │
│  │  • Toast notifications                                       │   │
│  │  • Price table with sorting                                  │   │
│  │  • Charts (Recharts)                                         │   │
│  │  • Responsive design (Tailwind CSS)                          │   │
│  │                                                              │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │ Authentication Flow:                                          │   │
│  │  1. User registers/logs in                                    │   │
│  │  2. Backend returns JWT token                                 │   │
│  │  3. Frontend stores token in localStorage                     │   │
│  │  4. All API requests include Authorization header             │   │
│  │  5. Backend verifies token on each request                    │   │
│  │  6. On token expiry, redirect to login                        │   │
│  │                                                              │   │
│  └──────────────────────────────────────────────────────────────┘   │
└───────────────────────────────────────────────────────────────────────┘
```

## Data Flow

### Price Update Flow (Every 10 Seconds)

```
1. Worker Timer Triggers
   └─> fetchCryptoPrices()
       ├─> Check Redis cache
       ├─> If miss, call CoinGecko API
       ├─> Cache result in Redis (30s)
       └─> Return prices

2. Store Price Data
   ├─> Insert into price_snapshots table
   └─> Insert into price_histories table

3. Check Alerts
   └─> For each active alert:
       ├─> Get current price
       ├─> Compare against threshold
       ├─> If triggered:
       │   ├─> Update alert (is_active = false)
       │   ├─> Create alert_history record
       │   └─> Emit alert:triggered event
       └─> Continue to next alert

4. Broadcast Updates
   ├─> Emit prices:updated to all connected clients
   ├─> Include all coin data
   └─> Include timestamp
```

### User Interaction Flow (Create Alert)

```
1. User fills alert form
   ├─> Coin ID/Name
   ├─> Condition (above/below)
   └─> Target price

2. Frontend sends POST /api/alerts
   ├─> Include JWT token
   ├─> Validate input
   └─> Server creates alert record

3. Server response
   ├─> Return alert object
   └─> Store in frontend state

4. Real-time monitoring
   ├─> Background worker checks this alert every 10s
   ├─> When price crosses threshold:
   │   ├─> Mark alert as triggered
   │   ├─> Emit alert:triggered via WebSocket
   │   └─> Frontend receives event
   └─> Display toast notification
```

## Key Design Decisions

### 1. Separate Worker Process
- **Why:** Decouples price fetching from API request handling
- **Benefit:** Better resource utilization, independent scaling
- **Alternative:** Could use Bull job queue for more complex scenarios

### 2. Redis Caching
- **Why:** Avoid hitting CoinGecko rate limits (30 calls/min)
- **Strategy:** Cache full response for 30 seconds
- **Benefit:** Allows many API requests without rate limiting

### 3. PostgreSQL for Time-Series
- **Why:** Excellent indexing, ACID compliance, query capabilities
- **Alternative:** Could use TimescaleDB for better time-series optimization
- **Indexes:** On coin_id and timestamp for fast historical queries

### 4. Socket.io over Polling
- **Why:** Real-time updates without continuous polling
- **Benefit:** Reduces server load, instant updates
- **Fallback:** WebSocket with fallback to long-polling

### 5. JWT Authentication
- **Why:** Stateless, scalable, works well with distributed systems
- **Security:** Tokens stored in localStorage, included in Authorization header
- **Expiry:** 7-day tokens (configurable)

### 6. Zustand State Management
- **Why:** Minimal boilerplate, TypeScript support
- **Benefits:** Small bundle size, easy to test
- **Alternative:** Could use Redux for larger apps

## Performance Considerations

### Backend
- Connection pooling: Max 20 database connections
- Query optimization: Indexes on frequently accessed fields
- Caching: Redis for API responses (30s TTL)
- No N+1 queries: All relationships handled in single queries
- Rate limiting: Handled by CoinGecko cache

### Frontend
- Component memoization where needed
- Efficient re-renders with Zustand
- CSS-in-JS with Tailwind (no runtime overhead)
- Chart optimization (virtual scrolling not needed for 10 coins)

### Network
- WebSocket for real-time updates (vs polling)
- Gzip compression on API responses
- Efficient JSON payloads
- Minimal bundle size (React 18 + Tailwind + Recharts)

## Deployment Architecture

```
┌──────────────────────────────────┐
│      Docker Compose (Local)       │
│                                  │
│  ┌──────────────────────────┐   │
│  │ PostgreSQL               │   │
│  │ postgres:15-alpine       │   │
│  └──────────────────────────┘   │
│                                  │
│  ┌──────────────────────────┐   │
│  │ Redis                    │   │
│  │ redis:7-alpine           │   │
│  └──────────────────────────┘   │
│                                  │
│  ┌──────────────────────────┐   │
│  │ Backend API              │   │
│  │ Dockerfile               │   │
│  │ Port: 4000               │   │
│  └──────────────────────────┘   │
│                                  │
│  ┌──────────────────────────┐   │
│  │ Worker                   │   │
│  │ Dockerfile.worker        │   │
│  │ Background process       │   │
│  └──────────────────────────┘   │
│                                  │
│  ┌──────────────────────────┐   │
│  │ Frontend (Nginx)         │   │
│  │ Dockerfile               │   │
│  │ Port: 3000               │   │
│  │ Proxy to backend /api    │   │
│  └──────────────────────────┘   │
└──────────────────────────────────┘
```

For production:
- Use managed PostgreSQL (AWS RDS, GCP Cloud SQL)
- Use managed Redis (AWS ElastiCache, Azure Cache)
- Deploy backend/worker on container orchestration (K8s, ECS)
- Use CDN for frontend static assets
- Implement auto-scaling based on metrics

# 🎡 Wheel Strategy Scanner

A Next.js app that scans stocks for optimal Wheel strategy candidates using Polygon.io and Unusual Whales APIs.

## Features

- **50 liquid, optionable tickers** in the scanning universe
- **Wheel Score** (0-100) based on:
  - IV Rank (25 pts) - Sweet spot 30-60%
  - Stock Liquidity (20 pts) - Volume > 2M ideal
  - Technical (20 pts) - Above 200 SMA + RSI neutral
  - Fundamental (20 pts) - Market cap quality
  - Options Liquidity (15 pts) - Options volume > 10K ideal
- **Configurable filters** for price range, RSI, SMA requirements
- **Sortable results table**

## Quick Deploy to Vercel

### 1. Push to GitHub

```bash
cd wheel-scanner-app
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/wheel-scanner.git
git push -u origin main
```

### 2. Deploy on Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Import your GitHub repo
4. **Add Environment Variables:**
   - `POLYGON_API_KEY` = your Polygon.io API key
   - `UW_API_KEY` = your Unusual Whales API key (optional but recommended)
5. Click Deploy

### 3. Done!

Your scanner will be live at `https://wheel-scanner.vercel.app` (or your custom domain).

## Local Development

```bash
# Install dependencies
npm install

# Create .env.local with your API keys
cp .env.example .env.local
# Edit .env.local with your keys

# Run dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## API Endpoints

### GET /api/test?ticker=AAPL
Tests API connections with a single ticker. Returns detailed results from both Polygon and UW.

### POST /api/scan
Runs full scan of 50 tickers. Accepts optional config in body:
```json
{
  "config": {
    "minPrice": 15,
    "maxPrice": 75,
    "minRSI": 35,
    "maxRSI": 65,
    "aboveSMA200": true
  }
}
```

### GET /api/scan
Health check - returns API key status.

## Ticker Universe

The scanner includes 50 liquid, optionable stocks:
- **Tech:** AAPL, MSFT, GOOGL, AMZN, META, NVDA, AMD, etc.
- **Financial:** JPM, BAC, WFC, GS
- **Energy:** XOM, CVX, OXY
- **Healthcare:** UNH, JNJ, PFE, ABBV, MRK
- **Consumer:** DIS, NFLX, WMT, TGT, COST, etc.
- **ETFs:** SPY, QQQ, IWM
- **Fintech:** COIN, SQ, PYPL, SOFI, HOOD

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `POLYGON_API_KEY` | Yes | Your Polygon.io API key |
| `UW_API_KEY` | No | Unusual Whales API key (for IV rank data) |

## License

MIT - Use at your own risk. Not financial advice.

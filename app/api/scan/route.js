// app/api/scan/route.js
// Scans universe of tickers for Wheel candidates

const WHEEL_UNIVERSE = [
  'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META', 'NVDA', 'AMD', 'INTC', 'TSM', 'QCOM',
  'TSLA', 'F', 'GM', 'JPM', 'BAC', 'WFC', 'GS', 'XOM', 'CVX', 'OXY',
  'UNH', 'JNJ', 'PFE', 'ABBV', 'MRK', 'DIS', 'NFLX', 'WMT', 'TGT', 'COST',
  'HD', 'LOW', 'SBUX', 'MCD', 'NKE', 'BA', 'CAT', 'SPY', 'QQQ', 'IWM',
  'COIN', 'SQ', 'PYPL', 'PLTR', 'SNOW', 'CRM', 'UBER', 'ABNB', 'SOFI', 'HOOD'
];

const DEFAULT_CONFIG = {
  minPrice: 15,
  maxPrice: 75,
  minAvgVolume: 1000000,
  minMarketCap: 2000000000,
  minIVRank: 25,
  maxIVRank: 80,
  aboveSMA200: true,
  minRSI: 35,
  maxRSI: 65,
  weights: {
    ivRank: 25,
    liquidity: 20,
    technical: 20,
    fundamental: 20,
    optionsLiquidity: 15
  }
};

function calculateWheelScore(stock, config) {
  const { weights } = config;
  let score = 0;

  // IV Rank Score
  if (stock.ivRank !== null) {
    if (stock.ivRank >= 30 && stock.ivRank <= 60) score += weights.ivRank;
    else if (stock.ivRank >= 25 && stock.ivRank <= 70) score += weights.ivRank * 0.8;
    else if (stock.ivRank >= 20 && stock.ivRank <= 80) score += weights.ivRank * 0.6;
    else score += weights.ivRank * 0.3;
  } else {
    score += weights.ivRank * 0.5;
  }

  // Liquidity Score
  if (stock.avgVolume > 5000000) score += weights.liquidity;
  else if (stock.avgVolume > 2000000) score += weights.liquidity * 0.8;
  else if (stock.avgVolume > 1000000) score += weights.liquidity * 0.6;
  else score += weights.liquidity * 0.3;

  // Technical Score
  if (stock.aboveSMA200) score += weights.technical * 0.5;
  if (stock.rsi && stock.rsi >= 40 && stock.rsi <= 60) score += weights.technical * 0.5;
  else if (stock.rsi && stock.rsi >= 35 && stock.rsi <= 65) score += weights.technical * 0.3;

  // Fundamental Score
  score += weights.fundamental * (stock.marketCap > 10000000000 ? 1 : 0.7);

  // Options Liquidity Score
  if (stock.optionsVolume > 10000) score += weights.optionsLiquidity;
  else if (stock.optionsVolume > 5000) score += weights.optionsLiquidity * 0.8;
  else if (stock.optionsVolume > 1000) score += weights.optionsLiquidity * 0.6;
  else score += weights.optionsLiquidity * 0.4;

  return Math.round(score);
}

async function fetchTickerData(ticker, POLYGON_KEY, UW_KEY) {
  const data = { ticker };
  
  // Fetch Polygon Quote
  try {
    const quoteRes = await fetch(
      `https://api.polygon.io/v2/aggs/ticker/${ticker}/prev?apiKey=${POLYGON_KEY}`
    );
    const quoteData = await quoteRes.json();
    
    if (quoteData.results?.[0]) {
      const q = quoteData.results[0];
      data.price = q.c;
      data.open = q.o;
      data.avgVolume = q.v;
      data.change = ((q.c - q.o) / q.o * 100).toFixed(2);
    } else {
      return null; // Skip if no quote
    }
  } catch (e) {
    return null;
  }

  // Fetch Polygon Details
  try {
    const detailsRes = await fetch(
      `https://api.polygon.io/v3/reference/tickers/${ticker}?apiKey=${POLYGON_KEY}`
    );
    const detailsData = await detailsRes.json();
    
    if (detailsData.results) {
      data.marketCap = detailsData.results.market_cap || 0;
      data.name = detailsData.results.name;
      data.sector = detailsData.results.sic_description || 'Unknown';
    }
  } catch (e) {
    data.marketCap = 0;
  }

  // Fetch SMA 200
  try {
    const smaRes = await fetch(
      `https://api.polygon.io/v1/indicators/sma/${ticker}?timespan=day&adjusted=true&window=200&series_type=close&limit=1&apiKey=${POLYGON_KEY}`
    );
    const smaData = await smaRes.json();
    data.sma200 = smaData.results?.values?.[0]?.value || null;
    data.aboveSMA200 = data.sma200 ? data.price > data.sma200 : true;
  } catch (e) {
    data.sma200 = null;
    data.aboveSMA200 = true;
  }

  // Fetch RSI
  try {
    const rsiRes = await fetch(
      `https://api.polygon.io/v1/indicators/rsi/${ticker}?timespan=day&adjusted=true&window=14&series_type=close&limit=1&apiKey=${POLYGON_KEY}`
    );
    const rsiData = await rsiRes.json();
    data.rsi = rsiData.results?.values?.[0]?.value 
      ? Math.round(rsiData.results.values[0].value) 
      : null;
  } catch (e) {
    data.rsi = null;
  }

  // Fetch UW IV Rank (if key available)
  data.ivRank = null;
  data.optionsVolume = 1000; // Default for liquid stocks
  data.putCallRatio = null;
  
  if (UW_KEY) {
    // Fetch IV Rank - returns array of daily values, grab most recent
    try {
      const ivRes = await fetch(
        `https://api.unusualwhales.com/api/stock/${ticker}/iv-rank`,
        {
          headers: {
            'Authorization': `Bearer ${UW_KEY}`,
            'Accept': 'application/json'
          }
        }
      );
      
      if (ivRes.ok) {
        const ivData = await ivRes.json();
        // Data comes as array, get the most recent entry's iv_rank_1y
        const ivArray = ivData.data || ivData;
        if (Array.isArray(ivArray) && ivArray.length > 0) {
          // Get last entry (most recent)
          const latest = ivArray[ivArray.length - 1];
          data.ivRank = parseFloat(latest.iv_rank_1y) || null;
          data.currentIV = parseFloat(latest.volatility) * 100 || null; // Convert to percentage
        }
      }
    } catch (e) {}

    // Fetch options volume - sum put_volume + call_volume
    try {
      const volRes = await fetch(
        `https://api.unusualwhales.com/api/stock/${ticker}/options-volume`,
        {
          headers: {
            'Authorization': `Bearer ${UW_KEY}`,
            'Accept': 'application/json'
          }
        }
      );
      
      if (volRes.ok) {
        const volData = await volRes.json();
        const volArray = volData.data || volData;
        if (Array.isArray(volArray) && volArray.length > 0) {
          const latest = volArray[0]; // Most recent day
          const putVol = parseInt(latest.put_volume) || 0;
          const callVol = parseInt(latest.call_volume) || 0;
          data.optionsVolume = putVol + callVol;
          data.putCallRatio = callVol > 0 ? (putVol / callVol).toFixed(2) : null;
          data.callOI = parseInt(latest.call_open_interest) || 0;
          data.putOI = parseInt(latest.put_open_interest) || 0;
        }
      }
    } catch (e) {}
  }

  return data;
}

export async function POST(request) {
  const body = await request.json();
  const config = { ...DEFAULT_CONFIG, ...body.config };
  
  const POLYGON_KEY = process.env.POLYGON_API_KEY;
  const UW_KEY = process.env.UW_API_KEY;
  
  if (!POLYGON_KEY) {
    return Response.json({ error: 'Polygon API key not configured' }, { status: 500 });
  }

  const results = [];
  const skipped = [];

  for (const ticker of WHEEL_UNIVERSE) {
    const data = await fetchTickerData(ticker, POLYGON_KEY, UW_KEY);
    
    if (!data) {
      skipped.push({ ticker, reason: 'No quote data' });
      continue;
    }

    // Apply filters
    if (data.price < config.minPrice || data.price > config.maxPrice) {
      skipped.push({ ticker, reason: `Price $${data.price.toFixed(2)} outside range` });
      continue;
    }

    if (data.avgVolume < config.minAvgVolume) {
      skipped.push({ ticker, reason: `Volume ${data.avgVolume} below minimum` });
      continue;
    }

    if (config.aboveSMA200 && data.sma200 && !data.aboveSMA200) {
      skipped.push({ ticker, reason: 'Below 200 SMA' });
      continue;
    }

    if (data.rsi && (data.rsi < config.minRSI || data.rsi > config.maxRSI)) {
      skipped.push({ ticker, reason: `RSI ${data.rsi} outside range` });
      continue;
    }

    // Calculate score
    data.wheelScore = calculateWheelScore(data, config);
    results.push(data);

    // Small delay for rate limiting
    await new Promise(resolve => setTimeout(resolve, 50));
  }

  // Sort by wheel score
  results.sort((a, b) => b.wheelScore - a.wheelScore);

  return Response.json({
    candidates: results,
    skipped,
    meta: {
      scanned: WHEEL_UNIVERSE.length,
      found: results.length,
      filtered: skipped.length,
      timestamp: new Date().toISOString()
    }
  });
}

// GET endpoint for quick health check
export async function GET() {
  return Response.json({
    status: 'ok',
    universe: WHEEL_UNIVERSE.length,
    hasPolygonKey: !!process.env.POLYGON_API_KEY,
    hasUWKey: !!process.env.UW_API_KEY
  });
}

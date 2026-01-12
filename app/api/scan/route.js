// app/api/scan/route.js
// Scans universe of tickers for Wheel candidates with strike suggestions

const WHEEL_UNIVERSE = [
  // Mega-cap Tech
  'AAPL', 'MSFT', 'GOOGL', 'GOOG', 'AMZN', 'META', 'NVDA', 'TSM', 'AVGO', 'ORCL',
  // Semiconductors
  'AMD', 'INTC', 'QCOM', 'MU', 'AMAT', 'LRCX', 'KLAC', 'ADI', 'MRVL', 'ON',
  // EV / Auto
  'TSLA', 'F', 'GM', 'RIVN', 'LCID', 'NIO', 'XPEV', 'LI',
  // Financials
  'JPM', 'BAC', 'WFC', 'C', 'GS', 'MS', 'SCHW', 'COF', 'AXP', 'USB',
  // Energy
  'XOM', 'CVX', 'OXY', 'SLB', 'HAL', 'DVN', 'MRO', 'VLO', 'PSX', 'EOG',
  // Healthcare / Pharma
  'UNH', 'JNJ', 'PFE', 'ABBV', 'MRK', 'LLY', 'BMY', 'GILD', 'AMGN', 'MRNA',
  // Media / Telecom
  'DIS', 'NFLX', 'CMCSA', 'T', 'VZ', 'TMUS', 'WBD', 'PARA',
  // Retail / Consumer
  'WMT', 'TGT', 'COST', 'HD', 'LOW', 'SBUX', 'MCD', 'NKE', 'LULU', 'TJX',
  // Industrial
  'BA', 'CAT', 'DE', 'UPS', 'FDX', 'RTX', 'LMT', 'GE', 'HON', 'MMM',
  // ETFs
  'SPY', 'QQQ', 'IWM', 'DIA', 'XLF', 'XLE', 'XLK', 'XLV', 'XLI', 'ARKK',
  // Fintech / Payments
  'COIN', 'SQ', 'PYPL', 'V', 'MA', 'AFRM', 'UPST',
  // Cloud / SaaS
  'PLTR', 'SNOW', 'CRM', 'NOW', 'SHOP', 'DDOG', 'NET', 'ZS', 'CRWD', 'MDB',
  // Gig Economy / Travel
  'UBER', 'LYFT', 'ABNB', 'BKNG', 'EXPE', 'MAR',
  // Airlines / Cruise
  'AAL', 'UAL', 'DAL', 'LUV', 'CCL', 'RCL', 'NCLH',
  // Meme / High Vol
  'SOFI', 'HOOD', 'MARA', 'RIOT', 'CLSK', 'GME', 'AMC',
  // REITs
  'O', 'SPG', 'AMT', 'PLD',
  // Other Popular
  'KO', 'PEP', 'PM', 'MO', 'CL', 'PG', 'WBA', 'CVS'
];

const DEFAULT_CONFIG = {
  minPrice: 15,
  maxPrice: 100,
  minAvgVolume: 500000,
  minMarketCap: 1000000000,
  minIVRank: 20,
  maxIVRank: 85,
  aboveSMA200: true,
  minRSI: 30,
  maxRSI: 70,
  targetDelta: 0.30,
  minDTE: 20,
  maxDTE: 45,
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

  // IV Rank Score - sweet spot is 30-60%
  if (stock.ivRank !== null && stock.ivRank !== undefined) {
    if (stock.ivRank >= 30 && stock.ivRank <= 60) score += weights.ivRank;
    else if (stock.ivRank >= 25 && stock.ivRank <= 70) score += weights.ivRank * 0.8;
    else if (stock.ivRank >= 20 && stock.ivRank <= 80) score += weights.ivRank * 0.6;
    else score += weights.ivRank * 0.3;
  } else {
    score += weights.ivRank * 0.4; // Partial if no data
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
  else score += weights.technical * 0.1;

  // Fundamental Score
  if (stock.marketCap > 50000000000) score += weights.fundamental;
  else if (stock.marketCap > 10000000000) score += weights.fundamental * 0.8;
  else score += weights.fundamental * 0.6;

  // Options Liquidity Score
  if (stock.optionsVolume > 50000) score += weights.optionsLiquidity;
  else if (stock.optionsVolume > 10000) score += weights.optionsLiquidity * 0.8;
  else if (stock.optionsVolume > 5000) score += weights.optionsLiquidity * 0.6;
  else score += weights.optionsLiquidity * 0.3;

  return Math.round(score);
}

async function fetchPolygonData(ticker, POLYGON_KEY) {
  const data = { ticker };
  
  // Quote
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
      return null;
    }
  } catch (e) {
    return null;
  }

  // Details
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

  // SMA 200
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

  // RSI
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

  return data;
}

async function fetchUWData(ticker, UW_KEY) {
  const data = {
    ivRank: null,
    optionsVolume: 1000,
    putCallRatio: null
  };

  if (!UW_KEY) return data;

  // IV Rank
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
      const ivArray = ivData.data || ivData;
      if (Array.isArray(ivArray) && ivArray.length > 0) {
        const latest = ivArray[ivArray.length - 1];
        data.ivRank = parseFloat(latest.iv_rank_1y) || null;
        data.currentIV = parseFloat(latest.volatility) * 100 || null;
      }
    }
  } catch (e) {}

  // Delay to avoid rate limiting
  await new Promise(resolve => setTimeout(resolve, 100));

  // Options Volume
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
        const latest = volArray[0];
        const putVol = parseInt(latest.put_volume) || 0;
        const callVol = parseInt(latest.call_volume) || 0;
        data.optionsVolume = putVol + callVol;
        data.putCallRatio = callVol > 0 ? (putVol / callVol).toFixed(2) : null;
      }
    }
  } catch (e) {}

  return data;
}

// Fetch strike suggestion using UW greeks endpoint
async function fetchStrikeSuggestion(ticker, UW_KEY, config) {
  if (!UW_KEY) return null;
  
  const targetDelta = config.targetDelta || 0.30;
  const minDTE = config.minDTE || 20;
  const maxDTE = config.maxDTE || 45;
  const today = new Date();
  
  const headers = {
    'Authorization': `Bearer ${UW_KEY}`,
    'Accept': 'application/json'
  };

  try {
    // Step 1: Get option chains to find valid expiry dates
    const chainsRes = await fetch(
      `https://api.unusualwhales.com/api/stock/${ticker}/option-chains`,
      { headers }
    );
    
    if (!chainsRes.ok) return null;
    
    const chainsData = await chainsRes.json();
    const symbols = chainsData.data || chainsData || [];
    
    if (symbols.length === 0) return null;
    
    // Extract unique expiration dates from symbols
    // Format: GM260116P00073000 -> 260116 -> 2026-01-16
    const expirySet = new Set();
    symbols.forEach(sym => {
      const match = sym.match(/[A-Z]+(\d{6})[CP]/);
      if (match) {
        const dateStr = match[1];
        const year = '20' + dateStr.substring(0, 2);
        const month = dateStr.substring(2, 4);
        const day = dateStr.substring(4, 6);
        expirySet.add(`${year}-${month}-${day}`);
      }
    });
    
    // Filter to expiries in our DTE range
    const validExpiries = Array.from(expirySet).filter(exp => {
      const expDate = new Date(exp);
      const dte = Math.ceil((expDate - today) / (1000 * 60 * 60 * 24));
      return dte >= minDTE && dte <= maxDTE;
    }).sort();
    
    if (validExpiries.length === 0) return null;
    
    // Step 2: Get greeks for the first valid expiry (closest to minDTE)
    const targetExpiry = validExpiries[0];
    
    await new Promise(r => setTimeout(r, 100)); // Rate limit
    
    const greeksRes = await fetch(
      `https://api.unusualwhales.com/api/stock/${ticker}/greeks?expiry=${targetExpiry}`,
      { headers }
    );
    
    if (!greeksRes.ok) return null;
    
    const greeksData = await greeksRes.json();
    const strikes = greeksData.data || [];
    
    if (strikes.length === 0) return null;
    
    // Step 3: Find put with delta closest to target (e.g., -0.30)
    let bestPut = null;
    let bestDeltaDiff = Infinity;
    
    for (const strike of strikes) {
      const putDelta = Math.abs(parseFloat(strike.put_delta) || 0);
      if (putDelta < 0.15 || putDelta > 0.45) continue;
      
      const deltaDiff = Math.abs(putDelta - targetDelta);
      
      if (deltaDiff < bestDeltaDiff) {
        bestDeltaDiff = deltaDiff;
        
        const expDate = new Date(strike.expiry);
        const dte = Math.ceil((expDate - today) / (1000 * 60 * 60 * 24));
        
        // Get IV from put_volatility (it's already a decimal like 0.45)
        const iv = strike.put_volatility ? (parseFloat(strike.put_volatility) * 100).toFixed(1) : null;
        
        bestPut = {
          strike: parseFloat(strike.strike),
          expiration: strike.expiry,
          dte: dte,
          delta: (-putDelta).toFixed(2),
          bid: '-',
          ask: '-',
          mid: '-',
          premiumSource: '',
          iv: iv,
          volume: 0,
          openInterest: 0,
          symbol: strike.put_option_symbol
        };
      }
    }
    
    // Step 4: If we found a put, try to get pricing from option-contracts
    if (bestPut) {
      await new Promise(r => setTimeout(r, 100)); // Rate limit
      
      try {
        const contractsRes = await fetch(
          `https://api.unusualwhales.com/api/stock/${ticker}/option-contracts`,
          { headers }
        );
        
        if (contractsRes.ok) {
          const contractsData = await contractsRes.json();
          const contracts = contractsData.data || [];
          
          // Find matching contract
          const matchingContract = contracts.find(c => 
            c.option_symbol === bestPut.symbol
          );
          
          if (matchingContract) {
            const bid = parseFloat(matchingContract.nbbo_bid) || 0;
            const ask = parseFloat(matchingContract.nbbo_ask) || 0;
            const lastPrice = parseFloat(matchingContract.last_price) || 0;
            
            let premium = 0;
            let premiumSource = '';
            if (bid > 0 && ask > 0) {
              premium = (bid + ask) / 2;
              premiumSource = 'mid';
            } else if (lastPrice > 0) {
              premium = lastPrice;
              premiumSource = 'last';
            }
            
            bestPut.bid = bid > 0 ? bid.toFixed(2) : '-';
            bestPut.ask = ask > 0 ? ask.toFixed(2) : '-';
            bestPut.mid = premium > 0 ? premium.toFixed(2) : '-';
            bestPut.premiumSource = premiumSource;
            bestPut.volume = parseInt(matchingContract.volume) || 0;
            bestPut.openInterest = parseInt(matchingContract.open_interest) || 0;
          }
        }
      } catch (e) {
        // Pricing lookup failed, but we still have the strike suggestion
      }
    }
    
    return bestPut;
  } catch (e) {
    return null;
  }
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
  const errors = [];

  for (let i = 0; i < WHEEL_UNIVERSE.length; i++) {
    const ticker = WHEEL_UNIVERSE[i];

    try {
      // Fetch Polygon data
      const polygonData = await fetchPolygonData(ticker, POLYGON_KEY);
      
      if (!polygonData) {
        skipped.push({ ticker, reason: 'No quote data' });
        continue;
      }

      const { price, avgVolume, marketCap } = polygonData;

      // Apply filters
      if (price < config.minPrice || price > config.maxPrice) {
        skipped.push({ ticker, reason: `Price $${price.toFixed(2)} outside range` });
        continue;
      }

      if (avgVolume < config.minAvgVolume) {
        skipped.push({ ticker, reason: `Volume ${avgVolume.toLocaleString()} below minimum` });
        continue;
      }

      if (config.aboveSMA200 && polygonData.sma200 && !polygonData.aboveSMA200) {
        skipped.push({ ticker, reason: 'Below 200 SMA' });
        continue;
      }

      if (polygonData.rsi && (polygonData.rsi < config.minRSI || polygonData.rsi > config.maxRSI)) {
        skipped.push({ ticker, reason: `RSI ${polygonData.rsi} outside range` });
        continue;
      }

      // Fetch UW data (IV, options volume)
      const uwData = await fetchUWData(ticker, UW_KEY);

      // Fetch strike suggestion from UW greeks endpoint
      const suggestedStrike = await fetchStrikeSuggestion(ticker, UW_KEY, config);

      // Combine data
      const stockData = {
        ...polygonData,
        ...uwData,
        suggestedStrike
      };

      // Calculate score
      stockData.wheelScore = calculateWheelScore(stockData, config);
      results.push(stockData);

      // Rate limiting delay
      await new Promise(resolve => setTimeout(resolve, 50));
      
    } catch (e) {
      errors.push({ ticker, error: e.message });
    }
  }

  // Sort by wheel score descending
  results.sort((a, b) => b.wheelScore - a.wheelScore);

  return Response.json({
    candidates: results,
    skipped,
    errors,
    meta: {
      scanned: WHEEL_UNIVERSE.length,
      found: results.length,
      filtered: skipped.length,
      errored: errors.length,
      timestamp: new Date().toISOString(),
      config: {
        priceRange: `$${config.minPrice}-$${config.maxPrice}`,
        targetDelta: config.targetDelta,
        dteRange: `${config.minDTE}-${config.maxDTE} days`
      }
    }
  });
}

export async function GET() {
  return Response.json({
    status: 'ok',
    universe: WHEEL_UNIVERSE.length,
    tickers: WHEEL_UNIVERSE,
    hasPolygonKey: !!process.env.POLYGON_API_KEY,
    hasUWKey: !!process.env.UW_API_KEY
  });
}

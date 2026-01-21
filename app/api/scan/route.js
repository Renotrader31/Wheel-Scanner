// app/api/scan/route.js
// Wheel Strategy Scanner - EXPANDED Universe v2
// 200+ tickers across diverse sectors

const WHEEL_UNIVERSE = [
  // ============ TECH - MEGA CAP ============
  'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META', 'NVDA', 'AVGO', 'ORCL', 'CRM', 'ADBE',
  
  // ============ TECH - SEMICONDUCTORS ============
  'AMD', 'INTC', 'TSM', 'QCOM', 'MU', 'AMAT', 'LRCX', 'KLAC', 'ADI', 'MRVL',
  'ON', 'NXPI', 'TXN', 'MCHP', 'SWKS', 'QRVO',
  
  // ============ TECH - SOFTWARE/CLOUD ============
  'NOW', 'SNOW', 'PLTR', 'DDOG', 'NET', 'ZS', 'CRWD', 'MDB', 'PANW', 'FTNT',
  'WDAY', 'SPLK', 'TEAM', 'ZM', 'OKTA', 'HUBS', 'DOCU', 'TWLO', 'BILL', 'CFLT',
  
  // ============ TECH - INTERNET/ECOMMERCE ============
  'SHOP', 'UBER', 'LYFT', 'ABNB', 'DASH', 'PINS', 'SNAP', 'RBLX', 'U', 'ROKU',
  'ETSY', 'EBAY', 'CHWY', 'W', 'BKNG', 'EXPE', 'TCOM',
  
  // ============ EV / AUTO ============
  'TSLA', 'F', 'GM', 'RIVN', 'LCID', 'NIO', 'XPEV', 'LI', 'FSR',
  'TM', 'HMC', 'STLA', 'RACE',
  
  // ============ FINANCIALS - BANKS ============
  'JPM', 'BAC', 'WFC', 'C', 'GS', 'MS', 'USB', 'PNC', 'TFC', 'FITB',
  'CFG', 'KEY', 'HBAN', 'RF', 'ZION', 'CMA', 'ALLY', 'MTB', 'SIVB',
  
  // ============ FINANCIALS - OTHER ============
  'SCHW', 'COF', 'AXP', 'DFS', 'SYF', 'PYPL', 'SQ', 'V', 'MA', 'AFRM',
  'COIN', 'HOOD', 'SOFI', 'UPST', 'LC', 'NU',
  
  // ============ FINANCIALS - INSURANCE ============
  'BRK.B', 'MET', 'PRU', 'AIG', 'ALL', 'TRV', 'PGR', 'AFL', 'CINF',
  
  // ============ ENERGY - OIL & GAS ============
  'XOM', 'CVX', 'OXY', 'COP', 'EOG', 'SLB', 'HAL', 'BKR', 'DVN', 'MRO',
  'APA', 'FANG', 'PXD', 'HES', 'MPC', 'VLO', 'PSX',
  
  // ============ ENERGY - CLEAN/RENEWABLE ============
  'ENPH', 'SEDG', 'FSLR', 'RUN', 'PLUG', 'BE', 'NEE', 'AES',
  
  // ============ HEALTHCARE - PHARMA ============
  'JNJ', 'PFE', 'ABBV', 'MRK', 'LLY', 'BMY', 'GILD', 'AMGN', 'REGN', 'VRTX',
  'BIIB', 'MRNA', 'BNTX', 'AZN', 'NVO', 'SNY', 'GSK', 'TAK',
  
  // ============ HEALTHCARE - BIOTECH ============
  'SGEN', 'ILMN', 'DXCM', 'ISRG', 'ALGN', 'HOLX', 'IDXX', 'IQV',
  
  // ============ HEALTHCARE - SERVICES ============
  'UNH', 'CVS', 'CI', 'HUM', 'ELV', 'CNC', 'MOH', 'HCA', 'THC',
  
  // ============ CONSUMER - RETAIL ============
  'WMT', 'TGT', 'COST', 'HD', 'LOW', 'DG', 'DLTR', 'FIVE', 'OLLI', 'ROST',
  'TJX', 'BBY', 'KSS', 'M', 'JWN', 'GPS', 'ANF', 'AEO', 'LULU', 'NKE',
  'DECK', 'CROX', 'SKX', 'UAA',
  
  // ============ CONSUMER - RESTAURANTS/FOOD ============
  'MCD', 'SBUX', 'CMG', 'YUM', 'DPZ', 'WING', 'SHAK', 'CAVA', 'BROS',
  'QSR', 'WEN', 'DRI', 'TXRH', 'EAT', 'CAKE',
  
  // ============ CONSUMER - STAPLES ============
  'KO', 'PEP', 'MNST', 'KDP', 'STZ', 'TAP', 'BUD',
  'PG', 'CL', 'KMB', 'CLX', 'CHD',
  'PM', 'MO', 'BTI',
  'GIS', 'K', 'CAG', 'SJM', 'HSY', 'MDLZ', 'KHC',
  
  // ============ INDUSTRIALS - AEROSPACE/DEFENSE ============
  'BA', 'RTX', 'LMT', 'NOC', 'GD', 'LHX', 'TDG', 'HWM', 'TXT', 'SPR',
  
  // ============ INDUSTRIALS - MACHINERY ============
  'CAT', 'DE', 'PCAR', 'CMI', 'AGCO', 'CNHI', 'OSK', 'TTC',
  
  // ============ INDUSTRIALS - TRANSPORT ============
  'UPS', 'FDX', 'XPO', 'ODFL', 'JBHT', 'SAIA', 'CHRW',
  'CSX', 'UNP', 'NSC',
  
  // ============ INDUSTRIALS - OTHER ============
  'GE', 'HON', 'MMM', 'EMR', 'ETN', 'ROK', 'PH', 'DOV', 'ITW', 'SWK',
  
  // ============ AIRLINES / CRUISE / TRAVEL ============
  'AAL', 'UAL', 'DAL', 'LUV', 'ALK', 'JBLU', 'SAVE',
  'CCL', 'RCL', 'NCLH',
  'MAR', 'HLT', 'H', 'WH', 'CHH',
  
  // ============ MEDIA / ENTERTAINMENT ============
  'DIS', 'NFLX', 'WBD', 'PARA', 'CMCSA', 'FOX', 'FOXA',
  'SPOT', 'LYV', 'MSGS', 'EDR', 'WWE',
  
  // ============ TELECOM ============
  'T', 'VZ', 'TMUS', 'LUMN',
  
  // ============ MATERIALS ============
  'NEM', 'FCX', 'GOLD', 'AEM', 'KGC',
  'CLF', 'X', 'NUE', 'STLD', 'AA',
  'DOW', 'LYB', 'CE', 'EMN', 'PPG', 'SHW', 'APD', 'LIN',
  
  // ============ REITS ============
  'O', 'SPG', 'AMT', 'PLD', 'EQIX', 'DLR', 'PSA', 'EXR', 'CUBE',
  'VTR', 'WELL', 'ARE', 'BXP', 'SLG', 'VNO', 'KIM', 'REG', 'FRT',
  
  // ============ UTILITIES ============
  'DUK', 'SO', 'D', 'AEP', 'XEL', 'WEC', 'ES', 'ED', 'EIX', 'PCG',
  
  // ============ CRYPTO/BLOCKCHAIN ============
  'MARA', 'RIOT', 'CLSK', 'HUT', 'BITF', 'MSTR',
  
  // ============ ETFs (for reference/liquidity) ============
  'SPY', 'QQQ', 'IWM', 'DIA', 'XLF', 'XLE', 'XLK', 'XLV', 'XLI', 'XLY',
  'XLP', 'XLU', 'XLB', 'XLRE', 'GLD', 'SLV', 'TLT', 'HYG', 'EEM', 'EFA',
  'ARKK', 'ARKW', 'ARKG', 'SOXL', 'TQQQ', 'SQQQ', 'UVXY', 'VXX',
  
  // ============ INTERNATIONAL ADRs ============
  'BABA', 'JD', 'PDD', 'BIDU', 'NTES', 'BILI', 'TME', 'IQ', 'VIPS',
  'SE', 'GRAB', 'MELI', 'GLOB', 'STNE', 'PAGS',
  
  // ============ CANNABIS (if legal in your state) ============
  'TLRY', 'CGC', 'ACB', 'SNDL', 'CRON',
];

const DEFAULT_CONFIG = {
  minPrice: 10,
  maxPrice: 100,
  minAvgVolume: 500000,
  minMarketCap: 1000000000,
  minIVRank: 20,
  maxIVRank: 85,
  aboveSMA200: false, // Relaxed - let's see more variety
  minRSI: 25,
  maxRSI: 75,
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

  // IV Rank Score (25 points) - Sweet spot 30-60%
  if (stock.ivRank !== null) {
    if (stock.ivRank >= 30 && stock.ivRank <= 60) score += weights.ivRank;
    else if (stock.ivRank >= 25 && stock.ivRank <= 70) score += weights.ivRank * 0.8;
    else if (stock.ivRank >= 20 && stock.ivRank <= 80) score += weights.ivRank * 0.6;
    else score += weights.ivRank * 0.3;
  } else {
    score += weights.ivRank * 0.5; // Partial credit if no IV data
  }

  // Liquidity Score (20 points)
  if (stock.avgVolume > 5000000) score += weights.liquidity;
  else if (stock.avgVolume > 2000000) score += weights.liquidity * 0.8;
  else if (stock.avgVolume > 1000000) score += weights.liquidity * 0.6;
  else if (stock.avgVolume > 500000) score += weights.liquidity * 0.4;
  else score += weights.liquidity * 0.2;

  // Technical Score (20 points)
  if (stock.aboveSMA200) score += weights.technical * 0.5;
  if (stock.rsi !== null) {
    if (stock.rsi >= 40 && stock.rsi <= 60) score += weights.technical * 0.5;
    else if (stock.rsi >= 35 && stock.rsi <= 65) score += weights.technical * 0.3;
    else if (stock.rsi >= 30 && stock.rsi <= 70) score += weights.technical * 0.2;
  }

  // Fundamental Score (20 points)
  if (stock.marketCap > 50000000000) score += weights.fundamental; // Large cap
  else if (stock.marketCap > 10000000000) score += weights.fundamental * 0.85;
  else if (stock.marketCap > 2000000000) score += weights.fundamental * 0.7;
  else score += weights.fundamental * 0.5;

  // Options Liquidity Score (15 points)
  if (stock.optionsVolume > 10000) score += weights.optionsLiquidity;
  else if (stock.optionsVolume > 5000) score += weights.optionsLiquidity * 0.8;
  else if (stock.optionsVolume > 1000) score += weights.optionsLiquidity * 0.6;
  else score += weights.optionsLiquidity * 0.4;

  return Math.round(score);
}

// Fetch IV rank and options volume from Unusual Whales
async function fetchUWData(ticker, UW_KEY) {
  const data = {
    ivRank: null,
    optionsVolume: null,
    putCallRatio: null
  };

  if (!UW_KEY) return data;

  const headers = {
    'Authorization': `Bearer ${UW_KEY}`,
    'Accept': 'application/json'
  };

  // Fetch IV Rank from /iv-rank endpoint
  try {
    const ivRes = await fetch(
      `https://api.unusualwhales.com/api/stock/${ticker}/iv-rank`,
      { headers }
    );
    
    if (ivRes.ok) {
      const ivData = await ivRes.json();
      
      // Response is { data: [{ iv_rank_1y: "0.65", ... }, ...] }
      // Get the most recent entry (first in array)
      if (Array.isArray(ivData.data) && ivData.data.length > 0) {
        const latest = ivData.data[0];
        const ivRankValue = latest.iv_rank_1y || latest.iv_rank || null;
        
        if (ivRankValue !== null) {
          // Convert from decimal to percentage (0.65 -> 65)
          const numVal = parseFloat(ivRankValue);
          data.ivRank = numVal <= 1 ? Math.round(numVal * 100) : Math.round(numVal);
        }
      }
    }
  } catch (e) {}

  // Fetch Options Volume from options-volume endpoint
  try {
    const volRes = await fetch(
      `https://api.unusualwhales.com/api/stock/${ticker}/options-volume`,
      { headers }
    );
    
    if (volRes.ok) {
      const volData = await volRes.json();
      
      let callVol = 0;
      let putVol = 0;
      
      // Handle array response (historical data)
      if (Array.isArray(volData.data) && volData.data.length > 0) {
        const latest = volData.data[0];
        callVol = parseInt(latest.call_volume) || 0;
        putVol = parseInt(latest.put_volume) || 0;
      } 
      // Handle object response
      else if (volData.data) {
        callVol = parseInt(volData.data.call_volume) || 0;
        putVol = parseInt(volData.data.put_volume) || 0;
      }
      
      const totalVol = callVol + putVol;
      data.optionsVolume = totalVol > 0 ? totalVol : null;
      
      // Calculate P/C ratio and format to 2 decimals
      if (callVol > 0 && putVol > 0) {
        data.putCallRatio = parseFloat((putVol / callVol).toFixed(2));
      }
    }
  } catch (e) {}

  return data;
}

// Fetch strike suggestion using UW greeks endpoint + pricing from option-contracts
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
    
    // Step 2: Get greeks for the first valid expiry
    const targetExpiry = validExpiries[0];
    
    await new Promise(r => setTimeout(r, 100));
    
    const greeksRes = await fetch(
      `https://api.unusualwhales.com/api/stock/${ticker}/greeks?expiry=${targetExpiry}`,
      { headers }
    );
    
    if (!greeksRes.ok) return null;
    
    const greeksData = await greeksRes.json();
    const strikes = greeksData.data || [];
    
    if (strikes.length === 0) return null;
    
    // Step 3: Find put with delta closest to target
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
        
        const iv = strike.put_volatility ? (parseFloat(strike.put_volatility) * 100).toFixed(1) : null;
        
        bestPut = {
          strike: parseFloat(strike.strike),
          expiration: strike.expiry,
          dte: dte,
          delta: (-putDelta).toFixed(2),
          iv: iv,
          symbol: strike.put_option_symbol,
          // Initialize pricing fields with defaults
          bid: null,
          ask: null,
          mid: null,
          lastPrice: null,
          volume: null,
          openInterest: null,
          premiumSource: null
        };
      }
    }
    
    // Step 4: Fetch pricing data from option-contracts endpoint
    if (bestPut && bestPut.symbol) {
      await new Promise(r => setTimeout(r, 100));
      
      try {
        const contractsRes = await fetch(
          `https://api.unusualwhales.com/api/stock/${ticker}/option-contracts`,
          { headers }
        );
        
        if (contractsRes.ok) {
          const contractsData = await contractsRes.json();
          const contracts = contractsData.data || contractsData || [];
          
          // Find matching contract - try multiple field names
          const matchingContract = contracts.find(c => 
            c.option_chain_id === bestPut.symbol ||
            c.option_symbol === bestPut.symbol ||
            c.symbol === bestPut.symbol
          );
          
          if (matchingContract) {
            // Parse bid/ask - try multiple field names
            const bid = parseFloat(matchingContract.nbbo_bid) || 
                        parseFloat(matchingContract.bid) || 0;
            const ask = parseFloat(matchingContract.nbbo_ask) || 
                        parseFloat(matchingContract.ask) || 0;
            const lastPrice = parseFloat(matchingContract.price) || 
                              parseFloat(matchingContract.last_price) || 0;
            
            // Calculate mid or use last price as fallback
            let premium = 0;
            let premiumSource = null;
            
            if (bid > 0 && ask > 0) {
              premium = (bid + ask) / 2;
              premiumSource = 'mid';
            } else if (lastPrice > 0) {
              premium = lastPrice;
              premiumSource = 'last';
            }
            
            bestPut.bid = bid > 0 ? bid : null;
            bestPut.ask = ask > 0 ? ask : null;
            bestPut.mid = premium > 0 ? parseFloat(premium.toFixed(2)) : null;
            bestPut.lastPrice = lastPrice > 0 ? lastPrice : null;
            bestPut.volume = parseInt(matchingContract.volume) || null;
            bestPut.openInterest = parseInt(matchingContract.open_interest) || 
                                   parseInt(matchingContract.openInterest) || null;
            bestPut.premiumSource = premiumSource;
            
            // Also grab IV from contract if we don't have it
            if (!bestPut.iv && matchingContract.implied_volatility) {
              bestPut.iv = (parseFloat(matchingContract.implied_volatility) * 100).toFixed(1);
            }
          } else {
            // Contract not found - try to find by strike + expiry + type
            const strikeStr = bestPut.strike.toString();
            const expStr = bestPut.expiration;
            
            const fallbackContract = contracts.find(c => {
              const cStrike = parseFloat(c.strike) || 0;
              const cExpiry = c.expiry || c.expiration;
              const cType = (c.option_type || c.type || '').toLowerCase();
              
              return Math.abs(cStrike - bestPut.strike) < 0.01 &&
                     cExpiry === expStr &&
                     cType === 'put';
            });
            
            if (fallbackContract) {
              const bid = parseFloat(fallbackContract.nbbo_bid) || 
                          parseFloat(fallbackContract.bid) || 0;
              const ask = parseFloat(fallbackContract.nbbo_ask) || 
                          parseFloat(fallbackContract.ask) || 0;
              const lastPrice = parseFloat(fallbackContract.price) || 
                                parseFloat(fallbackContract.last_price) || 0;
              
              let premium = 0;
              let premiumSource = null;
              
              if (bid > 0 && ask > 0) {
                premium = (bid + ask) / 2;
                premiumSource = 'mid';
              } else if (lastPrice > 0) {
                premium = lastPrice;
                premiumSource = 'last';
              }
              
              bestPut.bid = bid > 0 ? bid : null;
              bestPut.ask = ask > 0 ? ask : null;
              bestPut.mid = premium > 0 ? parseFloat(premium.toFixed(2)) : null;
              bestPut.lastPrice = lastPrice > 0 ? lastPrice : null;
              bestPut.volume = parseInt(fallbackContract.volume) || null;
              bestPut.openInterest = parseInt(fallbackContract.open_interest) || null;
              bestPut.premiumSource = premiumSource;
            }
          }
        }
      } catch (e) {
        // Pricing fetch failed, but we still have the strike suggestion
      }
    }
    
    return bestPut;
  } catch (e) {
    return null;
  }
}

async function fetchTickerData(ticker, POLYGON_KEY, UW_KEY, config) {
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
      return null;
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
    data.aboveSMA200 = data.sma200 ? data.price > data.sma200 : null;
  } catch (e) {
    data.sma200 = null;
    data.aboveSMA200 = null;
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

  // Fetch UW data (IV rank, options volume)
  const uwData = await fetchUWData(ticker, UW_KEY);
  data.ivRank = uwData.ivRank;
  data.optionsVolume = uwData.optionsVolume;
  data.putCallRatio = uwData.putCallRatio;

  // Fetch strike suggestion
  const suggestedStrike = await fetchStrikeSuggestion(ticker, UW_KEY, config);
  data.suggestedStrike = suggestedStrike;

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
  const batchSize = 10; // Process in batches

  // Shuffle universe for variety (optional - controlled by config)
  let universe = [...WHEEL_UNIVERSE];
  if (body.shuffle) {
    universe = universe.sort(() => Math.random() - 0.5);
  }

  for (let i = 0; i < universe.length; i++) {
    const ticker = universe[i];
    
    try {
      const data = await fetchTickerData(ticker, POLYGON_KEY, UW_KEY, config);
      
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
        skipped.push({ ticker, reason: `Volume below minimum` });
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

      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
      
    } catch (e) {
      skipped.push({ ticker, reason: e.message });
    }
  }

  // Sort by wheel score
  results.sort((a, b) => b.wheelScore - a.wheelScore);

  return Response.json({
    candidates: results,
    skipped,
    meta: {
      scanned: universe.length,
      found: results.length,
      filtered: skipped.length,
      timestamp: new Date().toISOString()
    }
  });
}

export async function GET() {
  return Response.json({
    status: 'ok',
    universe: WHEEL_UNIVERSE.length,
    hasPolygonKey: !!process.env.POLYGON_API_KEY,
    hasUWKey: !!process.env.UW_API_KEY,
    sectors: [
      'Tech Mega Cap', 'Semiconductors', 'Software/Cloud', 'Internet/Ecommerce',
      'EV/Auto', 'Banks', 'Financials', 'Insurance', 'Energy', 'Clean Energy',
      'Pharma', 'Biotech', 'Healthcare Services', 'Retail', 'Restaurants',
      'Consumer Staples', 'Aerospace/Defense', 'Machinery', 'Transport',
      'Airlines/Cruise/Travel', 'Media/Entertainment', 'Telecom', 'Materials',
      'REITs', 'Utilities', 'Crypto', 'ETFs', 'International ADRs', 'Cannabis'
    ]
  });
}

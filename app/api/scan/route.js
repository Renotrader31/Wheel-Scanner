// app/api/scan/route.js
// Wheel Strategy Scanner - With Sector Selection
// Prevents timeout by allowing targeted scans

// ============================================
// SECTOR-BASED UNIVERSE
// ============================================
const SECTORS = {
  tech_mega: {
    name: 'Tech Mega Cap',
    tickers: ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META', 'NVDA', 'AVGO', 'ORCL', 'CRM', 'ADBE']
  },
  
  semiconductors: {
    name: 'Semiconductors',
    tickers: ['AMD', 'INTC', 'TSM', 'QCOM', 'MU', 'AMAT', 'LRCX', 'KLAC', 'ADI', 'MRVL', 'ON', 'NXPI', 'TXN', 'MCHP', 'SWKS']
  },
  
  software: {
    name: 'Software/Cloud',
    tickers: ['NOW', 'SNOW', 'PLTR', 'DDOG', 'NET', 'ZS', 'CRWD', 'MDB', 'PANW', 'FTNT', 'WDAY', 'TEAM', 'ZM', 'OKTA', 'HUBS']
  },
  
  internet: {
    name: 'Internet/E-commerce',
    tickers: ['SHOP', 'UBER', 'LYFT', 'ABNB', 'DASH', 'PINS', 'SNAP', 'RBLX', 'U', 'ROKU', 'ETSY', 'EBAY', 'CHWY', 'BKNG', 'EXPE']
  },
  
  auto: {
    name: 'Auto/EV',
    tickers: ['TSLA', 'F', 'GM', 'RIVN', 'LCID', 'NIO', 'XPEV', 'LI', 'TM', 'HMC', 'STLA', 'RACE']
  },
  
  banks: {
    name: 'Banks',
    tickers: ['JPM', 'BAC', 'WFC', 'C', 'GS', 'MS', 'USB', 'PNC', 'TFC', 'FITB', 'CFG', 'KEY', 'HBAN', 'RF', 'ZION', 'CMA', 'ALLY', 'MTB']
  },
  
  fintech: {
    name: 'Fintech/Payments',
    tickers: ['SCHW', 'COF', 'AXP', 'DFS', 'SYF', 'PYPL', 'SQ', 'V', 'MA', 'AFRM', 'COIN', 'HOOD', 'SOFI', 'UPST', 'NU']
  },
  
  insurance: {
    name: 'Insurance',
    tickers: ['MET', 'PRU', 'AIG', 'ALL', 'TRV', 'PGR', 'AFL', 'CINF']
  },
  
  energy: {
    name: 'Oil & Gas',
    tickers: ['XOM', 'CVX', 'OXY', 'COP', 'EOG', 'SLB', 'HAL', 'BKR', 'DVN', 'MRO', 'APA', 'FANG', 'PXD', 'HES', 'MPC', 'VLO', 'PSX']
  },
  
  clean_energy: {
    name: 'Clean Energy',
    tickers: ['ENPH', 'SEDG', 'FSLR', 'RUN', 'PLUG', 'BE', 'NEE', 'AES']
  },
  
  pharma: {
    name: 'Pharma',
    tickers: ['JNJ', 'PFE', 'ABBV', 'MRK', 'LLY', 'BMY', 'GILD', 'AMGN', 'REGN', 'VRTX', 'BIIB', 'MRNA', 'BNTX', 'AZN', 'NVO', 'GSK']
  },
  
  biotech: {
    name: 'Biotech/MedTech',
    tickers: ['ISRG', 'DXCM', 'ALGN', 'HOLX', 'IDXX', 'IQV', 'ILMN']
  },
  
  healthcare: {
    name: 'Healthcare Services',
    tickers: ['UNH', 'CVS', 'CI', 'HUM', 'ELV', 'CNC', 'MOH', 'HCA', 'THC']
  },
  
  retail: {
    name: 'Retail',
    tickers: ['WMT', 'TGT', 'COST', 'HD', 'LOW', 'DG', 'DLTR', 'ROST', 'TJX', 'BBY', 'M', 'GPS', 'ANF', 'LULU', 'NKE', 'DECK', 'CROX']
  },
  
  restaurants: {
    name: 'Restaurants',
    tickers: ['MCD', 'SBUX', 'CMG', 'YUM', 'DPZ', 'WING', 'SHAK', 'CAVA', 'QSR', 'WEN', 'DRI', 'TXRH']
  },
  
  staples: {
    name: 'Consumer Staples',
    tickers: ['KO', 'PEP', 'MNST', 'KDP', 'STZ', 'TAP', 'PG', 'CL', 'KMB', 'CLX', 'PM', 'MO', 'BTI', 'GIS', 'HSY', 'MDLZ', 'KHC']
  },
  
  aerospace: {
    name: 'Aerospace/Defense',
    tickers: ['BA', 'RTX', 'LMT', 'NOC', 'GD', 'LHX', 'TDG', 'HWM', 'TXT']
  },
  
  industrials: {
    name: 'Industrials',
    tickers: ['CAT', 'DE', 'PCAR', 'CMI', 'GE', 'HON', 'MMM', 'EMR', 'ETN', 'UPS', 'FDX', 'CSX', 'UNP', 'NSC']
  },
  
  travel: {
    name: 'Airlines/Cruise/Travel',
    tickers: ['AAL', 'UAL', 'DAL', 'LUV', 'ALK', 'JBLU', 'CCL', 'RCL', 'NCLH', 'MAR', 'HLT']
  },
  
  media: {
    name: 'Media/Entertainment',
    tickers: ['DIS', 'NFLX', 'WBD', 'PARA', 'CMCSA', 'FOX', 'SPOT', 'LYV']
  },
  
  telecom: {
    name: 'Telecom',
    tickers: ['T', 'VZ', 'TMUS']
  },
  
  materials: {
    name: 'Materials/Mining',
    tickers: ['NEM', 'FCX', 'GOLD', 'CLF', 'X', 'NUE', 'STLD', 'AA', 'DOW', 'LYB', 'PPG', 'SHW', 'APD', 'LIN']
  },
  
  reits: {
    name: 'REITs',
    tickers: ['O', 'SPG', 'AMT', 'PLD', 'EQIX', 'DLR', 'PSA', 'EXR', 'WELL', 'ARE']
  },
  
  utilities: {
    name: 'Utilities',
    tickers: ['DUK', 'SO', 'D', 'AEP', 'XEL', 'WEC', 'ED', 'EIX', 'PCG']
  },
  
  crypto: {
    name: 'Crypto/Blockchain',
    tickers: ['MARA', 'RIOT', 'CLSK', 'MSTR', 'COIN']
  },
  
  etfs: {
    name: 'ETFs',
    tickers: ['SPY', 'QQQ', 'IWM', 'DIA', 'XLF', 'XLE', 'XLK', 'XLV', 'XLI', 'XLY', 'XLP', 'GLD', 'SLV', 'TLT', 'EEM']
  },
  
  china: {
    name: 'China/ADRs',
    tickers: ['BABA', 'JD', 'PDD', 'BIDU', 'NTES', 'BILI', 'SE', 'GRAB', 'MELI']
  },
  
  emerging_tech: {
    name: 'Quantum/AI',
    tickers: ['IONQ', 'RGTI', 'QBTS', 'QUBT', 'AI', 'BBAI', 'SOUN', 'UPST', 'PATH', 'S', 'ALIT']
  }
};

// ============================================
// PRESETS - Quick selection bundles
// ============================================
const PRESETS = {
  quick: {
    name: 'Quick Scan (~2 min)',
    description: 'Top 50 most liquid wheel candidates',
    sectors: ['banks', 'tech_mega', 'auto', 'energy', 'pharma']
  },
  
  premium_hunters: {
    name: 'Premium Hunters (~2.5 min)',
    description: 'High IV sectors for juicy premiums',
    sectors: ['crypto', 'china', 'auto', 'clean_energy', 'travel', 'emerging_tech']
  },
  
  conservative: {
    name: 'Conservative (~2 min)',
    description: 'Stable dividend payers',
    sectors: ['banks', 'staples', 'utilities', 'insurance', 'telecom']
  },
  
  growth: {
    name: 'Growth (~3 min)',
    description: 'Tech and high-growth names',
    sectors: ['tech_mega', 'semiconductors', 'software', 'internet', 'fintech']
  },
  
  value: {
    name: 'Value (~2.5 min)',
    description: 'Traditional value sectors',
    sectors: ['banks', 'energy', 'industrials', 'materials', 'aerospace']
  },
  
  income: {
    name: 'Income (~2 min)',
    description: 'REITs, utilities, and dividend stocks',
    sectors: ['reits', 'utilities', 'staples', 'telecom', 'insurance']
  },
  
  all: {
    name: 'Full Scan (~8-10 min)',
    description: 'All 340+ tickers - may timeout!',
    sectors: Object.keys(SECTORS)
  }
};

// ============================================
// DEFAULT CONFIG
// ============================================
const DEFAULT_CONFIG = {
  minPrice: 10,
  maxPrice: 100,
  minAvgVolume: 500000,
  minMarketCap: 1000000000,
  minIVRank: 20,
  maxIVRank: 85,
  aboveSMA200: false,
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

// ============================================
// SCORING LOGIC
// ============================================
function calculateWheelScore(stock, config) {
  const { weights } = config;
  let score = 0;

  if (stock.ivRank !== null) {
    if (stock.ivRank >= 30 && stock.ivRank <= 60) score += weights.ivRank;
    else if (stock.ivRank >= 25 && stock.ivRank <= 70) score += weights.ivRank * 0.8;
    else if (stock.ivRank >= 20 && stock.ivRank <= 80) score += weights.ivRank * 0.6;
    else score += weights.ivRank * 0.3;
  } else {
    score += weights.ivRank * 0.5;
  }

  if (stock.avgVolume > 5000000) score += weights.liquidity;
  else if (stock.avgVolume > 2000000) score += weights.liquidity * 0.8;
  else if (stock.avgVolume > 1000000) score += weights.liquidity * 0.6;
  else if (stock.avgVolume > 500000) score += weights.liquidity * 0.4;
  else score += weights.liquidity * 0.2;

  if (stock.aboveSMA200) score += weights.technical * 0.5;
  if (stock.rsi !== null) {
    if (stock.rsi >= 40 && stock.rsi <= 60) score += weights.technical * 0.5;
    else if (stock.rsi >= 35 && stock.rsi <= 65) score += weights.technical * 0.3;
    else if (stock.rsi >= 30 && stock.rsi <= 70) score += weights.technical * 0.2;
  }

  if (stock.marketCap > 50000000000) score += weights.fundamental;
  else if (stock.marketCap > 10000000000) score += weights.fundamental * 0.85;
  else if (stock.marketCap > 2000000000) score += weights.fundamental * 0.7;
  else score += weights.fundamental * 0.5;

  if (stock.optionsVolume > 10000) score += weights.optionsLiquidity;
  else if (stock.optionsVolume > 5000) score += weights.optionsLiquidity * 0.8;
  else if (stock.optionsVolume > 1000) score += weights.optionsLiquidity * 0.6;
  else score += weights.optionsLiquidity * 0.4;

  return Math.round(score);
}

// ============================================
// UW DATA FETCHING
// ============================================
async function fetchUWData(ticker, UW_KEY) {
  const data = { ivRank: null, optionsVolume: null, putCallRatio: null };
  if (!UW_KEY) return data;

  const headers = { 'Authorization': `Bearer ${UW_KEY}`, 'Accept': 'application/json' };

  try {
    const ivRes = await fetch(`https://api.unusualwhales.com/api/stock/${ticker}/iv-rank`, { headers });
    if (ivRes.ok) {
      const ivData = await ivRes.json();
      if (Array.isArray(ivData.data) && ivData.data.length > 0) {
        const latest = ivData.data[0];
        const ivRankValue = latest.iv_rank_1y || latest.iv_rank || null;
        if (ivRankValue !== null) {
          const numVal = parseFloat(ivRankValue);
          data.ivRank = numVal <= 1 ? Math.round(numVal * 100) : Math.round(numVal);
        }
      }
    }
  } catch (e) {}

  try {
    const volRes = await fetch(`https://api.unusualwhales.com/api/stock/${ticker}/options-volume`, { headers });
    if (volRes.ok) {
      const volData = await volRes.json();
      let callVol = 0, putVol = 0;
      if (Array.isArray(volData.data) && volData.data.length > 0) {
        const latest = volData.data[0];
        callVol = parseInt(latest.call_volume) || 0;
        putVol = parseInt(latest.put_volume) || 0;
      } else if (volData.data) {
        callVol = parseInt(volData.data.call_volume) || 0;
        putVol = parseInt(volData.data.put_volume) || 0;
      }
      const totalVol = callVol + putVol;
      data.optionsVolume = totalVol > 0 ? totalVol : null;
      if (callVol > 0 && putVol > 0) {
        data.putCallRatio = parseFloat((putVol / callVol).toFixed(2));
      }
    }
  } catch (e) {}

  return data;
}

// ============================================
// STRIKE SUGGESTION
// ============================================
async function fetchStrikeSuggestion(ticker, UW_KEY, config) {
  if (!UW_KEY) return null;
  
  const targetDelta = config.targetDelta || 0.30;
  const minDTE = config.minDTE || 20;
  const maxDTE = config.maxDTE || 45;
  const today = new Date();
  const headers = { 'Authorization': `Bearer ${UW_KEY}`, 'Accept': 'application/json' };

  try {
    const chainsRes = await fetch(`https://api.unusualwhales.com/api/stock/${ticker}/option-chains`, { headers });
    if (!chainsRes.ok) return null;
    
    const chainsData = await chainsRes.json();
    const symbols = chainsData.data || chainsData || [];
    if (symbols.length === 0) return null;
    
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
    
    const validExpiries = Array.from(expirySet).filter(exp => {
      const expDate = new Date(exp);
      const dte = Math.ceil((expDate - today) / (1000 * 60 * 60 * 24));
      return dte >= minDTE && dte <= maxDTE;
    }).sort();
    
    if (validExpiries.length === 0) return null;
    
    const targetExpiry = validExpiries[0];
    await new Promise(r => setTimeout(r, 50));
    
    const greeksRes = await fetch(`https://api.unusualwhales.com/api/stock/${ticker}/greeks?expiry=${targetExpiry}`, { headers });
    if (!greeksRes.ok) return null;
    
    const greeksData = await greeksRes.json();
    const strikes = greeksData.data || [];
    if (strikes.length === 0) return null;
    
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
          bid: null, ask: null, mid: null, lastPrice: null,
          volume: null, openInterest: null, premiumSource: null
        };
      }
    }
    
    // Fetch pricing
    if (bestPut && bestPut.symbol) {
      await new Promise(r => setTimeout(r, 50));
      try {
        const contractsRes = await fetch(`https://api.unusualwhales.com/api/stock/${ticker}/option-contracts`, { headers });
        if (contractsRes.ok) {
          const contractsData = await contractsRes.json();
          const contracts = contractsData.data || contractsData || [];
          
          const matchingContract = contracts.find(c => 
            c.option_chain_id === bestPut.symbol || c.option_symbol === bestPut.symbol || c.symbol === bestPut.symbol
          );
          
          if (matchingContract) {
            const bid = parseFloat(matchingContract.nbbo_bid) || parseFloat(matchingContract.bid) || 0;
            const ask = parseFloat(matchingContract.nbbo_ask) || parseFloat(matchingContract.ask) || 0;
            const lastPrice = parseFloat(matchingContract.price) || parseFloat(matchingContract.last_price) || 0;
            
            let premium = 0, premiumSource = null;
            if (bid > 0 && ask > 0) { premium = (bid + ask) / 2; premiumSource = 'mid'; }
            else if (lastPrice > 0) { premium = lastPrice; premiumSource = 'last'; }
            
            bestPut.bid = bid > 0 ? bid : null;
            bestPut.ask = ask > 0 ? ask : null;
            bestPut.mid = premium > 0 ? parseFloat(premium.toFixed(2)) : null;
            bestPut.lastPrice = lastPrice > 0 ? lastPrice : null;
            bestPut.volume = parseInt(matchingContract.volume) || null;
            bestPut.openInterest = parseInt(matchingContract.open_interest) || parseInt(matchingContract.openInterest) || null;
            bestPut.premiumSource = premiumSource;
            if (!bestPut.iv && matchingContract.implied_volatility) {
              bestPut.iv = (parseFloat(matchingContract.implied_volatility) * 100).toFixed(1);
            }
          } else {
            // Fallback match by strike/expiry/type
            const fallback = contracts.find(c => {
              const cStrike = parseFloat(c.strike) || 0;
              const cExpiry = c.expiry || c.expiration;
              const cType = (c.option_type || c.type || '').toLowerCase();
              return Math.abs(cStrike - bestPut.strike) < 0.01 && cExpiry === bestPut.expiration && cType === 'put';
            });
            
            if (fallback) {
              const bid = parseFloat(fallback.nbbo_bid) || parseFloat(fallback.bid) || 0;
              const ask = parseFloat(fallback.nbbo_ask) || parseFloat(fallback.ask) || 0;
              const lastPrice = parseFloat(fallback.price) || parseFloat(fallback.last_price) || 0;
              let premium = 0, premiumSource = null;
              if (bid > 0 && ask > 0) { premium = (bid + ask) / 2; premiumSource = 'mid'; }
              else if (lastPrice > 0) { premium = lastPrice; premiumSource = 'last'; }
              bestPut.bid = bid > 0 ? bid : null;
              bestPut.ask = ask > 0 ? ask : null;
              bestPut.mid = premium > 0 ? parseFloat(premium.toFixed(2)) : null;
              bestPut.lastPrice = lastPrice > 0 ? lastPrice : null;
              bestPut.volume = parseInt(fallback.volume) || null;
              bestPut.openInterest = parseInt(fallback.open_interest) || null;
              bestPut.premiumSource = premiumSource;
            }
          }
        }
      } catch (e) {}
    }
    
    return bestPut;
  } catch (e) {
    return null;
  }
}

// ============================================
// FETCH TICKER DATA
// ============================================
async function fetchTickerData(ticker, POLYGON_KEY, UW_KEY, config) {
  const data = { ticker };
  
  try {
    const quoteRes = await fetch(`https://api.polygon.io/v2/aggs/ticker/${ticker}/prev?apiKey=${POLYGON_KEY}`);
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

  try {
    const detailsRes = await fetch(`https://api.polygon.io/v3/reference/tickers/${ticker}?apiKey=${POLYGON_KEY}`);
    const detailsData = await detailsRes.json();
    if (detailsData.results) {
      data.marketCap = detailsData.results.market_cap || 0;
      data.name = detailsData.results.name;
      data.sector = detailsData.results.sic_description || 'Unknown';
    }
  } catch (e) {
    data.marketCap = 0;
  }

  try {
    const smaRes = await fetch(`https://api.polygon.io/v1/indicators/sma/${ticker}?timespan=day&adjusted=true&window=200&series_type=close&limit=1&apiKey=${POLYGON_KEY}`);
    const smaData = await smaRes.json();
    data.sma200 = smaData.results?.values?.[0]?.value || null;
    data.aboveSMA200 = data.sma200 ? data.price > data.sma200 : null;
  } catch (e) {
    data.sma200 = null;
    data.aboveSMA200 = null;
  }

  try {
    const rsiRes = await fetch(`https://api.polygon.io/v1/indicators/rsi/${ticker}?timespan=day&adjusted=true&window=14&series_type=close&limit=1&apiKey=${POLYGON_KEY}`);
    const rsiData = await rsiRes.json();
    data.rsi = rsiData.results?.values?.[0]?.value ? Math.round(rsiData.results.values[0].value) : null;
  } catch (e) {
    data.rsi = null;
  }

  const uwData = await fetchUWData(ticker, UW_KEY);
  data.ivRank = uwData.ivRank;
  data.optionsVolume = uwData.optionsVolume;
  data.putCallRatio = uwData.putCallRatio;

  const suggestedStrike = await fetchStrikeSuggestion(ticker, UW_KEY, config);
  data.suggestedStrike = suggestedStrike;

  return data;
}

// ============================================
// MAIN POST HANDLER
// ============================================
export async function POST(request) {
  const body = await request.json();
  const config = { ...DEFAULT_CONFIG, ...body.config };
  
  const POLYGON_KEY = process.env.POLYGON_API_KEY;
  const UW_KEY = process.env.UW_API_KEY;
  
  if (!POLYGON_KEY) {
    return Response.json({ error: 'Polygon API key not configured' }, { status: 500 });
  }

  // Build universe from sectors or preset
  let universe = [];
  let selectedSectors = [];
  
  if (body.preset && PRESETS[body.preset]) {
    selectedSectors = PRESETS[body.preset].sectors;
    for (const sectorKey of selectedSectors) {
      if (SECTORS[sectorKey]) universe.push(...SECTORS[sectorKey].tickers);
    }
  } else if (body.sectors && Array.isArray(body.sectors)) {
    selectedSectors = body.sectors;
    for (const sectorKey of body.sectors) {
      if (SECTORS[sectorKey]) universe.push(...SECTORS[sectorKey].tickers);
    }
  } else {
    // Default to 'quick' preset
    selectedSectors = PRESETS.quick.sectors;
    for (const sectorKey of PRESETS.quick.sectors) {
      if (SECTORS[sectorKey]) universe.push(...SECTORS[sectorKey].tickers);
    }
  }

  universe = [...new Set(universe)]; // Remove duplicates
  
  if (body.shuffle) {
    universe = universe.sort(() => Math.random() - 0.5);
  }

  const results = [];
  const skipped = [];

  for (let i = 0; i < universe.length; i++) {
    const ticker = universe[i];
    
    try {
      const data = await fetchTickerData(ticker, POLYGON_KEY, UW_KEY, config);
      
      if (!data) {
        skipped.push({ ticker, reason: 'No quote data' });
        continue;
      }

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

      data.wheelScore = calculateWheelScore(data, config);
      results.push(data);

      await new Promise(resolve => setTimeout(resolve, 50));
      
    } catch (e) {
      skipped.push({ ticker, reason: e.message });
    }
  }

  results.sort((a, b) => b.wheelScore - a.wheelScore);

  return Response.json({
    candidates: results,
    skipped,
    meta: {
      scanned: universe.length,
      found: results.length,
      filtered: skipped.length,
      timestamp: new Date().toISOString(),
      sectors: selectedSectors.map(s => SECTORS[s]?.name || s),
      preset: body.preset || null
    }
  });
}

// ============================================
// GET - Returns available sectors and presets
// ============================================
export async function GET() {
  const sectorList = Object.entries(SECTORS).map(([key, val]) => ({
    id: key,
    name: val.name,
    count: val.tickers.length
  }));
  
  const presetList = Object.entries(PRESETS).map(([key, val]) => ({
    id: key,
    name: val.name,
    description: val.description,
    sectorCount: val.sectors.length,
    tickerCount: val.sectors.reduce((sum, s) => sum + (SECTORS[s]?.tickers.length || 0), 0)
  }));

  return Response.json({
    status: 'ok',
    totalTickers: Object.values(SECTORS).reduce((sum, s) => sum + s.tickers.length, 0),
    sectors: sectorList,
    presets: presetList,
    hasPolygonKey: !!process.env.POLYGON_API_KEY,
    hasUWKey: !!process.env.UW_API_KEY
  });
}

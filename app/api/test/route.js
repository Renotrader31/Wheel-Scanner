// app/api/test/route.js
// Tests a single ticker against Polygon + UW APIs

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const ticker = searchParams.get('ticker') || 'AAPL';
  
  const POLYGON_KEY = process.env.POLYGON_API_KEY;
  const UW_KEY = process.env.UW_API_KEY;
  
  const results = {
    ticker,
    polygon: {},
    uw: {},
    errors: []
  };

  // Test Polygon Quote
  try {
    const quoteRes = await fetch(
      `https://api.polygon.io/v2/aggs/ticker/${ticker}/prev?apiKey=${POLYGON_KEY}`
    );
    const quoteData = await quoteRes.json();
    
    if (quoteData.results?.[0]) {
      results.polygon.quote = {
        success: true,
        close: quoteData.results[0].c,
        open: quoteData.results[0].o,
        high: quoteData.results[0].h,
        low: quoteData.results[0].l,
        volume: quoteData.results[0].v
      };
    } else {
      results.polygon.quote = { success: false, error: quoteData.error || 'No data' };
    }
  } catch (e) {
    results.polygon.quote = { success: false, error: e.message };
    results.errors.push(`Polygon Quote: ${e.message}`);
  }

  // Test Polygon Details
  try {
    const detailsRes = await fetch(
      `https://api.polygon.io/v3/reference/tickers/${ticker}?apiKey=${POLYGON_KEY}`
    );
    const detailsData = await detailsRes.json();
    
    if (detailsData.results) {
      results.polygon.details = {
        success: true,
        name: detailsData.results.name,
        marketCap: detailsData.results.market_cap,
        sector: detailsData.results.sic_description
      };
    } else {
      results.polygon.details = { success: false, error: detailsData.error || 'No data' };
    }
  } catch (e) {
    results.polygon.details = { success: false, error: e.message };
  }

  // Test Polygon SMA
  try {
    const smaRes = await fetch(
      `https://api.polygon.io/v1/indicators/sma/${ticker}?timespan=day&adjusted=true&window=200&series_type=close&limit=1&apiKey=${POLYGON_KEY}`
    );
    const smaData = await smaRes.json();
    
    const smaValue = smaData.results?.values?.[0]?.value;
    results.polygon.sma200 = smaValue 
      ? { success: true, value: smaValue }
      : { success: false, error: 'No SMA data' };
  } catch (e) {
    results.polygon.sma200 = { success: false, error: e.message };
  }

  // Test Polygon RSI
  try {
    const rsiRes = await fetch(
      `https://api.polygon.io/v1/indicators/rsi/${ticker}?timespan=day&adjusted=true&window=14&series_type=close&limit=1&apiKey=${POLYGON_KEY}`
    );
    const rsiData = await rsiRes.json();
    
    const rsiValue = rsiData.results?.values?.[0]?.value;
    results.polygon.rsi = rsiValue 
      ? { success: true, value: rsiValue }
      : { success: false, error: 'No RSI data' };
  } catch (e) {
    results.polygon.rsi = { success: false, error: e.message };
  }

  // Test Unusual Whales (if key provided)
  if (UW_KEY) {
    // Try stock endpoint
    try {
      const uwRes = await fetch(
        `https://api.unusualwhales.com/api/stock/${ticker}`,
        {
          headers: {
            'Authorization': `Bearer ${UW_KEY}`,
            'Accept': 'application/json'
          }
        }
      );
      
      if (uwRes.ok) {
        const uwData = await uwRes.json();
        results.uw.stock = { success: true, data: uwData };
      } else {
        results.uw.stock = { success: false, status: uwRes.status, error: await uwRes.text() };
      }
    } catch (e) {
      results.uw.stock = { success: false, error: e.message };
    }

    // Try IV rank endpoint
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
        results.uw.ivRank = { success: true, data: ivData };
      } else {
        results.uw.ivRank = { success: false, status: ivRes.status };
      }
    } catch (e) {
      results.uw.ivRank = { success: false, error: e.message };
    }

    // Try options volume endpoint
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
        results.uw.optionsVolume = { success: true, data: volData };
      } else {
        results.uw.optionsVolume = { success: false, status: volRes.status };
      }
    } catch (e) {
      results.uw.optionsVolume = { success: false, error: e.message };
    }
  } else {
    results.uw = { error: 'No UW API key configured' };
  }

  return Response.json(results);
}

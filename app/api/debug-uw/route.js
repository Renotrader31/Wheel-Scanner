// app/api/debug-uw/route.js
// Debug endpoint to find correct UW options chain endpoint

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const ticker = searchParams.get('ticker') || 'GM';
  
  const UW_KEY = process.env.UW_API_KEY;
  
  if (!UW_KEY) {
    return Response.json({ error: 'No UW API key' }, { status: 500 });
  }

  const headers = {
    'Authorization': `Bearer ${UW_KEY}`,
    'Accept': 'application/json'
  };

  // List of potential endpoints to try
  const endpoints = [
    `/api/stock/${ticker}/greeks`,
    `/api/stock/${ticker}/greeks-by-strike`,
    `/api/stock/${ticker}/greeks/expiry`,
    `/api/stock/${ticker}/option-chains`,
    `/api/stock/${ticker}/options/chain`,
    `/api/stock/${ticker}/options/greeks`,
    `/api/stock/${ticker}/option-contract-greeks`,
    `/api/stock/${ticker}/contracts`,
    `/api/stock/${ticker}/expirations`,
    `/api/stock/${ticker}/option-contracts`,
    `/api/stock/${ticker}/options`,
    `/api/options/${ticker}/chain`,
    `/api/options/${ticker}/greeks`,
    `/api/options/chain/${ticker}`,
    `/api/stock/${ticker}/chain`,
  ];

  const results = {};

  for (const endpoint of endpoints) {
    try {
      const res = await fetch(`https://api.unusualwhales.com${endpoint}`, { headers });
      const status = res.status;
      
      let data = null;
      let sample = null;
      
      if (res.ok) {
        data = await res.json();
        // Get a sample of the data
        if (data.data && Array.isArray(data.data)) {
          sample = data.data.slice(0, 2);
        } else if (Array.isArray(data)) {
          sample = data.slice(0, 2);
        } else {
          sample = data;
        }
      } else {
        try {
          data = await res.json();
        } catch {
          data = await res.text();
        }
      }

      results[endpoint] = {
        status,
        ok: res.ok,
        sample: sample,
        error: !res.ok ? data : null
      };
    } catch (e) {
      results[endpoint] = {
        status: 'error',
        error: e.message
      };
    }
    
    // Small delay between requests
    await new Promise(r => setTimeout(r, 100));
  }

  return Response.json({
    ticker,
    results
  });
}

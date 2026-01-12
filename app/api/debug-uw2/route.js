// app/api/debug-uw2/route.js
// Targeted debug to find greeks endpoint with parameters

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

  const results = {};

  // Calculate expiry dates in our DTE range (20-45 days)
  const today = new Date();
  const exp30 = new Date(today);
  exp30.setDate(exp30.getDate() + 30);
  const expStr = exp30.toISOString().split('T')[0];

  // Try greeks with expiry parameter
  const greeksEndpoints = [
    `/api/stock/${ticker}/greeks?expiry=${expStr}`,
    `/api/stock/${ticker}/greeks/expiry/${expStr}`,
    `/api/stock/${ticker}/greeks/${expStr}`,
    `/api/stock/${ticker}/option-greeks?expiry=${expStr}`,
    `/api/stock/${ticker}/greeks-by-expiry?expiry=${expStr}`,
    `/api/stock/${ticker}/greeks-by-strike?expiry=${expStr}`,
  ];

  for (const endpoint of greeksEndpoints) {
    try {
      const res = await fetch(`https://api.unusualwhales.com${endpoint}`, { headers });
      const data = await res.json();
      
      results[endpoint] = {
        status: res.status,
        ok: res.ok,
        hasData: !!(data.data && data.data.length > 0),
        count: data.data?.length || 0,
        sample: data.data?.slice(0, 2) || data
      };
    } catch (e) {
      results[endpoint] = { error: e.message };
    }
    await new Promise(r => setTimeout(r, 100));
  }

  // Also get the expirations list first
  try {
    const expRes = await fetch(`https://api.unusualwhales.com/api/stock/${ticker}/option-expirations`, { headers });
    const expData = await expRes.json();
    results['expirations'] = {
      status: expRes.status,
      data: expData.data?.slice(0, 5) || expData
    };
  } catch (e) {
    results['expirations'] = { error: e.message };
  }

  // Try getting a specific option contract's greeks
  // First get an option symbol from the chains
  try {
    const chainsRes = await fetch(`https://api.unusualwhales.com/api/stock/${ticker}/option-chains`, { headers });
    const chainsData = await chainsRes.json();
    const symbols = chainsData.data || chainsData || [];
    
    // Find a put option symbol (contains 'P')
    const putSymbol = symbols.find(s => s.includes('P') && s.includes('260'));
    
    if (putSymbol) {
      results['sample_put_symbol'] = putSymbol;
      
      // Try to get greeks for this specific contract
      const contractEndpoints = [
        `/api/option-contract/${putSymbol}`,
        `/api/option-contract/${putSymbol}/greeks`,
        `/api/options/contract/${putSymbol}`,
        `/api/stock/${ticker}/option/${putSymbol}`,
      ];
      
      for (const endpoint of contractEndpoints) {
        try {
          const res = await fetch(`https://api.unusualwhales.com${endpoint}`, { headers });
          const data = await res.json();
          results[endpoint] = {
            status: res.status,
            ok: res.ok,
            sample: data.data || data
          };
        } catch (e) {
          results[endpoint] = { error: e.message };
        }
        await new Promise(r => setTimeout(r, 100));
      }
    }
  } catch (e) {
    results['chains_error'] = e.message;
  }

  return Response.json({
    ticker,
    targetExpiry: expStr,
    results
  });
}

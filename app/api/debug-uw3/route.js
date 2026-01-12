// app/api/debug-uw3/route.js
// Test greeks with valid expiration dates extracted from option-chains

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

  // Step 1: Get option chains to find valid expiration dates
  let validExpiries = [];
  let putSymbols = [];
  
  try {
    const chainsRes = await fetch(`https://api.unusualwhales.com/api/stock/${ticker}/option-chains`, { headers });
    const chainsData = await chainsRes.json();
    const symbols = chainsData.data || chainsData || [];
    
    // Extract unique expiration dates from symbols
    // Format: GM260116P00073000 -> 260116 -> 2026-01-16
    const expirySet = new Set();
    symbols.forEach(sym => {
      const match = sym.match(/[A-Z]+(\d{6})[CP]/);
      if (match) {
        const dateStr = match[1]; // e.g., "260116"
        const year = '20' + dateStr.substring(0, 2);
        const month = dateStr.substring(2, 4);
        const day = dateStr.substring(4, 6);
        expirySet.add(`${year}-${month}-${day}`);
      }
      if (sym.includes('P')) {
        putSymbols.push(sym);
      }
    });
    
    validExpiries = Array.from(expirySet).sort();
    results['valid_expiries'] = validExpiries.slice(0, 10);
    results['sample_puts'] = putSymbols.slice(0, 5);
  } catch (e) {
    results['chains_error'] = e.message;
  }

  // Step 2: Try greeks endpoint with valid expiry dates
  // Find expiries 20-45 days out
  const today = new Date();
  const targetExpiries = validExpiries.filter(exp => {
    const expDate = new Date(exp);
    const dte = Math.ceil((expDate - today) / (1000 * 60 * 60 * 24));
    return dte >= 20 && dte <= 60;
  }).slice(0, 3);

  results['target_expiries'] = targetExpiries;

  for (const expiry of targetExpiries) {
    const endpoint = `/api/stock/${ticker}/greeks?expiry=${expiry}`;
    try {
      const res = await fetch(`https://api.unusualwhales.com${endpoint}`, { headers });
      const data = await res.json();
      
      results[`greeks_${expiry}`] = {
        status: res.status,
        ok: res.ok,
        count: data.data?.length || 0,
        sample: data.data?.slice(0, 3) || data
      };
    } catch (e) {
      results[`greeks_${expiry}`] = { error: e.message };
    }
    await new Promise(r => setTimeout(r, 150));
  }

  // Step 3: Try individual option contract endpoint
  // Find a put in our target range
  const targetPut = putSymbols.find(sym => {
    const match = sym.match(/[A-Z]+(\d{6})P/);
    if (match) {
      const dateStr = match[1];
      const year = '20' + dateStr.substring(0, 2);
      const month = dateStr.substring(2, 4);
      const day = dateStr.substring(4, 6);
      const expDate = new Date(`${year}-${month}-${day}`);
      const dte = Math.ceil((expDate - today) / (1000 * 60 * 60 * 24));
      return dte >= 20 && dte <= 60;
    }
    return false;
  });

  if (targetPut) {
    results['target_put'] = targetPut;
    
    // Try different endpoints for individual contract
    const contractEndpoints = [
      `/api/option-contract/${targetPut}`,
      `/api/option-contracts/${targetPut}`,
      `/api/stock/${ticker}/option-contract/${targetPut}`,
    ];
    
    for (const endpoint of contractEndpoints) {
      try {
        const res = await fetch(`https://api.unusualwhales.com${endpoint}`, { headers });
        const text = await res.text();
        let data;
        try {
          data = JSON.parse(text);
        } catch {
          data = text.substring(0, 200);
        }
        
        results[endpoint] = {
          status: res.status,
          ok: res.ok,
          data: data.data || data
        };
      } catch (e) {
        results[endpoint] = { error: e.message };
      }
      await new Promise(r => setTimeout(r, 150));
    }
  }

  return Response.json({
    ticker,
    results
  });
}

// app/api/debug-uw-data/route.js
// Debug endpoint to inspect what UW API returns for a ticker

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const ticker = searchParams.get('ticker') || 'SBUX';
  
  const UW_KEY = process.env.UW_API_KEY;
  
  if (!UW_KEY) {
    return Response.json({ error: 'No UW API key configured' }, { status: 500 });
  }

  const headers = {
    'Authorization': `Bearer ${UW_KEY}`,
    'Accept': 'application/json'
  };

  const results = {
    ticker,
    timestamp: new Date().toISOString()
  };

  // Test IV Rank / Volatility endpoint
  try {
    const ivRes = await fetch(
      `https://api.unusualwhales.com/api/stock/${ticker}/volatility/term-structure`,
      { headers }
    );
    results.volatility = {
      status: ivRes.status,
      ok: ivRes.ok,
      data: ivRes.ok ? await ivRes.json() : null
    };
  } catch (e) {
    results.volatility = { error: e.message };
  }

  await new Promise(r => setTimeout(r, 100));

  // Test Options Volume endpoint
  try {
    const volRes = await fetch(
      `https://api.unusualwhales.com/api/stock/${ticker}/options-volume`,
      { headers }
    );
    results.optionsVolume = {
      status: volRes.status,
      ok: volRes.ok,
      data: volRes.ok ? await volRes.json() : null
    };
  } catch (e) {
    results.optionsVolume = { error: e.message };
  }

  await new Promise(r => setTimeout(r, 100));

  // Test Option Contracts endpoint (for pricing)
  try {
    const contractsRes = await fetch(
      `https://api.unusualwhales.com/api/stock/${ticker}/option-contracts`,
      { headers }
    );
    const contractsData = contractsRes.ok ? await contractsRes.json() : null;
    
    // Get first few PUT contracts as sample
    let samplePuts = [];
    let allFieldNames = new Set();
    
    if (contractsData?.data) {
      // Collect all field names
      if (contractsData.data.length > 0) {
        Object.keys(contractsData.data[0]).forEach(k => allFieldNames.add(k));
      }
      
      samplePuts = contractsData.data
        .filter(c => {
          // Check for put in various field names
          const sym = c.option_chain_id || c.option_symbol || c.symbol || '';
          const type = (c.option_type || c.type || '').toLowerCase();
          return sym.includes('P') || type === 'put';
        })
        .slice(0, 3)
        .map(c => ({
          // Include all pricing-related fields
          option_chain_id: c.option_chain_id,
          option_symbol: c.option_symbol,
          symbol: c.symbol,
          strike: c.strike,
          expiry: c.expiry || c.expiration,
          option_type: c.option_type || c.type,
          nbbo_bid: c.nbbo_bid,
          nbbo_ask: c.nbbo_ask,
          bid: c.bid,
          ask: c.ask,
          price: c.price,
          last_price: c.last_price,
          volume: c.volume,
          open_interest: c.open_interest,
          implied_volatility: c.implied_volatility
        }));
    }
    
    results.optionContracts = {
      status: contractsRes.status,
      ok: contractsRes.ok,
      totalContracts: contractsData?.data?.length || 0,
      fieldNames: Array.from(allFieldNames),
      samplePuts: samplePuts
    };
  } catch (e) {
    results.optionContracts = { error: e.message };
  }

  await new Promise(r => setTimeout(r, 100));

  // Test Greeks endpoint with a valid expiry
  try {
    // First get option-chains to find a valid expiry
    const chainsRes = await fetch(
      `https://api.unusualwhales.com/api/stock/${ticker}/option-chains`,
      { headers }
    );
    
    if (chainsRes.ok) {
      const chainsData = await chainsRes.json();
      const symbols = chainsData.data || chainsData || [];
      
      // Extract first valid expiry in 20-45 DTE range
      const today = new Date();
      let validExpiry = null;
      
      for (const sym of symbols) {
        const match = sym.match(/[A-Z]+(\d{6})[CP]/);
        if (match) {
          const dateStr = match[1];
          const year = '20' + dateStr.substring(0, 2);
          const month = dateStr.substring(2, 4);
          const day = dateStr.substring(4, 6);
          const expDate = new Date(`${year}-${month}-${day}`);
          const dte = Math.ceil((expDate - today) / (1000 * 60 * 60 * 24));
          
          if (dte >= 20 && dte <= 45) {
            validExpiry = `${year}-${month}-${day}`;
            break;
          }
        }
      }
      
      if (validExpiry) {
        await new Promise(r => setTimeout(r, 100));
        
        const greeksRes = await fetch(
          `https://api.unusualwhales.com/api/stock/${ticker}/greeks?expiry=${validExpiry}`,
          { headers }
        );
        
        const greeksData = greeksRes.ok ? await greeksRes.json() : null;
        
        // Get sample strikes around 0.30 delta
        let sampleStrikes = [];
        if (greeksData?.data) {
          sampleStrikes = greeksData.data
            .filter(s => {
              const delta = Math.abs(parseFloat(s.put_delta) || 0);
              return delta >= 0.25 && delta <= 0.35;
            })
            .slice(0, 3);
        }
        
        results.greeks = {
          status: greeksRes.status,
          ok: greeksRes.ok,
          expiry: validExpiry,
          totalStrikes: greeksData?.data?.length || 0,
          sampleStrikes: sampleStrikes
        };
      } else {
        results.greeks = { error: 'No valid expiry found in 20-45 DTE range' };
      }
    }
  } catch (e) {
    results.greeks = { error: e.message };
  }

  return Response.json(results, { 
    headers: { 'Content-Type': 'application/json' }
  });
}

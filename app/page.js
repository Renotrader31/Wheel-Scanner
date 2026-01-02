'use client';

import { useState } from 'react';

export default function WheelScanner() {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [error, setError] = useState(null);
  const [lastScan, setLastScan] = useState(null);
  const [view, setView] = useState('scanner');
  const [sortConfig, setSortConfig] = useState({ key: 'wheelScore', direction: 'desc' });
  const [config, setConfig] = useState({
    minPrice: 15,
    maxPrice: 75,
    minRSI: 35,
    maxRSI: 65,
    aboveSMA200: true
  });

  const testAPI = async () => {
    setLoading(true);
    setError(null);
    setTestResult(null);
    
    try {
      const res = await fetch('/api/test?ticker=AAPL');
      const data = await res.json();
      setTestResult(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const runScan = async () => {
    setLoading(true);
    setError(null);
    setCandidates([]);
    
    try {
      const res = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config })
      });
      
      const data = await res.json();
      
      if (data.error) {
        setError(data.error);
      } else {
        setCandidates(data.candidates);
        setLastScan(new Date());
        setView('results');
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (key) => {
    const direction = sortConfig.key === key && sortConfig.direction === 'desc' ? 'asc' : 'desc';
    setSortConfig({ key, direction });
    
    const sorted = [...candidates].sort((a, b) => {
      if (a[key] === null) return 1;
      if (b[key] === null) return -1;
      return direction === 'desc' ? b[key] - a[key] : a[key] - b[key];
    });
    setCandidates(sorted);
  };

  const formatNumber = (num) => {
    if (!num) return '-';
    if (num >= 1e9) return (num / 1e9).toFixed(1) + 'B';
    if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K';
    return num.toFixed(0);
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 65) return 'text-emerald-400';
    if (score >= 50) return 'text-yellow-400';
    return 'text-orange-400';
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* Header */}
      <div className="border-b border-gray-800 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🎡</span>
              <div>
                <h1 className="text-xl font-bold text-blue-400">Wheel Strategy Scanner</h1>
                <p className="text-xs text-gray-500">Polygon + Unusual Whales</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setView('scanner')}
                className={`px-4 py-2 rounded text-sm font-medium transition ${
                  view === 'scanner' ? 'bg-blue-600' : 'bg-gray-800 hover:bg-gray-700'
                }`}
              >
                Scanner
              </button>
              <button
                onClick={() => setView('results')}
                className={`px-4 py-2 rounded text-sm font-medium transition ${
                  view === 'results' ? 'bg-blue-600' : 'bg-gray-800 hover:bg-gray-700'
                }`}
              >
                Results ({candidates.length})
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Scanner View */}
        {view === 'scanner' && (
          <div className="space-y-6">
            {/* API Test */}
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-blue-400 mb-4">🔧 API Connection Test</h2>
              <p className="text-sm text-gray-400 mb-4">
                API keys are configured via environment variables on Vercel (POLYGON_API_KEY, UW_API_KEY)
              </p>
              <button
                onClick={testAPI}
                disabled={loading}
                className="px-4 py-2 bg-yellow-600 hover:bg-yellow-500 rounded font-medium transition disabled:opacity-50"
              >
                {loading ? '⏳ Testing...' : '🧪 Test AAPL'}
              </button>
              
              {testResult && (
                <div className="mt-4 bg-gray-950 rounded p-4 text-sm overflow-auto max-h-64">
                  <pre className="text-gray-300">{JSON.stringify(testResult, null, 2)}</pre>
                </div>
              )}
            </div>

            {/* Filters */}
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-blue-400 mb-4">📊 Scan Filters</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Min Price</label>
                  <input
                    type="number"
                    value={config.minPrice}
                    onChange={(e) => setConfig(prev => ({ ...prev, minPrice: Number(e.target.value) }))}
                    className="w-full bg-gray-950 border border-gray-700 rounded px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Max Price</label>
                  <input
                    type="number"
                    value={config.maxPrice}
                    onChange={(e) => setConfig(prev => ({ ...prev, maxPrice: Number(e.target.value) }))}
                    className="w-full bg-gray-950 border border-gray-700 rounded px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Min RSI</label>
                  <input
                    type="number"
                    value={config.minRSI}
                    onChange={(e) => setConfig(prev => ({ ...prev, minRSI: Number(e.target.value) }))}
                    className="w-full bg-gray-950 border border-gray-700 rounded px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Max RSI</label>
                  <input
                    type="number"
                    value={config.maxRSI}
                    onChange={(e) => setConfig(prev => ({ ...prev, maxRSI: Number(e.target.value) }))}
                    className="w-full bg-gray-950 border border-gray-700 rounded px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>
              <label className="flex items-center gap-2 mt-4 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.aboveSMA200}
                  onChange={(e) => setConfig(prev => ({ ...prev, aboveSMA200: e.target.checked }))}
                  className="w-4 h-4 rounded bg-gray-950 border-gray-700"
                />
                <span className="text-sm text-gray-300">Must be above 200 SMA</span>
              </label>
            </div>

            {/* Scan Button */}
            <div className="flex flex-col items-center gap-4">
              {error && (
                <div className="bg-red-900/50 border border-red-700 rounded px-4 py-2 text-red-400 text-sm">
                  {error}
                </div>
              )}
              
              <button
                onClick={runScan}
                disabled={loading}
                className={`px-8 py-4 rounded-lg font-bold text-lg transition-all ${
                  loading 
                    ? 'bg-gray-700 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 shadow-lg shadow-blue-600/20'
                }`}
              >
                {loading ? '⏳ Scanning 50 Tickers...' : '🚀 Run Wheel Scan'}
              </button>

              {lastScan && (
                <p className="text-sm text-gray-500">
                  Last scan: {lastScan.toLocaleTimeString()} • Found {candidates.length} candidates
                </p>
              )}
            </div>

            {/* Scoring Info */}
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-blue-400 mb-4">📈 Wheel Score Components</h2>
              <div className="grid grid-cols-5 gap-4 text-sm">
                <div className="bg-gray-950 rounded p-3">
                  <div className="text-gray-500">IV Rank</div>
                  <div className="text-white font-semibold">25 pts</div>
                  <div className="text-xs text-gray-600">Sweet spot: 30-60%</div>
                </div>
                <div className="bg-gray-950 rounded p-3">
                  <div className="text-gray-500">Stock Liquidity</div>
                  <div className="text-white font-semibold">20 pts</div>
                  <div className="text-xs text-gray-600">Volume &gt; 2M ideal</div>
                </div>
                <div className="bg-gray-950 rounded p-3">
                  <div className="text-gray-500">Technical</div>
                  <div className="text-white font-semibold">20 pts</div>
                  <div className="text-xs text-gray-600">Above 200 SMA + RSI</div>
                </div>
                <div className="bg-gray-950 rounded p-3">
                  <div className="text-gray-500">Fundamental</div>
                  <div className="text-white font-semibold">20 pts</div>
                  <div className="text-xs text-gray-600">Market cap quality</div>
                </div>
                <div className="bg-gray-950 rounded p-3">
                  <div className="text-gray-500">Options Liquidity</div>
                  <div className="text-white font-semibold">15 pts</div>
                  <div className="text-xs text-gray-600">Vol &gt; 10K ideal</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Results View */}
        {view === 'results' && (
          <div className="space-y-4">
            {candidates.length === 0 ? (
              <div className="bg-gray-900 border border-gray-800 rounded-lg p-12 text-center">
                <div className="text-5xl mb-4">🔍</div>
                <p className="text-gray-400">No candidates found. Run a scan to find Wheel opportunities.</p>
              </div>
            ) : (
              <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-950">
                      <tr>
                        <th className="px-4 py-3 text-left text-gray-400 font-medium">#</th>
                        <th className="px-4 py-3 text-left text-gray-400 font-medium">Ticker</th>
                        <th className="px-4 py-3 text-right text-gray-400 font-medium cursor-pointer hover:text-white" onClick={() => handleSort('wheelScore')}>
                          Score {sortConfig.key === 'wheelScore' && (sortConfig.direction === 'desc' ? '↓' : '↑')}
                        </th>
                        <th className="px-4 py-3 text-right text-gray-400 font-medium cursor-pointer hover:text-white" onClick={() => handleSort('price')}>
                          Price {sortConfig.key === 'price' && (sortConfig.direction === 'desc' ? '↓' : '↑')}
                        </th>
                        <th className="px-4 py-3 text-right text-gray-400 font-medium">RSI</th>
                        <th className="px-4 py-3 text-center text-gray-400 font-medium">200 SMA</th>
                        <th className="px-4 py-3 text-right text-gray-400 font-medium cursor-pointer hover:text-white" onClick={() => handleSort('ivRank')}>
                          IV Rank {sortConfig.key === 'ivRank' && (sortConfig.direction === 'desc' ? '↓' : '↑')}
                        </th>
                        <th className="px-4 py-3 text-right text-gray-400 font-medium cursor-pointer hover:text-white" onClick={() => handleSort('avgVolume')}>
                          Volume {sortConfig.key === 'avgVolume' && (sortConfig.direction === 'desc' ? '↓' : '↑')}
                        </th>
                        <th className="px-4 py-3 text-right text-gray-400 font-medium">Opt Vol</th>
                        <th className="px-4 py-3 text-right text-gray-400 font-medium">P/C</th>
                        <th className="px-4 py-3 text-right text-gray-400 font-medium">Mkt Cap</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                      {candidates.map((stock, idx) => (
                        <tr key={stock.ticker} className="hover:bg-gray-800/50 transition">
                          <td className="px-4 py-3 text-gray-500">{idx + 1}</td>
                          <td className="px-4 py-3">
                            <span className="font-semibold text-white">{stock.ticker}</span>
                            {stock.name && <span className="ml-2 text-xs text-gray-500">{stock.name.slice(0, 20)}</span>}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <span className={`font-bold ${getScoreColor(stock.wheelScore)}`}>{stock.wheelScore}</span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <span className="text-white">${stock.price?.toFixed(2)}</span>
                            <span className={`ml-2 text-xs ${Number(stock.change) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                              {Number(stock.change) >= 0 ? '+' : ''}{stock.change}%
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right text-gray-300">{stock.rsi || '-'}</td>
                          <td className="px-4 py-3 text-center">
                            {stock.aboveSMA200 
                              ? <span className="text-green-400">✓</span> 
                              : <span className="text-red-400">✗</span>
                            }
                          </td>
                          <td className="px-4 py-3 text-right">
                            {stock.ivRank 
                              ? <span className={stock.ivRank >= 30 ? 'text-green-400' : 'text-yellow-400'}>{stock.ivRank.toFixed(0)}%</span>
                              : <span className="text-gray-500">-</span>
                            }
                          </td>
                          <td className="px-4 py-3 text-right text-gray-300">{formatNumber(stock.avgVolume)}</td>
                          <td className="px-4 py-3 text-right text-gray-300">{formatNumber(stock.optionsVolume)}</td>
                          <td className="px-4 py-3 text-right text-gray-300">{stock.putCallRatio || '-'}</td>
                          <td className="px-4 py-3 text-right text-gray-400">{formatNumber(stock.marketCap)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-gray-800 mt-8 py-4">
        <p className="text-center text-xs text-gray-600">
          Wheel Strategy Scanner • Data: Polygon.io + Unusual Whales • Not financial advice
        </p>
      </div>
    </div>
  );
}

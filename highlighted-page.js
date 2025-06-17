// Simple component to display highlighted stocks directly from the API
// Save this to your highlighted page component file

import { useState, useEffect } from 'react';

export default function HighlightedStocksPage() {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHighlightedStocks = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/stocks/highlighted');
        if (!response.ok) {
          throw new Error('Failed to fetch highlighted stocks');
        }
        const data = await response.json();
        setStocks(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchHighlightedStocks();
  }, []);

  if (loading) return <div>Loading highlighted stocks...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return (
    <div>
      <h1>Highlighted Stocks</h1>
      <p>View all stocks that have been highlighted for special attention.</p>
      
      <h2>Highlighted Stocks</h2>
      <p>Sort by Sentiment ↓</p>
      
      {stocks.length > 0 ? (
        <table>
          <thead>
            <tr>
              <th>Ticker</th>
              <th>Sentiment Score</th>
              <th>Signal Score</th>
              <th>PE</th>
              <th>Guru</th>
            </tr>
          </thead>
          <tbody>
            {stocks.map(stock => (
              <tr key={stock.id}>
                <td>{stock.ticker}</td>
                <td>{stock.sentiment_score}</td>
                <td>{stock.signal_score}</td>
                <td>{stock.pe}</td>
                <td>{stock.guru}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No highlighted stocks found</p>
      )}
    </div>
  );
}
// This is a suggested fix for your highlighted stocks page
// Add this code to your highlighted/page.tsx component

/*
The issue is that your API is correctly returning highlighted stocks (379 of them),
but your frontend component might be looking for an explicit 'highlight: true' property
which doesn't exist in the API response.

Here's how to fix it:
*/

// In your fetchHighlightedStocks function:
const fetchHighlightedStocks = async () => {
  try {
    const response = await fetch('http://localhost:3000/api/stocks/highlighted');
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Add the highlight property to each stock
    // This is needed because the API returns stocks that meet the criteria
    // but doesn't explicitly set the highlight property
    return data.map(stock => ({
      ...stock,
      highlight: true
    }));
  } catch (error) {
    console.error('Error fetching highlighted stocks:', error);
    return [];
  }
};

// Then in your component's render logic:
// Instead of checking for stock.highlight === true
// You can just use the array directly since all stocks from this endpoint
// are considered highlighted

// Example:
/*
{stocks.length > 0 ? (
  <div className="highlighted-stocks-table">
    {stocks.map(stock => (
      <StockRow key={stock.id} stock={stock} />
    ))}
  </div>
) : (
  <p>No highlighted stocks found</p>
)}
*/
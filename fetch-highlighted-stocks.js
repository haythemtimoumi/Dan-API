// Simple script to fetch highlighted stocks from the API
const fetchHighlightedStocks = async () => {
  try {
    const response = await fetch('http://localhost:3000/api/stocks/highlighted');
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Highlighted Stocks:', data);
    return data;
  } catch (error) {
    console.error('Error fetching highlighted stocks:', error);
  }
};

// Execute the function
fetchHighlightedStocks();

// To use this in a browser environment:
// 1. Open your browser console
// 2. Copy and paste this code
// 3. Press Enter to execute

// To use with Node.js:
// 1. Make sure your API server is running on localhost:3000
// 2. Run this file with: node fetch-highlighted-stocks.js
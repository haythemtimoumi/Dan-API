// Debug script to check highlighted stocks API
const fetchHighlightedStocks = async () => {
  try {
    console.log('Fetching highlighted stocks...');
    const response = await fetch('http://localhost:3000/api/stocks/highlighted');
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('API Response Status:', response.status);
    console.log('Number of highlighted stocks:', data.length);
    
    if (data.length > 0) {
      console.log('First highlighted stock:', data[0]);
      
      // Check if any stocks have highlight property explicitly set
      const explicitHighlights = data.filter(stock => stock.highlight === true);
      console.log('Stocks with explicit highlight=true:', explicitHighlights.length);
      
      // Check sentiment and signal scores
      const highScores = data.filter(stock => 
        stock.sentiment_score > 60 && stock.signal_score > 80
      );
      console.log('Stocks meeting highlight criteria (sentiment>60, signal>80):', highScores.length);
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching highlighted stocks:', error);
  }
};

// Execute the function
fetchHighlightedStocks();
// Test script for /api/stocks/companies/recent-date endpoint
const testRecentDate = async () => {
  try {
    console.log('Testing /api/stocks/companies/recent-date endpoint...');
    const response = await fetch('http://localhost:3000/api/stocks/companies/recent-date');
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('✅ API Response Status:', response.status);
    console.log('✅ Response Data:', data);
    
    if (data.recent_date) {
      const date = new Date(data.recent_date);
      console.log('✅ Formatted Date:', date.toISOString().split('T')[0]);
    } else {
      console.log('⚠️  No recent date found');
    }
    
    return data;
  } catch (error) {
    console.error('❌ Error testing recent date endpoint:', error);
  }
};

testRecentDate();
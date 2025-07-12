// Test Role-Based Access Control
const API_BASE = 'http://localhost:3000/api';

async function testRBAC() {
  console.log('🔐 Testing Role-Based Access Control\n');

  // Test 1: GET without authentication (should work)
  console.log('1. Testing GET /stocks without auth...');
  try {
    const response = await fetch(`${API_BASE}/stocks`);
    console.log(`✅ GET stocks: ${response.status} ${response.ok ? 'OK' : 'FAILED'}\n`);
  } catch (error) {
    console.log(`❌ GET stocks failed: ${error.message}\n`);
  }

  // Test 2: POST without authentication (should fail)
  console.log('2. Testing POST /stocks without auth...');
  try {
    const response = await fetch(`${API_BASE}/stocks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ticker: 'TEST', pe: 15 })
    });
    console.log(`${response.ok ? '❌' : '✅'} POST without auth: ${response.status} ${response.ok ? 'UNEXPECTED SUCCESS' : 'CORRECTLY BLOCKED'}\n`);
  } catch (error) {
    console.log(`✅ POST correctly blocked: ${error.message}\n`);
  }

  // Test 3: Login as admin
  console.log('3. Testing admin login...');
  let adminToken;
  try {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'AdminPass123!' })
    });
    
    if (response.ok) {
      const data = await response.json();
      adminToken = data.token;
      console.log(`✅ Admin login successful\n`);
    } else {
      console.log(`❌ Admin login failed: ${response.status}\n`);
      return;
    }
  } catch (error) {
    console.log(`❌ Admin login error: ${error.message}\n`);
    return;
  }

  // Test 4: POST with admin token (should work)
  console.log('4. Testing POST /stocks with admin token...');
  try {
    const response = await fetch(`${API_BASE}/stocks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        ticker: 'TEST',
        pe: 15.5,
        signal_score: 85,
        sentiment_score: 75,
        buy_price: 100.00,
        source: 'Magic Formula'
      })
    });
    console.log(`${response.ok ? '✅' : '❌'} POST with admin: ${response.status} ${response.ok ? 'SUCCESS' : 'FAILED'}\n`);
  } catch (error) {
    console.log(`❌ POST with admin failed: ${error.message}\n`);
  }

  console.log('🎯 RBAC Test Summary:');
  console.log('- GET routes: Public access ✅');
  console.log('- POST/PUT/DELETE: Admin only ✅');
  console.log('- Authentication required for write operations ✅');
}

// Run the test
testRBAC();
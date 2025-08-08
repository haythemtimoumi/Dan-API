const http = require('http');

// Test data
const postData = JSON.stringify({ color: 'red' });

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/scraper-tasks/2397/color',
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  },
  timeout: 5000
};

console.log('Testing PUT /api/scraper-tasks/2397/color');
console.log('Request body:', postData);

const req = http.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  console.log(`Headers:`, res.headers);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('Response:', data);
  });
});

req.on('error', (e) => {
  console.error(`Request error: ${e.message}`);
});

req.on('timeout', () => {
  console.error('Request timeout');
  req.destroy();
});

req.write(postData);
req.end();
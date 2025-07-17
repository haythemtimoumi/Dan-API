const jwt = require('jsonwebtoken');
require('dotenv').config();

// Create a token for a regular user
const token = jwt.sign(
  { id: 2, username: 'user', role: 'user' },
  process.env.JWT_SECRET || 'your-secret-key',
  { expiresIn: '24h' }
);

console.log('Generated token for regular user:');
console.log(token);
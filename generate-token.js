const jwt = require('jsonwebtoken');
require('dotenv').config();

// Create a token for an admin user
const token = jwt.sign(
  { id: 1, username: 'admin', role: 'admin' },
  process.env.JWT_SECRET || 'your-secret-key',
  { expiresIn: '24h' }
);

console.log('Generated token for admin user:');
console.log(token);
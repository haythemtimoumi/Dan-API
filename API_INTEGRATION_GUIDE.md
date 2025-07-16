# Stock Analysis API - Frontend Integration Guide

## 🔐 Authentication & Authorization

### Login Endpoint
**POST** `/api/auth/login`

**Request:**
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "admin",
    "role": "admin"
  }
}
```

### Test Accounts
- **Admin:** `admin` / `admin123` (full access)
- **User:** `user` / `user123` (read-only access)

## 🛡️ Route Access Control

### Public Routes (No Authentication Required)
- `GET /api/stocks` - Get all stocks
- `GET /api/stocks/sorted` - Get stocks sorted by sentiment
- `GET /api/stocks/highlighted` - Get highlighted stocks
- `GET /api/stocks/:id` - Get stock by ID
- `GET /api/stocks/ticker/:ticker` - Get stocks by ticker
- `GET /api/stocks/recent-changes` - Get recent changes
- All other GET routes

### Protected Routes (Admin Only)
- `POST /api/stocks` - Create new stock
- `PUT /api/stocks/:id` - Update stock
- `DELETE /api/stocks/:id` - Delete stock

## 📡 Frontend Implementation

### 1. Login Function
```javascript
async function login(username, password) {
  const response = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  
  if (response.ok) {
    const { token, user } = await response.json();
    localStorage.setItem('authToken', token);
    localStorage.setItem('user', JSON.stringify(user));
    return { token, user };
  }
  
  throw new Error('Login failed');
}
```

### 2. API Request Helper
```javascript
async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem('authToken');
  const headers = { 'Content-Type': 'application/json' };
  
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  
  const response = await fetch(`http://localhost:3000/api${endpoint}`, {
    ...options,
    headers: { ...headers, ...options.headers }
  });
  
  if (response.status === 401) {
    // Token expired or invalid
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    window.location.href = '/login';
    return;
  }
  
  return response.json();
}
```

### 3. Stock Operations
```javascript
// Public - Get all stocks (no auth needed)
const stocks = await apiRequest('/stocks');

// Public - Get highlighted stocks
const highlighted = await apiRequest('/stocks/highlighted');

// Protected - Create stock (admin only)
const newStock = await apiRequest('/stocks', {
  method: 'POST',
  body: JSON.stringify({
    ticker: 'AAPL',
    pe: 25.5,
    signal_score: 85,
    sentiment_score: 75,
    buy_price: 150.00,
    source: 'Magic Formula'
  })
});

// Protected - Update stock (admin only)
const updatedStock = await apiRequest(`/stocks/${id}`, {
  method: 'PUT',
  body: JSON.stringify(stockData)
});

// Protected - Delete stock (admin only)
await apiRequest(`/stocks/${id}`, { method: 'DELETE' });
```

### 4. User Role Check
```javascript
function isAdmin() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  return user.role === 'admin';
}

function canModifyStocks() {
  return isAdmin();
}
```

### 5. Complete Example Component
```javascript
class StockManager {
  constructor() {
    this.token = localStorage.getItem('authToken');
    this.user = JSON.parse(localStorage.getItem('user') || '{}');
  }
  
  async login(username, password) {
    const response = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    
    if (response.ok) {
      const data = await response.json();
      this.token = data.token;
      this.user = data.user;
      localStorage.setItem('authToken', this.token);
      localStorage.setItem('user', JSON.stringify(this.user));
      return data;
    }
    
    throw new Error('Login failed');
  }
  
  async getStocks() {
    // Public endpoint - no auth required
    const response = await fetch('http://localhost:3000/api/stocks');
    return response.json();
  }
  
  async createStock(stockData) {
    if (!this.isAdmin()) {
      throw new Error('Admin access required');
    }
    
    const response = await fetch('http://localhost:3000/api/stocks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.token}`
      },
      body: JSON.stringify(stockData)
    });
    
    if (response.status === 401) {
      throw new Error('Authentication required');
    }
    
    if (response.status === 403) {
      throw new Error('Admin access required');
    }
    
    return response.json();
  }
  
  isAdmin() {
    return this.user.role === 'admin';
  }
  
  logout() {
    this.token = null;
    this.user = {};
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  }
}
```

## 🚨 Error Handling

### Common Response Codes
- `200` - Success
- `400` - Validation error
- `401` - Authentication required
- `403` - Insufficient permissions (not admin)
- `404` - Resource not found
- `500` - Server error

### Error Response Format
```json
{
  "message": "Authentication required for this operation"
}
```

## 🔧 Implementation Checklist

- [ ] Implement login form
- [ ] Store JWT token in localStorage
- [ ] Add Authorization header to protected requests
- [ ] Handle 401/403 responses (redirect to login)
- [ ] Show/hide admin features based on user role
- [ ] Implement logout functionality
- [ ] Add error handling for all API calls

## 🌐 CORS Configuration

The API allows requests from:
- Update CORS settings in backend if using different domain

## 📝 Notes

- JWT tokens expire in 24 hours
- All GET routes are public (no authentication required)
- Only admin users can create, update, or delete stocks
- Regular users can only view stock data
- Always check user role before showing admin features in UI
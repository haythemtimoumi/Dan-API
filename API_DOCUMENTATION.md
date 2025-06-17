# Stock Analysis API Documentation

This document provides comprehensive documentation for the Stock Analysis API, which offers endpoints for managing and analyzing stock data.

## Base URL

```
http://localhost:3000/api/stocks
```

## Authentication

Currently, the API does not require authentication.

## Response Format

All responses are returned in JSON format.

## Error Handling

The API returns appropriate HTTP status codes:

- `200 OK`: Request successful
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid request parameters
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server-side error

Error responses include a message field explaining the error:

```json
{
  "message": "Error message description"
}
```

## API Endpoints

### GET Endpoints

#### Get All Stocks

```
GET /api/stocks
```

Returns all stocks ordered by date (descending).

**Response Example:**
```json
[
  {
    "id": 1,
    "date": "2023-05-15T00:00:00.000Z",
    "ticker": "AAPL",
    "source": "Magic Formula",
    "pe": 25.6,
    "dividend": "0.92%",
    "cash_per_share": "3.75",
    "current_ratio": 1.2,
    "signal_score": 85,
    "sentiment_score": 75,
    "screenshot": "https://example.com/screenshot.jpg",
    "guru": "Warren Buffett",
    "rule1_score": 0,
    "moat_score": 8,
    "management_score": 9,
    "buy_price": "150.00"
  },
  // More stocks...
]
```

#### Get All Stocks Sorted

```
GET /api/stocks/sorted
```

Returns all stocks sorted by sentiment score (descending) with a highlight property.

**Response Example:**
```json
[
  {
    "id": 2,
    "ticker": "MSFT",
    "sentiment_score": 90,
    "signal_score": 85,
    "highlight": true,
    // Other fields...
  },
  // More stocks...
]
```

#### Get Stocks With Source

```
GET /api/stocks/with-source
```

Returns stocks with their analysis source (Magic Formula or Rule 1).

**Response Example:**
```json
[
  {
    "id": 1,
    "ticker": "AAPL",
    "source": "Magic Formula",
    "highlight": true,
    // Other fields...
  },
  // More stocks...
]
```

#### Get Daily Changes

```
GET /api/stocks/daily-changes
```

Returns daily changes in stocks (new, removed, existing).

**Response Example:**
```json
{
  "current": [
    {
      "id": 1,
      "ticker": "AAPL",
      "status": "existing",
      "highlight": true,
      // Other fields...
    }
  ],
  "new": [
    {
      "id": 3,
      "ticker": "GOOG",
      "status": "new",
      "highlight": true,
      // Other fields...
    }
  ],
  "removed": [
    {
      "id": 2,
      "ticker": "MSFT",
      "status": "removed",
      // Other fields...
    }
  ]
}
```

#### Get Highlighted Stocks

```
GET /api/stocks/highlighted
```

Returns stocks with sentiment_score > 60 AND signal_score > 80.

**Response Example:**
```json
[
  {
    "id": 1,
    "ticker": "AAPL",
    "sentiment_score": 75,
    "signal_score": 85,
    // Other fields...
  },
  // More highlighted stocks...
]
```

#### Get Highlighted Stocks By Date Range

```
GET /api/stocks/highlighted/filter?startDate=2023-01-01&endDate=2023-12-31
```

Returns highlighted stocks filtered by date range.

**Query Parameters:**
- `startDate` (optional): Start date in YYYY-MM-DD format
- `endDate` (optional): End date in YYYY-MM-DD format

**Response Example:**
```json
[
  {
    "id": 1,
    "ticker": "AAPL",
    "date": "2023-05-15T00:00:00.000Z",
    "sentiment_score": 75,
    "signal_score": 85,
    // Other fields...
  },
  // More highlighted stocks within date range...
]
```

#### Get All Stocks By Date Range

```
GET /api/stocks/filter?startDate=2023-01-01&endDate=2023-12-31
```

Returns all stocks filtered by date range.

**Query Parameters:**
- `startDate` (optional): Start date in YYYY-MM-DD format
- `endDate` (optional): End date in YYYY-MM-DD format

**Response Example:**
```json
[
  {
    "id": 1,
    "ticker": "AAPL",
    "date": "2023-05-15T00:00:00.000Z",
    // Other fields...
  },
  // More stocks within date range...
]
```

#### Get Stocks By Date Range (Legacy)

```
GET /api/stocks/date-range?startDate=01/01/2023&endDate=12/31/2023
```

Returns stocks by date range using MM/DD/YYYY format.

**Query Parameters:**
- `startDate` (required): Start date in MM/DD/YYYY format
- `endDate` (required): End date in MM/DD/YYYY format

**Response Example:**
```json
[
  {
    "id": 1,
    "ticker": "AAPL",
    "date": "2023-05-15T00:00:00.000Z",
    // Other fields...
  },
  // More stocks within date range...
]
```

#### Get Stock By ID

```
GET /api/stocks/:id
```

Returns a specific stock by ID.

**Path Parameters:**
- `id`: Stock ID (integer)

**Response Example:**
```json
{
  "id": 1,
  "date": "2023-05-15T00:00:00.000Z",
  "ticker": "AAPL",
  // Other fields...
}
```

#### Get Stock History

```
GET /api/stocks/:id/history
```

Returns historical records for a stock with the same ticker, source, and guru (if present in the original stock).

**Path Parameters:**
- `id`: Stock ID (integer)

**Query Parameters:**
- `from` (optional): Start date in YYYY-MM-DD format to filter records
- `to` (optional): End date in YYYY-MM-DD format to filter records

**Response Example:**
```json
[
  {
    "id": 15100,
    "ticker": "AAPL",
    "source": "Magic Formula",
    "guru": "Warren Buffett",
    "date": "2023-01-15T00:00:00.000Z",
    "sentiment_score": 70,
    "signal_score": 82,
    "pe": 24.5,
    "buy_price": "145.00"
  },
  {
    "id": 15289,
    "ticker": "AAPL",
    "source": "Magic Formula",
    "guru": "Warren Buffett",
    "date": "2023-05-15T00:00:00.000Z",
    "sentiment_score": 75,
    "signal_score": 85,
    "pe": 25.6,
    "buy_price": "150.00"
  },
  {
    "id": 15400,
    "ticker": "AAPL",
    "source": "Magic Formula",
    "guru": "Warren Buffett",
    "date": "2023-09-15T00:00:00.000Z",
    "sentiment_score": 78,
    "signal_score": 88,
    "pe": 26.2,
    "buy_price": "155.00"
  }
]
```

**Example with Date Filtering:**
```
GET /api/stocks/:id/history?from=2023-05-01&to=2023-10-01
```

**Response Example with Date Filtering:**
```json
[
  {
    "id": 15289,
    "ticker": "AAPL",
    "source": "Magic Formula",
    "guru": "Warren Buffett",
    "date": "2023-05-15T00:00:00.000Z",
    "sentiment_score": 75,
    "signal_score": 85,
    "pe": 25.6,
    "buy_price": "150.00"
  },
  {
    "id": 15400,
    "ticker": "AAPL",
    "source": "Magic Formula",
    "guru": "Warren Buffett",
    "date": "2023-09-15T00:00:00.000Z",
    "sentiment_score": 78,
    "signal_score": 88,
    "pe": 26.2,
    "buy_price": "155.00"
  }
]
```

#### Get Stocks By Ticker

```
GET /api/stocks/ticker/:ticker
```

Returns stocks by ticker symbol.

**Path Parameters:**
- `ticker`: Stock ticker symbol (string)

**Response Example:**
```json
[
  {
    "id": 1,
    "date": "2023-05-15T00:00:00.000Z",
    "ticker": "AAPL",
    // Other fields...
  },
  // More stocks with the same ticker...
]
```

### POST Endpoint

#### Create Stock

```
POST /api/stocks
```

Creates a new stock entry.

**Request Body:**
```json
{
  "date": "2023-05-15",
  "ticker": "AAPL",
  "source": "Magic Formula",
  "pe": 25.6,
  "dividend": "0.92%",
  "cash_per_share": "3.75",
  "current_ratio": 1.2,
  "signal_score": 85,
  "sentiment_score": 75,
  "screenshot": "https://example.com/screenshot.jpg",
  "guru": "Warren Buffett",
  "rule1_score": 0,
  "moat_score": 8,
  "management_score": 9,
  "buy_price": "150.00"
}
```

**Response Example:**
```json
{
  "id": 1,
  "date": "2023-05-15T00:00:00.000Z",
  "ticker": "AAPL",
  "source": "Magic Formula",
  "pe": 25.6,
  "dividend": "0.92%",
  "cash_per_share": "3.75",
  "current_ratio": 1.2,
  "signal_score": 85,
  "sentiment_score": 75,
  "screenshot": "https://example.com/screenshot.jpg",
  "guru": "Warren Buffett",
  "rule1_score": 0,
  "moat_score": 8,
  "management_score": 9,
  "buy_price": "150.00"
}
```

### PUT Endpoint

#### Update Stock

```
PUT /api/stocks/:id
```

Updates an existing stock.

**Path Parameters:**
- `id`: Stock ID (integer)

**Request Body:**
```json
{
  "signal_score": 90,
  "sentiment_score": 80,
  "buy_price": "155.00"
}
```

**Response Example:**
```json
{
  "id": 1,
  "date": "2023-05-15T00:00:00.000Z",
  "ticker": "AAPL",
  "source": "Magic Formula",
  "pe": 25.6,
  "dividend": "0.92%",
  "cash_per_share": "3.75",
  "current_ratio": 1.2,
  "signal_score": 90,
  "sentiment_score": 80,
  "screenshot": "https://example.com/screenshot.jpg",
  "guru": "Warren Buffett",
  "rule1_score": 0,
  "moat_score": 8,
  "management_score": 9,
  "buy_price": "155.00"
}
```

### DELETE Endpoint

#### Delete Stock

```
DELETE /api/stocks/:id
```

Deletes a stock by ID.

**Path Parameters:**
- `id`: Stock ID (integer)

**Response Example:**
```json
{
  "message": "Stock deleted successfully"
}
```

## Data Model

The Stock Analysis API uses the following data model:

```typescript
interface StockAnalysis {
  id?: number;
  date?: Date;
  ticker?: string;
  source?: string;
  pe?: number;
  dividend?: string;
  cash_per_share?: string;
  current_ratio?: number;
  signal_score?: number;
  sentiment_score?: number;
  screenshot?: string;
  guru?: string;
  rule1_score?: number;
  moat_score?: number;
  management_score?: number;
  buy_price?: string;
  highlight?: boolean;
  status?: 'new' | 'removed' | 'existing';
}
```

## Testing with Postman

A Postman collection is available for testing the API:
- Import `postman_collection.json` and `postman_environment.json` into Postman
- Select the "Stock Analysis API Environment" from the environment dropdown
- Use the collection to test all API endpoints

## Testing with Curl

The repository includes a bash script (`api_examples.sh`) with curl commands for all API endpoints:

```bash
# Make the script executable
chmod +x api_examples.sh

# Run the script
./api_examples.sh
```

## Database Configuration

The API connects to a PostgreSQL database with the following configuration:

```javascript
{
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'postgres',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres123'
}
```

Configure these values in your `.env` file for your specific environment.
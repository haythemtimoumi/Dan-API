# Guru-Ticker API Documentation

This document describes the new POST and UPDATE APIs that manage the relationship between gurus, tickers (scraper_tasks), and their many-to-many mapping (guru_ticker_map).

## Overview

The new API endpoints replace the current POST /ticker endpoint and provide enhanced functionality for managing guru-ticker relationships across three database tables:

- `guru` - Contains guru information
- `scraper_tasks` - Contains ticker/stock information  
- `guru_ticker_map` - Many-to-many mapping between gurus and tickers

## API Endpoints

### POST /api/tickers
Creates a new ticker with guru relationship.

**Request Body:**
```json
{
  "symbol": "AAPL",                    // Required: Stock symbol
  "guru_id": 1,                        // Optional: Existing guru ID
  "guru_name": "Warren Buffett",       // Optional: Guru name (creates if doesn't exist)
  "list_type": "manual",               // Optional: Default "manual"
  "scrape_type": "daily",              // Optional: "daily"|"hourly"|"monthly", default "daily"
  "active": true,                      // Optional: Default true
  "last_action": "buy",                // Optional: Last action taken
  "per_portfolio": "5%",               // Optional: Portfolio percentage
  "target": false,                     // Optional: Default false
  "color": "green"                     // Optional: "red"|"yellow"|"green"|"neutral", default "neutral"
}
```

**Behavior:**
1. **New ticker + new/existing guru**: Creates ticker, ensures guru exists, creates mapping
2. **Existing ticker + new guru**: Creates guru if needed, creates mapping only
3. **Existing ticker + existing guru (already linked)**: Returns success with "Already linked" message

**Response:**
```json
{
  "id": 123,
  "symbol": "AAPL",
  "guru_id": 1,
  "guru_name": "Warren Buffett",
  "list_type": "manual",
  "scrape_type": "daily",
  "active": true,
  "message": "Already linked"  // Only present if relationship already existed
}
```

### PUT /api/tickers/:id
Updates an existing ticker and its guru relationship.

**Request Body:**
```json
{
  "symbol": "AAPL_NEW",               // Optional: Update symbol
  "guru_id": 2,                       // Optional: Change guru association
  "guru_name": "New Guru",            // Optional: Create/update guru
  "scrape_type": "hourly",            // Optional: Update scrape frequency
  "active": false,                    // Optional: Update active status
  "target": true,                     // Optional: Update target status
  "color": "red"                      // Optional: Update color
}
```

**Response:**
```json
{
  "id": 123,
  "symbol": "AAPL_NEW",
  "guru_id": 2,
  "guru_name": "New Guru",
  "list_type": "manual",
  "scrape_type": "hourly",
  "active": false
}
```

## Error Responses

### 400 Bad Request
```json
{
  "error": "Symbol is required"
}
```

```json
{
  "error": "Either guru_id or guru_name is required"
}
```

### 404 Not Found
```json
{
  "error": "Ticker not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error"
}
```

## Legacy Endpoints

For backward compatibility, the old endpoints are still available:

- `POST /api/tickers/legacy` - Original ticker creation
- `PUT /api/tickers/legacy/:id` - Original ticker update

## Database Schema

### guru table
```sql
id          | integer (PK)
guru_name   | varchar(100) (UNIQUE)
description | text
created_at  | timestamp
```

### scraper_tasks table
```sql
id                    | integer (PK)
symbol                | text (NOT NULL)
guru_id               | integer (FK to guru.id)
list_type             | text
scrape_type           | text (NOT NULL)
active                | boolean (default: false)
current_step          | text (default: 'rule1')
scrape_status         | text (default: 'pending')
retry_count           | integer (default: 0)
last_updated_at       | timestamp
rule1_scraped_at      | timestamp
stockscore_scraped_at | timestamp
last_price_scraped_at | timestamp
last_action           | text
per_portfolio         | text
target                | boolean (default: false)
color                 | varchar(10) (default: 'neutral')
```

### guru_ticker_map table
```sql
id              | integer (PK)
guru_id         | integer (FK to guru.id)
scraper_task_id | integer (FK to scraper_tasks.id)
```

## Usage Examples

### Create new ticker with new guru
```bash
curl -X POST http://localhost:3000/api/tickers \
  -H "Content-Type: application/json" \
  -d '{
    "symbol": "TSLA",
    "guru_name": "Cathie Wood",
    "scrape_type": "daily",
    "active": true,
    "target": true
  }'
```

### Create ticker with existing guru
```bash
curl -X POST http://localhost:3000/api/tickers \
  -H "Content-Type: application/json" \
  -d '{
    "symbol": "NVDA",
    "guru_id": 1,
    "scrape_type": "hourly"
  }'
```

### Update ticker details
```bash
curl -X PUT http://localhost:3000/api/tickers/123 \
  -H "Content-Type: application/json" \
  -d '{
    "symbol": "NVDA_UPDATED",
    "scrape_type": "monthly",
    "active": false,
    "color": "red"
  }'
```

## Transaction Safety

Both POST and PUT operations use database transactions to ensure data consistency across all three tables. If any operation fails, all changes are rolled back.

## Testing

Use the provided test script to verify the API functionality:

```bash
node test-guru-ticker-api.js
```

This script tests various scenarios including:
- Creating new ticker with new guru
- Attempting to create duplicate relationships
- Creating same ticker with different guru
- Updating ticker details and guru relationships
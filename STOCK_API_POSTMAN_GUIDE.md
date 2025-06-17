# Stock Analysis API - Postman Guide

This guide will help you set up and use the Stock Analysis API with Postman.

## Setting Up Postman

1. **Download and Install Postman**:
   - Download from [postman.com/downloads](https://www.postman.com/downloads/)
   - Install and open the application

2. **Import the Collection and Environment**:
   - In Postman, click the "Import" button in the top left
   - Select the `postman_collection.json` and `postman_environment.json` files from this project
   - Both files will be imported into your Postman workspace

3. **Select the Environment**:
   - In the top right corner of Postman, select "Stock Analysis API Environment" from the dropdown
   - This sets the `baseUrl` variable to `http://localhost:3000`

## API Endpoints Reference

### GET Endpoints

#### 1. Get All Stocks
- **URL**: `GET {{baseUrl}}/api/stocks`
- **Description**: Retrieves all stocks ordered by date (descending)
- **How to use in Postman**:
  - Select "Get All Stocks" from the collection
  - Click "Send"

#### 2. Get All Stocks Sorted
- **URL**: `GET {{baseUrl}}/api/stocks/sorted`
- **Description**: Retrieves all stocks sorted by sentiment score (descending)
- **How to use in Postman**:
  - Select "Get All Stocks Sorted" from the collection
  - Click "Send"

#### 3. Get Stocks With Source
- **URL**: `GET {{baseUrl}}/api/stocks/with-source`
- **Description**: Retrieves stocks with their analysis source (Magic Formula or Rule 1)
- **How to use in Postman**:
  - Select "Get Stocks With Source" from the collection
  - Click "Send"

#### 4. Get Daily Changes
- **URL**: `GET {{baseUrl}}/api/stocks/daily-changes`
- **Description**: Gets daily changes in stocks (new, removed, existing)
- **How to use in Postman**:
  - Select "Get Daily Changes" from the collection
  - Click "Send"

#### 5. Get Highlighted Stocks
- **URL**: `GET {{baseUrl}}/api/stocks/highlighted`
- **Description**: Retrieves stocks with sentiment_score > 60 AND signal_score > 80
- **How to use in Postman**:
  - Select "Get Highlighted Stocks" from the collection
  - Click "Send"

#### 6. Get Highlighted Stocks By Date Range
- **URL**: `GET {{baseUrl}}/api/stocks/highlighted/filter?startDate=2023-01-01&endDate=2023-12-31`
- **Description**: Retrieves highlighted stocks filtered by date range
- **Parameters**:
  - `startDate`: Start date in YYYY-MM-DD format (optional)
  - `endDate`: End date in YYYY-MM-DD format (optional)
- **How to use in Postman**:
  - Select "Get Highlighted Stocks By Date Range" from the collection
  - Modify the query parameters if needed
  - Click "Send"

#### 7. Get All Stocks By Date Range
- **URL**: `GET {{baseUrl}}/api/stocks/filter?startDate=2023-01-01&endDate=2023-12-31`
- **Description**: Retrieves all stocks filtered by date range
- **Parameters**:
  - `startDate`: Start date in YYYY-MM-DD format (optional)
  - `endDate`: End date in YYYY-MM-DD format (optional)
- **How to use in Postman**:
  - Select "Get All Stocks By Date Range" from the collection
  - Modify the query parameters if needed
  - Click "Send"

#### 8. Get Stocks By Date Range (Legacy)
- **URL**: `GET {{baseUrl}}/api/stocks/date-range?startDate=01/01/2023&endDate=12/31/2023`
- **Description**: Retrieves stocks by date range using MM/DD/YYYY format
- **Parameters**:
  - `startDate`: Start date in MM/DD/YYYY format (required)
  - `endDate`: End date in MM/DD/YYYY format (required)
- **How to use in Postman**:
  - Select "Get Stocks By Date Range (Legacy)" from the collection
  - Modify the query parameters if needed
  - Click "Send"

#### 9. Get Stock By ID
- **URL**: `GET {{baseUrl}}/api/stocks/1`
- **Description**: Retrieves a specific stock by ID
- **How to use in Postman**:
  - Select "Get Stock By ID" from the collection
  - Modify the URL to include the desired stock ID
  - Click "Send"

#### 10. Get Stocks By Ticker
- **URL**: `GET {{baseUrl}}/api/stocks/ticker/AAPL`
- **Description**: Retrieves stocks by ticker symbol
- **How to use in Postman**:
  - Select "Get Stocks By Ticker" from the collection
  - Modify the URL to include the desired ticker symbol
  - Click "Send"

### POST Endpoint

#### 11. Create Stock
- **URL**: `POST {{baseUrl}}/api/stocks`
- **Description**: Creates a new stock entry
- **Request Body Example**:
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
- **How to use in Postman**:
  - Select "Create Stock" from the collection
  - Modify the request body as needed
  - Click "Send"

### PUT Endpoint

#### 12. Update Stock
- **URL**: `PUT {{baseUrl}}/api/stocks/1`
- **Description**: Updates an existing stock
- **Request Body Example** (partial update):
  ```json
  {
    "signal_score": 90,
    "sentiment_score": 80,
    "buy_price": "155.00"
  }
  ```
- **How to use in Postman**:
  - Select "Update Stock" from the collection
  - Modify the URL to include the desired stock ID
  - Modify the request body as needed
  - Click "Send"

### DELETE Endpoint

#### 13. Delete Stock
- **URL**: `DELETE {{baseUrl}}/api/stocks/1`
- **Description**: Deletes a stock by ID
- **How to use in Postman**:
  - Select "Delete Stock" from the collection
  - Modify the URL to include the desired stock ID
  - Click "Send"

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

## Troubleshooting

1. **API Not Responding**:
   - Ensure the API server is running on port 3000
   - Check if the baseUrl in the environment is correct

2. **Invalid Date Format**:
   - For `/api/stocks/date-range` endpoint, use MM/DD/YYYY format
   - For `/api/stocks/filter` and `/api/stocks/highlighted/filter` endpoints, use YYYY-MM-DD format

3. **Authentication Issues**:
   - This API currently does not require authentication

4. **Error Responses**:
   - Check the response body for error messages
   - Common status codes:
     - 400: Bad Request (invalid parameters)
     - 404: Not Found (resource doesn't exist)
     - 500: Internal Server Error (server-side issue)
# Stock Analysis API - Postman Collection

This repository includes Postman collection and environment files to help you test the Stock Analysis API.

## Files

- `postman_collection.json`: Contains all API endpoints for testing
- `postman_environment.json`: Contains environment variables like baseUrl

## Setup Instructions

1. Install [Postman](https://www.postman.com/downloads/) if you haven't already
2. Import the collection:
   - Open Postman
   - Click "Import" button
   - Select `postman_collection.json` file
3. Import the environment:
   - Click "Import" button
   - Select `postman_environment.json` file
4. Select the "Stock Analysis API Environment" from the environment dropdown in the top right corner

## Available Endpoints

### GET Endpoints

- **Get All Stocks**: `GET {{baseUrl}}/api/stocks`
  - Retrieves all stocks ordered by date (descending)

- **Get All Stocks Sorted**: `GET {{baseUrl}}/api/stocks/sorted`
  - Retrieves all stocks sorted by sentiment score (descending)

- **Get Stocks With Source**: `GET {{baseUrl}}/api/stocks/with-source`
  - Retrieves stocks with their analysis source (Magic Formula or Rule 1)

- **Get Daily Changes**: `GET {{baseUrl}}/api/stocks/daily-changes`
  - Gets daily changes in stocks (new, removed, existing)

- **Get Highlighted Stocks**: `GET {{baseUrl}}/api/stocks/highlighted`
  - Retrieves stocks with sentiment_score > 60 AND signal_score > 80

- **Get Highlighted Stocks By Date Range**: `GET {{baseUrl}}/api/stocks/highlighted/filter?startDate=2023-01-01&endDate=2023-12-31`
  - Retrieves highlighted stocks filtered by date range
  - Parameters:
    - `startDate`: Start date in YYYY-MM-DD format (optional)
    - `endDate`: End date in YYYY-MM-DD format (optional)

- **Get All Stocks By Date Range**: `GET {{baseUrl}}/api/stocks/filter?startDate=2023-01-01&endDate=2023-12-31`
  - Retrieves all stocks filtered by date range
  - Parameters:
    - `startDate`: Start date in YYYY-MM-DD format (optional)
    - `endDate`: End date in YYYY-MM-DD format (optional)

- **Get Stocks By Date Range (Legacy)**: `GET {{baseUrl}}/api/stocks/date-range?startDate=01/01/2023&endDate=12/31/2023`
  - Retrieves stocks by date range using MM/DD/YYYY format
  - Parameters:
    - `startDate`: Start date in MM/DD/YYYY format (required)
    - `endDate`: End date in MM/DD/YYYY format (required)

- **Get Stock By ID**: `GET {{baseUrl}}/api/stocks/1`
  - Retrieves a specific stock by ID

- **Get Stocks By Ticker**: `GET {{baseUrl}}/api/stocks/ticker/AAPL`
  - Retrieves stocks by ticker symbol

### POST Endpoint

- **Create Stock**: `POST {{baseUrl}}/api/stocks`
  - Creates a new stock entry
  - Request body example:
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

### PUT Endpoint

- **Update Stock**: `PUT {{baseUrl}}/api/stocks/1`
  - Updates an existing stock
  - Request body example (partial update):
  ```json
  {
    "signal_score": 90,
    "sentiment_score": 80,
    "buy_price": "155.00"
  }
  ```

### DELETE Endpoint

- **Delete Stock**: `DELETE {{baseUrl}}/api/stocks/1`
  - Deletes a stock by ID

## Notes on Recently Added APIs

The following endpoints were recently added to the API:

1. **Get Highlighted Stocks By Date Range**: `GET {{baseUrl}}/api/stocks/highlighted/filter`
   - Filters highlighted stocks (sentiment_score > 60 AND signal_score > 80) by date range
   - Both startDate and endDate parameters are optional

2. **Get All Stocks By Date Range**: `GET {{baseUrl}}/api/stocks/filter`
   - Filters all stocks by date range
   - Both startDate and endDate parameters are optional

These new endpoints use the YYYY-MM-DD date format, unlike the legacy date-range endpoint which uses MM/DD/YYYY format.

## Customizing the Environment

If your API is running on a different host or port, you can update the `baseUrl` variable in the environment:

1. Click on the "Environment" dropdown in the top right corner
2. Select "Stock Analysis API Environment"
3. Edit the value of `baseUrl` (default is `http://localhost:3000`)
4. Click "Update"
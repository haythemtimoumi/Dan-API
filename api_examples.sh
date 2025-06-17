#!/bin/bash

# Stock Analysis API Examples
# This script demonstrates how to use the Stock Analysis API with curl commands
#
# To make this script executable, run:
# chmod +x api_examples.sh

# Set the base URL
BASE_URL="http://localhost:3000/api/stocks"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Stock Analysis API Examples${NC}"
echo "=================================="
echo ""

# Function to make API calls and display results
call_api() {
  local endpoint=$1
  local method=${2:-GET}
  local data=$3
  local description=$4

  echo -e "${GREEN}$description${NC}"
  echo "$ curl -X $method $BASE_URL$endpoint ${data:+"-d '$data'"} -H 'Content-Type: application/json'"
  
  if [ "$method" = "GET" ]; then
    curl -s -X $method "$BASE_URL$endpoint" | json_pp
  else
    curl -s -X $method "$BASE_URL$endpoint" -H "Content-Type: application/json" -d "$data" | json_pp
  fi
  
  echo ""
  echo "=================================="
  echo ""
}

# GET all stocks
call_api "" "GET" "" "Get all stocks"

# GET all stocks sorted by sentiment score
call_api "/sorted" "GET" "" "Get all stocks sorted by sentiment score"

# GET stocks with source
call_api "/with-source" "GET" "" "Get stocks with source (Magic Formula or Rule 1)"

# GET daily changes
call_api "/daily-changes" "GET" "" "Get daily changes in stocks"

# GET highlighted stocks
call_api "/highlighted" "GET" "" "Get highlighted stocks (sentiment_score > 60 AND signal_score > 80)"

# GET highlighted stocks by date range
call_api "/highlighted/filter?startDate=2023-01-01&endDate=2023-12-31" "GET" "" "Get highlighted stocks filtered by date range"

# GET all stocks by date range
call_api "/filter?startDate=2023-01-01&endDate=2023-12-31" "GET" "" "Get all stocks filtered by date range"

# GET stocks by date range (legacy format)
call_api "/date-range?startDate=01/01/2023&endDate=12/31/2023" "GET" "" "Get stocks by date range (MM/DD/YYYY format)"

# GET stock by ID
call_api "/1" "GET" "" "Get stock by ID"

# GET stocks by ticker
call_api "/ticker/AAPL" "GET" "" "Get stocks by ticker"

# POST create new stock
NEW_STOCK='{
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
}'
call_api "" "POST" "$NEW_STOCK" "Create new stock"

# PUT update stock
UPDATE_STOCK='{
  "signal_score": 90,
  "sentiment_score": 80,
  "buy_price": "155.00"
}'
call_api "/1" "PUT" "$UPDATE_STOCK" "Update stock"

# Note: DELETE is commented out to prevent accidental deletion
# Uncomment to test DELETE functionality
# call_api "/1" "DELETE" "" "Delete stock"

echo -e "${BLUE}All examples completed${NC}"
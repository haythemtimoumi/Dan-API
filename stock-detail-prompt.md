# Stock Detail View Frontend

Create a React-based frontend application that displays detailed information for a specific stock by ID from my Stock Analysis API. The application should have a clean, professional UI with responsive design.

## API Details

- **Base URL**: http://localhost:3000/api
- **Endpoint**: GET /stocks/:id
- **Response Format**:
```json
{
  "id": 123,
  "date": "2023-05-15T00:00:00.000Z",
  "ticker": "AAPL",
  "source": "Magic Formula",
  "pe": 25.6,
  "dividend": "0.88%",
  "cash_per_share": "$3.75",
  "current_ratio": 1.35,
  "signal_score": 85,
  "sentiment_score": 72,
  "screenshot": "https://example.com/screenshots/aapl.png",
  "guru": "Warren Buffett",
  "rule1_score": null,
  "moat_score": null,
  "management_score": null,
  "buy_price": "$145.00",
  "highlight": true
}
```

## Requirements

1. **Stock Detail Page**:
   - Create a page that displays all details for a stock when given its ID
   - Include a URL parameter for the stock ID (e.g., /stock/123)
   - Display a loading state while fetching data
   - Handle and display errors appropriately
   - Include a "Back to List" button

2. **UI Components**:
   - Header with stock ticker and name
   - Financial metrics section (PE, dividend, cash per share, current ratio)
   - Score visualization (signal score and sentiment score) as gauges or charts
   - Source information with guru name if available
   - Rule 1 metrics section if applicable (rule1_score, moat_score, management_score)
   - Visual indicator for "highlighted" stocks
   - Date of analysis
   - Screenshot display if available

3. **Technical Requirements**:
   - Use React with TypeScript
   - Implement responsive design (mobile, tablet, desktop)
   - Use a modern UI library (Material UI, Chakra UI, or similar)
   - Implement proper error handling
   - Add loading states
   - Use React Router for navigation
   - Implement proper TypeScript interfaces for the stock data

4. **Additional Features**:
   - Add a feature to view stock history using the /stocks/:id/history endpoint
   - Include a chart to visualize changes in sentiment and signal scores over time
   - Add a "Compare" feature that allows comparing metrics with another stock

## Deliverables

1. A complete React application with TypeScript
2. Responsive UI that works on mobile, tablet, and desktop
3. Clear documentation on how to run and use the application
4. Unit tests for key components

## Design Guidelines

- Use a clean, financial-focused design
- Color scheme should be professional (blues, grays, with accent colors for indicators)
- Use charts and visualizations where appropriate
- Ensure accessibility compliance
- Provide clear visual hierarchy of information
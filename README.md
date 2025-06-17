# Stock Analysis API

This project is a RESTful API for managing and analyzing stock data, built with Express.js and TypeScript.

The Stock Analysis API provides a robust backend for storing, retrieving, and analyzing stock data. It offers various endpoints for managing stock information, including creating new stock entries, updating existing ones, and fetching stocks based on different criteria. The API also includes features for daily stock changes analysis and source-based stock categorization.

Key features include:
- CRUD operations for stock data
- Sorting and filtering capabilities
- Daily stock changes tracking
- Stock categorization based on analysis source
- PostgreSQL database integration
- Error handling and request logging
- Health check endpoint for monitoring

## Repository Structure

```
.
├── package.json
├── README.md
├── src
│   ├── config
│   │   └── db.ts
│   ├── controllers
│   │   └── stockAnalysisController.ts
│   ├── index.ts
│   ├── middleware
│   │   ├── errorHandler.ts
│   │   └── requestLogger.ts
│   ├── models
│   │   └── StockAnalysis.ts
│   └── routes
│       └── stockRoutes.ts
└── tsconfig.json
```

Key Files:
- `src/index.ts`: Entry point of the application
- `src/config/db.ts`: Database configuration and connection setup
- `src/controllers/stockAnalysisController.ts`: Contains the logic for handling stock-related requests
- `src/models/StockAnalysis.ts`: Defines the data model and database operations for stock analysis
- `src/routes/stockRoutes.ts`: Defines the API routes for stock-related operations
- `package.json`: Project metadata and dependencies
- `tsconfig.json`: TypeScript compiler configuration

## Usage Instructions

### Installation

Prerequisites:
- Node.js (v14 or later)
- npm (v6 or later)
- PostgreSQL (v12 or later)

Steps:
1. Clone the repository
2. Navigate to the project directory
3. Install dependencies:
   ```
   npm install
   ```
4. Create a `.env` file in the root directory with the following variables:
   ```
   PORT=3000
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=your_database_name
   DB_USER=your_database_user
   DB_PASSWORD=your_database_password
   ```
5. Build the project:
   ```
   npm run build
   ```

### Postman Collection

This repository includes Postman collection files to help you test the API:

- `postman_collection.json`: Contains all API endpoints for testing
- `postman_environment.json`: Contains environment variables like baseUrl
- `POSTMAN_README.md`: Detailed instructions for using the Postman collection

To use the Postman collection:
1. Import `postman_collection.json` and `postman_environment.json` into Postman
2. Select the "Stock Analysis API Environment" from the environment dropdown
3. Start testing the API endpoints

For more details, see the [Postman README](./POSTMAN_README.md).

### API Examples

The repository also includes a bash script with curl examples for testing the API:

- `api_examples.sh`: Contains curl commands for all API endpoints

To use the script:
1. Make it executable: `chmod +x api_examples.sh`
2. Run it: `./api_examples.sh`

This script provides practical examples of how to interact with the API using curl commands.

### Getting Started

To start the server:

```
npm start
```

The server will start on the port specified in the `.env` file (default: 3000).

### API Endpoints

- `GET /api/stocks`: Retrieve all stocks
- `GET /api/stocks/sorted`: Retrieve all stocks sorted by sentiment score
- `GET /api/stocks/with-source`: Retrieve stocks with their analysis source
- `GET /api/stocks/daily-changes`: Get daily changes in stocks
- `GET /api/stocks/highlighted`: Retrieve stocks with sentiment_score > 60 AND signal_score > 80
- `GET /api/stocks/:id`: Retrieve a specific stock by ID
- `GET /api/stocks/ticker/:ticker`: Retrieve stocks by ticker symbol
- `POST /api/stocks`: Create a new stock entry
- `PUT /api/stocks/:id`: Update an existing stock
- `DELETE /api/stocks/:id`: Delete a stock

### Configuration Options

The application can be configured using environment variables. Key configuration options include:

- `PORT`: The port on which the server will run
- `DB_HOST`: PostgreSQL database host
- `DB_PORT`: PostgreSQL database port
- `DB_NAME`: PostgreSQL database name
- `DB_USER`: PostgreSQL database user
- `DB_PASSWORD`: PostgreSQL database password

### Testing & Quality

To run tests (if implemented):

```
npm test
```

### Troubleshooting

Common issues and solutions:

1. Database Connection Failure
   - Problem: Server fails to start due to database connection issues
   - Error message: "Failed to connect to database. Server will not start."
   - Diagnostic steps:
     1. Check if PostgreSQL is running
     2. Verify database credentials in `.env` file
     3. Ensure the specified database exists
   - Solution: Correct the database configuration in the `.env` file or create the required database

2. TypeScript Compilation Errors
   - Problem: Build fails due to TypeScript errors
   - Error message: Various TypeScript compilation errors
   - Diagnostic steps:
     1. Run `npm run build` to see detailed error messages
     2. Check the problematic files mentioned in the error output
   - Solution: Fix the TypeScript errors in the mentioned files

3. Route Order Issues
   - Problem: Specific routes like `/stocks/highlighted` being matched to `/:id` pattern
   - Error message: "Invalid ID format" when accessing `/stocks/highlighted`
   - Diagnostic steps:
     1. Check the order of route definitions in `stockRoutes.ts`
     2. Ensure specific routes are defined before parameterized routes
   - Solution: Reorder routes so that specific routes like `/stocks/highlighted` are defined before parameterized routes like `/:id`

### Recent Changes

#### Added Highlighted Stocks Feature (2023-05-15)
- Added new endpoint: `GET /api/stocks/highlighted`
- Returns stocks with sentiment_score > 60 AND signal_score > 80
- Fixed route ordering to ensure `/stocks/highlighted` is matched correctly
- Added unit tests for the new functionality

### Debugging

To enable debug mode:

1. Set the `DEBUG` environment variable:
   ```
   DEBUG=stocks-api:* npm start
   ```
2. This will output detailed debug information to the console

Log files are typically stored in the project root directory with names like `npm-debug.log*` or `yarn-debug.log*`.

## Data Flow

The Stock Analysis API follows a typical request-response cycle:

1. Client sends a request to a specific endpoint
2. The request is logged by the `requestLogger` middleware
3. The appropriate route handler in `stockRoutes.ts` processes the request
4. The route handler calls the corresponding controller function in `stockAnalysisController.ts`
5. The controller function interacts with the `StockAnalysisModel` to perform database operations
6. The model executes SQL queries using the PostgreSQL connection pool
7. The query results are processed and sent back through the controller to the client
8. If any errors occur, they are caught and processed by the `errorHandler` middleware

```
Client Request -> requestLogger -> Route Handler -> Controller -> Model -> Database
           ^                                                                  |
           |                                                                  |
           Response <- errorHandler <- Controller <- Model <- Query Results <-+
```

Note: The application uses a connection pool for efficient database interactions, and all database operations are performed asynchronously to prevent blocking the event loop.
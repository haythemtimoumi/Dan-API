import request from 'supertest';
import express from 'express';
import stockRoutes from '../src/routes/stockRoutes';
import * as stockController from '../src/controllers/stockAnalysisController';

// Mock the controller functions
jest.mock('../src/controllers/stockAnalysisController');

const app = express();
app.use('/api/stocks', stockRoutes);

describe('Stock Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/stocks/highlighted', () => {
    it('should call getHighlightedStocks controller', async () => {
      // Mock implementation
      const mockGetHighlightedStocks = stockController.getHighlightedStocks as jest.Mock;
      mockGetHighlightedStocks.mockImplementation((req, res) => {
        res.status(200).json([
          { 
            id: 1, 
            ticker: 'AAPL', 
            sentiment_score: 75, 
            signal_score: 85 
          },
          { 
            id: 2, 
            ticker: 'MSFT', 
            sentiment_score: 70, 
            signal_score: 90 
          }
        ]);
      });

      // Make request
      const response = await request(app).get('/api/stocks/highlighted');
      
      // Assertions
      expect(response.status).toBe(200);
      expect(mockGetHighlightedStocks).toHaveBeenCalled();
      expect(response.body).toHaveLength(2);
      expect(response.body[0].ticker).toBe('AAPL');
      expect(response.body[1].ticker).toBe('MSFT');
    });
  });

  describe('GET /api/stocks/highlighted/filter', () => {
    it('should call getHighlightedStocksByDateRange controller with date parameters', async () => {
      // Mock implementation
      const mockGetHighlightedStocksByDateRange = stockController.getHighlightedStocksByDateRange as jest.Mock;
      mockGetHighlightedStocksByDateRange.mockImplementation((req, res) => {
        const { startDate, endDate } = req.query;
        res.status(200).json([
          { 
            id: 1, 
            ticker: 'AAPL',
            date: '2025-06-08T00:00:00.000Z',
            sentiment_score: 75, 
            signal_score: 85 
          }
        ]);
      });

      // Make request with date parameters
      const response = await request(app)
        .get('/api/stocks/highlighted/filter')
        .query({ startDate: '2025-06-07', endDate: '2025-06-10' });
      
      // Assertions
      expect(response.status).toBe(200);
      expect(mockGetHighlightedStocksByDateRange).toHaveBeenCalled();
      expect(mockGetHighlightedStocksByDateRange.mock.calls[0][0].query).toEqual({
        startDate: '2025-06-07',
        endDate: '2025-06-10'
      });
      expect(response.body).toHaveLength(1);
      expect(response.body[0].ticker).toBe('AAPL');
    });

    it('should call getHighlightedStocksByDateRange controller without date parameters', async () => {
      // Mock implementation
      const mockGetHighlightedStocksByDateRange = stockController.getHighlightedStocksByDateRange as jest.Mock;
      mockGetHighlightedStocksByDateRange.mockImplementation((req, res) => {
        res.status(200).json([
          { 
            id: 1, 
            ticker: 'AAPL', 
            sentiment_score: 75, 
            signal_score: 85 
          },
          { 
            id: 2, 
            ticker: 'MSFT', 
            sentiment_score: 70, 
            signal_score: 90 
          }
        ]);
      });

      // Make request without date parameters
      const response = await request(app).get('/api/stocks/highlighted/filter');
      
      // Assertions
      expect(response.status).toBe(200);
      expect(mockGetHighlightedStocksByDateRange).toHaveBeenCalled();
      expect(response.body).toHaveLength(2);
    });
  });

  describe('GET /api/stocks/filter', () => {
    it('should call getAllStocksByDateRange controller with date parameters', async () => {
      // Mock implementation
      const mockGetAllStocksByDateRange = stockController.getAllStocksByDateRange as jest.Mock;
      mockGetAllStocksByDateRange.mockImplementation((req, res) => {
        const { startDate, endDate } = req.query;
        res.status(200).json([
          { 
            id: 1, 
            ticker: 'AAPL',
            date: '2025-06-08T00:00:00.000Z'
          },
          {
            id: 3,
            ticker: 'GOOGL',
            date: '2025-06-09T00:00:00.000Z'
          }
        ]);
      });

      // Make request with date parameters
      const response = await request(app)
        .get('/api/stocks/filter')
        .query({ startDate: '2025-06-07', endDate: '2025-06-10' });
      
      // Assertions
      expect(response.status).toBe(200);
      expect(mockGetAllStocksByDateRange).toHaveBeenCalled();
      expect(mockGetAllStocksByDateRange.mock.calls[0][0].query).toEqual({
        startDate: '2025-06-07',
        endDate: '2025-06-10'
      });
      expect(response.body).toHaveLength(2);
    });

    it('should call getAllStocksByDateRange controller without date parameters', async () => {
      // Mock implementation
      const mockGetAllStocksByDateRange = stockController.getAllStocksByDateRange as jest.Mock;
      mockGetAllStocksByDateRange.mockImplementation((req, res) => {
        res.status(200).json([
          { id: 1, ticker: 'AAPL' },
          { id: 2, ticker: 'MSFT' },
          { id: 3, ticker: 'GOOGL' }
        ]);
      });

      // Make request without date parameters
      const response = await request(app).get('/api/stocks/filter');
      
      // Assertions
      expect(response.status).toBe(200);
      expect(mockGetAllStocksByDateRange).toHaveBeenCalled();
      expect(response.body).toHaveLength(3);
    });
  });

  describe('GET /api/stocks/filter-by-date-source', () => {
    it('should call getStocksByDateAndSource controller with valid parameters', async () => {
      // Mock implementation
      const mockGetStocksByDateAndSource = stockController.getStocksByDateAndSource as jest.Mock;
      mockGetStocksByDateAndSource.mockImplementation((req, res) => {
        const { date, source } = req.query;
        res.status(200).json([
          { 
            id: 1, 
            ticker: 'AAPL',
            date: '2023-06-15T00:00:00.000Z',
            source: 'Magic Formula',
            sentiment_score: 75,
            signal_score: 85
          },
          { 
            id: 2, 
            ticker: 'MSFT',
            date: '2023-06-15T00:00:00.000Z',
            source: 'Magic Formula',
            sentiment_score: 70,
            signal_score: 82
          }
        ]);
      });

      // Make request with valid parameters
      const response = await request(app)
        .get('/api/stocks/filter-by-date-source')
        .query({ date: '06/15/2023', source: 'Magic Formula' });
      
      // Assertions
      expect(response.status).toBe(200);
      expect(mockGetStocksByDateAndSource).toHaveBeenCalled();
      expect(mockGetStocksByDateAndSource.mock.calls[0][0].query).toEqual({
        date: '06/15/2023',
        source: 'Magic Formula'
      });
      expect(response.body).toHaveLength(2);
      expect(response.body[0].ticker).toBe('AAPL');
      expect(response.body[0].source).toBe('Magic Formula');
    });

    it('should return 400 when date parameter is missing', async () => {
      // Mock implementation
      const mockGetStocksByDateAndSource = stockController.getStocksByDateAndSource as jest.Mock;
      mockGetStocksByDateAndSource.mockImplementation((req, res) => {
        res.status(400).json({ message: 'Both date and source parameters are required' });
      });

      // Make request with missing date parameter
      const response = await request(app)
        .get('/api/stocks/filter-by-date-source')
        .query({ source: 'Magic Formula' });
      
      // Assertions
      expect(response.status).toBe(400);
      expect(mockGetStocksByDateAndSource).toHaveBeenCalled();
      expect(response.body.message).toBe('Both date and source parameters are required');
    });

    it('should return 400 when source parameter is missing', async () => {
      // Mock implementation
      const mockGetStocksByDateAndSource = stockController.getStocksByDateAndSource as jest.Mock;
      mockGetStocksByDateAndSource.mockImplementation((req, res) => {
        res.status(400).json({ message: 'Both date and source parameters are required' });
      });

      // Make request with missing source parameter
      const response = await request(app)
        .get('/api/stocks/filter-by-date-source')
        .query({ date: '06/15/2023' });
      
      // Assertions
      expect(response.status).toBe(400);
      expect(mockGetStocksByDateAndSource).toHaveBeenCalled();
      expect(response.body.message).toBe('Both date and source parameters are required');
    });

    it('should return 400 when date format is invalid', async () => {
      // Mock implementation
      const mockGetStocksByDateAndSource = stockController.getStocksByDateAndSource as jest.Mock;
      mockGetStocksByDateAndSource.mockImplementation((req, res) => {
        res.status(400).json({ message: 'Date must be in MM/DD/YYYY format' });
      });

      // Make request with invalid date format
      const response = await request(app)
        .get('/api/stocks/filter-by-date-source')
        .query({ date: '2023-06-15', source: 'Magic Formula' });
      
      // Assertions
      expect(response.status).toBe(400);
      expect(mockGetStocksByDateAndSource).toHaveBeenCalled();
      expect(response.body.message).toBe('Date must be in MM/DD/YYYY format');
    });

    it('should return 500 when server error occurs', async () => {
      // Mock implementation
      const mockGetStocksByDateAndSource = stockController.getStocksByDateAndSource as jest.Mock;
      mockGetStocksByDateAndSource.mockImplementation((req, res) => {
        res.status(500).json({ message: 'Failed to fetch stocks by date and source' });
      });

      // Make request
      const response = await request(app)
        .get('/api/stocks/filter-by-date-source')
        .query({ date: '06/15/2023', source: 'Magic Formula' });
      
      // Assertions
      expect(response.status).toBe(500);
      expect(mockGetStocksByDateAndSource).toHaveBeenCalled();
      expect(response.body.message).toBe('Failed to fetch stocks by date and source');
    });
  });

  describe('GET /api/stocks/:id', () => {
    it('should call getStockById controller with valid ID', async () => {
      // Mock implementation
      const mockGetStockById = stockController.getStockById as jest.Mock;
      mockGetStockById.mockImplementation((req, res) => {
        const id = parseInt(req.params.id);
        res.status(200).json({
          id: id,
          ticker: 'AAPL',
          date: '2023-05-15T00:00:00.000Z',
          source: 'Magic Formula',
          pe: 25.6,
          dividend: '0.92%',
          cash_per_share: '3.75',
          current_ratio: 1.2,
          signal_score: 85,
          sentiment_score: 75
        });
      });

      // Make request
      const response = await request(app).get('/api/stocks/1');
      
      // Assertions
      expect(response.status).toBe(200);
      expect(mockGetStockById).toHaveBeenCalled();
      expect(response.body.id).toBe(1);
      expect(response.body.ticker).toBe('AAPL');
    });

    it('should return 404 when stock is not found', async () => {
      // Mock implementation for not found
      const mockGetStockById = stockController.getStockById as jest.Mock;
      mockGetStockById.mockImplementation((req, res) => {
        res.status(404).json({ message: 'Stock not found' });
      });

      // Make request
      const response = await request(app).get('/api/stocks/999');
      
      // Assertions
      expect(response.status).toBe(404);
      expect(mockGetStockById).toHaveBeenCalled();
      expect(response.body.message).toBe('Stock not found');
    });

    it('should return 400 for invalid ID format', async () => {
      // Mock implementation for invalid ID
      const mockGetStockById = stockController.getStockById as jest.Mock;
      mockGetStockById.mockImplementation((req, res) => {
        res.status(400).json({ message: 'Invalid ID format' });
      });

      // Make request with non-numeric ID
      const response = await request(app).get('/api/stocks/abc');
      
      // Assertions
      expect(response.status).toBe(400);
      expect(mockGetStockById).toHaveBeenCalled();
      expect(response.body.message).toBe('Invalid ID format');
    });
  });

  describe('Route Order', () => {
    it('should match /stocks/highlighted before /stocks/:id', async () => {
      // Mock implementations
      const mockGetHighlightedStocks = stockController.getHighlightedStocks as jest.Mock;
      mockGetHighlightedStocks.mockImplementation((req, res) => {
        res.status(200).json({ route: 'highlighted' });
      });

      const mockGetStockById = stockController.getStockById as jest.Mock;
      mockGetStockById.mockImplementation((req, res) => {
        res.status(200).json({ route: 'id', id: req.params.id });
      });

      // Test highlighted route
      const highlightedResponse = await request(app).get('/api/stocks/highlighted');
      expect(highlightedResponse.status).toBe(200);
      expect(highlightedResponse.body).toEqual({ route: 'highlighted' });
      expect(mockGetHighlightedStocks).toHaveBeenCalled();
      expect(mockGetStockById).not.toHaveBeenCalled();

      // Reset mocks
      jest.clearAllMocks();

      // Test id route with a numeric id
      const idResponse = await request(app).get('/api/stocks/123');
      expect(idResponse.status).toBe(200);
      expect(idResponse.body).toEqual({ route: 'id', id: '123' });
      expect(mockGetStockById).toHaveBeenCalled();
      expect(mockGetHighlightedStocks).not.toHaveBeenCalled();
    });
  });

  describe('GET /api/stocks/recent-changes', () => {
    it('should call getRecentChanges controller with valid parameters', async () => {
      // Mock implementation
      const mockGetRecentChanges = stockController.getRecentChanges as jest.Mock;
      mockGetRecentChanges.mockImplementation((req, res) => {
        const { metric, start_date, end_date, threshold, ticker, source, guru } = req.query;
        res.status(200).json([
          { 
            ticker: 'AAPL',
            source: 'Magic Formula',
            guru: 'Warren Buffett',
            metric: metric,
            start_value: 25.6,
            end_value: 28.2,
            change_percent: 10.16
          },
          { 
            ticker: 'MSFT',
            source: 'Magic Formula',
            guru: null,
            metric: metric,
            start_value: 30.1,
            end_value: 32.5,
            change_percent: 7.97
          }
        ]);
      });

      // Make request with valid parameters
      const response = await request(app)
        .get('/api/stocks/recent-changes')
        .query({ 
          metric: 'pe', 
          start_date: '2023-01-01', 
          end_date: '2023-12-31',
          threshold: '5',
          ticker: 'AAPL'
        });
      
      // Assertions
      expect(response.status).toBe(200);
      expect(mockGetRecentChanges).toHaveBeenCalled();
      expect(mockGetRecentChanges.mock.calls[0][0].query).toEqual({
        metric: 'pe',
        start_date: '2023-01-01',
        end_date: '2023-12-31',
        threshold: '5',
        ticker: 'AAPL'
      });
      expect(response.body).toHaveLength(2);
      expect(response.body[0].ticker).toBe('AAPL');
      expect(response.body[0].metric).toBe('pe');
      expect(response.body[0].change_percent).toBe(10.16);
      expect(response.body[0].change).toBe(10.16);
    });

    it('should return 400 when metric parameter is missing', async () => {
      // Mock implementation
      const mockGetRecentChanges = stockController.getRecentChanges as jest.Mock;
      mockGetRecentChanges.mockImplementation((req, res) => {
        res.status(400).json({ message: 'metric parameter is required' });
      });

      // Make request with missing metric parameter
      const response = await request(app)
        .get('/api/stocks/recent-changes')
        .query({ 
          start_date: '2023-01-01', 
          end_date: '2023-12-31'
        });
      
      // Assertions
      expect(response.status).toBe(400);
      expect(mockGetRecentChanges).toHaveBeenCalled();
      expect(response.body.message).toBe('metric parameter is required');
    });

    it('should return 400 when start_date parameter is missing', async () => {
      // Mock implementation
      const mockGetRecentChanges = stockController.getRecentChanges as jest.Mock;
      mockGetRecentChanges.mockImplementation((req, res) => {
        res.status(400).json({ message: 'start_date parameter is required' });
      });

      // Make request with missing start_date parameter
      const response = await request(app)
        .get('/api/stocks/recent-changes')
        .query({ 
          metric: 'pe',
          end_date: '2023-12-31'
        });
      
      // Assertions
      expect(response.status).toBe(400);
      expect(mockGetRecentChanges).toHaveBeenCalled();
      expect(response.body.message).toBe('start_date parameter is required');
    });

    it('should return 400 when end_date parameter is missing', async () => {
      // Mock implementation
      const mockGetRecentChanges = stockController.getRecentChanges as jest.Mock;
      mockGetRecentChanges.mockImplementation((req, res) => {
        res.status(400).json({ message: 'end_date parameter is required' });
      });

      // Make request with missing end_date parameter
      const response = await request(app)
        .get('/api/stocks/recent-changes')
        .query({ 
          metric: 'pe',
          start_date: '2023-01-01'
        });
      
      // Assertions
      expect(response.status).toBe(400);
      expect(mockGetRecentChanges).toHaveBeenCalled();
      expect(response.body.message).toBe('end_date parameter is required');
    });

    it('should return 400 when metric is invalid', async () => {
      // Mock implementation
      const mockGetRecentChanges = stockController.getRecentChanges as jest.Mock;
      mockGetRecentChanges.mockImplementation((req, res) => {
        res.status(400).json({ 
          message: 'Invalid metric: invalid_metric. Must be one of: pe, signal_score, sentiment_score, buy_price' 
        });
      });

      // Make request with invalid metric
      const response = await request(app)
        .get('/api/stocks/recent-changes')
        .query({ 
          metric: 'invalid_metric',
          start_date: '2023-01-01',
          end_date: '2023-12-31'
        });
      
      // Assertions
      expect(response.status).toBe(400);
      expect(mockGetRecentChanges).toHaveBeenCalled();
      expect(response.body.message).toContain('Invalid metric');
    });

    it('should return 400 when date format is invalid', async () => {
      // Mock implementation
      const mockGetRecentChanges = stockController.getRecentChanges as jest.Mock;
      mockGetRecentChanges.mockImplementation((req, res) => {
        res.status(400).json({ message: 'Dates must be in YYYY-MM-DD format' });
      });

      // Make request with invalid date format
      const response = await request(app)
        .get('/api/stocks/recent-changes')
        .query({ 
          metric: 'pe',
          start_date: '01/01/2023',
          end_date: '2023-12-31'
        });
      
      // Assertions
      expect(response.status).toBe(400);
      expect(mockGetRecentChanges).toHaveBeenCalled();
      expect(response.body.message).toBe('Dates must be in YYYY-MM-DD format');
    });

    it('should return 500 when server error occurs', async () => {
      // Mock implementation
      const mockGetRecentChanges = stockController.getRecentChanges as jest.Mock;
      mockGetRecentChanges.mockImplementation((req, res) => {
        res.status(500).json({ message: 'Failed to fetch recent changes' });
      });

      // Make request
      const response = await request(app)
        .get('/api/stocks/recent-changes')
        .query({ 
          metric: 'pe',
          start_date: '2023-01-01',
          end_date: '2023-12-31'
        });
      
      // Assertions
      expect(response.status).toBe(500);
      expect(mockGetRecentChanges).toHaveBeenCalled();
      expect(response.body.message).toBe('Failed to fetch recent changes');
    });
  });

  describe('GET /api/stocks/:id/history', () => {
    it('should call getStockHistory controller with valid ID', async () => {
      // Mock implementation
      const mockGetStockHistory = stockController.getStockHistory as jest.Mock;
      mockGetStockHistory.mockImplementation((req, res) => {
        const id = parseInt(req.params.id);
        res.status(200).json([
          {
            id: 15100,
            ticker: 'AAPL',
            source: 'Magic Formula',
            guru: 'Warren Buffett',
            date: '2023-01-15T00:00:00.000Z',
            sentiment_score: 70,
            signal_score: 82,
            pe: 24.5,
            buy_price: '145.00'
          },
          {
            id: 15289,
            ticker: 'AAPL',
            source: 'Magic Formula',
            guru: 'Warren Buffett',
            date: '2023-05-15T00:00:00.000Z',
            sentiment_score: 75,
            signal_score: 85,
            pe: 25.6,
            buy_price: '150.00'
          },
          {
            id: 15400,
            ticker: 'AAPL',
            source: 'Magic Formula',
            guru: 'Warren Buffett',
            date: '2023-09-15T00:00:00.000Z',
            sentiment_score: 78,
            signal_score: 88,
            pe: 26.2,
            buy_price: '155.00'
          }
        ]);
      });

      // Make request
      const response = await request(app).get('/api/stocks/15289/history');
      
      // Assertions
      expect(response.status).toBe(200);
      expect(mockGetStockHistory).toHaveBeenCalled();
      expect(response.body).toHaveLength(3);
      expect(response.body[0].ticker).toBe('AAPL');
      expect(response.body[0].source).toBe('Magic Formula');
      expect(response.body[0].guru).toBe('Warren Buffett');
      
      // Check that dates are in ascending order
      const dates = response.body.map((stock: any) => new Date(stock.date).getTime());
      const sortedDates = [...dates].sort((a, b) => a - b);
      expect(dates).toEqual(sortedDates);
    });

    it('should call getStockHistory controller with date filtering parameters', async () => {
      // Mock implementation
      const mockGetStockHistory = stockController.getStockHistory as jest.Mock;
      mockGetStockHistory.mockImplementation((req, res) => {
        const id = parseInt(req.params.id);
        const { from, to } = req.query;
        
        // Return filtered results based on query parameters
        res.status(200).json([
          {
            id: 15289,
            ticker: 'AAPL',
            source: 'Magic Formula',
            guru: 'Warren Buffett',
            date: '2023-05-15T00:00:00.000Z',
            sentiment_score: 75,
            signal_score: 85,
            pe: 25.6,
            buy_price: '150.00'
          }
        ]);
      });

      // Make request with date parameters
      const response = await request(app)
        .get('/api/stocks/15289/history')
        .query({ from: '2023-05-01', to: '2023-06-01' });
      
      // Assertions
      expect(response.status).toBe(200);
      expect(mockGetStockHistory).toHaveBeenCalled();
      expect(mockGetStockHistory.mock.calls[0][0].query).toEqual({
        from: '2023-05-01',
        to: '2023-06-01'
      });
      expect(response.body).toHaveLength(1);
      expect(response.body[0].ticker).toBe('AAPL');
      expect(response.body[0].date).toBe('2023-05-15T00:00:00.000Z');
    });

    it('should call getStockHistory controller with only from parameter', async () => {
      // Mock implementation
      const mockGetStockHistory = stockController.getStockHistory as jest.Mock;
      mockGetStockHistory.mockImplementation((req, res) => {
        const id = parseInt(req.params.id);
        const { from } = req.query;
        
        // Return filtered results based on query parameters
        res.status(200).json([
          {
            id: 15289,
            ticker: 'AAPL',
            source: 'Magic Formula',
            guru: 'Warren Buffett',
            date: '2023-05-15T00:00:00.000Z',
            sentiment_score: 75,
            signal_score: 85
          },
          {
            id: 15400,
            ticker: 'AAPL',
            source: 'Magic Formula',
            guru: 'Warren Buffett',
            date: '2023-09-15T00:00:00.000Z',
            sentiment_score: 78,
            signal_score: 88
          }
        ]);
      });

      // Make request with only from parameter
      const response = await request(app)
        .get('/api/stocks/15289/history')
        .query({ from: '2023-05-01' });
      
      // Assertions
      expect(response.status).toBe(200);
      expect(mockGetStockHistory).toHaveBeenCalled();
      expect(mockGetStockHistory.mock.calls[0][0].query).toEqual({
        from: '2023-05-01'
      });
      expect(response.body).toHaveLength(2);
    });

    it('should call getStockHistory controller with only to parameter', async () => {
      // Mock implementation
      const mockGetStockHistory = stockController.getStockHistory as jest.Mock;
      mockGetStockHistory.mockImplementation((req, res) => {
        const id = parseInt(req.params.id);
        const { to } = req.query;
        
        // Return filtered results based on query parameters
        res.status(200).json([
          {
            id: 15100,
            ticker: 'AAPL',
            source: 'Magic Formula',
            guru: 'Warren Buffett',
            date: '2023-01-15T00:00:00.000Z',
            sentiment_score: 70,
            signal_score: 82
          },
          {
            id: 15289,
            ticker: 'AAPL',
            source: 'Magic Formula',
            guru: 'Warren Buffett',
            date: '2023-05-15T00:00:00.000Z',
            sentiment_score: 75,
            signal_score: 85
          }
        ]);
      });

      // Make request with only to parameter
      const response = await request(app)
        .get('/api/stocks/15289/history')
        .query({ to: '2023-06-01' });
      
      // Assertions
      expect(response.status).toBe(200);
      expect(mockGetStockHistory).toHaveBeenCalled();
      expect(mockGetStockHistory.mock.calls[0][0].query).toEqual({
        to: '2023-06-01'
      });
      expect(response.body).toHaveLength(2);
    });

    it('should return 404 when stock is not found', async () => {
      // Mock implementation for not found
      const mockGetStockHistory = stockController.getStockHistory as jest.Mock;
      mockGetStockHistory.mockImplementation((req, res) => {
        res.status(404).json({ message: 'Stock not found' });
      });

      // Make request
      const response = await request(app).get('/api/stocks/999/history');
      
      // Assertions
      expect(response.status).toBe(404);
      expect(mockGetStockHistory).toHaveBeenCalled();
      expect(response.body.message).toBe('Stock not found');
    });
    
    it('should return 404 when no history is available', async () => {
      // Mock implementation for no history
      const mockGetStockHistory = stockController.getStockHistory as jest.Mock;
      mockGetStockHistory.mockImplementation((req, res) => {
        res.status(404).json({ message: 'No history available for this stock' });
      });

      // Make request
      const response = await request(app).get('/api/stocks/888/history');
      
      // Assertions
      expect(response.status).toBe(404);
      expect(mockGetStockHistory).toHaveBeenCalled();
      expect(response.body.message).toBe('No history available for this stock');
    });

    it('should return 400 for invalid ID format', async () => {
      // Mock implementation for invalid ID
      const mockGetStockHistory = stockController.getStockHistory as jest.Mock;
      mockGetStockHistory.mockImplementation((req, res) => {
        res.status(400).json({ message: 'Invalid ID format' });
      });

      // Make request with non-numeric ID
      const response = await request(app).get('/api/stocks/abc/history');
      
      // Assertions
      expect(response.status).toBe(400);
      expect(mockGetStockHistory).toHaveBeenCalled();
      expect(response.body.message).toBe('Invalid ID format');
    });
  });
});
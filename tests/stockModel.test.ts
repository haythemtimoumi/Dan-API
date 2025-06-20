import { StockAnalysisModel } from '../src/models/StockAnalysis';
import { pool } from '../src/config/db';

// Mock the database pool
jest.mock('../src/config/db', () => ({
  pool: {
    query: jest.fn()
  }
}));

describe('StockAnalysisModel', () => {
  let stockModel: StockAnalysisModel;
  const mockPool = pool as jest.Mocked<typeof pool>;

  beforeEach(() => {
    stockModel = new StockAnalysisModel();
    jest.clearAllMocks();
  });
  
  describe('getById', () => {
    it('should return a stock by ID when it exists', async () => {
      // Mock data
      const mockStock = {
        id: 1,
        ticker: 'AAPL',
        date: '2023-05-15T00:00:00.000Z',
        source: 'Magic Formula',
        pe: 25.6,
        dividend: '0.92%',
        cash_per_share: '3.75',
        current_ratio: 1.2,
        signal_score: 85,
        sentiment_score: 75
      };

      // Mock the query response
      mockPool.query.mockResolvedValue({ rows: [mockStock] });

      // Call the method
      const result = await stockModel.getById(1);

      // Assertions
      expect(mockPool.query).toHaveBeenCalledWith(
        'SELECT * FROM stock_analysis WHERE id = $1',
        [1]
      );
      expect(result).toEqual(mockStock);
    });

    it('should return null when stock with ID does not exist', async () => {
      // Mock empty response
      mockPool.query.mockResolvedValue({ rows: [] });

      // Call the method
      const result = await stockModel.getById(999);

      // Assertions
      expect(mockPool.query).toHaveBeenCalledWith(
        'SELECT * FROM stock_analysis WHERE id = $1',
        [999]
      );
      expect(result).toBeNull();
    });
  });

  describe('getHighlightedStocks', () => {
    it('should return stocks with sentiment_score > 60 and signal_score > 80', async () => {
      // Mock data
      const mockStocks = [
        { id: 1, ticker: 'AAPL', sentiment_score: 75, signal_score: 85 },
        { id: 2, ticker: 'MSFT', sentiment_score: 70, signal_score: 90 }
      ];

      // Mock the query response
      mockPool.query.mockResolvedValue({ rows: mockStocks });

      // Call the method
      const result = await stockModel.getHighlightedStocks();

      // Assertions
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('WHERE sentiment_score > 60 AND signal_score > 80'),
        []
      );
      expect(result).toEqual(mockStocks);
      expect(result).toHaveLength(2);
    });

    it('should handle empty results', async () => {
      // Mock empty response
      mockPool.query.mockResolvedValue({ rows: [] });

      // Call the method
      const result = await stockModel.getHighlightedStocks();

      // Assertions
      expect(mockPool.query).toHaveBeenCalled();
      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });
  });

  describe('getHighlightedStocksByDateRange', () => {
    it('should return highlighted stocks filtered by date range when both dates are provided', async () => {
      // Mock data
      const mockStocks = [
        { 
          id: 1, 
          ticker: 'AAPL', 
          date: '2025-06-08T00:00:00.000Z',
          sentiment_score: 75, 
          signal_score: 85 
        }
      ];

      // Mock the query response
      mockPool.query.mockResolvedValue({ rows: mockStocks });

      // Call the method with both dates
      const result = await stockModel.getHighlightedStocksByDateRange('2025-06-07', '2025-06-10');

      // Assertions
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('WHERE sentiment_score > 60 AND signal_score > 80 AND date >= $1 AND date <= $2'),
        ['2025-06-07', '2025-06-10']
      );
      expect(result).toEqual(mockStocks);
      expect(result).toHaveLength(1);
    });

    it('should return highlighted stocks filtered by start date only', async () => {
      // Mock data
      const mockStocks = [
        { 
          id: 1, 
          ticker: 'AAPL', 
          date: '2025-06-08T00:00:00.000Z',
          sentiment_score: 75, 
          signal_score: 85 
        }
      ];

      // Mock the query response
      mockPool.query.mockResolvedValue({ rows: mockStocks });

      // Call the method with only start date
      const result = await stockModel.getHighlightedStocksByDateRange('2025-06-07');

      // Assertions
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('WHERE sentiment_score > 60 AND signal_score > 80 AND date >= $1'),
        ['2025-06-07']
      );
      expect(result).toEqual(mockStocks);
    });

    it('should return highlighted stocks filtered by end date only', async () => {
      // Mock data
      const mockStocks = [
        { 
          id: 1, 
          ticker: 'AAPL', 
          date: '2025-06-08T00:00:00.000Z',
          sentiment_score: 75, 
          signal_score: 85 
        }
      ];

      // Mock the query response
      mockPool.query.mockResolvedValue({ rows: mockStocks });

      // Call the method with only end date
      const result = await stockModel.getHighlightedStocksByDateRange(undefined, '2025-06-10');

      // Assertions
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('WHERE sentiment_score > 60 AND signal_score > 80 AND date <= $1'),
        ['2025-06-10']
      );
      expect(result).toEqual(mockStocks);
    });

    it('should return all highlighted stocks when no dates are provided', async () => {
      // Mock data
      const mockStocks = [
        { id: 1, ticker: 'AAPL', sentiment_score: 75, signal_score: 85 },
        { id: 2, ticker: 'MSFT', sentiment_score: 70, signal_score: 90 }
      ];

      // Mock the query response
      mockPool.query.mockResolvedValue({ rows: mockStocks });

      // Call the method without dates
      const result = await stockModel.getHighlightedStocksByDateRange();

      // Assertions
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('WHERE sentiment_score > 60 AND signal_score > 80'),
        []
      );
      expect(result).toEqual(mockStocks);
      expect(result).toHaveLength(2);
    });
  });

  describe('getAllStocksByDateRange', () => {
    it('should return all stocks filtered by date range when both dates are provided', async () => {
      // Mock data
      const mockStocks = [
        { id: 1, ticker: 'AAPL', date: '2025-06-08T00:00:00.000Z' },
        { id: 3, ticker: 'GOOGL', date: '2025-06-09T00:00:00.000Z' }
      ];

      // Mock the query response
      mockPool.query.mockResolvedValue({ rows: mockStocks });

      // Call the method with both dates
      const result = await stockModel.getAllStocksByDateRange('2025-06-07', '2025-06-10');

      // Assertions
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('WHERE date >= $1 AND date <= $2'),
        ['2025-06-07', '2025-06-10']
      );
      expect(result).toEqual(mockStocks);
      expect(result).toHaveLength(2);
    });

    it('should return all stocks filtered by start date only', async () => {
      // Mock data
      const mockStocks = [
        { id: 1, ticker: 'AAPL', date: '2025-06-08T00:00:00.000Z' },
        { id: 3, ticker: 'GOOGL', date: '2025-06-09T00:00:00.000Z' }
      ];

      // Mock the query response
      mockPool.query.mockResolvedValue({ rows: mockStocks });

      // Call the method with only start date
      const result = await stockModel.getAllStocksByDateRange('2025-06-07');

      // Assertions
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('WHERE date >= $1'),
        ['2025-06-07']
      );
      expect(result).toEqual(mockStocks);
    });

    it('should return all stocks filtered by end date only', async () => {
      // Mock data
      const mockStocks = [
        { id: 1, ticker: 'AAPL', date: '2025-06-08T00:00:00.000Z' }
      ];

      // Mock the query response
      mockPool.query.mockResolvedValue({ rows: mockStocks });

      // Call the method with only end date
      const result = await stockModel.getAllStocksByDateRange(undefined, '2025-06-10');

      // Assertions
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('WHERE date <= $1'),
        ['2025-06-10']
      );
      expect(result).toEqual(mockStocks);
    });

    it('should return all stocks when no dates are provided', async () => {
      // Mock data
      const mockStocks = [
        { id: 1, ticker: 'AAPL' },
        { id: 2, ticker: 'MSFT' },
        { id: 3, ticker: 'GOOGL' }
      ];

      // Mock the query response
      mockPool.query.mockResolvedValue({ rows: mockStocks });

      // Call the method without dates
      const result = await stockModel.getAllStocksByDateRange();

      // Assertions
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.not.stringContaining('WHERE'),
        []
      );
      expect(result).toEqual(mockStocks);
      expect(result).toHaveLength(3);
    });
  });

  describe('getRecentChanges', () => {
    it('should return stocks with significant changes in the specified metric', async () => {
      // Mock data
      const mockChanges = [
        { 
          ticker: 'AAPL',
          source: 'Magic Formula',
          guru: 'Warren Buffett',
          metric: 'pe',
          start_value: 25.6,
          end_value: 28.2,
          change: 10.16
        },
        { 
          ticker: 'MSFT',
          source: 'Magic Formula',
          guru: null,
          metric: 'pe',
          start_value: 30.1,
          end_value: 32.5,
          change: 7.97
        }
      ];

      // Mock the query response
      mockPool.query.mockResolvedValue({ rows: mockChanges });

      // Call the method
      const result = await stockModel.getRecentChanges(
        'pe', 
        '2023-01-01', 
        '2023-12-31', 
        5
      );

      // Assertions
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('WITH start_data AS'),
        expect.arrayContaining(['2023-01-01', '2023-12-31', 5])
      );
      expect(result).toEqual(expect.arrayContaining([
        expect.objectContaining({
          ticker: 'AAPL',
          metric: 'pe',
          start_value: expect.any(Number),
          end_value: expect.any(Number),
          change: expect.any(Number)
        })
      ]));
      expect(result).toHaveLength(2);
    });

    it('should apply ticker filter when provided', async () => {
      // Mock data
      const mockChanges = [
        { 
          ticker: 'AAPL',
          source: 'Magic Formula',
          guru: 'Warren Buffett',
          metric: 'pe',
          start_value: 25.6,
          end_value: 28.2,
          change: 10.16
        }
      ];

      // Mock the query response
      mockPool.query.mockResolvedValue({ rows: mockChanges });

      // Call the method with ticker filter
      const result = await stockModel.getRecentChanges(
        'pe', 
        '2023-01-01', 
        '2023-12-31', 
        5,
        'AAPL'
      );

      // Assertions
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('AND ticker = $3'),
        expect.arrayContaining(['2023-01-01', '2023-12-31', 'AAPL', 5])
      );
      expect(result).toHaveLength(1);
      expect(result[0].ticker).toBe('AAPL');
    });

    it('should apply source filter when provided', async () => {
      // Mock data
      const mockChanges = [
        { 
          ticker: 'AAPL',
          source: 'Magic Formula',
          guru: 'Warren Buffett',
          metric: 'pe',
          start_value: 25.6,
          end_value: 28.2,
          change: 10.16
        }
      ];

      // Mock the query response
      mockPool.query.mockResolvedValue({ rows: mockChanges });

      // Call the method with source filter
      const result = await stockModel.getRecentChanges(
        'pe', 
        '2023-01-01', 
        '2023-12-31', 
        5,
        undefined,
        'Magic Formula'
      );

      // Assertions
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('AND source = $3'),
        expect.arrayContaining(['2023-01-01', '2023-12-31', 'Magic Formula', 5])
      );
      expect(result).toHaveLength(1);
      expect(result[0].source).toBe('Magic Formula');
    });

    it('should apply guru filter when provided', async () => {
      // Mock data
      const mockChanges = [
        { 
          ticker: 'AAPL',
          source: 'Magic Formula',
          guru: 'Warren Buffett',
          metric: 'pe',
          start_value: 25.6,
          end_value: 28.2,
          change: 10.16
        }
      ];

      // Mock the query response
      mockPool.query.mockResolvedValue({ rows: mockChanges });

      // Call the method with guru filter
      const result = await stockModel.getRecentChanges(
        'pe', 
        '2023-01-01', 
        '2023-12-31', 
        5,
        undefined,
        undefined,
        'Warren Buffett'
      );

      // Assertions
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('AND guru = $3'),
        expect.arrayContaining(['2023-01-01', '2023-12-31', 'Warren Buffett', 5])
      );
      expect(result).toHaveLength(1);
      expect(result[0].guru).toBe('Warren Buffett');
    });

    it('should apply all filters when provided', async () => {
      // Mock data
      const mockChanges = [
        { 
          ticker: 'AAPL',
          source: 'Magic Formula',
          guru: 'Warren Buffett',
          metric: 'pe',
          start_value: 25.6,
          end_value: 28.2,
          change: 10.16
        }
      ];

      // Mock the query response
      mockPool.query.mockResolvedValue({ rows: mockChanges });

      // Call the method with all filters
      const result = await stockModel.getRecentChanges(
        'pe', 
        '2023-01-01', 
        '2023-12-31', 
        5,
        'AAPL',
        'Magic Formula',
        'Warren Buffett'
      );

      // Assertions
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('AND ticker = $3'),
        expect.arrayContaining([
          '2023-01-01', 
          '2023-12-31', 
          'AAPL', 
          'Magic Formula', 
          'Warren Buffett', 
          5
        ])
      );
      expect(result).toHaveLength(1);
      expect(result[0].ticker).toBe('AAPL');
      expect(result[0].source).toBe('Magic Formula');
      expect(result[0].guru).toBe('Warren Buffett');
    });

    it('should handle buy_price metric correctly', async () => {
      // Mock data with string buy_price values
      const mockChanges = [
        { 
          ticker: 'AAPL',
          source: 'Magic Formula',
          guru: 'Warren Buffett',
          metric: 'buy_price',
          start_value: '$150.00',
          end_value: '$165.00',
          change: 10.00
        }
      ];

      // Mock the query response
      mockPool.query.mockResolvedValue({ rows: mockChanges });

      // Call the method with buy_price metric
      const result = await stockModel.getRecentChanges(
        'buy_price', 
        '2023-01-01', 
        '2023-12-31', 
        5
      );

      // Assertions
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('buy_price'),
        expect.arrayContaining(['2023-01-01', '2023-12-31', 5])
      );
      expect(result).toHaveLength(1);
      expect(result[0].metric).toBe('buy_price');
      expect(typeof result[0].start_value).toBe('number');
      expect(typeof result[0].end_value).toBe('number');
    });

    it('should throw error for invalid metric', async () => {
      // Call the method with invalid metric
      await expect(stockModel.getRecentChanges(
        'invalid_metric', 
        '2023-01-01', 
        '2023-12-31', 
        5
      )).rejects.toThrow('Invalid metric');
    });

    it('should handle empty results', async () => {
      // Mock empty response
      mockPool.query.mockResolvedValue({ rows: [] });

      // Call the method
      const result = await stockModel.getRecentChanges(
        'pe', 
        '2023-01-01', 
        '2023-12-31', 
        5
      );

      // Assertions
      expect(mockPool.query).toHaveBeenCalled();
      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });
  });

  describe('getStockHistory with date filtering', () => {
    it('should return stock history with matching ticker, source, and guru when guru exists', async () => {
      // Mock data for the original stock
      const mockOriginalStock = {
        id: 15289,
        ticker: 'AAPL',
        source: 'Magic Formula',
        guru: 'Warren Buffett',
        date: '2023-05-15T00:00:00.000Z'
      };

      // Mock data for the history results
      const mockHistoryStocks = [
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
      ];

      // Mock the query responses
      mockPool.query.mockImplementation((query, params) => {
        if (query.includes('WHERE id = $1')) {
          return Promise.resolve({ rows: [mockOriginalStock] });
        } else {
          return Promise.resolve({ rows: mockHistoryStocks });
        }
      });

      // Call the method
      const result = await stockModel.getStockHistory(15289);

      // Assertions
      expect(mockPool.query).toHaveBeenCalledTimes(2);
      expect(result).toEqual(mockHistoryStocks);
      expect(result).toHaveLength(3);
    });

    it('should filter stock history by from date when provided', async () => {
      // Mock data for the original stock
      const mockOriginalStock = {
        id: 15289,
        ticker: 'AAPL',
        source: 'Magic Formula',
        guru: 'Warren Buffett',
        date: '2023-05-15T00:00:00.000Z'
      };

      // Mock data for the history results
      const mockHistoryStocks = [
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
      ];

      // Mock the query responses
      mockPool.query.mockImplementation((query, params) => {
        if (query.includes('WHERE id = $1')) {
          return Promise.resolve({ rows: [mockOriginalStock] });
        } else {
          return Promise.resolve({ rows: mockHistoryStocks });
        }
      });

      // Call the method with from date
      const result = await stockModel.getStockHistory(15289, '2023-05-01');

      // Assertions
      expect(mockPool.query).toHaveBeenCalledTimes(2);
      expect(mockPool.query).toHaveBeenNthCalledWith(
        2,
        expect.stringContaining('AND date >= $4'),
        expect.arrayContaining(['AAPL', 'Magic Formula', 'Warren Buffett', '2023-05-01'])
      );
      expect(result).toEqual(mockHistoryStocks);
      expect(result).toHaveLength(2);
    });

    it('should filter stock history by to date when provided', async () => {
      // Mock data for the original stock
      const mockOriginalStock = {
        id: 15289,
        ticker: 'AAPL',
        source: 'Magic Formula',
        guru: 'Warren Buffett',
        date: '2023-05-15T00:00:00.000Z'
      };

      // Mock data for the history results
      const mockHistoryStocks = [
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
      ];

      // Mock the query responses
      mockPool.query.mockImplementation((query, params) => {
        if (query.includes('WHERE id = $1')) {
          return Promise.resolve({ rows: [mockOriginalStock] });
        } else {
          return Promise.resolve({ rows: mockHistoryStocks });
        }
      });

      // Call the method with to date
      const result = await stockModel.getStockHistory(15289, undefined, '2023-06-01');

      // Assertions
      expect(mockPool.query).toHaveBeenCalledTimes(2);
      expect(mockPool.query).toHaveBeenNthCalledWith(
        2,
        expect.stringContaining('AND date <= $4'),
        expect.arrayContaining(['AAPL', 'Magic Formula', 'Warren Buffett', '2023-06-01'])
      );
      expect(result).toEqual(mockHistoryStocks);
      expect(result).toHaveLength(2);
    });

    it('should filter stock history by both from and to dates when provided', async () => {
      // Mock data for the original stock
      const mockOriginalStock = {
        id: 15289,
        ticker: 'AAPL',
        source: 'Magic Formula',
        guru: 'Warren Buffett',
        date: '2023-05-15T00:00:00.000Z'
      };

      // Mock data for the history results
      const mockHistoryStocks = [
        {
          id: 15289,
          ticker: 'AAPL',
          source: 'Magic Formula',
          guru: 'Warren Buffett',
          date: '2023-05-15T00:00:00.000Z',
          sentiment_score: 75,
          signal_score: 85
        }
      ];

      // Mock the query responses
      mockPool.query.mockImplementation((query, params) => {
        if (query.includes('WHERE id = $1')) {
          return Promise.resolve({ rows: [mockOriginalStock] });
        } else {
          return Promise.resolve({ rows: mockHistoryStocks });
        }
      });

      // Call the method with both from and to dates
      const result = await stockModel.getStockHistory(15289, '2023-05-01', '2023-06-01');

      // Assertions
      expect(mockPool.query).toHaveBeenCalledTimes(2);
      expect(mockPool.query).toHaveBeenNthCalledWith(
        2,
        expect.stringContaining('AND date >= $4 AND date <= $5'),
        expect.arrayContaining(['AAPL', 'Magic Formula', 'Warren Buffett', '2023-05-01', '2023-06-01'])
      );
      expect(result).toEqual(mockHistoryStocks);
      expect(result).toHaveLength(1);
    });
  });
});
import { pool } from '../config/db';

export interface StockAnalysis {
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

export class StockAnalysisModel {
  
  async getAll(): Promise<StockAnalysis[]> {
    const query = 'SELECT * FROM stock_analysis ORDER BY date DESC';
    const { rows } = await pool.query(query);
    return rows;
  }
  
  async getRecentChanges(
    metric: string,
    startDate: string,
    endDate: string,
    threshold: number = 5,
    ticker?: string,
    source?: string,
    guru?: string
  ): Promise<any[]> {
    try {
      // Validate metric is one of the allowed values
      const allowedMetrics = ['pe', 'signal_score', 'sentiment_score', 'buy_price'];
      if (!allowedMetrics.includes(metric)) {
        throw new Error(`Invalid metric: ${metric}. Must be one of: ${allowedMetrics.join(', ')}`);
      }
      
      // Build the base query to get stocks on start date
      let startQuery = `
        SELECT ticker, source, guru, ${metric} as start_value
        FROM stock_analysis
        WHERE date::date = $1::date
      `;
      
      // Build the base query to get stocks on end date
      let endQuery = `
        SELECT ticker, source, guru, ${metric} as end_value
        FROM stock_analysis
        WHERE date::date = $2::date
      `;
      
      // Add filters if provided
      const params: any[] = [startDate, endDate];
      let paramCounter = 3;
      
      if (ticker) {
        startQuery += ` AND ticker = $${paramCounter}`;
        endQuery += ` AND ticker = $${paramCounter}`;
        params.push(ticker);
        paramCounter++;
      }
      
      if (source) {
        startQuery += ` AND source = $${paramCounter}`;
        endQuery += ` AND source = $${paramCounter}`;
        params.push(source);
        paramCounter++;
      }
      
      if (guru) {
        startQuery += ` AND guru = $${paramCounter}`;
        endQuery += ` AND guru = $${paramCounter}`;
        params.push(guru);
        paramCounter++;
      }
      
      // Complete the query to join start and end data
      const fullQuery = `
        WITH start_data AS (${startQuery}),
             end_data AS (${endQuery})
        SELECT 
          s.ticker,
          s.source,
          s.guru,
          '${metric}' as metric,
          s.start_value,
          e.end_value,
          CASE
            WHEN ABS(s.start_value) < 0.01 THEN (e.end_value - s.start_value)
            ELSE ROUND(((e.end_value - s.start_value) / s.start_value) * 100, 2)
          END as change_percent
        FROM start_data s
        JOIN end_data e ON s.ticker = e.ticker AND 
                          COALESCE(s.source, '') = COALESCE(e.source, '') AND 
                          COALESCE(s.guru, '') = COALESCE(e.guru, '')
        WHERE 
          CASE
            WHEN ABS(s.start_value) < 0.01 THEN ABS(e.end_value - s.start_value) >= $${paramCounter}
            ELSE ABS(((e.end_value - s.start_value) / s.start_value) * 100) >= $${paramCounter}
          END
      `;
      
      params.push(threshold);
      
      const { rows } = await pool.query(fullQuery, params);
      
      // Process the results to ensure proper formatting
      return rows.map(row => {
        // Convert buy_price from string to number if needed
        if (metric === 'buy_price' && typeof row.start_value === 'string') {
          row.start_value = parseFloat(row.start_value.replace(/[^0-9.-]+/g, ''));
        }
        if (metric === 'buy_price' && typeof row.end_value === 'string') {
          row.end_value = parseFloat(row.end_value.replace(/[^0-9.-]+/g, ''));
        }
        
        // Ensure numeric values
        row.start_value = Number(row.start_value);
        row.end_value = Number(row.end_value);
        
        // Add change property for backward compatibility
        row.change = row.change_percent;
        
        return row;
      });
    } catch (error) {
      console.error('Error in getRecentChanges:', error);
      throw error;
    }
  }

  async getStockHistory(id: number, from?: string, to?: string): Promise<StockAnalysis[]> {
    try {
      // First, get the stock with the given ID
      const stockQuery = 'SELECT * FROM stock_analysis WHERE id = $1';
      const stockResult = await pool.query(stockQuery, [id]);
      
      if (stockResult.rows.length === 0) {
        return [];
      }
      
      const stock = stockResult.rows[0];
      const { ticker, source, guru } = stock;
      
      // Build query based on whether guru is null or not
      let query: string;
      let params: any[];
      let paramCounter = 1;
      
      if (guru) {
        // If guru exists in the original stock, match on ticker, source, and guru
        query = `
          SELECT * FROM stock_analysis 
          WHERE ticker = $${paramCounter++} AND source = $${paramCounter++} AND guru = $${paramCounter++}
        `;
        params = [ticker, source, guru];
      } else {
        // If guru is null in the original stock, match on ticker and source where guru is also null
        query = `
          SELECT * FROM stock_analysis 
          WHERE ticker = $${paramCounter++} AND source = $${paramCounter++} AND guru IS NULL
        `;
        params = [ticker, source];
      }
      
      // Add date filtering if provided
      if (from && to) {
        query += ` AND date >= $${paramCounter++} AND date <= $${paramCounter++}`;
        params.push(from, to);
      } else if (from) {
        query += ` AND date >= $${paramCounter++}`;
        params.push(from);
      } else if (to) {
        query += ` AND date <= $${paramCounter++}`;
        params.push(to);
      }
      
      // Always order by date in ascending order
      query += ` ORDER BY date ASC`;
      
      const { rows } = await pool.query(query, params);
      return rows;
    } catch (error) {
      console.error('Error in getStockHistory:', error);
      throw error;
    }
  }
  
  async getByDateRange(startDate: string, endDate: string): Promise<StockAnalysis[]> {
    const query = `
      SELECT * FROM stock_analysis 
      WHERE date >= $1 AND date <= $2
      ORDER BY date DESC
    `;
    const { rows } = await pool.query(query, [startDate, endDate]);
    return rows;
  }

  async getAllSorted(): Promise<StockAnalysis[]> {
    const query = 'SELECT * FROM stock_analysis ORDER BY sentiment_score DESC';
    const { rows } = await pool.query(query);
    
    // Add highlight property based on sentiment and signal scores
    return rows.map(row => ({
      ...row,
      highlight: row.sentiment_score > 60 && row.signal_score > 80
    }));
  }

  async getById(id: number): Promise<StockAnalysis | null> {
    const query = 'SELECT * FROM stock_analysis WHERE id = $1';
    const { rows } = await pool.query(query, [id]);
    return rows.length ? rows[0] : null;
  }

  async getByTicker(ticker: string): Promise<StockAnalysis[]> {
    const query = 'SELECT * FROM stock_analysis WHERE ticker = $1 ORDER BY date DESC';
    const { rows } = await pool.query(query, [ticker]);
    return rows;
  }

  async create(stockData: StockAnalysis): Promise<StockAnalysis> {
    const {
      date, ticker, source, pe, dividend, cash_per_share,
      current_ratio, signal_score, sentiment_score, screenshot,
      guru, rule1_score, moat_score, management_score, buy_price
    } = stockData;

    const query = `
      INSERT INTO stock_analysis (
        date, ticker, source, pe, dividend, cash_per_share,
        current_ratio, signal_score, sentiment_score, screenshot,
        guru, rule1_score, moat_score, management_score, buy_price
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING *
    `;

    const values = [
      date, ticker, source, pe, dividend, cash_per_share,
      current_ratio, signal_score, sentiment_score, screenshot,
      guru, rule1_score, moat_score, management_score, buy_price
    ];

    const { rows } = await pool.query(query, values);
    return rows[0];
  }

  async update(id: number, stockData: StockAnalysis): Promise<StockAnalysis | null> {
    // First check if record exists
    const checkQuery = 'SELECT * FROM stock_analysis WHERE id = $1';
    const checkResult = await pool.query(checkQuery, [id]);
    
    if (checkResult.rows.length === 0) {
      return null;
    }

    // Build dynamic update query based on provided fields
    const updates: string[] = [];
    const values: any[] = [];
    let paramCounter = 1;

    Object.entries(stockData).forEach(([key, value]) => {
      if (key !== 'id' && value !== undefined) {
        updates.push(`${key} = $${paramCounter}`);
        values.push(value);
        paramCounter++;
      }
    });

    if (updates.length === 0) {
      // No fields to update
      return checkResult.rows[0];
    }

    values.push(id);
    const query = `
      UPDATE stock_analysis 
      SET ${updates.join(', ')} 
      WHERE id = $${paramCounter} 
      RETURNING *
    `;

    const { rows } = await pool.query(query, values);
    return rows[0];
  }

  async delete(id: number): Promise<boolean> {
    const query = 'DELETE FROM stock_analysis WHERE id = $1 RETURNING id';
    const { rows } = await pool.query(query, [id]);
    return rows.length > 0;
  }

  async getDailyChanges(): Promise<{
    current: StockAnalysis[];
    new: StockAnalysis[];
    removed: StockAnalysis[];
  }> {
    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    // Get today's stocks
    const todayQuery = `
      SELECT * FROM stock_analysis 
      WHERE date::date = $1::date
      ORDER BY sentiment_score DESC
    `;
    const todayResult = await pool.query(todayQuery, [today]);
    
    // Get yesterday's stocks
    const yesterdayQuery = `
      SELECT * FROM stock_analysis 
      WHERE date::date = $1::date
      ORDER BY sentiment_score DESC
    `;
    const yesterdayResult = await pool.query(yesterdayQuery, [yesterdayStr]);
    
    const todayStocks = todayResult.rows;
    const yesterdayStocks = yesterdayResult.rows;
    
    // Find new stocks (in today but not in yesterday)
    const newStocks = todayStocks.filter(todayStock => 
      !yesterdayStocks.some(yesterdayStock => 
        yesterdayStock.ticker === todayStock.ticker
      )
    ).map(stock => ({
      ...stock,
      status: 'new' as const,
      highlight: true
    }));
    
    // Find removed stocks (in yesterday but not in today)
    const removedStocks = yesterdayStocks.filter(yesterdayStock => 
      !todayStocks.some(todayStock => 
        todayStock.ticker === yesterdayStock.ticker
      )
    ).map(stock => ({
      ...stock,
      status: 'removed' as const
    }));
    
    // Mark existing stocks
    const existingStocks = todayStocks.filter(todayStock => 
      yesterdayStocks.some(yesterdayStock => 
        yesterdayStock.ticker === todayStock.ticker
      )
    ).map(stock => ({
      ...stock,
      status: 'existing' as const,
      highlight: stock.sentiment_score > 60 && stock.signal_score > 80
    }));
    
    return {
      current: [...existingStocks, ...newStocks],
      new: newStocks,
      removed: removedStocks
    };
  }

  async getStocksWithSource(): Promise<StockAnalysis[]> {
    const query = `
      SELECT *, 
        CASE 
          WHEN rule1_score > 0 THEN 'Rule 1'
          ELSE 'Magic Formula'
        END AS source
      FROM stock_analysis
      ORDER BY sentiment_score DESC
    `;
    
    const { rows } = await pool.query(query);
    
    return rows.map(row => ({
      ...row,
      highlight: row.sentiment_score > 60 && row.signal_score > 80
    }));
  }

  async getHighlightedStocks(): Promise<StockAnalysis[]> {
    const query = `
      SELECT * FROM stock_analysis
      WHERE sentiment_score > 60 AND signal_score > 80
      ORDER BY sentiment_score DESC
    `;
    
    const { rows } = await pool.query(query);
    return rows;
  }

  async getHighlightedStocksByDateRange(startDate?: string, endDate?: string): Promise<StockAnalysis[]> {
    let query = `
      SELECT * FROM stock_analysis
      WHERE sentiment_score > 60 AND signal_score > 80
    `;
    
    const params: any[] = [];
    let paramCounter = 1;
    
    if (startDate && endDate) {
      query += ` AND date >= $${paramCounter} AND date <= $${paramCounter + 1}`;
      params.push(startDate, endDate);
    } else if (startDate) {
      query += ` AND date >= $${paramCounter}`;
      params.push(startDate);
    } else if (endDate) {
      query += ` AND date <= $${paramCounter}`;
      params.push(endDate);
    }
    
    query += ` ORDER BY sentiment_score DESC`;
    
    const { rows } = await pool.query(query, params);
    return rows;
  }

  async getAllStocksByDateRange(startDate?: string, endDate?: string): Promise<StockAnalysis[]> {
    let query = `SELECT * FROM stock_analysis`;
    
    const params: any[] = [];
    let paramCounter = 1;
    
    if (startDate && endDate) {
      query += ` WHERE date >= $${paramCounter} AND date <= $${paramCounter + 1}`;
      params.push(startDate, endDate);
    } else if (startDate) {
      query += ` WHERE date >= $${paramCounter}`;
      params.push(startDate);
    } else if (endDate) {
      query += ` WHERE date <= $${paramCounter}`;
      params.push(endDate);
    }
    
    query += ` ORDER BY date DESC`;
    
    const { rows } = await pool.query(query, params);
    return rows;
  }

  async getStocksByDateAndSource(date: string, source: string): Promise<StockAnalysis[]> {
    try {
      // Convert MM/DD/YYYY to YYYY-MM-DD for PostgreSQL
      const formatDate = (dateStr: string): string => {
        const [month, day, year] = dateStr.split('/');
        return `${year}-${month}-${day}`;
      };
      
      const formattedDate = formatDate(date);
      
      // First, try to get all stocks for this date to see what's available
const normalizedSource = source.toString().replace(/\s+/g, '');

const allStocksQuery = `
  SELECT * FROM stock_analysis 
  WHERE date::date = $1::date AND source = $2
  ORDER BY sentiment_score DESC
`;

const allStocksResult = await pool.query(allStocksQuery, [formattedDate, normalizedSource]);
console.log(`Found ${allStocksResult.rows.length} stocks for date ${formattedDate} and source ${normalizedSource}`);

      
      // If we have results, return them all for now (ignoring source filter)
      if (allStocksResult.rows.length > 0) {
        return allStocksResult.rows;
      }
      
      // If no results with the exact date, try with just the source
      const sourceQuery = `
        SELECT * FROM stock_analysis 
        WHERE source = $1 OR source = $2 OR source = $3
        ORDER BY date DESC
        LIMIT 10
      `;
      
      // Try different variations of the source
      const sourceResult = await pool.query(sourceQuery, [
        source, 
        source === 'Rule 1' ? 'Rule1' : 'MagicFormula',
        source === 'Magic Formula' ? 'MagicFormula' : 'Rule1'
      ]);
      
      return sourceResult.rows;
    } catch (error) {
      console.error('Error in getStocksByDateAndSource:', error);
      throw error;
    }
  }
}
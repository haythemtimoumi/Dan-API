import { pool } from '../config/db';

export interface StockAnalysis {
  id?: number;
  ticker_id?: number;
  guru_id?: number;
  date?: string;
  ticker?: string;
  source?: string;
  pe?: number;
  dividend?: string;
  cash_per_share?: string;
  current_ratio?: number;
  signal_score?: number;
  sentiment_score?: number;
  screenshot?: string;
  rule1_score?: number;
  moat_score?: number;
  management_score?: number;
  buy_price?: string;
  full_name?: string;
  last_price?: string;
  last_action?: string;
  per_portfolio?: string;
  long_gr?: string;
  last_gr?: string;
  per_upside?: string;
  pbt?: string;
  created_at?: string;
  guru?: string;
  highlight?: boolean;
  status?: 'new' | 'existing' | 'removed';
}

export class StockAnalysisModel {
  async getAll(): Promise<StockAnalysis[]> {
    const query = `
      SELECT sa.*, g.guru_name as guru
      FROM stock_analysis sa
      LEFT JOIN guru g ON sa.guru_id = g.id
      ORDER BY sa.sentiment_score DESC
    `;
    const { rows } = await pool.query(query);
    return rows.map(row => ({
      ...row,
      highlight: row.sentiment_score > 60 && row.signal_score > 80
    }));
  }

  async getAllSorted(): Promise<StockAnalysis[]> {
    const query = `
      SELECT sa.*, g.guru_name as guru
      FROM stock_analysis sa
      LEFT JOIN guru g ON sa.guru_id = g.id
      ORDER BY sa.sentiment_score DESC
    `;
    const { rows } = await pool.query(query);
    return rows.map(row => ({
      ...row,
      highlight: row.sentiment_score > 60 && row.signal_score > 80
    }));
  }

  async getById(id: number): Promise<StockAnalysis | null> {
    const query = `
      SELECT sa.*, g.guru_name as guru
      FROM stock_analysis sa
      LEFT JOIN guru g ON sa.guru_id = g.id
      WHERE sa.id = $1
    `;
    const { rows } = await pool.query(query, [id]);
    return rows.length ? rows[0] : null;
  }

  async getByTicker(ticker: string): Promise<StockAnalysis[]> {
    const query = `
      SELECT sa.*, g.guru_name as guru
      FROM stock_analysis sa
      LEFT JOIN guru g ON sa.guru_id = g.id
      WHERE sa.ticker = $1
      ORDER BY sa.date DESC
    `;
    const { rows } = await pool.query(query, [ticker]);
    return rows;
  }

  async create(stockData: StockAnalysis): Promise<StockAnalysis> {
    const {
      ticker_id, guru_id, date, ticker, source, pe, dividend, cash_per_share,
      current_ratio, signal_score, sentiment_score, screenshot,
      rule1_score, moat_score, management_score, buy_price, full_name,
      last_price, last_action, per_portfolio, long_gr, last_gr, per_upside, pbt
    } = stockData;

    const query = `
      INSERT INTO stock_analysis (
        ticker_id, guru_id, date, ticker, source, pe, dividend, cash_per_share,
        current_ratio, signal_score, sentiment_score, screenshot,
        rule1_score, moat_score, management_score, buy_price, full_name,
        last_price, last_action, per_portfolio, long_gr, last_gr, per_upside, pbt
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24)
      RETURNING *
    `;

    const values = [
      ticker_id, guru_id, date, ticker, source, pe, dividend, cash_per_share,
      current_ratio, signal_score, sentiment_score, screenshot,
      rule1_score, moat_score, management_score, buy_price, full_name,
      last_price, last_action, per_portfolio, long_gr, last_gr, per_upside, pbt
    ];

    const { rows } = await pool.query(query, values);
    return rows[0];
  }

  async update(id: number, stockData: StockAnalysis): Promise<StockAnalysis | null> {
    const checkQuery = 'SELECT * FROM stock_analysis WHERE id = $1';
    const checkResult = await pool.query(checkQuery, [id]);
    
    if (checkResult.rows.length === 0) {
      return null;
    }

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
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    const todayQuery = `
      SELECT sa.*, g.guru_name as guru
      FROM stock_analysis sa
      LEFT JOIN guru g ON sa.guru_id = g.id
      WHERE sa.date::date = $1::date
      ORDER BY sa.sentiment_score DESC
    `;
    const todayResult = await pool.query(todayQuery, [today]);
    
    const yesterdayQuery = `
      SELECT sa.*, g.guru_name as guru
      FROM stock_analysis sa
      LEFT JOIN guru g ON sa.guru_id = g.id
      WHERE sa.date::date = $1::date
      ORDER BY sa.sentiment_score DESC
    `;
    const yesterdayResult = await pool.query(yesterdayQuery, [yesterdayStr]);
    
    const todayStocks = todayResult.rows;
    const yesterdayStocks = yesterdayResult.rows;
    
    const newStocks = todayStocks.filter(todayStock => 
      !yesterdayStocks.some(yesterdayStock => 
        yesterdayStock.ticker === todayStock.ticker
      )
    ).map(stock => ({
      ...stock,
      status: 'new' as const,
      highlight: true
    }));
    
    const removedStocks = yesterdayStocks.filter(yesterdayStock => 
      !todayStocks.some(todayStock => 
        todayStock.ticker === yesterdayStock.ticker
      )
    ).map(stock => ({
      ...stock,
      status: 'removed' as const
    }));
    
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
      SELECT sa.*, g.guru_name as guru,
        CASE 
          WHEN sa.rule1_score > 0 THEN 'Rule 1'
          ELSE 'Magic Formula'
        END AS source
      FROM stock_analysis sa
      LEFT JOIN guru g ON sa.guru_id = g.id
      ORDER BY sa.sentiment_score DESC
    `;
    
    const { rows } = await pool.query(query);
    
    return rows.map(row => ({
      ...row,
      highlight: row.sentiment_score > 60 && row.signal_score > 80
    }));
  }

  async getHighlightedStocks(): Promise<StockAnalysis[]> {
    const query = `
      SELECT sa.*, g.guru_name as guru
      FROM stock_analysis sa
      LEFT JOIN guru g ON sa.guru_id = g.id
      WHERE sa.sentiment_score > 60 AND sa.signal_score > 80
      ORDER BY sa.sentiment_score DESC
    `;
    
    const { rows } = await pool.query(query);
    return rows;
  }

  async getHighlightedStocksByDateRange(startDate?: string, endDate?: string): Promise<StockAnalysis[]> {
    let query = `
      SELECT sa.*, g.guru_name as guru
      FROM stock_analysis sa
      LEFT JOIN guru g ON sa.guru_id = g.id
      WHERE sa.sentiment_score > 60 AND sa.signal_score > 80
    `;
    
    const params: any[] = [];
    let paramCounter = 1;
    
    if (startDate && endDate) {
      query += ` AND sa.date::date >= $${paramCounter}::date AND sa.date::date <= $${paramCounter + 1}::date`;
      params.push(startDate, endDate);
    } else if (startDate) {
      query += ` AND sa.date::date >= $${paramCounter}::date`;
      params.push(startDate);
    } else if (endDate) {
      query += ` AND sa.date::date <= $${paramCounter}::date`;
      params.push(endDate);
    }
    
    query += ` ORDER BY sa.sentiment_score DESC`;
    
    const { rows } = await pool.query(query, params);
    return rows;
  }

  async getStocksByDateAndSource(date: string, source: string): Promise<StockAnalysis[]> {
    const formatDate = (dateStr: string): string => {
      const [month, day, year] = dateStr.split('/');
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    };
    
    const formattedDate = formatDate(date);
    
    const query = `
      SELECT sa.*, g.guru_name as guru
      FROM stock_analysis sa
      LEFT JOIN guru g ON sa.guru_id = g.id
      WHERE sa.date::date = $1::date AND sa.source = $2
      ORDER BY sa.sentiment_score DESC
    `;
    
    const { rows } = await pool.query(query, [formattedDate, source]);
    return rows;
  }

  async getAvailableSources(): Promise<string[]> {
    const query = 'SELECT DISTINCT source FROM stock_analysis WHERE source IS NOT NULL ORDER BY source';
    const { rows } = await pool.query(query);
    return rows.map(row => row.source);
  }

  async getStocksBySource(source: string): Promise<StockAnalysis[]> {
    const query = `
      SELECT sa.*, g.guru_name as guru
      FROM stock_analysis sa
      LEFT JOIN guru g ON sa.guru_id = g.id
      WHERE sa.source = $1
      ORDER BY sa.sentiment_score DESC
    `;
    
    const { rows } = await pool.query(query, [source]);
    return rows.map(row => ({
      ...row,
      highlight: row.sentiment_score > 60 && row.signal_score > 80
    }));
  }

  async getStocksByDateRange(startDate?: string, endDate?: string): Promise<StockAnalysis[]> {
    let query = `
      SELECT sa.*, g.guru_name as guru
      FROM stock_analysis sa
      LEFT JOIN guru g ON sa.guru_id = g.id
    `;
    
    const params: any[] = [];
    let paramCounter = 1;
    
    if (startDate && endDate) {
      query += ` WHERE sa.date::date >= $${paramCounter}::date AND sa.date::date <= $${paramCounter + 1}::date`;
      params.push(startDate, endDate);
    } else if (startDate) {
      query += ` WHERE sa.date::date >= $${paramCounter}::date`;
      params.push(startDate);
    } else if (endDate) {
      query += ` WHERE sa.date::date <= $${paramCounter}::date`;
      params.push(endDate);
    }
    
    query += ` ORDER BY sa.sentiment_score DESC`;
    
    const { rows } = await pool.query(query, params);
    return rows.map(row => ({
      ...row,
      highlight: row.sentiment_score > 60 && row.signal_score > 80
    }));
  }

  async getFilterValues(): Promise<{
    list_types: string[];
    statuses: string[];
    current_steps: string[];
    scrape_types: string[];
  }> {
    const [listTypes, statuses, currentSteps, scrapeTypes] = await Promise.all([
      pool.query('SELECT DISTINCT st.list_type FROM scraper_tasks st WHERE st.list_type IS NOT NULL ORDER BY st.list_type'),
      pool.query('SELECT DISTINCT st.scrape_status FROM scraper_tasks st WHERE st.scrape_status IS NOT NULL ORDER BY st.scrape_status'),
      pool.query('SELECT DISTINCT st.current_step FROM scraper_tasks st WHERE st.current_step IS NOT NULL ORDER BY st.current_step'),
      pool.query('SELECT DISTINCT st.scrape_type FROM scraper_tasks st WHERE st.scrape_type IS NOT NULL ORDER BY st.scrape_type')
    ]);

    return {
      list_types: listTypes.rows.map(row => row.list_type),
      statuses: statuses.rows.map(row => row.scrape_status),
      current_steps: currentSteps.rows.map(row => row.current_step),
      scrape_types: scrapeTypes.rows.map(row => row.scrape_type)
    };
  }
}

export default new StockAnalysisModel();
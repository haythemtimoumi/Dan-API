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
  gurus?: string;
  guru_count?: number;
  list_type?: string;
  highlight?: boolean;
  status?: 'new' | 'existing' | 'removed';
  color?: string;
  target?: boolean;
}

export class StockAnalysisModel {
  async getAll(): Promise<StockAnalysis[]> {
    const query = `
      SELECT sa.*, g.guru_name as guru,
        (SELECT c.color 
         FROM comment c 
         JOIN scraper_tasks st ON c.ticker_id = st.id 
         WHERE st.symbol = sa.ticker AND c.color IS NOT NULL 
         ORDER BY c.created_at DESC 
         LIMIT 1) as color
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
      SELECT sa.*, g.guru_name as guru,
        (SELECT c.color 
         FROM comment c 
         JOIN scraper_tasks st ON c.ticker_id = st.id 
         WHERE st.symbol = sa.ticker AND c.color IS NOT NULL 
         ORDER BY c.created_at DESC 
         LIMIT 1) as color
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

  async getLatestStockAnalysis(guru?: string, listType?: string): Promise<StockAnalysis[]> {
    let query = `
      WITH latest_analysis AS (
        SELECT sa.*, g.guru_name as guru, st.list_type,
               ROW_NUMBER() OVER (PARTITION BY sa.ticker, sa.guru_id ORDER BY sa.date DESC, sa.id DESC) as rn
        FROM stock_analysis sa
        LEFT JOIN guru g ON sa.guru_id = g.id
        LEFT JOIN scraper_tasks st ON sa.ticker_id = st.id
        WHERE 1=1
    `;
    
    const params: any[] = [];
    let paramCounter = 1;
    
    if (guru) {
      query += ` AND g.guru_name = $${paramCounter}`;
      params.push(guru);
      paramCounter++;
    }
    
    if (listType) {
      query += ` AND st.list_type = $${paramCounter}`;
      params.push(listType);
      paramCounter++;
    }
    
    query += `
      )
      SELECT * FROM latest_analysis 
      WHERE rn = 1
      ORDER BY sentiment_score DESC
    `;
    
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

  async getGroupedByTicker(startDate?: string, endDate?: string): Promise<StockAnalysis[]> {
    let dateFilter = '';
    const params: any[] = [];
    let paramCounter = 1;
    
    if (startDate && endDate) {
      dateFilter = `WHERE sa.date::date >= $${paramCounter}::date AND sa.date::date <= $${paramCounter + 1}::date`;
      params.push(startDate, endDate);
    } else if (startDate) {
      dateFilter = `WHERE sa.date::date >= $${paramCounter}::date`;
      params.push(startDate);
    } else if (endDate) {
      dateFilter = `WHERE sa.date::date <= $${paramCounter}::date`;
      params.push(endDate);
    }
    
    const query = `
      WITH latest_per_ticker AS (
        SELECT sa.*, g.guru_name,
               ROW_NUMBER() OVER (PARTITION BY sa.ticker ORDER BY sa.date DESC, sa.id DESC) as rn
        FROM stock_analysis sa
        LEFT JOIN guru g ON sa.guru_id = g.id
        ${dateFilter}
      ),
      guru_aggregation AS (
        SELECT 
          ticker,
          STRING_AGG(DISTINCT guru_name, ', ' ORDER BY guru_name) as gurus,
          COUNT(DISTINCT guru_id) as guru_count
        FROM stock_analysis sa
        LEFT JOIN guru g ON sa.guru_id = g.id
        ${dateFilter}
        GROUP BY ticker
      )
      SELECT 
        lpt.*,
        ga.gurus,
        ga.guru_count,
        st.target,
        (SELECT c.color 
         FROM comment c 
         JOIN scraper_tasks st2 ON c.ticker_id = st2.id 
         WHERE st2.symbol = lpt.ticker AND c.color IS NOT NULL 
         ORDER BY c.created_at DESC 
         LIMIT 1) as color
      FROM latest_per_ticker lpt
      JOIN guru_aggregation ga ON lpt.ticker = ga.ticker
      LEFT JOIN scraper_tasks st ON lpt.ticker_id = st.id
      WHERE lpt.rn = 1
      ORDER BY lpt.sentiment_score DESC NULLS LAST
    `;
    
    const { rows } = await pool.query(query, params);
    return rows.map(row => ({
      ...row,
      highlight: row.sentiment_score > 60 && row.signal_score > 80
    }));
  }

  async getTickerByGuruGrouped(ticker: string, date?: string): Promise<any> {
    let dateFilter = '';
    const params: any[] = [ticker.toUpperCase()];
    let paramCounter = 2;
    
    if (date) {
      dateFilter = `AND sa.date::date = $${paramCounter}::date`;
      params.push(date);
    }
    
    const query = `
      SELECT 
        sa.ticker,
        g.guru_name,
        g.id as guru_id,
        COALESCE(st.per_portfolio, '') as per_portfolio,
        COALESCE(st.last_action, '') as last_action,
        JSON_AGG(
          JSON_BUILD_OBJECT(
            'id', sa.id,
            'ticker_id', sa.ticker_id,
            'guru_id', sa.guru_id,
            'date', sa.date,
            'ticker', sa.ticker,
            'source', sa.source,
            'pe', sa.pe,
            'dividend', sa.dividend,
            'cash_per_share', sa.cash_per_share,
            'current_ratio', sa.current_ratio,
            'signal_score', sa.signal_score,
            'sentiment_score', sa.sentiment_score,
            'screenshot', sa.screenshot,
            'rule1_score', sa.rule1_score,
            'moat_score', sa.moat_score,
            'management_score', sa.management_score,
            'buy_price', sa.buy_price,
            'full_name', sa.full_name,
            'last_price', sa.last_price,
            'last_action', sa.last_action,
            'per_portfolio', sa.per_portfolio,
            'long_gr', sa.long_gr,
            'last_gr', sa.last_gr,
            'per_upside', sa.per_upside,
            'pbt', sa.pbt,
            'created_at', sa.created_at
          ) ORDER BY sa.date DESC, sa.id DESC
        ) as analyses
      FROM stock_analysis sa
      LEFT JOIN guru g ON sa.guru_id = g.id
      LEFT JOIN scraper_tasks st ON sa.ticker_id = st.id AND st.guru_id = sa.guru_id
      WHERE sa.ticker = $1 ${dateFilter}
      GROUP BY sa.ticker, g.guru_name, g.id, st.per_portfolio, st.last_action
      ORDER BY g.guru_name
    `;
    
    const { rows } = await pool.query(query, params);
    return {
      ticker: ticker.toUpperCase(),
      date: date || 'all',
      gurus: rows
    };
  }

  async getLastDate(): Promise<string | null> {
    const query = 'SELECT MAX(date)::date as last_date FROM stock_analysis';
    const { rows } = await pool.query(query);
    return rows[0]?.last_date || null;
  }

  async getFilteredStocks(filters: {
    sentiment?: number;
    moat?: number;
    rule1?: number;
    management?: number;
  }): Promise<StockAnalysis[]> {
    let query = `
      SELECT DISTINCT sa.*, g.guru_name as guru,
        (SELECT c.color 
         FROM comment c 
         JOIN scraper_tasks st2 ON c.ticker_id = st2.id 
         WHERE st2.symbol = sa.ticker AND c.color IS NOT NULL 
         ORDER BY c.created_at DESC 
         LIMIT 1) as color,
        COALESCE(st.target, false) as target
      FROM stock_analysis sa
      LEFT JOIN guru g ON sa.guru_id = g.id
      LEFT JOIN scraper_tasks st ON sa.ticker_id = st.id
      WHERE (st.target = true OR st.target IS NULL)
    `;
    
    const params: any[] = [];
    let paramCounter = 1;
    
    if (filters.sentiment !== undefined) {
      query += ` AND sa.sentiment_score > $${paramCounter}`;
      params.push(filters.sentiment);
      paramCounter++;
    }
    
    if (filters.moat !== undefined) {
      query += ` AND sa.moat_score > $${paramCounter}`;
      params.push(filters.moat);
      paramCounter++;
    }
    
    if (filters.rule1 !== undefined) {
      query += ` AND sa.rule1_score > $${paramCounter}`;
      params.push(filters.rule1);
      paramCounter++;
    }
    
    if (filters.management !== undefined) {
      query += ` AND sa.management_score > $${paramCounter}`;
      params.push(filters.management);
      paramCounter++;
    }
    
    query += ` ORDER BY sa.sentiment_score DESC`;
    
    const { rows } = await pool.query(query, params);
    return rows.map(row => ({
      ...row,
      highlight: row.sentiment_score > 60 && row.signal_score > 80
    }));
  }

  async updateStockColor(ticker: string, color: string): Promise<boolean> {
    const query = `
      INSERT INTO comment (ticker_id, color, comment, user_id, created_at)
      SELECT st.id, $2, 'Color update', 2, NOW()
      FROM scraper_tasks st
      WHERE st.symbol = $1
      LIMIT 1
      RETURNING id
    `;
    
    const { rows } = await pool.query(query, [ticker, color]);
    return rows.length > 0;
  }

  async activateTickersForDan(tickers: string[]): Promise<{
    success: boolean;
    activated: string[];
    added_to_dan: string[];
    not_found: string[];
    logs: string[];
  }> {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Get Dan's guru_id
      const danQuery = 'SELECT id FROM guru WHERE LOWER(guru_name) = $1';
      const danResult = await client.query(danQuery, ['dan']);
      
      if (danResult.rows.length === 0) {
        throw new Error('Guru "dan" not found');
      }
      
      const danId = danResult.rows[0].id;
      const activated: string[] = [];
      const addedToDan: string[] = [];
      const notFound: string[] = [];
      const logs: string[] = [];
      
      for (const ticker of tickers) {
        const upperTicker = ticker.toUpperCase();
        
        // Check if ticker exists in scraper_tasks
        const tickerQuery = 'SELECT id FROM scraper_tasks WHERE symbol = $1';
        const tickerResult = await client.query(tickerQuery, [upperTicker]);
        
        let tickerId;
        
        if (tickerResult.rows.length === 0) {
          // Create new ticker in scraper_tasks
          const insertQuery = `
            INSERT INTO scraper_tasks (symbol, guru_id, scrape_type, active, target) 
            VALUES ($1, $2, 'rule1', true, true) 
            RETURNING id
          `;
          const insertResult = await client.query(insertQuery, [upperTicker, danId]);
          tickerId = insertResult.rows[0].id;
          logs.push(`${upperTicker}: ticker added`);
        } else {
          tickerId = tickerResult.rows[0].id;
          // Update existing ticker to set active = true and target = true
          const updateQuery = 'UPDATE scraper_tasks SET active = true, target = true WHERE id = $1';
          await client.query(updateQuery, [tickerId]);
          logs.push(`${upperTicker}: ticker activated`);
        }
        
        activated.push(upperTicker);
        
        // Check if already in guru_ticker_map for Dan
        const existingQuery = 'SELECT id FROM guru_ticker_map WHERE guru_id = $1 AND scraper_task_id = $2';
        const existingResult = await client.query(existingQuery, [danId, tickerId]);
        
        if (existingResult.rows.length === 0) {
          // Add to guru_ticker_map
          const insertQuery = 'INSERT INTO guru_ticker_map (guru_id, scraper_task_id) VALUES ($1, $2)';
          await client.query(insertQuery, [danId, tickerId]);
          addedToDan.push(upperTicker);
        }
      }
      
      await client.query('COMMIT');
      
      return {
        success: true,
        activated,
        added_to_dan: addedToDan,
        not_found: notFound,
        logs
      };
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async getMissingAnalysis(): Promise<{ symbol: string; scrape_status: string }[]> {
    const query = `
      SELECT st.symbol, st.scrape_status 
      FROM scraper_tasks st 
      LEFT JOIN stock_analysis sa ON st.id = sa.ticker_id 
      WHERE st.active = true 
      AND st.target = true 
      AND sa.id IS NULL
    `;
    const { rows } = await pool.query(query);
    return rows;
  }
}

export default new StockAnalysisModel();
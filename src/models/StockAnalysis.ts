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

  async updateDanTickerInfo(ticker: string, lastAction?: string, perPortfolio?: string): Promise<boolean> {
    console.log(`[updateDanTickerInfo] Starting update for ticker: ${ticker}`);
    
    const updates: string[] = [];
    const values: any[] = [];
    let paramCounter = 1;
    
    if (lastAction !== undefined) {
      updates.push(`last_action = $${paramCounter}`);
      values.push(lastAction);
      paramCounter++;
      console.log(`[updateDanTickerInfo] Will update last_action to: ${lastAction}`);
    }
    
    if (perPortfolio !== undefined) {
      updates.push(`per_portfolio = $${paramCounter}`);
      values.push(perPortfolio);
      paramCounter++;
      console.log(`[updateDanTickerInfo] Will update per_portfolio to: ${perPortfolio}`);
    }
    
    if (updates.length === 0) {
      console.log('[updateDanTickerInfo] No updates provided');
      return false;
    }
    
    values.push(ticker.toUpperCase());
    
    const query = `
      UPDATE scraper_tasks 
      SET ${updates.join(', ')}
      FROM guru g
      WHERE scraper_tasks.symbol = $${paramCounter} 
      AND scraper_tasks.guru_id = g.id
      AND LOWER(g.guru_name) = 'dan'
      RETURNING scraper_tasks.id
    `;
    
    console.log(`[updateDanTickerInfo] Executing query: ${query}`);
    console.log(`[updateDanTickerInfo] Query values: ${JSON.stringify(values)}`);
    
    const { rows } = await pool.query(query, values);
    const success = rows.length > 0;
    
    console.log(`[updateDanTickerInfo] Query result: ${success ? 'SUCCESS' : 'NO ROWS AFFECTED'}`);
    return success;
  }

  async getTickerChanges(fromDate: string, toDate: string): Promise<any[]> {
    const query = `
      WITH from_snapshots AS (
        SELECT DISTINCT ON (ticker) 
          ticker, signal_score, sentiment_score, rule1_score, moat_score, 
          management_score, buy_price, last_price, long_gr, last_gr, per_upside, pbt
        FROM stock_analysis 
        WHERE date::date = $1::date
        ORDER BY ticker, created_at DESC
      ),
      to_snapshots AS (
        SELECT DISTINCT ON (ticker) 
          ticker, signal_score, sentiment_score, rule1_score, moat_score, 
          management_score, buy_price, last_price, long_gr, last_gr, per_upside, pbt
        FROM stock_analysis 
        WHERE date::date = $2::date
        ORDER BY ticker, created_at DESC
      )
      SELECT 
        f.ticker,
        CASE 
          WHEN t.signal_score > f.signal_score THEN 'up'
          WHEN t.signal_score < f.signal_score THEN 'down'
          ELSE 'stable'
        END as signal_change,
        CASE 
          WHEN t.sentiment_score > f.sentiment_score THEN 'up'
          WHEN t.sentiment_score < f.sentiment_score THEN 'down'
          ELSE 'stable'
        END as sentiment_change,
        CASE 
          WHEN t.rule1_score > f.rule1_score THEN 'up'
          WHEN t.rule1_score < f.rule1_score THEN 'down'
          ELSE 'stable'
        END as rule1_change,
        CASE 
          WHEN t.moat_score > f.moat_score THEN 'up'
          WHEN t.moat_score < f.moat_score THEN 'down'
          ELSE 'stable'
        END as moat_change,
        CASE 
          WHEN t.management_score > f.management_score THEN 'up'
          WHEN t.management_score < f.management_score THEN 'down'
          ELSE 'stable'
        END as management_change,
        CASE 
          WHEN t.buy_price ~ '^[0-9]+(\\.[0-9]+)?$' AND f.buy_price ~ '^[0-9]+(\\.[0-9]+)?$' THEN
            CASE 
              WHEN t.buy_price::NUMERIC > f.buy_price::NUMERIC THEN 'up'
              WHEN t.buy_price::NUMERIC < f.buy_price::NUMERIC THEN 'down'
              ELSE 'stable'
            END
          ELSE 'stable'
        END as buy_price_change,
        CASE 
          WHEN t.buy_price ~ '^[0-9]+(\\.[0-9]+)?$' AND f.buy_price ~ '^[0-9]+(\\.[0-9]+)?$' THEN
            CASE 
              WHEN t.buy_price::NUMERIC * 2 > f.buy_price::NUMERIC * 2 THEN 'up'
              WHEN t.buy_price::NUMERIC * 2 < f.buy_price::NUMERIC * 2 THEN 'down'
              ELSE 'stable'
            END
          ELSE 'stable'
        END as sticker_price_change,
        CASE 
          WHEN t.per_upside ~ '^[0-9]+(\\.[0-9]+)?$' AND f.per_upside ~ '^[0-9]+(\\.[0-9]+)?$' THEN
            CASE 
              WHEN t.per_upside::NUMERIC > f.per_upside::NUMERIC THEN 'up'
              WHEN t.per_upside::NUMERIC < f.per_upside::NUMERIC THEN 'down'
              ELSE 'stable'
            END
          ELSE 'stable'
        END as upside_change,
        CASE 
          WHEN t.last_price ~ '^[0-9]+(\\.[0-9]+)?$' AND f.last_price ~ '^[0-9]+(\\.[0-9]+)?$' THEN
            CASE 
              WHEN t.last_price::NUMERIC > f.last_price::NUMERIC THEN 'up'
              WHEN t.last_price::NUMERIC < f.last_price::NUMERIC THEN 'down'
              ELSE 'stable'
            END
          ELSE 'stable'
        END as price_change,
        CASE 
          WHEN t.long_gr ~ '^[0-9]+(\\.[0-9]+)?$' AND f.long_gr ~ '^[0-9]+(\\.[0-9]+)?$' THEN
            CASE 
              WHEN t.long_gr::NUMERIC > f.long_gr::NUMERIC THEN 'up'
              WHEN t.long_gr::NUMERIC < f.long_gr::NUMERIC THEN 'down'
              ELSE 'stable'
            END
          ELSE 'stable'
        END as analyst_growth_change,
        CASE 
          WHEN t.last_gr ~ '^[0-9]+(\\.[0-9]+)?$' AND f.last_gr ~ '^[0-9]+(\\.[0-9]+)?$' THEN
            CASE 
              WHEN t.last_gr::NUMERIC > f.last_gr::NUMERIC THEN 'up'
              WHEN t.last_gr::NUMERIC < f.last_gr::NUMERIC THEN 'down'
              ELSE 'stable'
            END
          ELSE 'stable'
        END as composite_growth_change,
        CASE 
          WHEN t.pbt ~ '^[0-9]+(\\.[0-9]+)?$' AND f.pbt ~ '^[0-9]+(\\.[0-9]+)?$' THEN
            CASE 
              WHEN t.pbt::NUMERIC > f.pbt::NUMERIC THEN 'up'
              WHEN t.pbt::NUMERIC < f.pbt::NUMERIC THEN 'down'
              ELSE 'stable'
            END
          ELSE 'stable'
        END as pbt_change
      FROM from_snapshots f
      INNER JOIN to_snapshots t ON f.ticker = t.ticker
      ORDER BY f.ticker
    `;
    
    const { rows } = await pool.query(query, [fromDate, toDate]);
    return rows;
  }

  async getGuruPortfolios(date?: string | null): Promise<any> {
    const dateFilter = date ? 'WHERE DATE(sa.date) = $1' : 'WHERE DATE(sa.date) = (SELECT MAX(DATE(date)) FROM stock_analysis)';
    const params = date ? [date] : [];
    
    const query = `
      SELECT 
        g.id as guru_id,
        g.guru_name,
        sa.ticker_id,
        sa.ticker,
        sa.signal_score,
        sa.sentiment_score,
        sa.rule1_score,
        sa.moat_score,
        sa.management_score,
        sa.buy_price,
        sa.per_upside,
        sa.last_price,
        sa.last_gr,
        sa.long_gr,
        sa.last_action,
        sa.per_portfolio,
        DATE(sa.date) as analysis_date
      FROM guru g
      JOIN stock_analysis sa ON g.id = sa.guru_id
      ${dateFilter}
      ORDER BY g.guru_name, sa.ticker
    `;
    
    const { rows } = await pool.query(query, params);
    
    // Get the actual date used
    const actualDate = rows.length > 0 ? rows[0].analysis_date : null;
    
    // Group by guru
    const guruMap = new Map();
    
    rows.forEach(row => {
      if (!guruMap.has(row.guru_id)) {
        guruMap.set(row.guru_id, {
          guru_name: row.guru_name,
          guru_id: row.guru_id,
          stocks: []
        });
      }
      
      guruMap.get(row.guru_id).stocks.push({
        ticker_id: row.ticker_id,
        ticker: row.ticker,
        signal: row.signal_score,
        sentiment: row.sentiment_score,
        rule1_score: row.rule1_score,
        moat_score: row.moat_score,
        management_score: row.management_score,
        buy_price: row.buy_price,
        upside_percent: row.per_upside,
        current_price: row.last_price,
        analyst_growth: row.last_gr,
        composite_growth: row.long_gr,
        last_action: row.last_action,
        portfolio_percent: row.per_portfolio
      });
    });
    
    const gurus = Array.from(guruMap.values());
    const totalStocks = rows.length;
    
    return {
      date: actualDate,
      total_gurus: gurus.length,
      total_stocks: totalStocks,
      gurus
    };
  }

  async getCompanyInfo(symbol: string): Promise<any | null> {
    const query = `
      SELECT 
        id,
        symbol,
        business_description,
        address,
        website,
        ir_phone_number,
        email_address,
        year_established,
        fiscal_year_end,
        ceo,
        number_of_employees,
        sp
      FROM scraper_tasks 
      WHERE symbol = $1
    `;
    
    const { rows } = await pool.query(query, [symbol]);
    return rows.length ? rows[0] : null;
  }

  async getAllWithTickerInfo(): Promise<StockAnalysis[]> {
    const query = `
      SELECT 
        sa.*,
        st.symbol as ticker_symbol,
        g.guru_name as guru
      FROM stock_analysis sa
      LEFT JOIN scraper_tasks st ON sa.ticker_id = st.id
      LEFT JOIN guru g ON sa.guru_id = g.id
      ORDER BY sa.date DESC, sa.created_at DESC
    `;
    const { rows } = await pool.query(query);
    return rows;
  }

  async getByTickerAndDate(ticker: string, date: string): Promise<StockAnalysis[]> {
    const query = `
      SELECT 
        sa.*,
        st.symbol as ticker_symbol,
        g.guru_name as guru
      FROM stock_analysis sa
      LEFT JOIN scraper_tasks st ON sa.ticker_id = st.id
      LEFT JOIN guru g ON sa.guru_id = g.id
      WHERE sa.ticker = $1 AND DATE(sa.date) = $2
      ORDER BY sa.created_at DESC
    `;
    const { rows } = await pool.query(query, [ticker.toUpperCase(), date]);
    return rows;
  }

  async getCompaniesWithAnalysis(date?: string): Promise<any[]> {
    if (date) {
      // Query for specific date - get latest company and analysis per ticker_id
      const query = `
        WITH latest_analysis AS (
          SELECT DISTINCT ON (ticker_id) 
            ticker_id, signal_score, sentiment_score, date, created_at
          FROM stock_analysis 
          WHERE DATE(date) <= $1
          ORDER BY ticker_id, date DESC, created_at DESC
        ),
        latest_company AS (
          SELECT DISTINCT ON (ticker_id)
            *
          FROM company
          WHERE DATE(created_at) = $1
          ORDER BY ticker_id, created_at DESC
        )
        SELECT 
          lc.*,
          lc.company_url,
          lc.company_email,
          la.signal_score,
          la.sentiment_score,
          la.date as analysis_date,
          la.created_at as analysis_created_at,
          slc.categories,
          st.target
        FROM latest_company lc
        LEFT JOIN scraper_tasks st ON lc.ticker_id = st.id
        LEFT JOIN (
          SELECT 
            ticker_id, 
            ARRAY_AGG(category_name ORDER BY category_name) as categories
          FROM stock_list_categories 
          GROUP BY ticker_id
        ) slc ON lc.ticker_id = slc.ticker_id
        LEFT JOIN latest_analysis la ON lc.ticker_id = la.ticker_id
        ORDER BY la.created_at DESC NULLS LAST, lc.created_at DESC
      `;
      const { rows } = await pool.query(query, [date]);
      return rows;
    } else {
      // Query for latest analysis and company per ticker_id (no date filter)
      const query = `
        WITH latest_analysis AS (
          SELECT DISTINCT ON (ticker_id) 
            ticker_id, signal_score, sentiment_score, date, created_at
          FROM stock_analysis 
          ORDER BY ticker_id, date DESC, created_at DESC
        ),
        latest_company AS (
          SELECT DISTINCT ON (ticker_id)
            *
          FROM company
          ORDER BY ticker_id, created_at DESC
        )
        SELECT 
          lc.*,
          lc.company_url,
          lc.company_email,
          la.signal_score,
          la.sentiment_score,
          la.date as analysis_date,
          la.created_at as analysis_created_at,
          slc.categories,
          st.target
        FROM latest_company lc
        LEFT JOIN scraper_tasks st ON lc.ticker_id = st.id
        LEFT JOIN (
          SELECT 
            ticker_id, 
            ARRAY_AGG(category_name ORDER BY category_name) as categories
          FROM stock_list_categories 
          GROUP BY ticker_id
        ) slc ON lc.ticker_id = slc.ticker_id
        LEFT JOIN latest_analysis la ON lc.ticker_id = la.ticker_id
        ORDER BY la.date DESC NULLS LAST, la.created_at DESC NULLS LAST, lc.created_at DESC
      `;
      const { rows } = await pool.query(query);
      return rows;
    }
  }

  async getRecentCompanyDate(): Promise<string | null> {
    const query = 'SELECT MAX(DATE(created_at)) as recent_date FROM company';
    const { rows } = await pool.query(query);
    return rows[0]?.recent_date || null;
  }

  async getTickersWithViewByDate(date?: string): Promise<any[]> {
    let query = `
      SELECT 
        symbol,
        stock_ticker,
        ticker_view,
        last_updated_at
      FROM scraper_tasks
      WHERE ticker_view IS NOT NULL OR stock_ticker IS NOT NULL
    `;
    
    const params: any[] = [];
    
    if (date) {
      query += ` AND DATE(last_updated_at) = $1`;
      params.push(date);
    }
    
    query += ` ORDER BY last_updated_at DESC`;
    
    const { rows } = await pool.query(query, params);
    return rows;
  }

  async updateTickerView(ticker: string, tickerView: string): Promise<boolean> {
    const query = `
      UPDATE scraper_tasks 
      SET ticker_view = $1, last_updated_at = NOW()
      WHERE symbol = $2
      RETURNING id
    `;
    const { rows } = await pool.query(query, [tickerView, ticker.toUpperCase()]);
    return rows.length > 0;
  }

  async updateStockTicker(ticker: string, stockTicker: string): Promise<boolean> {
    const query = `
      UPDATE scraper_tasks 
      SET stock_ticker = $1, last_updated_at = NOW()
      WHERE symbol = $2
      RETURNING id
    `;
    const { rows } = await pool.query(query, [stockTicker, ticker.toUpperCase()]);
    return rows.length > 0;
  }
}

export default new StockAnalysisModel();
import { pool } from '../config/db';

export interface OldStockAnalysis {
  id?: number;
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
  date?: string;
  highlight?: boolean;
  status?: 'new' | 'existing' | 'removed';
}

export class OldStockAnalysisModel {
  async getAll(): Promise<OldStockAnalysis[]> {
    const query = `
      SELECT *
      FROM old_stock_analysis
      ORDER BY sentiment_score DESC
    `;
    const { rows } = await pool.query(query);
    return rows.map(row => ({
      ...row,
      highlight: row.sentiment_score > 60 && row.signal_score > 80
    }));
  }

  async getAllSorted(): Promise<OldStockAnalysis[]> {
    const query = `
      SELECT *
      FROM old_stock_analysis
      ORDER BY sentiment_score DESC
    `;
    const { rows } = await pool.query(query);
    return rows.map(row => ({
      ...row,
      highlight: row.sentiment_score > 60 && row.signal_score > 80
    }));
  }

  async getById(id: number): Promise<OldStockAnalysis | null> {
    const query = `
      SELECT *
      FROM old_stock_analysis
      WHERE id = $1
    `;
    const { rows } = await pool.query(query, [id]);
    return rows.length ? rows[0] : null;
  }

  async getByTicker(ticker: string): Promise<OldStockAnalysis[]> {
    const query = `
      SELECT *
      FROM old_stock_analysis
      WHERE ticker = $1
      ORDER BY date DESC
    `;
    const { rows } = await pool.query(query, [ticker]);
    return rows;
  }

  async getDailyChanges(): Promise<{
    current: OldStockAnalysis[];
    new: OldStockAnalysis[];
    removed: OldStockAnalysis[];
  }> {
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    const todayQuery = `
      SELECT *
      FROM old_stock_analysis
      WHERE date::date = $1::date
      ORDER BY sentiment_score DESC
    `;
    const todayResult = await pool.query(todayQuery, [today]);
    
    const yesterdayQuery = `
      SELECT *
      FROM old_stock_analysis
      WHERE date::date = $1::date
      ORDER BY sentiment_score DESC
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

  async getStocksWithSource(): Promise<OldStockAnalysis[]> {
    const query = `
      SELECT *,
        CASE 
          WHEN rule1_score > 0 THEN 'Rule 1'
          ELSE 'Magic Formula'
        END AS source
      FROM old_stock_analysis
      ORDER BY sentiment_score DESC
    `;
    
    const { rows } = await pool.query(query);
    
    return rows.map(row => ({
      ...row,
      highlight: row.sentiment_score > 60 && row.signal_score > 80
    }));
  }

  async getHighlightedStocks(): Promise<OldStockAnalysis[]> {
    const query = `
      SELECT *
      FROM old_stock_analysis
      WHERE sentiment_score > 60 AND signal_score > 80
      ORDER BY sentiment_score DESC
    `;
    
    const { rows } = await pool.query(query);
    return rows;
  }

  async getHighlightedStocksByDateRange(startDate?: string, endDate?: string): Promise<OldStockAnalysis[]> {
    let query = `
      SELECT *
      FROM old_stock_analysis
      WHERE sentiment_score > 60 AND signal_score > 80
    `;
    
    const params: any[] = [];
    let paramCounter = 1;
    
    if (startDate && endDate) {
      query += ` AND date::date >= $${paramCounter}::date AND date::date <= $${paramCounter + 1}::date`;
      params.push(startDate, endDate);
    } else if (startDate) {
      query += ` AND date::date >= $${paramCounter}::date`;
      params.push(startDate);
    } else if (endDate) {
      query += ` AND date::date <= $${paramCounter}::date`;
      params.push(endDate);
    }
    
    query += ` ORDER BY sentiment_score DESC`;
    
    const { rows } = await pool.query(query, params);
    return rows;
  }

  async getAllStocksByDateRange(startDate?: string, endDate?: string): Promise<OldStockAnalysis[]> {
    let query = `
      SELECT *
      FROM old_stock_analysis
      WHERE 1=1
    `;
    
    const params: any[] = [];
    let paramCounter = 1;
    
    if (startDate && endDate) {
      query += ` AND date::date >= $${paramCounter}::date AND date::date <= $${paramCounter + 1}::date`;
      params.push(startDate, endDate);
    } else if (startDate) {
      query += ` AND date::date >= $${paramCounter}::date`;
      params.push(startDate);
    } else if (endDate) {
      query += ` AND date::date <= $${paramCounter}::date`;
      params.push(endDate);
    }
    
    query += ` ORDER BY sentiment_score DESC`;
    
    const { rows } = await pool.query(query, params);
    return rows.map(row => ({
      ...row,
      highlight: row.sentiment_score > 60 && row.signal_score > 80
    }));
  }

  async getStocksByDateAndSource(date: string, source: string): Promise<OldStockAnalysis[]> {
    const formatDate = (dateStr: string): string => {
      const [month, day, year] = dateStr.split('/');
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    };
    
    const formattedDate = formatDate(date);

    const query = `
      SELECT *
      FROM old_stock_analysis
      WHERE date::date = $1::date AND source = $2
      ORDER BY sentiment_score DESC
    `;
    
    const { rows } = await pool.query(query, [formattedDate, source]);
    return rows;
  }
}

export default new OldStockAnalysisModel();
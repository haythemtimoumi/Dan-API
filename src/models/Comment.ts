import { pool } from '../config/db';

export interface Comment {
  id?: number;
  ticker?: string;
  ticker_id?: number;
  user_id?: number;
  comment: string;
  color?: string;
  date?: string;
  created_at?: string;
  updated_at?: string;
}

export class CommentModel {
  async getByTicker(ticker: string): Promise<Comment[]> {
    const query = `
      SELECT c.*, st.symbol as ticker 
      FROM comment c
      JOIN scraper_tasks st ON c.ticker_id = st.id
      WHERE st.symbol = $1 
      ORDER BY c.created_at DESC
    `;
    const { rows } = await pool.query(query, [ticker.toUpperCase()]);
    return rows.map(row => ({
      ...row,
      comment_text: row.comment,
      ticker: row.ticker
    }));
  }

  async create(commentData: Comment): Promise<Comment> {
    const { ticker, user_id, comment, color } = commentData;
    
    // First, get or create ticker_id
    const tickerQuery = `
      SELECT id FROM scraper_tasks WHERE symbol = $1 LIMIT 1
    `;
    const tickerResult = await pool.query(tickerQuery, [ticker?.toUpperCase()]);
    
    let ticker_id;
    if (tickerResult.rows.length > 0) {
      ticker_id = tickerResult.rows[0].id;
    } else {
      // Create a basic scraper_tasks entry if it doesn't exist
      const insertTickerQuery = `
        INSERT INTO scraper_tasks (symbol, scrape_type, scrape_status)
        VALUES ($1, 'manual', 'manual')
        RETURNING id
      `;
      const insertResult = await pool.query(insertTickerQuery, [ticker?.toUpperCase()]);
      ticker_id = insertResult.rows[0].id;
    }
    
    const query = `
      INSERT INTO comment (ticker_id, user_id, comment, color, created_at, updated_at)
      VALUES ($1, $2, $3, $4, NOW(), NOW())
      RETURNING *
    `;
    
    const values = [ticker_id, user_id || 1, comment, color];
    const { rows } = await pool.query(query, values);
    return {
      ...rows[0],
      comment_text: rows[0].comment,
      ticker: ticker
    };
  }

  async update(id: number, commentData: Comment): Promise<Comment | null> {
    const { comment, color } = commentData;
    
    const query = `
      UPDATE comment 
      SET comment = $1, color = $2, updated_at = NOW()
      WHERE id = $3
      RETURNING *
    `;
    
    const { rows } = await pool.query(query, [comment, color, id]);
    return rows.length ? { ...rows[0], comment_text: rows[0].comment } : null;
  }

  async delete(id: number): Promise<boolean> {
    const query = 'DELETE FROM comment WHERE id = $1 RETURNING id';
    const { rows } = await pool.query(query, [id]);
    return rows.length > 0;
  }

  async getLatestColorByTicker(ticker: string): Promise<string | null> {
    const query = `
      SELECT c.color 
      FROM comment c
      JOIN scraper_tasks st ON c.ticker_id = st.id
      WHERE st.symbol = $1 AND c.color IS NOT NULL
      ORDER BY c.created_at DESC
      LIMIT 1
    `;
    const { rows } = await pool.query(query, [ticker.toUpperCase()]);
    return rows.length > 0 ? rows[0].color : null;
  }

  async getAllTickerColors(): Promise<{ [ticker: string]: string }> {
    const query = `
      WITH latest_colors AS (
        SELECT 
          st.symbol as ticker,
          c.color,
          ROW_NUMBER() OVER (PARTITION BY st.symbol ORDER BY c.created_at DESC) as rn
        FROM comment c
        JOIN scraper_tasks st ON c.ticker_id = st.id
        WHERE c.color IS NOT NULL
      )
      SELECT ticker, color
      FROM latest_colors
      WHERE rn = 1
    `;
    const { rows } = await pool.query(query);
    const colorMap: { [ticker: string]: string } = {};
    rows.forEach(row => {
      colorMap[row.ticker] = row.color;
    });
    return colorMap;
  }

  async createTable(): Promise<void> {
    // Table already exists, no need to create
    return Promise.resolve();
  }
}

export default new CommentModel();
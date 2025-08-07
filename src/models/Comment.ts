import { pool } from '../config/db';

export interface Comment {
  id?: number;
  comment: string;
  user_id: number;
  ticker_id: number;
  color?: string;
  date?: string;
  created_at?: string;
  updated_at?: string;
  username?: string;
  ticker_symbol?: string;
}

class CommentModel {
  async getCommentsByUser(userId: number): Promise<Comment[]> {
    const query = `
      SELECT 
        c.id,
        c.comment,
        c.user_id,
        c.ticker_id,
        c.color,
        c.date,
        c.created_at,
        c.updated_at,
        u.username,
        st.symbol as ticker_symbol
      FROM comment c
      JOIN users u ON c.user_id = u.id
      JOIN scraper_tasks st ON c.ticker_id = st.id
      WHERE c.user_id = $1
      ORDER BY c.created_at DESC
    `;
    
    const result = await pool.query(query, [userId]);
    return result.rows;
  }

  async getCommentsByTicker(ticker: string): Promise<Comment[]> {
    const query = `
      SELECT 
        c.id,
        c.comment,
        c.user_id,
        c.ticker_id,
        c.color,
        c.date,
        c.created_at,
        c.updated_at,
        u.username,
        st.symbol as ticker_symbol
      FROM comment c
      JOIN users u ON c.user_id = u.id
      JOIN scraper_tasks st ON c.ticker_id = st.id
      WHERE st.symbol = $1
      ORDER BY c.created_at DESC
    `;
    
    const result = await pool.query(query, [ticker]);
    return result.rows;
  }

  async createComment(comment: { comment: string; user_id: number; ticker_symbol: string; color?: string }): Promise<Comment> {
    // First get ticker_id from symbol
    const tickerQuery = 'SELECT id FROM scraper_tasks WHERE symbol = $1';
    const tickerResult = await pool.query(tickerQuery, [comment.ticker_symbol]);
    
    if (tickerResult.rows.length === 0) {
      throw new Error('Ticker not found');
    }
    
    const ticker_id = tickerResult.rows[0].id;
    
    const query = `
      INSERT INTO comment (comment, user_id, ticker_id, color, date)
      VALUES ($1, $2, $3, $4, CURRENT_DATE)
      RETURNING *
    `;
    
    const result = await pool.query(query, [
      comment.comment,
      comment.user_id,
      ticker_id,
      comment.color
    ]);
    
    return result.rows[0];
  }

  async deleteComment(commentId: number, userId: number): Promise<boolean> {
    const query = 'DELETE FROM comment WHERE id = $1 AND user_id = $2';
    const result = await pool.query(query, [commentId, userId]);
    return (result.rowCount || 0) > 0;
  }
}

export default new CommentModel();
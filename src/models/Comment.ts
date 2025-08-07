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
}

export default new CommentModel();
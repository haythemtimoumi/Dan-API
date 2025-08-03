import { pool } from '../config/db';

export interface GuruTickerRequest {
  symbol: string;
  list_type?: string;
  scrape_type?: 'daily' | 'hourly' | 'monthly';
  active?: boolean;
  last_action?: string;
  per_portfolio?: string;
  target?: boolean;
  color?: 'red' | 'yellow' | 'green' | 'neutral';
}

export interface GuruTickerResponse {
  id: number;
  symbol: string;
  guru_id: number;
  guru_name: string;
  list_type?: string;
  scrape_type: string;
  active: boolean;
  message?: string;
}

export class GuruTickerModel {
  async createTickerWithGuru(data: GuruTickerRequest): Promise<GuruTickerResponse> {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      const symbol = data.symbol.toUpperCase();
      
      // Always use 'dan' as guru
      const guruResult = await client.query(
        'SELECT id FROM guru WHERE guru_name = $1',
        ['dan']
      );
      let guruId: number;
      if (guruResult.rows.length > 0) {
        guruId = guruResult.rows[0].id;
      } else {
        const createResult = await client.query(
          'INSERT INTO guru (guru_name) VALUES ($1) RETURNING id',
          ['dan']
        );
        guruId = createResult.rows[0].id;
      }
      
      // Check if ticker exists
      const tickerCheck = await client.query(
        'SELECT id FROM scraper_tasks WHERE symbol = $1',
        [symbol]
      );
      
      let tickerId: number;
      
      if (tickerCheck.rows.length === 0) {
        // Create new ticker
        const tickerResult = await client.query(`
          INSERT INTO scraper_tasks (
            symbol, list_type, scrape_type, active, current_step, 
            scrape_status, retry_count, last_action, per_portfolio, target, color
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
          RETURNING id
        `, [
          symbol,
          data.list_type || 'manual',
          data.scrape_type || 'daily',
          data.active !== undefined ? data.active : true,
          'rule1',
          'pending',
          0,
          data.last_action,
          data.per_portfolio,
          data.target !== undefined ? data.target : true,
          data.color || 'neutral'
        ]);
        tickerId = tickerResult.rows[0].id;
      } else {
        tickerId = tickerCheck.rows[0].id;
      }
      
      // Check if mapping already exists
      const mappingCheck = await client.query(
        'SELECT id FROM guru_ticker_map WHERE guru_id = $1 AND scraper_task_id = $2',
        [guruId, tickerId]
      );
      
      if (mappingCheck.rows.length > 0) {
        await client.query('COMMIT');
        
        // Return existing relationship
        const result = await client.query(`
          SELECT st.id, st.symbol, st.list_type, st.scrape_type, st.active, g.id as guru_id, g.guru_name
          FROM scraper_tasks st
          JOIN guru g ON g.id = $1
          WHERE st.id = $2
        `, [guruId, tickerId]);
        
        return { ...result.rows[0], message: 'Already linked' };
      }
      
      // Create mapping
      await client.query(
        'INSERT INTO guru_ticker_map (guru_id, scraper_task_id) VALUES ($1, $2)',
        [guruId, tickerId]
      );
      
      await client.query('COMMIT');
      
      // Return the created relationship
      const result = await client.query(`
        SELECT st.id, st.symbol, st.list_type, st.scrape_type, st.active, g.id as guru_id, g.guru_name
        FROM scraper_tasks st
        JOIN guru g ON g.id = $1
        WHERE st.id = $2
      `, [guruId, tickerId]);
      
      return result.rows[0];
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
  
  async updateTickerWithGuru(id: number, data: GuruTickerRequest): Promise<GuruTickerResponse | null> {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Check if ticker exists
      const tickerCheck = await client.query('SELECT * FROM scraper_tasks WHERE id = $1', [id]);
      if (tickerCheck.rows.length === 0) {
        return null;
      }
      
      // Always use 'dan' as guru for updates too
      const guruResult = await client.query(
        'SELECT id FROM guru WHERE guru_name = $1',
        ['dan']
      );
      let guruId: number;
      if (guruResult.rows.length > 0) {
        guruId = guruResult.rows[0].id;
      } else {
        const createResult = await client.query(
          'INSERT INTO guru (guru_name) VALUES ($1) RETURNING id',
          ['dan']
        );
        guruId = createResult.rows[0].id;
      }
      
      // Update scraper_tasks
      const updates: string[] = [];
      const values: any[] = [];
      let paramCounter = 1;
      
      if (data.symbol) {
        updates.push(`symbol = $${paramCounter}`);
        values.push(data.symbol.toUpperCase());
        paramCounter++;
      }
      
      ['list_type', 'scrape_type', 'active', 'last_action', 'per_portfolio', 'target', 'color'].forEach(field => {
        if (data[field as keyof GuruTickerRequest] !== undefined) {
          updates.push(`${field} = $${paramCounter}`);
          values.push(data[field as keyof GuruTickerRequest]);
          paramCounter++;
        }
      });
      
      if (updates.length > 0) {
        values.push(id);
        await client.query(
          `UPDATE scraper_tasks SET ${updates.join(', ')}, last_updated_at = CURRENT_TIMESTAMP WHERE id = $${paramCounter}`,
          values
        );
      }
      
      // Update guru mapping if needed
      if (guruId) {
        await client.query(
          'INSERT INTO guru_ticker_map (guru_id, scraper_task_id) VALUES ($1, $2) ON CONFLICT (guru_id, scraper_task_id) DO NOTHING',
          [guruId, id]
        );
      }
      
      await client.query('COMMIT');
      
      // Return updated ticker with guru info
      const result = await client.query(`
        SELECT st.id, st.symbol, st.list_type, st.scrape_type, st.active, 
               COALESCE($1, (SELECT guru_id FROM guru_ticker_map WHERE scraper_task_id = st.id LIMIT 1)) as guru_id,
               g.guru_name
        FROM scraper_tasks st
        LEFT JOIN guru g ON g.id = COALESCE($1, (SELECT guru_id FROM guru_ticker_map WHERE scraper_task_id = st.id LIMIT 1))
        WHERE st.id = $2
      `, [guruId, id]);
      
      return result.rows[0];
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}

export default new GuruTickerModel();
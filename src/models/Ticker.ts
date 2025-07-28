import { pool } from '../config/db';

export interface Ticker {
  id?: number;
  symbol: string;
  guru_id?: number;
  list_type?: string;
  scrape_type?: 'daily' | 'hourly' | 'monthly';
  active?: boolean;
  current_step?: string;
  scrape_status?: string;
  retry_count?: number;
  last_updated_at?: string;
  rule1_scraped_at?: string;
  stockscore_scraped_at?: string;
  last_price_scraped_at?: string;
  last_action?: string;
  per_portfolio?: string;
  guru_name?: string;
}

export interface Guru {
  id: number;
  guru_name: string;
}

export class TickerModel {
  async getAll(): Promise<Ticker[]> {
    const query = `
      SELECT st.*, g.guru_name
      FROM scraper_tasks st
      LEFT JOIN guru g ON st.guru_id = g.id
      ORDER BY st.id DESC
    `;
    const { rows } = await pool.query(query);
    return rows;
  }

  async getById(id: number): Promise<Ticker | null> {
    const query = `
      SELECT st.*, g.guru_name
      FROM scraper_tasks st
      LEFT JOIN guru g ON st.guru_id = g.id
      WHERE st.id = $1
    `;
    const { rows } = await pool.query(query, [id]);
    return rows.length ? rows[0] : null;
  }

  async create(tickerData: Ticker): Promise<Ticker> {
    const {
      symbol, guru_id, list_type, scrape_type, last_action, per_portfolio
    } = tickerData;

    const query = `
      INSERT INTO scraper_tasks (
        symbol, guru_id, list_type, scrape_type, active, current_step, 
        scrape_status, retry_count, last_action, per_portfolio
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `;

    const values = [
      symbol.toUpperCase(),
      guru_id,
      list_type || 'manual',
      scrape_type || 'daily',
      true,
      'rule1',
      'pending',
      0,
      last_action,
      per_portfolio
    ];

    const { rows } = await pool.query(query, values);
    return rows[0];
  }

  async update(id: number, tickerData: Ticker): Promise<Ticker | null> {
    const checkQuery = 'SELECT * FROM scraper_tasks WHERE id = $1';
    const checkResult = await pool.query(checkQuery, [id]);
    
    if (checkResult.rows.length === 0) {
      return null;
    }

    const updates: string[] = [];
    const values: any[] = [];
    let paramCounter = 1;

    Object.entries(tickerData).forEach(([key, value]) => {
      if (key !== 'id' && key !== 'guru_name' && value !== undefined) {
        if (key === 'symbol' && typeof value === 'string') {
          updates.push(`${key} = $${paramCounter}`);
          values.push(value.toUpperCase());
        } else {
          updates.push(`${key} = $${paramCounter}`);
          values.push(value);
        }
        paramCounter++;
      }
    });

    if (updates.length === 0) {
      return checkResult.rows[0];
    }

    values.push(id);
    const updateQuery = `
      UPDATE scraper_tasks 
      SET ${updates.join(', ')}, last_updated_at = CURRENT_TIMESTAMP
      WHERE id = $${paramCounter}
    `;

    await pool.query(updateQuery, values);
    
    const selectQuery = `
      SELECT st.*, g.guru_name
      FROM scraper_tasks st
      LEFT JOIN guru g ON st.guru_id = g.id
      WHERE st.id = $1
    `;
    
    const { rows } = await pool.query(selectQuery, [id]);
    return rows[0];
  }

  async delete(id: number): Promise<boolean> {
    const query = 'DELETE FROM scraper_tasks WHERE id = $1 RETURNING id';
    const { rows } = await pool.query(query, [id]);
    return rows.length > 0;
  }

  async getGurus(): Promise<Guru[]> {
    const query = 'SELECT id, guru_name FROM guru ORDER BY guru_name';
    const { rows } = await pool.query(query);
    return rows;
  }

  async getBySymbol(symbol: string): Promise<Ticker[]> {
    const query = `
      SELECT st.*, g.guru_name
      FROM scraper_tasks st
      LEFT JOIN guru g ON st.guru_id = g.id
      WHERE st.symbol = $1
      ORDER BY st.id DESC
    `;
    const { rows } = await pool.query(query, [symbol.toUpperCase()]);
    return rows;
  }

  async getActiveCount(): Promise<number> {
    const query = 'SELECT COUNT(*) as count FROM scraper_tasks WHERE active = true';
    const { rows } = await pool.query(query);
    return parseInt(rows[0].count);
  }
}

export default new TickerModel();
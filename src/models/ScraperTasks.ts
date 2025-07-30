import { pool } from '../config/db';

export class ScraperTasksModel {
  static async getDistinctListTypes(): Promise<string[]> {
    const query = 'SELECT DISTINCT list_type FROM scraper_tasks WHERE list_type IS NOT NULL ORDER BY list_type';
    const result = await pool.query(query);
    return result.rows.map(row => row.list_type);
  }

  static async addMultipleTickers(tickers: string[]): Promise<{ added: string[], updated: string[] }> {
    const guruId = 1231; // Dan's guru_id
    const listType = 'rule1';
    const added: string[] = [];
    const updated: string[] = [];

    for (const ticker of tickers) {
      const query = `
        INSERT INTO scraper_tasks (symbol, guru_id, list_type, scrape_type, target, active)
        VALUES ($1, $2, $3, 'rule1', true, true)
        ON CONFLICT (symbol, guru_id, list_type)
        DO UPDATE SET target = true
        RETURNING (xmax = 0) AS inserted
      `;
      
      const result = await pool.query(query, [ticker.toUpperCase(), guruId, listType]);
      
      if (result.rows[0].inserted) {
        added.push(ticker);
      } else {
        updated.push(ticker);
      }
    }

    return { added, updated };
  }
}
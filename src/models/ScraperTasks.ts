import { pool } from '../config/db';

export class ScraperTasksModel {
  static async getDistinctListTypes(): Promise<string[]> {
    const query = 'SELECT DISTINCT list_type FROM scraper_tasks WHERE list_type IS NOT NULL ORDER BY list_type';
    const result = await pool.query(query);
    return result.rows.map(row => row.list_type);
  }
}
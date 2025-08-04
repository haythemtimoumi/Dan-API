import { Request, Response } from 'express';
import { pool } from '../config/db';

export const getGurusWithTickers = async (req: Request, res: Response): Promise<void> => {
  try {
    const query = `
      SELECT 
        g.id as guru_id,
        g.guru_name,
        json_agg(
          json_build_object(
            'symbol', st.symbol,
            'last_act', gtm.last_act,
            'per_port', gtm.per_port
          )
        ) as tickers
      FROM guru g
      LEFT JOIN guru_ticker_map gtm ON g.id = gtm.guru_id
      LEFT JOIN scraper_tasks st ON gtm.scraper_task_id = st.id
      WHERE st.symbol IS NOT NULL
      GROUP BY g.id, g.guru_name
      ORDER BY g.guru_name
    `;
    
    const { rows } = await pool.query(query);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching gurus with tickers:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getGuruTickers = async (req: Request, res: Response): Promise<void> => {
  try {
    const guruId = parseInt(req.params.id);
    if (isNaN(guruId)) {
      res.status(400).json({ error: 'Invalid guru ID format' });
      return;
    }

    const query = `
      SELECT 
        st.symbol,
        st.scrape_type,
        gtm.last_act,
        gtm.per_port
      FROM guru_ticker_map gtm
      JOIN scraper_tasks st ON gtm.scraper_task_id = st.id
      WHERE gtm.guru_id = $1
      ORDER BY st.symbol
    `;
    
    const { rows } = await pool.query(query, [guruId]);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching guru tickers:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
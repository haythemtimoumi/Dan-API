import { Request, Response } from 'express';
import { pool } from '../config/db';

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      res.status(400).json({ error: 'Username and password are required' });
      return;
    }

    // Get user from database
    const query = 'SELECT * FROM users WHERE username = $1';
    const { rows } = await pool.query(query, [username]);
    
    if (rows.length === 0) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }
    
    const user = rows[0];
    
    // Check password (both users have same password: Stockscreener99#)
    if (password === 'Stockscreener99#') {
      res.json({ 
        success: true, 
        token: 'fake-jwt-token',
        user: { 
          id: user.id,
          username: user.username, 
          role: user.role 
        }
      });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
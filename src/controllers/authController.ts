import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../config/db';

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      res.status(400).json({ message: 'Username and password required' });
      return;
    }

    const userQuery = 'SELECT * FROM users WHERE username = $1';
    const { rows } = await pool.query(userQuery, [username]);

    if (rows.length === 0) {
      console.log(`[WARN] Invalid login attempt - IP: ${req.ip}, Username: ${username}`);
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    const user = rows[0];
    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      console.log(`[WARN] Invalid password attempt - IP: ${req.ip}, Username: ${username}`);
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: '24h' }
    );

    console.log(`[INFO] User logged in - Username: ${username}, Role: ${user.role}`);
    res.json({ 
      token, 
      user: { id: user.id, username: user.username, role: user.role } 
    });
  } catch (error) {
    console.log(`[ERROR] Login error:`, error);
    res.status(500).json({ message: 'Server error' });
  }
};
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { param, body, validationResult } from 'express-validator';

interface AuthRequest extends Request {
  user?: { id: string; username: string; role: string };
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    req.user = undefined;
    return next();
  }

  jwt.verify(token, process.env.JWT_SECRET!, (err: any, user: any) => {
    if (err) {
      console.log(`[WARN] Invalid token - IP: ${req.ip}, Path: ${req.path}`);
      req.user = undefined;
    } else {
      req.user = user;
    }
    next();
  });
};

export const requireAuth = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (!req.user) {
    console.log(`[WARN] Unauthorized access attempt - IP: ${req.ip}, Path: ${req.path}`);
    res.status(401).json({ message: 'Authentication required' });
    return;
  }
  next();
};

export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (!req.user || req.user.role !== 'admin') {
    console.log(`[WARN] Admin access denied - IP: ${req.ip}, Path: ${req.path}, Role: ${req.user?.role}`);
    res.status(403).json({ message: 'Admin access required' });
    return;
  }
  next();
};

export const checkWritePermission = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const method = req.method;
  
  // Allow GET requests for everyone
  if (method === 'GET') {
    return next();
  }
  
  // For non-GET requests, require authentication
  if (!req.user) {
    console.log(`[WARN] Write operation without auth - IP: ${req.ip}, Path: ${req.path}, Method: ${method}`);
    res.status(401).json({ message: 'Authentication required for this operation' });
    return;
  }
  
  // Admin can do everything
  if (req.user.role === 'admin') {
    return next();
  }
  
  // Regular users cannot perform write operations
  console.log(`[WARN] Write operation denied - IP: ${req.ip}, Path: ${req.path}, Method: ${method}, Role: ${req.user.role}`);
  res.status(403).json({ message: 'Insufficient permissions for this operation' });
};

// Validation middleware
export const validateId = [
  param('id').isInt({ min: 1 }).withMessage('ID must be positive integer'),
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log(`[WARN] Validation failed - IP: ${req.ip}, Errors: ${JSON.stringify(errors.array())}`);
      res.status(400).json({ errors: errors.array() });
      return;
    }
    next();
  }
];

export const validateStock = [
  body('ticker').matches(/^[A-Z]{1,5}$/).withMessage('Invalid ticker'),
  body('pe').optional().isFloat({ min: 0 }).withMessage('PE must be positive'),
  body('signal_score').optional().isFloat({ min: 0, max: 100 }).withMessage('Signal score 0-100'),
  body('sentiment_score').optional().isFloat({ min: 0, max: 100 }).withMessage('Sentiment score 0-100'),
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log(`[WARN] Stock validation failed - IP: ${req.ip}, Errors: ${JSON.stringify(errors.array())}`);
      res.status(400).json({ errors: errors.array() });
      return;
    }
    next();
  }
];
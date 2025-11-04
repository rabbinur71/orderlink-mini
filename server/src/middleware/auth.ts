import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
const JWT_SECRET = process.env.JWT_SECRET || 'dev_jwt_secret_change';

export interface JwtPayload {
  sub: string;
  email: string;
  is_super?: boolean;
  iat?: number;
  exp?: number;
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'missing_auth' });
  }
  const token = auth.slice('Bearer '.length);
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    // attach to request for downstream handlers
    (req as any).user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'invalid_token' });
  }
}
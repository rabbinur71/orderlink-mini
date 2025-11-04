import { Request, Response } from 'express';
import db from '../services/db';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { listOrders } from '../services/orderService';

const JWT_SECRET = process.env.JWT_SECRET || 'dev_jwt_secret_change';

export async function adminLoginHandler(req: Request, res: Response) {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'invalid_payload' });

    const admin = await db('admins').select('*').where({ email }).first();
    if (!admin) {
      return res.status(401).json({ error: 'invalid_credentials' });
    }

    const ok = await bcrypt.compare(password, admin.password_hash);
    if (!ok) return res.status(401).json({ error: 'invalid_credentials' });

    const token = jwt.sign({ sub: admin.id, email: admin.email, is_super: admin.is_super }, JWT_SECRET, {
      expiresIn: '8h'
    });

    return res.json({ token, expiresIn: 8 * 3600 });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'internal_error' });
  }
}

export async function adminListOrdersHandler(req: Request, res: Response) {
  try {
    const orders = await listOrders(100);
    return res.json({ orders });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'internal_error' });
  }
}
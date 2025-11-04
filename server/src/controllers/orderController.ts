import { Request, Response } from 'express';
import { createOrder } from '../services/orderService';

export async function createOrderHandler(req: Request, res: Response) {
  try {
    const { product_id, customer_name, customer_phone, customer_address, qty } = req.body;
    if (!product_id || !customer_name || !customer_phone) {
      return res.status(400).json({ error: 'invalid_payload' });
    }

    const order = await createOrder({ product_id, customer_name, customer_phone, customer_address, qty });
    return res.status(201).json({ invoice_id: order.invoice_id, order_id: order.id });
  } catch (err: any) {
    console.error('createOrder error:', err.message || err);
    if ((err.message || '').includes('Product not found')) {
      return res.status(404).json({ error: 'product_not_found' });
    }
    return res.status(500).json({ error: 'internal_error' });
  }
}
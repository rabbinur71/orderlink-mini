import { Request, Response } from 'express';
import db from '../services/db';
import { enqueueMessage } from '../services/messageService';

/**
 * GET /admin/orders/:id
 */
export async function adminGetOrderHandler(req: Request, res: Response) {
  try {
    const id = req.params.id;
    const order = await db('orders').select('*').where({ id }).first();
    if (!order) return res.status(404).json({ error: 'order_not_found' });
    return res.json({ order });
  } catch (err) {
    console.error('adminGetOrder error', err);
    return res.status(500).json({ error: 'internal_error' });
  }
}

/**
 * PATCH /admin/orders/:id/status
 * Body: { status: 'processing'|'shipped'|'delivered'|'cancelled', note?: string }
 */
export async function adminUpdateOrderStatusHandler(req: Request, res: Response) {
  try {
    const id = req.params.id;
    const { status, note } = req.body;
    if (!status) return res.status(400).json({ error: 'missing_status' });

    const validStatuses = ['processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'invalid_status' });
    }

    // Fetch existing order
    const order = await db('orders').select('*').where({ id }).first();
    if (!order) return res.status(404).json({ error: 'order_not_found' });

    const oldStatus = order.status;

    // Prevent redundant updates
    if (oldStatus === status) {
      return res.json({ order });
    }

    // Update order status
    const [updated] = await db('orders')
      .where({ id })
      .update({ status, updated_at: db.fn.now() })
      .returning('*');

    // Insert into history
    await db('order_status_history').insert({
      order_id: id,
      old_status: oldStatus,
      new_status: status,
      changed_by: (req as any).user?.sub || 'admin',
      note: note || null,
      created_at: db.fn.now(),
    });

    // ✅ Enqueue SMS notification to customer
    let messageText = '';
    if (status === 'shipped') {
      messageText = `Your order ${updated.invoice_id} has been shipped!`;
    } else if (status === 'delivered') {
      messageText = `Your order ${updated.invoice_id} was delivered. Thank you!`;
    } else if (status === 'cancelled') {
      messageText = `Your order ${updated.invoice_id} has been cancelled.`;
    } else if (status === 'processing') {
      messageText = `We're preparing your order ${updated.invoice_id}.`;
    }

    if (messageText) {
      await enqueueMessage(db, {
        order_id: updated.id,
        channel: 'sms',
        payload: { text: messageText },
      });
    }

    return res.json({ order: updated });
  } catch (err) {
    console.error('adminUpdateOrderStatus error', err);
    return res.status(500).json({ error: 'internal_error' });
  }
}
import { v4 as uuidv4 } from 'uuid';
import db from './db';
import { enqueueMessage } from './messageService';

export async function getProductBySlug(slug: string) {
  return db('products').select('*').where({ slug }).first();
}

function generateInvoiceId(): string {
  const dt = new Date();
  const pad = (n: number) => n.toString().padStart(2, '0');
  const y = dt.getFullYear();
  const m = pad(dt.getMonth() + 1);
  const d = pad(dt.getDate());
  const hh = pad(dt.getHours());
  const mm = pad(dt.getMinutes());
  const ss = pad(dt.getSeconds());
  const random = Math.floor(Math.random() * 9000) + 1000;
  return `INV-${y}${m}${d}-${hh}${mm}${ss}-${random}`;
}

export async function createOrder(payload: {
  product_id: string;
  customer_name: string;
  customer_phone: string;
  customer_address?: string;
  qty?: number;
}) {
  const { product_id, customer_name, customer_phone, customer_address = '', qty = 1 } = payload;

  return db.transaction(async (trx) => {
    const product = await trx('products').select('*').where({ id: product_id }).first();
    if (!product) {
      throw new Error('Product not found');
    }

    const invoice_id = generateInvoiceId();
    const product_snapshot = {
      id: product.id,
      title: product.title,
      price_cents: Number(product.price_cents || 0),
      currency: product.currency || 'BDT',
      image_url: product.image_url || null,
      slug: product.slug,
    };

    const total_cents = Math.round((product_snapshot.price_cents || 0) * (qty || 1));

    const [order] = await trx('orders')
      .insert({
        invoice_id,
        product_id,
        product_snapshot,
        customer_name,
        customer_phone,
        customer_address,
        qty,
        total_cents,
        status: 'new',
        paid: false,
      })
      .returning('*');

    // Enqueue SMS notification using shared message service
    await enqueueMessage(trx, {
      order_id: order.id,
      channel: 'sms',
      payload: {
        text: `New order ${invoice_id} for ${customer_name} (${customer_phone}).`,
      },
    });

    return order; // ← must return the order!
  });
}

export async function listOrders(limit = 50) {
  return db('orders').select('*').orderBy('created_at', 'desc').limit(limit);
}
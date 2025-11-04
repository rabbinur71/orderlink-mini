import { Request, Response } from 'express';
import { createProduct, upsertProductByFbPostId, getProductById } from '../services/productService';

/**
 * POST /admin/products
 * Body: { title, price_cents, description?, currency?, image_url?, slug?, fb_post_id?, is_active? }
 */
export async function adminCreateProductHandler(req: Request, res: Response) {
  try {
    const body = req.body;
    if (!body || !body.title || body.price_cents == null) {
      return res.status(400).json({ error: 'invalid_payload' });
    }
    const product = await createProduct({
      fb_post_id: body.fb_post_id,
      title: body.title,
      description: body.description,
      price_cents: Number(body.price_cents),
      currency: body.currency,
      image_url: body.image_url,
      slug: body.slug,
      is_active: body.is_active
    });
    return res.status(201).json({ product });
  } catch (err: any) {
    console.error('adminCreateProduct error', err.message || err);
    return res.status(500).json({ error: 'internal_error' });
  }
}

/**
 * PUT /admin/products/:id
 * Body: partial product fields to update
 * Note: The adminUpdateProductHandler references require('../services/db').default dynamically to avoid circular imports;
 */
export async function adminUpdateProductHandler(req: Request, res: Response) {
  try {
    const id = req.params.id;
    if (!id) return res.status(400).json({ error: 'missing_id' });

    const existing = await getProductById(id);
    if (!existing) return res.status(404).json({ error: 'product_not_found' });

    const updates: any = {};
    const allowed = ['title','description','price_cents','currency','image_url','slug','is_active','fb_post_id'];
    for (const k of allowed) {
      if (req.body[k] !== undefined) updates[k] = req.body[k];
    }
    updates.updated_at = (global as any).db ? (global as any).db.fn.now() : undefined;

    const [updated] = await (require('../services/db').default)('products').where({ id }).update(updates).returning('*');
    return res.json({ product: updated });
  } catch (err: any) {
    console.error('adminUpdateProduct error', err.message || err);
    return res.status(500).json({ error: 'internal_error' });
  }
}

/**
 * POST /admin/products/upsert-by-fb
 * Body: { fb_post_id, title, price_cents, ... }
 */
export async function adminUpsertByFbHandler(req: Request, res: Response) {
  try {
    const { fb_post_id } = req.body;
    if (!fb_post_id) return res.status(400).json({ error: 'fb_post_id_required' });

    const product = await upsertProductByFbPostId(fb_post_id, req.body);
    return res.json({ product });
  } catch (err: any) {
    console.error('adminUpsertByFb error', err.message || err);
    return res.status(500).json({ error: 'internal_error' });
  }
}
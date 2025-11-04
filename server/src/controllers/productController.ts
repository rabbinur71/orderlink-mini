import { Request, Response } from 'express';
import { getProductBySlug } from '../services/orderService';

export async function getProductBySlugHandler(req: Request, res: Response) {
  try {
    const slug = req.params.slug;
    const product = await getProductBySlug(slug);
    if (!product) return res.status(404).json({ error: 'product_not_found' });

    // return product snapshot (client consumes this)
    const snapshot = {
      id: product.id,
      title: product.title,
      description: product.description,
      price_cents: Number(product.price_cents),
      currency: product.currency,
      image_url: product.image_url,
      slug: product.slug
    };
    return res.json(snapshot);
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ error: 'internal_error' });
  }
}
import db from './db';
import { slugify } from '../utils/slugify';
import { v4 as uuidv4 } from 'uuid';

export type CreateProductPayload = {
  fb_post_id?: string | null;
  title: string;
  description?: string | null;
  price_cents: number;
  currency?: string;
  image_url?: string | null;
  slug?: string | null;
  is_active?: boolean;
};

export async function getProductBySlug(slug: string) {
  return db('products').select('*').where({ slug }).first();
}

export async function getProductById(id: string) {
  return db('products').select('*').where({ id }).first();
}

export async function createProduct(payload: CreateProductPayload) {
  const title = payload.title.trim();
  let baseSlug = payload.slug ? payload.slug.trim() : slugify(title);
  if (!baseSlug) baseSlug = `product-${Date.now()}`;

  // ensure unique slug by appending numeric suffix if needed (up to 10 tries)
  let slug = baseSlug;
  for (let i = 0; i < 10; i++) {
    const exists = await db('products').select('id').where({ slug }).first();
    if (!exists) break;
    slug = `${baseSlug}-${Math.floor(Math.random() * 9000) + 1000}`;
  }

  const id = uuidv4();
  const product = {
    id,
    fb_post_id: payload.fb_post_id || null,
    title,
    description: payload.description || null,
    price_cents: Math.round(Number(payload.price_cents) || 0),
    currency: payload.currency || 'BDT',
    image_url: payload.image_url || null,
    slug,
    is_active: payload.is_active === undefined ? true : !!payload.is_active,
    created_at: db.fn.now(),
    updated_at: db.fn.now()
  };

  const [inserted] = await db('products').insert(product).returning('*');
  return inserted;
}

/**
 * idempotent UPSERT by fb_post_id; if fb_post_id exists update fields, otherwise insert.
 * Returns the product row.
 */
export async function upsertProductByFbPostId(fb_post_id: string, payload: CreateProductPayload) {
  if (!fb_post_id) throw new Error('fb_post_id_required');

  // try find existing product
  const existing = await db('products').select('*').where({ fb_post_id }).first();
  if (existing) {
    const updates: any = {
      title: payload.title ?? existing.title,
      description: payload.description ?? existing.description,
      price_cents: payload.price_cents ?? existing.price_cents,
      currency: payload.currency ?? existing.currency,
      image_url: payload.image_url ?? existing.image_url,
      is_active: payload.is_active === undefined ? existing.is_active : payload.is_active,
      updated_at: db.fn.now()
    };
    const [updated] = await db('products').where({ id: existing.id }).update(updates).returning('*');
    return updated;
  } else {
    const toCreate = {
      ...payload,
      fb_post_id
    };
    return createProduct(toCreate);
  }
}
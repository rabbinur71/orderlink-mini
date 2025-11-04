import { Knex } from 'knex';
import { v4 as uuidv4 } from 'uuid';

export async function seed(knex: Knex): Promise<void> {
  // Deletes ALL existing entries
  await knex('products').del();

  await knex('products').insert([
    {
      id: uuidv4(),
      fb_post_id: 'fb_post_sample_1',
      title: 'Sample Product',
      description: 'This is a seeded sample product for ORDERLINK-MINI',
      price_cents: 250000, // represents 2500.00 in smallest unit if you use cents
      currency: 'BDT',
      image_url: 'https://via.placeholder.com/400x300.png?text=Sample+Product',
      slug: 'sample-product',
      is_active: true
    }
  ]);
}
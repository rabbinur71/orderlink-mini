import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Ensure pgcrypto for gen_random_uuid()
  await knex.raw('CREATE EXTENSION IF NOT EXISTS pgcrypto;');

  await knex.schema.createTable('products', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('fb_post_id').nullable().unique();
    table.string('title').notNullable();
    table.text('description').nullable();
    table.bigInteger('price_cents').notNullable().defaultTo(0);
    table.string('currency').notNullable().defaultTo('BDT');
    table.text('image_url').nullable();
    table.string('slug').notNullable().unique();
    table.boolean('is_active').notNullable().defaultTo(true);
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('products');
}
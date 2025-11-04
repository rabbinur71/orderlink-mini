import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('orders', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('invoice_id').notNullable().unique();
    table.uuid('product_id').notNullable().references('id').inTable('products').onDelete('RESTRICT');
    table.jsonb('product_snapshot').notNullable();
    table.string('customer_name').notNullable();
    table.string('customer_phone').notNullable();
    table.text('customer_address').nullable();
    table.integer('qty').notNullable().defaultTo(1);
    table.bigInteger('total_cents').notNullable().defaultTo(0);
    table.string('status').notNullable().defaultTo('new'); // new, processing, shipped, delivered, cancelled
    table.boolean('paid').notNullable().defaultTo(false);
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('orders');
}
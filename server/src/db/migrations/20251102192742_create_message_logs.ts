import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('message_logs', (table) => {
    table.bigIncrements('id').primary();
    table.uuid('order_id').nullable().references('id').inTable('orders').onDelete('SET NULL');
    table.string('channel').notNullable(); // e.g., sms, fb_message, whatsapp
    table.jsonb('payload').notNullable();
    table.string('status').notNullable().defaultTo('queued'); // queued, sent, failed
    table.text('response').nullable();
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('message_logs');
}
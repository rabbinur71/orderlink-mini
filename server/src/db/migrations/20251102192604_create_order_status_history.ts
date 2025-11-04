import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('order_status_history', (table) => {
    table.bigIncrements('id').primary();
    table.uuid('order_id').notNullable().references('id').inTable('orders').onDelete('CASCADE');
    table.string('old_status').nullable();
    table.string('new_status').notNullable();
    table.string('changed_by').nullable(); // admin id or system
    table.text('note').nullable();
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('order_status_history');
}
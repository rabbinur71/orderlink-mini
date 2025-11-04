import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  const has = await knex.schema.hasColumn('message_logs', 'attempts');
  if (!has) {
    await knex.schema.alterTable('message_logs', (table) => {
      table.integer('attempts').notNullable().defaultTo(0);
      table.timestamp('last_attempt_at').nullable();
    });
  }
}

export async function down(knex: Knex): Promise<void> {
  const has = await knex.schema.hasColumn('message_logs', 'attempts');
  if (has) {
    await knex.schema.alterTable('message_logs', (table) => {
      table.dropColumn('attempts');
      table.dropColumn('last_attempt_at');
    });
  }
}
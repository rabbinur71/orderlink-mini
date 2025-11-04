import type { Knex } from 'knex';
import dotenv from 'dotenv';
import path from 'path';

// Load .env from PROJECT ROOT (three levels up from this file)
const envPath = path.resolve(__dirname, '../../../.env');
const result = dotenv.config({ path: envPath });

if (result.error) {
  console.error('❌ Failed to load .env:', result.error);
  throw new Error('Missing .env file');
}

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('❌ DATABASE_URL is not defined in .env file');
}

const config: { [key: string]: Knex.Config } = {
  development: {
    client: 'pg',
    connection: databaseUrl,
    migrations: {
      directory: path.resolve(__dirname, 'migrations'),
    },
    seeds: {
      directory: path.resolve(__dirname, 'seeds'),
    },
  },
};

export default config;
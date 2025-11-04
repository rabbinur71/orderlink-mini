import knex from 'knex';
import knexConfig from '../db/knexfile';
import dotenv from 'dotenv';
dotenv.config();

const env = process.env.NODE_ENV || 'development';
const config = (knexConfig as any)[env];

const db = knex(config);

export default db;
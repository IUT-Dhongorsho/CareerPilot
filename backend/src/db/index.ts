import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import * as dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL!;

// For migrations and general use
export const client = postgres(connectionString, { prepare: false, ssl: 'require' });
export const db = drizzle(client, { schema });

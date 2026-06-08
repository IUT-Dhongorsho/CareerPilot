import postgres from 'postgres';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env' });

const connectionString = process.env.DATABASE_URL!;

async function checkTable() {
  const sql = postgres(connectionString, { ssl: 'require' });
  try {
    const result = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE  table_schema = 'public'
        AND    table_name   = 'users'
      );
    `;
    console.log('Users table exists:', result[0].exists);
  } catch (err) {
    console.error('Error checking table:', err);
  } finally {
    await sql.end();
  }
}

checkTable();

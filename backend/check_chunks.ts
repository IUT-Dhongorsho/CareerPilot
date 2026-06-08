import postgres from 'postgres';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env' });

const connectionString = process.env.DATABASE_URL!;
const TARGET_USER_ID = '32e164a8-c4b0-4357-b41a-3b7fb3a9cadb';

async function checkUserChunks() {
  const sql = postgres(connectionString, { ssl: 'require' });
  try {
    const result = await sql`
      SELECT COUNT(*) as count 
      FROM cv_chunks 
      WHERE user_id = ${TARGET_USER_ID};
    `;
    console.log(`\n--- DB Check ---`);
    console.log(`Total chunks found for user ${TARGET_USER_ID}: ${result[0].count}`);
    
    if (parseInt(result[0].count) > 0) {
      const sample = await sql`
        SELECT chunk_text, created_at 
        FROM cv_chunks 
        WHERE user_id = ${TARGET_USER_ID} 
        LIMIT 1;
      `;
      console.log(`Sample chunk:`, sample[0]);
    }
  } catch (err) {
    console.error('Error checking chunks:', err);
  } finally {
    await sql.end();
  }
}

checkUserChunks();

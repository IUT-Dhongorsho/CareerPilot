
import { processMessage } from './src/services/chat/chat.service.js';
import { insertChunk } from './src/services/rag/vectorStore.js';
import { getEmbedding } from './src/services/rag/embeddings.js';
import { db } from './src/db/index.js';
import { users, chatSessions } from './src/db/schema.js';
import { eq } from 'drizzle-orm';

async function testRAG() {
  const testUserId = "test-user-" + Math.random().toString(36).substring(7);
  const testEmail = "test-" + testUserId + "@example.com";
  
  console.log("--- 1. Ensuring Test User Exists ---");
  const existingUser = await db.query.users.findFirst({ where: eq(users.id, testUserId) });
  if (!existingUser) {
    await db.insert(users).values({ id: testUserId, email: testEmail, fullName: "Test User" });
  }

  console.log("--- 2. Injecting Real CV Data ---");
  const cvText = "Expertise in Quantum Computing and Advanced Thermodynamics. Worked at NASA as a Lead Researcher from 2018 to 2024.";
  const embedding = await getEmbedding(cvText);
  await insertChunk(testUserId, cvText, embedding);
  console.log("Chunk inserted.");

  console.log("--- 3. Creating Chat Session ---");
  const [session] = await db.insert(chatSessions).values({ 
    userId: testUserId, 
    title: "Test RAG Session" 
  }).returning();

  console.log("--- 4. Testing Chat Response ---");
  const query = "Where did I work and what is my expertise?";
  console.log(`Query: ${query}`);
  
  try {
    const response = await processMessage(testUserId, session.id, query);
    console.log("\n--- AI RESPONSE ---");
    console.log(response);
    console.log("-------------------\n");
    
    if (response.toLowerCase().includes("nasa") || response.toLowerCase().includes("quantum")) {
      console.log("SUCCESS: The chat system correctly used the CV data!");
    } else {
      console.log("FAILURE: The chat system did NOT seem to use the CV data.");
    }
  } catch (error) {
    console.error("Error during chat processing:", error);
  }
}

testRAG().catch(console.error);

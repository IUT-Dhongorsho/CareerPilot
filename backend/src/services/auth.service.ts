import { db } from '../db/index.js';
import { users } from '../db/schema.js';
import { eq } from 'drizzle-orm';

export class AuthService {
  static async syncUser(data: { id: string; email: string; fullName?: string; avatarUrl?: string }) {
    // 1. First, try to find user by existing ID or Email to handle multi-provider conflicts
    const existingUser = await db.query.users.findFirst({
      where: (u, { or, eq }) => or(eq(u.id, data.id), eq(u.email, data.email))
    });

    if (existingUser) {
      // 2. If user exists but ID changed (e.g. same email, different provider, not linked in Supabase)
      // We update the existing record with the new ID and other info
      const [updated] = await db
        .update(users)
        .set({
          id: data.id, // Update to latest Supabase UID
          email: data.email,
          fullName: data.fullName || existingUser.fullName,
          avatarUrl: data.avatarUrl || existingUser.avatarUrl,
          updatedAt: new Date(),
        })
        .where(eq(users.id, existingUser.id))
        .returning();
      
      return updated;
    }

    // 3. If no user exists by ID or Email, create new
    const [newUser] = await db
      .insert(users)
      .values({
        id: data.id,
        email: data.email,
        fullName: data.fullName,
        avatarUrl: data.avatarUrl,
      })
      .returning();

    return newUser;
  }
}

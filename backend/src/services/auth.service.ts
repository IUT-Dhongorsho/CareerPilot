import { db } from '../db/index.js';
import { users } from '../db/schema.js';

export class AuthService {
  static async syncUser(data: { id: string; email: string; fullName?: string; avatarUrl?: string }) {
    // Create new user record or update existing
    const [user] = await db
      .insert(users)
      .values({
        id: data.id,
        email: data.email,
        fullName: data.fullName,
        avatarUrl: data.avatarUrl,
      })
      .onConflictDoUpdate({
        target: users.id, // Conflict on primary key
        set: {
          email: data.email,
          fullName: data.fullName,
          avatarUrl: data.avatarUrl,
          updatedAt: new Date(),
        },
      })
      .returning();

    return user;
  }
}

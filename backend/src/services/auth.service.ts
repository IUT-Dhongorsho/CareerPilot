import { db } from '../db';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';

export class AuthService {
  static async syncUser(data: { id: string; email: string; fullName?: string; avatarUrl?: string }) {
    const existingUser = await db.query.users.findFirst({
      where: eq(users.id, data.id),
    });

    if (existingUser) {
      // Update existing user info if needed
      const [updatedUser] = await db
        .update(users)
        .set({
          email: data.email,
          fullName: data.fullName || existingUser.fullName,
          avatarUrl: data.avatarUrl || existingUser.avatarUrl,
          updatedAt: new Date(),
        })
        .where(eq(users.id, data.id))
        .returning();
      return updatedUser;
    }

    // Create new user record
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

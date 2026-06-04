import { z } from 'zod';

export const syncUserSchema = z.object({
  id: z.string().min(1),
  email: z.string().email(),
  fullName: z.string().optional(),
  avatarUrl: z.string().url().optional(),
});

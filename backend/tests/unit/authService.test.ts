import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthService } from '../../src/services/auth.service';
import { db } from '../../src/db';
import { users } from '../../src/db/schema';

// Mock the DB
vi.mock('../../src/db', () => ({
  db: {
    query: {
      users: {
        findFirst: vi.fn(),
      },
    },
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    set: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    values: vi.fn().mockReturnThis(),
    returning: vi.fn(),
  },
}));

describe('AuthService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create a new user if one does not exist', async () => {
    const mockData = { id: 'user123', email: 'test@example.com' };
    
    (db.query.users.findFirst as any).mockResolvedValue(null);
    (db.insert(users).returning as any).mockResolvedValue([mockData]);

    const result = await AuthService.syncUser(mockData);

    expect(db.insert).toHaveBeenCalled();
    expect(result).toEqual(mockData);
  });

  it('should update an existing user if they exist', async () => {
    const mockData = { id: 'user123', email: 'updated@example.com' };
    const existingUser = { id: 'user123', email: 'old@example.com', fullName: 'Old Name' };
    
    (db.query.users.findFirst as any).mockResolvedValue(existingUser);
    (db.update(users).returning as any).mockResolvedValue([{ ...existingUser, email: mockData.email }]);

    const result = await AuthService.syncUser(mockData);

    expect(db.update).toHaveBeenCalled();
    expect(result.email).toBe(mockData.email);
  });
});

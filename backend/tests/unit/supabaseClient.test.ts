import { describe, it, expect, vi } from 'vitest';
import { supabase } from '../../src/utils/supabase-client';

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
  })),
}));

describe('Supabase Client', () => {
  it('should be initialized', () => {
    expect(supabase).toBeDefined();
    expect(supabase.from).toBeDefined();
  });
});

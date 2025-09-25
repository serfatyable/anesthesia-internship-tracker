import { hash, compare } from 'bcryptjs';
import { describe, it, expect } from 'vitest';

describe('bcrypt hashing', () => {
  it('hashes and validates a password', async () => {
    const pw = 'admin123';
    const h = await hash(pw, 12);
    expect(h).toBeTypeOf('string');
    const ok = await compare(pw, h);
    expect(ok).toBe(true);
  });
});

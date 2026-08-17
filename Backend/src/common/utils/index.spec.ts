import * as argon2 from 'argon2';
import { generateBookingCode, generateSecureToken, hashToken } from './index';

describe('common utils', () => {
  it('generates unique booking codes', () => {
    const a = generateBookingCode();
    const b = generateBookingCode();
    expect(a).toMatch(/^CIN-\d{4}-[A-F0-9]{6}$/);
    expect(a).not.toBe(b);
  });

  it('generates secure tokens', () => {
    const token = generateSecureToken();
    expect(token.length).toBeGreaterThan(20);
  });

  it('hashes tokens deterministically', () => {
    expect(hashToken('abc')).toBe(hashToken('abc'));
    expect(hashToken('abc')).not.toBe(hashToken('xyz'));
  });
});

describe('argon2 password hashing', () => {
  it('hashes and verifies passwords', async () => {
    const hash = await argon2.hash('Password123!');
    expect(await argon2.verify(hash, 'Password123!')).toBe(true);
    expect(await argon2.verify(hash, 'wrong')).toBe(false);
  });
});

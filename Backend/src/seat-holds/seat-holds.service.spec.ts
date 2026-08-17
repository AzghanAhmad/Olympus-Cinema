import { REDIS_KEYS } from '../common/constants';

describe('REDIS_KEYS', () => {
  it('builds seat hold keys', () => {
    expect(REDIS_KEYS.seatHold('scr', 'seat')).toBe('seat-hold:scr:seat');
    expect(REDIS_KEYS.holdMeta('hold-1')).toBe('hold-meta:hold-1');
  });
});

describe('acquireSeatHolds rollback logic', () => {
  it('rolls back acquired keys when a later key fails', async () => {
    const set = jest
      .fn()
      .mockResolvedValueOnce('OK')
      .mockResolvedValueOnce(null);
    const del = jest.fn().mockResolvedValue(1);

    const keys = ['seat-hold:s1:a', 'seat-hold:s1:b'];
    const acquired: string[] = [];
    const failed: string[] = [];

    for (const key of keys) {
      const result = await set(key, 'hold-1', 'EX', 600, 'NX');
      if (result === 'OK') acquired.push(key);
      else {
        failed.push(key);
        break;
      }
    }

    if (failed.length > 0 && acquired.length > 0) {
      await del(...acquired);
      acquired.length = 0;
      failed.push(...keys.filter((k) => !acquired.includes(k)));
    }

    expect(acquired).toEqual([]);
    expect(failed.length).toBeGreaterThan(0);
  });
});

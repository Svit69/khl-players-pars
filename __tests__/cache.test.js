import PlayerCache from '../src/cache/PlayerCache.js';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

describe('PlayerCache', () => {
  test('stores and retrieves before TTL', async () => {
    const cache = new PlayerCache(1, 1);
    cache.set('id', { foo: 'bar' });
    expect(cache.get('id')).toEqual({ foo: 'bar' });
    cache.destroy();
  });

  test('expires after TTL', async () => {
    const cache = new PlayerCache(0.05, 0.05); // 50ms
    cache.set('id', { foo: 'bar' });
    await sleep(70);
    expect(cache.get('id')).toBeNull();
    cache.destroy();
  });
});

import { describe, it, expect, beforeEach } from 'vitest';
import { LRUCache, generateCacheKey } from '../src/lib/cache';

describe('Efficiency & In-Memory LRU Cache', () => {
  let cache: LRUCache<string>;

  beforeEach(() => {
    cache = new LRUCache<string>(3, 5000); // Max 3 items, 5s TTL
  });

  it('should store and retrieve cached values accurately', () => {
    cache.set('k1', 'val1');
    expect(cache.get('k1')).toBe('val1');
    expect(cache.has('k1')).toBe(true);
  });

  it('should return null on cache misses', () => {
    expect(cache.get('non-existent')).toBeNull();
  });

  it('should track hits, misses, and hit ratio accurately', () => {
    cache.set('key-a', 'data-a');
    cache.get('key-a'); // hit 1
    cache.get('key-a'); // hit 2
    cache.get('key-b'); // miss 1

    const stats = cache.getStats();
    expect(stats.hits).toBe(2);
    expect(stats.misses).toBe(1);
    expect(stats.hitRatio).toBeCloseTo(0.667, 2);
  });

  it('should evict the least recently used entry when reaching max capacity', () => {
    cache.set('a', '1');
    cache.set('b', '2');
    cache.set('c', '3');

    // Access 'a' to refresh its recency
    cache.get('a');

    // Adding 'd' should now evict 'b' (oldest unaccessed item)
    cache.set('d', '4');

    expect(cache.get('b')).toBeNull(); // evicted
    expect(cache.get('a')).toBe('1'); // kept
    expect(cache.get('c')).toBe('3'); // kept
    expect(cache.get('d')).toBe('4'); // kept
  });

  it('should generate consistent cache keys from identical payloads', () => {
    const key1 = generateCacheKey('query', { docId: 'doc-1', text: 'notice' });
    const key2 = generateCacheKey('query', { docId: 'doc-1', text: 'notice' });
    const key3 = generateCacheKey('query', { docId: 'doc-2', text: 'notice' });

    expect(key1).toBe(key2);
    expect(key1).not.toBe(key3);
  });
});

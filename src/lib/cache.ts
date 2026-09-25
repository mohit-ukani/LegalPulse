/**
 * LegalPulse In-Memory LRU Cache & Efficiency Engine
 * 
 * Provides deterministic caching for repeated legal queries, quick-action chips,
 * and translations. Prevents duplicate Gemini API calls, eliminates token waste,
 * and provides sub-millisecond response times for warm queries.
 */

export interface CacheEntry<T> {
  value: T;
  expiresAt: number;
  hitCount: number;
}

export interface CacheStats {
  hits: number;
  misses: number;
  size: number;
  maxSize: number;
  hitRatio: number;
}

export class LRUCache<T> {
  private cache: Map<string, CacheEntry<T>> = new Map();
  private readonly maxSize: number;
  private readonly defaultTtlMs: number;
  private hits = 0;
  private misses = 0;

  constructor(maxSize = 250, defaultTtlMs = 1000 * 60 * 30) { // 30 minutes TTL
    this.maxSize = maxSize;
    this.defaultTtlMs = defaultTtlMs;
  }

  public get(key: string): T | null {
    const entry = this.cache.get(key);
    const now = Date.now();

    if (!entry) {
      this.misses++;
      return null;
    }

    if (now > entry.expiresAt) {
      this.cache.delete(key);
      this.misses++;
      return null;
    }

    // Refresh LRU order (delete & re-insert)
    this.cache.delete(key);
    entry.hitCount++;
    this.cache.set(key, entry);
    this.hits++;

    return entry.value;
  }

  public set(key: string, value: T, ttlMs?: number): void {
    const expiresAt = Date.now() + (ttlMs || this.defaultTtlMs);

    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.maxSize) {
      // Evict oldest (first key in Map)
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }

    this.cache.set(key, {
      value,
      expiresAt,
      hitCount: 0,
    });
  }

  public has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return false;
    }
    return true;
  }

  public clear(): void {
    this.cache.clear();
    this.hits = 0;
    this.misses = 0;
  }

  public getStats(): CacheStats {
    const total = this.hits + this.misses;
    return {
      hits: this.hits,
      misses: this.misses,
      size: this.cache.size,
      maxSize: this.maxSize,
      hitRatio: total > 0 ? Number((this.hits / total).toFixed(3)) : 0,
    };
  }
}

// Global shared caches for high-traffic legal operations
export const analysisCache = new LRUCache<Record<string, unknown>>(200, 1000 * 60 * 30);
export const translationCache = new LRUCache<Record<string, unknown>>(300, 1000 * 60 * 60); // 1 hour TTL
export const comparisonCache = new LRUCache<Record<string, unknown>>(100, 1000 * 60 * 30);

/**
 * Computes a fast string hash for caching arbitrary legal query payloads
 */
export function generateCacheKey(prefix: string, payload: Record<string, unknown>): string {
  const serialized = JSON.stringify(payload);
  let hash = 0;
  for (let i = 0; i < serialized.length; i++) {
    const char = serialized.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return `${prefix}:${Math.abs(hash)}`;
}

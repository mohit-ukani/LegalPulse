/**
 * LegalPulse Security & Responsible AI Guardrails
 * 
 * Provides defense-in-depth for AI interactions, including:
 * 1. Prompt injection & jailbreak detection
 * 2. Input sanitization and token caps
 * 3. In-memory sliding-window rate limiting
 * 4. File upload magic-byte verification and path traversal prevention
 */

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetInMs: number;
}

/**
 * In-memory sliding-window rate limiter
 */
class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  private maxRequests: number;
  private windowMs: number;

  constructor(maxRequests = 60, windowMs = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  public check(identifier: string): RateLimitResult {
    const now = Date.now();
    const timestamps = this.requests.get(identifier) || [];
    const windowStart = now - this.windowMs;

    // Filter out timestamps outside current sliding window
    const validTimestamps = timestamps.filter((t) => t > windowStart);

    if (validTimestamps.length >= this.maxRequests) {
      const oldest = validTimestamps[0];
      const resetInMs = Math.max(0, oldest + this.windowMs - now);
      this.requests.set(identifier, validTimestamps);
      return { allowed: false, remaining: 0, resetInMs };
    }

    validTimestamps.push(now);
    this.requests.set(identifier, validTimestamps);

    return {
      allowed: true,
      remaining: this.maxRequests - validTimestamps.length,
      resetInMs: this.windowMs,
    };
  }

  public clear(): void {
    this.requests.clear();
  }
}

// Global rate limiter instances for different API tiers
export const queryRateLimiter = new RateLimiter(60, 60000); // 60 requests per minute
export const uploadRateLimiter = new RateLimiter(20, 60000); // 20 uploads per minute

/**
 * Common adversarial prompt injection patterns in LLMs
 */
const INJECTION_PATTERNS = [
  /ignore\s+(all\s+)?(previous|prior|above)\s+instructions/i,
  /disregard\s+(all\s+)?(previous|prior|system)\s+instructions/i,
  /bypass\s+(safety|content|system)\s+(filter|guidelines|prompt)/i,
  /reveal\s+(your\s+)?(system\s+prompt|initial\s+prompt|hidden\s+instructions)/i,
  /you\s+are\s+now\s+(an?\s+)?(unfiltered|unrestricted|dan\s+mode)/i,
  /dan\s+mode\s+enabled/i,
  /act\s+as\s+an?\s+unrestricted\s+ai/i,
  /print\s+system\s+prompt/i,
  /<script[\s\S]*?>[\s\S]*?<\/script>/i,
  /javascript:/i,
];

export interface InjectionCheckResult {
  isSafe: boolean;
  threatDetected?: string;
}

/**
 * Evaluates user prompt for prompt injection and jailbreak attempts
 */
export function detectPromptInjection(prompt: string): InjectionCheckResult {
  if (!prompt || typeof prompt !== 'string') {
    return { isSafe: true };
  }

  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(prompt)) {
      return {
        isSafe: false,
        threatDetected: 'Potential prompt injection or safety bypass detected.',
      };
    }
  }

  return { isSafe: true };
}

/**
 * Sanitizes legal inputs by trimming control characters and capping length
 */
export function sanitizeLegalInput(input: unknown, maxLength = 2500): string {
  if (typeof input !== 'string') {
    return '';
  }

  // Remove null bytes and non-printable control characters (preserve newlines/tabs)
  let sanitized = input.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

  // Strip excessive whitespace
  sanitized = sanitized.trim();

  // Enforce strict upper bound
  if (sanitized.length > maxLength) {
    sanitized = sanitized.slice(0, maxLength);
  }

  return sanitized;
}

/**
 * Validates PDF magic bytes (%PDF- at byte offset 0)
 */
export function verifyPdfMagicBytes(buffer: Buffer | Uint8Array): boolean {
  if (!buffer || buffer.length < 5) return false;
  // %PDF- in ASCII: 0x25, 0x50, 0x44, 0x46, 0x2D
  return (
    buffer[0] === 0x25 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x44 &&
    buffer[3] === 0x46 &&
    buffer[4] === 0x2d
  );
}

/**
 * Sanitizes uploaded file names against directory traversal attacks
 */
export function sanitizeFileName(name: string): string {
  if (!name || typeof name !== 'string') return 'document.pdf';
  // Strip path traversal indicators
  const clean = name.replace(/^.*[\\/]/, '').replace(/\.\./g, '');
  // Keep alphanumeric, hyphens, underscores, dots
  return clean.replace(/[^a-zA-Z0-9._-]/g, '_');
}

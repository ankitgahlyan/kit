// Input sanitization utilities

/**
 * Sanitize string input to prevent XSS and other attacks
 */
export function sanitizeString(input: unknown): string {
    if (typeof input !== 'string') {
        return '';
    }

    return input
        .replace(/[<>]/g, '') // Remove angle brackets
        .replace(/javascript:/gi, '') // Remove javascript: protocol
        .replace(/on\w+=/gi, '') // Remove event handlers like onclick=
        .trim()
        .slice(0, 1000); // Limit length
}

/**
 * Sanitize HTML content (basic)
 */
export function sanitizeHtml(input: unknown): string {
    if (typeof input !== 'string') {
        return '';
    }

    return input
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
        .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '') // Remove iframe tags
        .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '') // Remove object tags
        .replace(/<embed\b[^<]*>/gi, '') // Remove embed tags
        .replace(/javascript:/gi, '') // Remove javascript: protocol
        .replace(/on\w+\s*=/gi, '') // Remove event handlers
        .trim()
        .slice(0, 10000); // Limit length
}

/**
 * Sanitize URL input
 */
export function sanitizeUrl(input: unknown): string {
    if (typeof input !== 'string') {
        return '';
    }

    // Remove dangerous protocols
    const cleaned = input
        .replace(/^\s*(javascript|data|vbscript):/gi, '')
        .trim()
        .slice(0, 2000); // Limit length

    // Ensure it starts with a safe protocol or is relative
    if (cleaned && !cleaned.match(/^(https?:|\/\/|\/)/)) {
        return `https://${cleaned}`;
    }

    return cleaned;
}

/**
 * Sanitize numeric input
 */
export function sanitizeNumber(
    input: unknown,
    options: { min?: number; max?: number; integer?: boolean } = {},
): number | null {
    const { min = -Infinity, max = Infinity, integer = false } = options;

    let num: number;

    if (typeof input === 'number') {
        num = input;
    } else if (typeof input === 'string') {
        num = parseFloat(input);
    } else {
        return null;
    }

    // Check if it's a valid number
    if (isNaN(num) || !isFinite(num)) {
        return null;
    }

    // Apply integer constraint
    if (integer) {
        num = Math.floor(num);
    }

    // Apply bounds
    num = Math.max(min, Math.min(max, num));

    return num;
}

/**
 * Sanitize object keys to prevent prototype pollution
 */
export function sanitizeObjectKeys<T extends Record<string, unknown>>(obj: T, allowedKeys?: string[]): Partial<T> {
    if (!obj || typeof obj !== 'object') {
        return {};
    }

    const sanitized: Partial<T> = {};
    const dangerousKeys = ['__proto__', 'constructor', 'prototype'];

    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            // Skip dangerous keys
            if (dangerousKeys.includes(key)) {
                continue;
            }

            // Check allowed keys if provided
            if (allowedKeys && !allowedKeys.includes(key)) {
                continue;
            }

            // Sanitize key name
            const sanitizedKey = sanitizeString(key) as keyof T;
            if (sanitizedKey) {
                sanitized[sanitizedKey] = obj[key];
            }
        }
    }

    return sanitized;
}

/**
 * Sanitize hex string
 */
export function sanitizeHexString(input: unknown): string {
    if (typeof input !== 'string') {
        return '';
    }

    // Remove 0x prefix if present
    let hex = input.toLowerCase().replace(/^0x/, '');

    // Keep only hex characters
    hex = hex.replace(/[^0-9a-f]/g, '');

    // Limit length (e.g., for public keys, hashes)
    hex = hex.slice(0, 128);

    return hex;
}

/**
 * Sanitize base64 string
 */
export function sanitizeBase64(input: unknown): string {
    if (typeof input !== 'string') {
        return '';
    }

    // Keep only valid base64 characters
    const base64 = input.replace(/[^A-Za-z0-9+/=]/g, '');

    // Limit length
    return base64.slice(0, 10000);
}

/**
 * Sanitize JSON string
 */
export function sanitizeJsonString(input: unknown): string {
    if (typeof input !== 'string') {
        return '{}';
    }

    try {
        // Parse and re-stringify to normalize
        const parsed = JSON.parse(input);

        // Remove potentially dangerous content
        const cleaned = sanitizeObjectKeys(parsed);

        return JSON.stringify(cleaned);
    } catch {
        return '{}';
    }
}

/**
 * Check if input contains potentially dangerous content
 */
export function containsDangerousContent(input: string): boolean {
    const dangerousPatterns = [
        /javascript:/gi,
        /data:/gi,
        /<script/gi,
        /<iframe/gi,
        /<object/gi,
        /<embed/gi,
        /on\w+\s*=/gi,
        /__proto__/gi,
        /constructor/gi,
        /prototype/gi,
    ];

    return dangerousPatterns.some((pattern) => pattern.test(input));
}

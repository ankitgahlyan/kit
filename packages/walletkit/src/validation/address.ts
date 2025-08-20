// TON address validation logic

import type { ValidationResult, ValidationContext } from './types';

/**
 * Validate TON address format
 */
export function validateTonAddress(address: string, context: ValidationContext = {}): ValidationResult {
    const errors: string[] = [];

    if (!address || typeof address !== 'string') {
        errors.push('address must be a non-empty string');
        return { isValid: false, errors };
    }

    // Check different TON address formats
    const validationResults = [
        validateRawAddress(address),
        validateBouncableAddress(address),
        validateNonBouncableAddress(address),
    ];

    // If none of the formats are valid, collect all errors
    const allValid = validationResults.some((result) => result.isValid);

    if (!allValid) {
        errors.push('address must be in valid TON format (raw, bounceable, or non-bounceable)');

        if (context.strict) {
            // Include specific format errors in strict mode
            validationResults.forEach((result, index) => {
                const formats = ['raw', 'bounceable', 'non-bounceable'];
                errors.push(`${formats[index]} format: ${result.errors.join(', ')}`);
            });
        }
    }

    return {
        isValid: errors.length === 0,
        errors,
    };
}

/**
 * Validate raw TON address (workchain:hex)
 */
export function validateRawAddress(address: string): ValidationResult {
    const errors: string[] = [];

    // Raw format: workchain:account_id (e.g., "0:1234567890abcdef...")
    const rawPattern = /^-?[0-9]+:[0-9a-fA-F]{64}$/;

    if (!rawPattern.test(address)) {
        errors.push('raw address must be in format "workchain:account_id" where account_id is 64 hex chars');
    } else {
        const [workchain, accountId] = address.split(':');
        const workchainNum = parseInt(workchain, 10);

        // Validate workchain
        if (workchainNum < -128 || workchainNum > 127) {
            errors.push('workchain must be between -128 and 127');
        }

        // Validate account ID
        if (accountId.length !== 64) {
            errors.push('account ID must be exactly 64 hexadecimal characters');
        }
    }

    return {
        isValid: errors.length === 0,
        errors,
    };
}

/**
 * Validate bounceable address (base64 encoded)
 */
export function validateBouncableAddress(address: string): ValidationResult {
    const errors: string[] = [];

    // Bounceable addresses typically start with EQ, UQ for mainnet
    if (!address.match(/^[EU]Q[A-Za-z0-9_-]{46}$/)) {
        errors.push('bounceable address must be 48 characters starting with EQ or UQ');
    } else {
        // Additional base64 validation
        if (!isValidBase64Url(address)) {
            errors.push('invalid base64url encoding in bounceable address');
        }
    }

    return {
        isValid: errors.length === 0,
        errors,
    };
}

/**
 * Validate non-bounceable address (base64 encoded)
 */
export function validateNonBouncableAddress(address: string): ValidationResult {
    const errors: string[] = [];

    // Non-bounceable addresses typically start with 0Q, kQ for mainnet
    if (!address.match(/^[0k]Q[A-Za-z0-9_-]{46}$/)) {
        errors.push('non-bounceable address must be 48 characters starting with 0Q or kQ');
    } else {
        // Additional base64 validation
        if (!isValidBase64Url(address)) {
            errors.push('invalid base64url encoding in non-bounceable address');
        }
    }

    return {
        isValid: errors.length === 0,
        errors,
    };
}

/**
 * Detect TON address format
 */
export function detectAddressFormat(address: string): 'raw' | 'bounceable' | 'non-bounceable' | 'unknown' {
    if (validateRawAddress(address).isValid) return 'raw';
    if (validateBouncableAddress(address).isValid) return 'bounceable';
    if (validateNonBouncableAddress(address).isValid) return 'non-bounceable';
    return 'unknown';
}

/**
 * Check if address is for mainnet or testnet
 */
export function detectAddressNetwork(address: string): 'mainnet' | 'testnet' | 'unknown' {
    const format = detectAddressFormat(address);

    if (format === 'raw') {
        const workchain = parseInt(address.split(':')[0], 10);
        return workchain === 0 ? 'mainnet' : 'testnet';
    }

    if (format === 'bounceable' || format === 'non-bounceable') {
        // This is simplified - real detection would need to decode the address
        // For now, assume addresses starting with certain prefixes are mainnet
        return address.startsWith('EQ') || address.startsWith('0Q') ? 'mainnet' : 'testnet';
    }

    return 'unknown';
}

/**
 * Validate base64url encoding
 */
function isValidBase64Url(str: string): boolean {
    try {
        // Base64url uses - and _ instead of + and /
        const base64 = str.replace(/-/g, '+').replace(/_/g, '/');

        // Add padding if needed
        const padded = base64 + '=='.substring(0, (4 - (base64.length % 4)) % 4);

        // Try to decode with atob if available (browser environment)
        if (typeof atob !== 'undefined') {
            atob(padded);
            return true;
        }

        // For Node.js or other environments without atob,
        // we'll do basic format validation only
        return /^[A-Za-z0-9+/]*={0,2}$/.test(padded);
    } catch {
        return false;
    }
}

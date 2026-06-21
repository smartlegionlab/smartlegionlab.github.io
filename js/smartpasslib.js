/**
 * SmartPassLib v4.0.0 - Client-side smart password generator
 * Cross-platform deterministic password generation
 * Same secret + same length = same password across all platforms
 * Decentralized by design — no central servers, no cloud dependency, no third-party trust required
 *
 * Compatible with smartpasslib Python/Go/Kotlin/C# implementations
 *
 * Key derivation:
 * - Private key: 15-30 iterations (dynamic, deterministic per secret)
 * - Public key: 45-60 iterations (dynamic, deterministic per secret)
 *
 * Secret phrase:
 *   - is not transferred anywhere
 *   - is not stored anywhere
 *   - is required to generate the private key when creating a smart password
 *   - minimum 12 characters (enforced)
 *
 * Password length:
 *   - minimum 12 characters (enforced)
 *   - maximum 100 characters (enforced)
 *
 * Ecosystem:
 *   - Core library (Python): https://github.com/smartlegionlab/smartpasslib
 *   - Core library (JS): https://github.com/smartlegionlab/smartpasslib-js
 *   - Core library (Kotlin): https://github.com/smartlegionlab/smartpasslib-kotlin
 *   - Core library (Go): https://github.com/smartlegionlab/smartpasslib-go
 *   - Core library (C#): https://github.com/smartlegionlab/smartpasslib-csharp
 *   - Desktop Python: https://github.com/smartlegionlab/smart-password-manager-desktop
 *   - Desktop C#: https://github.com/smartlegionlab/SmartPasswordManagerCsharpDesktop
 *   - CLI Manager Python: https://github.com/smartlegionlab/clipassman
 *   - CLI Manager C#: https://github.com/smartlegionlab/SmartPasswordManagerCsharpCli
 *   - CLI Generator Python: https://github.com/smartlegionlab/clipassgen
 *   - CLI Generator C#: https://github.com/smartlegionlab/SmartPasswordGeneratorCsharpCli
 *   - Web: https://github.com/smartlegionlab/smart-password-manager-web
 *   - Android: https://github.com/smartlegionlab/smart-password-manager-android
 *
 * Author: Alexander Suvorov https://github.com/smartlegionlab
 * License: BSD 3-Clause https://github.com/smartlegionlab/smartpasslib-js/blob/master/LICENSE
 * Copyright (c) 2026, Alexander Suvorov. All rights reserved.
 */

const SmartPassLib = (function() {
    'use strict';

    // Character set for password generation (Google-compatible)
    // Must match exactly with Python version: symbols + uppercase + digits + lowercase
    const CHARS = "!@#$%^&*()_+-=[]{};:,.<>?/ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyz";
    const VERSION = '4.0.0';

    function validateSecret(secret) {
        if (!secret || secret.length < 12) {
            throw new Error(`Secret phrase must be at least 12 characters. Current: ${secret ? secret.length : 0}`);
        }
    }

    function validatePasswordLength(length) {
        if (length < 12) {
            throw new Error(`Password length must be at least 12 characters. Current: ${length}`);
        }
        if (length > 100) {
            throw new Error(`Password length cannot exceed 100 characters. Current: ${length}`);
        }
    }

    function validateCodeLength(length) {
        if (length < 4) {
            throw new Error(`Code length must be at least 4 characters. Current: ${length}`);
        }
        if (length > 100) {
            throw new Error(`Code length cannot exceed 100 characters. Current: ${length}`);
        }
    }

    /**
     * SHA-256 hash using Web Crypto API
     * @param {string} text - Text to hash
     * @returns {Promise<string>} Hex string of hash (lowercase)
     */
    async function sha256(text) {
        const encoder = new TextEncoder();
        const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(text));
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    /**
     * Get deterministic steps count from secret hash
     * @param {string} secret - Secret phrase
     * @param {number} minSteps - Minimum steps
     * @param {number} maxSteps - Maximum steps
     * @param {string} salt - Salt for different key types
     * @returns {Promise<number>} Steps count
     */
    async function getStepsFromSecret(secret, minSteps, maxSteps, salt) {
        const hashValue = await sha256(`${secret}:${salt}`);
        const hashInt = parseInt(hashValue.substring(0, 8), 16);
        const steps = minSteps + (hashInt % (maxSteps - minSteps + 1));
        return steps;
    }

    /**
     * Generate a key from secret phrase with specified number of iterations
     * @param {string} secret - Secret phrase
     * @param {number} steps - Number of hash iterations
     * @param {string} salt - Salt for key derivation
     * @returns {Promise<string>} Key hex string
     */
    async function generateKey(secret, steps, salt) {
        validateSecret(secret);

        let allHash = await sha256(`${secret}:${salt}`);

        for (let i = 0; i < steps; i++) {
            const tempString = `${allHash}:${i}`;
            allHash = await sha256(tempString);
        }

        return allHash;
    }

    /**
     * Generate private key from secret phrase (15-30 deterministic iterations)
     * Used for password generation, never stored or transmitted
     * @param {string} secret - Secret phrase (minimum 12 characters)
     * @returns {Promise<string>} Private key hex string (64 characters = 256 bits)
     */
    async function generatePrivateKey(secret) {
        validateSecret(secret);
        const steps = await getStepsFromSecret(secret, 15, 30, 'private');
        return await generateKey(secret, steps, 'private');
    }

    /**
     * Generate public key from secret phrase (45-60 deterministic iterations)
     * Used for verification, stored locally
     * @param {string} secret - Secret phrase (minimum 12 characters)
     * @returns {Promise<string>} Public key hex string
     */
    async function generatePublicKey(secret) {
        validateSecret(secret);
        const steps = await getStepsFromSecret(secret, 45, 60, 'public');
        return await generateKey(secret, steps, 'public');
    }

    /**
     * Verify that a secret phrase matches a stored public key
     * @param {string} secret - Secret phrase to verify
     * @param {string} publicKey - Public key to check against
     * @returns {Promise<boolean>} True if valid
     */
    async function verifySecret(secret, publicKey) {
        const computedKey = await generatePublicKey(secret);
        return computedKey === publicKey;
    }

    /**
     * Convert hex string to byte array
     * @param {string} hex - Hex string
     * @returns {number[]} Byte array
     */
    function hexToBytes(hex) {
        const bytes = [];
        for (let i = 0; i < hex.length; i += 2) {
            bytes.push(parseInt(hex.substr(i, 2), 16));
        }
        return bytes;
    }

    /**
     * Generate deterministic password from private key
     * @param {string} privateKey - Private key hex string (from generatePrivateKey)
     * @param {number} length - Desired password length (12-100)
     * @returns {Promise<string>} Generated password
     */
    async function generatePasswordFromPrivateKey(privateKey, length) {
        validatePasswordLength(length);

        const result = [];
        let counter = 0;

        while (result.length < length) {
            const data = `${privateKey}:${counter}`;
            const hashHex = await sha256(data);
            const hashBytes = hexToBytes(hashHex);

            for (let i = 0; i < hashBytes.length && result.length < length; i++) {
                result.push(CHARS[hashBytes[i] % CHARS.length]);
            }
            counter++;
        }

        return result.join('');
    }

    /**
     * Generate deterministic smart password directly from secret phrase
     * This is the main method for end users
     * @param {string} secret - Secret phrase (minimum 12 characters)
     * @param {number} length - Desired password length (12-100)
     * @returns {Promise<string>} Generated password
     */
    async function generateSmartPassword(secret, length) {
        validateSecret(secret);
        validatePasswordLength(length);
        const privateKey = await generatePrivateKey(secret);
        return await generatePasswordFromPrivateKey(privateKey, length);
    }

    /**
     * Generate strong random password (cryptographically secure)
     * @param {number} length - Desired password length (12-100)
     * @returns {Promise<string>} Generated random password
     */
    async function generateStrongPassword(length) {
        validatePasswordLength(length);

        const array = new Uint8Array(length);
        crypto.getRandomValues(array);

        let result = '';
        for (let i = 0; i < length; i++) {
            result += CHARS[array[i] % CHARS.length];
        }
        return result;
    }

    /**
     * Generate base random password (simpler random)
     * @param {number} length - Desired password length (12-100)
     * @returns {Promise<string>} Generated random password
     */
    async function generateBasePassword(length) {
        return await generateStrongPassword(length);
    }

    /**
     * Generate authentication code (shorter, for 2FA)
     * @param {number} length - Desired code length (4-100)
     * @returns {Promise<string>} Generated code
     */
    async function generateCode(length) {
        validateCodeLength(length);

        const array = new Uint8Array(length);
        crypto.getRandomValues(array);

        let result = '';
        for (let i = 0; i < length; i++) {
            result += CHARS[array[i] % CHARS.length];
        }
        return result;
    }

    // Public API
    return {
        VERSION: VERSION,
        CHARS: CHARS,
        generatePrivateKey: generatePrivateKey,
        generatePublicKey: generatePublicKey,
        verifySecret: verifySecret,
        generateSmartPassword: generateSmartPassword,
        generateStrongPassword: generateStrongPassword,
        generateBasePassword: generateBasePassword,
        generateCode: generateCode
    };
})();

// Export for different environments
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SmartPassLib;
}
if (typeof window !== 'undefined') {
    window.SmartPassLib = SmartPassLib;
}
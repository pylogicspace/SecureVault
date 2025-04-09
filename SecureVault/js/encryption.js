/**
 * Encryption Module for Password Manager
 * 
 * This module handles encryption and decryption of sensitive data
 * using CryptoJS for client-side encryption.
 */

/**
 * Encrypt data using AES encryption
 * @param {string} data - Data to encrypt
 * @param {string} key - Encryption key (master password)
 * @returns {string} - Encrypted data
 */
function encryptData(data, key) {
    try {
        return CryptoJS.AES.encrypt(data, key).toString();
    } catch (error) {
        console.error('Encryption error:', error);
        throw new Error('Failed to encrypt data');
    }
}

/**
 * Decrypt data using AES encryption
 * @param {string} encryptedData - Encrypted data
 * @param {string} key - Decryption key (master password)
 * @returns {string} - Decrypted data
 */
function decryptData(encryptedData, key) {
    try {
        const bytes = CryptoJS.AES.decrypt(encryptedData, key);
        return bytes.toString(CryptoJS.enc.Utf8);
    } catch (error) {
        console.error('Decryption error:', error);
        throw new Error('Failed to decrypt data. Incorrect password or corrupted data.');
    }
}

/**
 * Hash the master password with a salt for secure storage
 * @param {string} password - Master password to hash
 * @param {string} salt - Salt for hashing
 * @returns {string} - Hashed password
 */
function hashMasterPassword(password, salt) {
    try {
        // Combine password and salt
        const combined = password + salt;
        
        // Use SHA-256 for hashing
        return CryptoJS.SHA256(combined).toString();
    } catch (error) {
        console.error('Hashing error:', error);
        throw new Error('Failed to hash password');
    }
}

/**
 * Generate a random salt for password hashing
 * @returns {string} - Random salt
 */
function generateSalt() {
    return CryptoJS.lib.WordArray.random(16).toString();
}

/**
 * Password strength checker
 * @param {string} password - Password to check
 * @returns {string} - Strength rating: 'weak', 'fair', 'good', or 'strong'
 */
function checkPasswordStrength(password) {
    // Check length
    if (password.length < 8) {
        return 'weak';
    }
    
    // Check for different character types
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChars = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
    
    const variety = [hasUpperCase, hasLowerCase, hasNumbers, hasSpecialChars].filter(Boolean).length;
    
    if (variety === 1) {
        return 'weak';
    } else if (variety === 2) {
        return 'fair';
    } else if (variety === 3) {
        return password.length >= 10 ? 'good' : 'fair';
    } else {
        return password.length >= 12 ? 'strong' : 'good';
    }
}

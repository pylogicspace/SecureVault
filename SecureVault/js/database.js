/**
 * Database Module for Password Manager
 * 
 * This module provides an in-memory database for storing password entries
 * with client-side encryption.
 */
const db = (function() {
    // In-memory storage for passwords
    let passwords = [];
    let encryptionKey = null;
    
    // Database structure version
    const DB_VERSION = 1;
    
    // Storage key names
    const STORAGE_KEY = 'passwordManager_data';
    const VERSION_KEY = 'passwordManager_version';
    
    // Initialize the database
    function initializeDatabase() {
        // Check if we need to create a new database
        if (!localStorage.getItem(STORAGE_KEY)) {
            // Create empty database
            passwords = [];
            saveToLocalStorage();
            
            // Set version
            localStorage.setItem(VERSION_KEY, DB_VERSION);
        } else {
            // Update if needed based on version
            const version = parseInt(localStorage.getItem(VERSION_KEY) || '0');
            if (version < DB_VERSION) {
                // Migration logic would go here if needed
                localStorage.setItem(VERSION_KEY, DB_VERSION);
            }
        }
    }
    
    // Set the encryption key (derived from master password)
    function setEncryptionKey(masterPassword) {
        encryptionKey = masterPassword;
        loadFromLocalStorage();
    }
    
    // Generate a UUID for password entries
    function generateId() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
    
    // Save all passwords to localStorage (encrypted)
    function saveToLocalStorage() {
        if (!encryptionKey) {
            console.error('Encryption key not set. Cannot save data.');
            return;
        }
        
        try {
            const encryptedData = encryptData(JSON.stringify(passwords), encryptionKey);
            localStorage.setItem(STORAGE_KEY, encryptedData);
        } catch (error) {
            console.error('Error saving to localStorage:', error);
        }
    }
    
    // Load passwords from localStorage (decrypt)
    function loadFromLocalStorage() {
        if (!encryptionKey) {
            console.error('Encryption key not set. Cannot load data.');
            return;
        }
        
        try {
            const encryptedData = localStorage.getItem(STORAGE_KEY);
            if (encryptedData) {
                const decryptedData = decryptData(encryptedData, encryptionKey);
                passwords = JSON.parse(decryptedData);
            } else {
                passwords = [];
            }
        } catch (error) {
            console.error('Error loading from localStorage:', error);
            passwords = [];
        }
    }
    
    // Add a new password
    function addPassword(passwordData) {
        const now = Date.now();
        const newPassword = {
            id: generateId(),
            siteName: passwordData.siteName,
            username: passwordData.username,
            password: passwordData.password,
            url: passwordData.url || '',
            category: passwordData.category || 'other',
            notes: passwordData.notes || '',
            createdAt: now,
            lastModified: now
        };
        
        passwords.push(newPassword);
        saveToLocalStorage();
        return newPassword.id;
    }
    
    // Get all passwords
    function getAllPasswords() {
        return [...passwords];
    }
    
    // Get a password by ID
    function getPasswordById(id) {
        return passwords.find(pwd => pwd.id === id);
    }
    
    // Update an existing password
    function updatePassword(passwordData) {
        const index = passwords.findIndex(pwd => pwd.id === passwordData.id);
        if (index !== -1) {
            // Preserve original creation date
            const createdAt = passwords[index].createdAt;
            
            // Update the password entry
            passwords[index] = {
                ...passwordData,
                createdAt: createdAt,
                lastModified: Date.now()
            };
            
            saveToLocalStorage();
            return true;
        }
        return false;
    }
    
    // Delete a password by ID
    function deletePassword(id) {
        const index = passwords.findIndex(pwd => pwd.id === id);
        if (index !== -1) {
            passwords.splice(index, 1);
            saveToLocalStorage();
            return true;
        }
        return false;
    }
    
    // Search passwords
    function searchPasswords(query) {
        query = query.toLowerCase();
        return passwords.filter(pwd => 
            pwd.siteName.toLowerCase().includes(query) || 
            pwd.username.toLowerCase().includes(query) ||
            (pwd.notes && pwd.notes.toLowerCase().includes(query))
        );
    }
    
    // Get passwords by category
    function getPasswordsByCategory(category) {
        return passwords.filter(pwd => pwd.category === category);
    }
    
    // Clear all password data (dangerous operation)
    function clearAllData() {
        passwords = [];
        saveToLocalStorage();
    }
    
    // Public API
    return {
        initializeDatabase,
        setEncryptionKey,
        addPassword,
        getAllPasswords,
        getPasswordById,
        updatePassword,
        deletePassword,
        searchPasswords,
        getPasswordsByCategory,
        clearAllData
    };
})();

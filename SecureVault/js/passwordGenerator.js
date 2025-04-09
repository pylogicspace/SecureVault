/**
 * Password Generator Module
 * 
 * This module handles generating secure random passwords with
 * configurable options like length and character types.
 */

/**
 * Generate a random password based on provided options
 * @param {Object} options - Password generation options
 * @param {number} options.length - Length of the password (default: 16)
 * @param {boolean} options.uppercase - Include uppercase letters (default: true)
 * @param {boolean} options.lowercase - Include lowercase letters (default: true)
 * @param {boolean} options.numbers - Include numbers (default: true)
 * @param {boolean} options.symbols - Include symbols (default: true)
 * @returns {string} - Generated password
 */
function generatePassword(options = {}) {
    // Default options
    const config = {
        length: options.length || 16,
        uppercase: options.uppercase !== undefined ? options.uppercase : true,
        lowercase: options.lowercase !== undefined ? options.lowercase : true,
        numbers: options.numbers !== undefined ? options.numbers : true,
        symbols: options.symbols !== undefined ? options.symbols : true
    };
    
    // Character sets
    const uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercaseChars = 'abcdefghijklmnopqrstuvwxyz';
    const numberChars = '0123456789';
    const symbolChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    
    // Build character pool based on options
    let charPool = '';
    if (config.uppercase) charPool += uppercaseChars;
    if (config.lowercase) charPool += lowercaseChars;
    if (config.numbers) charPool += numberChars;
    if (config.symbols) charPool += symbolChars;
    
    // Ensure at least one character type is selected
    if (charPool === '') {
        console.warn('No character types selected for password generation, using lowercase letters as default');
        charPool = lowercaseChars;
    }
    
    // Generate the password
    let password = '';
    const charPoolLength = charPool.length;
    
    // Create a typed array of random values
    const randomValues = new Uint32Array(config.length);
    crypto.getRandomValues(randomValues);
    
    // Use the random values to select characters from the pool
    for (let i = 0; i < config.length; i++) {
        const randomIndex = randomValues[i] % charPoolLength;
        password += charPool.charAt(randomIndex);
    }
    
    // Ensure the password contains at least one of each selected character type
    let updatedPassword = ensureCharacterTypes(password, config);
    
    return updatedPassword;
}

/**
 * Ensure the password contains at least one of each selected character type
 * @param {string} password - The generated password
 * @param {Object} config - The password generation configuration
 * @returns {string} - The updated password with required character types
 */
function ensureCharacterTypes(password, config) {
    // Check which character types are present
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSymbols = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
    
    // Create a copy of the password we can modify
    let updatedPassword = password;
    const passwordLength = password.length;
    
    // Character sets
    const uppercaseChar = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)];
    const lowercaseChar = 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)];
    const numberChar = '0123456789'[Math.floor(Math.random() * 10)];
    const symbolChar = '!@#$%^&*()_+-=[]{}|;:,.<>?'[Math.floor(Math.random() * 24)];
    
    // Replace characters as needed to ensure required types
    if (config.uppercase && !hasUppercase) {
        const pos = Math.floor(Math.random() * passwordLength);
        updatedPassword = updatedPassword.substring(0, pos) + uppercaseChar + updatedPassword.substring(pos + 1);
    }
    
    if (config.lowercase && !hasLowercase) {
        const pos = Math.floor(Math.random() * passwordLength);
        updatedPassword = updatedPassword.substring(0, pos) + lowercaseChar + updatedPassword.substring(pos + 1);
    }
    
    if (config.numbers && !hasNumbers) {
        const pos = Math.floor(Math.random() * passwordLength);
        updatedPassword = updatedPassword.substring(0, pos) + numberChar + updatedPassword.substring(pos + 1);
    }
    
    if (config.symbols && !hasSymbols) {
        const pos = Math.floor(Math.random() * passwordLength);
        updatedPassword = updatedPassword.substring(0, pos) + symbolChar + updatedPassword.substring(pos + 1);
    }
    
    return updatedPassword;
}

/**
 * Generate a memorable password with random words
 * @param {number} wordCount - Number of words to include (default: 4)
 * @param {boolean} includeNumber - Whether to include a number (default: true)
 * @param {boolean} includeSymbol - Whether to include a symbol (default: true)
 * @returns {string} - Generated memorable password
 */
function generateMemorablePassword(wordCount = 4, includeNumber = true, includeSymbol = true) {
    // List of common words (short list for demonstration)
    const words = [
        'apple', 'banana', 'orange', 'grape', 'kiwi', 'lemon', 'peach', 'plum',
        'river', 'ocean', 'mountain', 'forest', 'desert', 'valley', 'hill', 'lake',
        'tiger', 'lion', 'eagle', 'wolf', 'bear', 'fox', 'deer', 'owl',
        'happy', 'sunny', 'cloudy', 'rainy', 'windy', 'snowy', 'warm', 'cold'
    ];
    
    // Select random words
    let password = '';
    for (let i = 0; i < wordCount; i++) {
        const randomIndex = Math.floor(Math.random() * words.length);
        let word = words[randomIndex];
        
        // Capitalize first letter of some words randomly
        if (Math.random() > 0.5) {
            word = word.charAt(0).toUpperCase() + word.slice(1);
        }
        
        password += word;
    }
    
    // Add a number if requested
    if (includeNumber) {
        password += Math.floor(Math.random() * 100);
    }
    
    // Add a symbol if requested
    if (includeSymbol) {
        const symbols = '!@#$%^&*';
        password += symbols.charAt(Math.floor(Math.random() * symbols.length));
    }
    
    return password;
}

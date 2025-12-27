/**
 * Centralized User Authentication and Data Management
 * Handles user registration, login validation, and user data storage
 */

const UserAuth = {
    // Storage key for all users
    USERS_STORAGE_KEY: 'gastador_users',
    
    /**
     * Get all registered users from localStorage
     * @returns {Object} Object containing all users keyed by username
     */
    getAllUsers() {
        const usersJson = localStorage.getItem(this.USERS_STORAGE_KEY);
        return usersJson ? JSON.parse(usersJson) : {};
    },
    
    /**
     * Save all users to localStorage
     * @param {Object} users - Object containing all users
     */
    saveAllUsers(users) {
        localStorage.setItem(this.USERS_STORAGE_KEY, JSON.stringify(users));
    },
    
    /**
     * Check if a username already exists
     * @param {string} username - Username to check
     * @returns {boolean} True if username exists
     */
    usernameExists(username) {
        const users = this.getAllUsers();
        return users.hasOwnProperty(username.toLowerCase());
    },
    
    /**
     * Check if an email already exists
     * @param {string} email - Email to check
     * @returns {boolean} True if email exists
     */
    emailExists(email) {
        const users = this.getAllUsers();
        return Object.values(users).some(user => 
            user.email && user.email.toLowerCase() === email.toLowerCase()
        );
    },
    
    /**
     * Register a new user
     * @param {string} username - Username
     * @param {string} email - Email address
     * @param {string} password - Password
     * @param {string} name - Full name (optional)
     * @returns {Object} Result object with success status and message
     */
    registerUser(username, email, password, name = '') {
        // Validation
        if (!username || !email || !password) {
            return {
                success: false,
                message: 'All fields are required'
            };
        }
        
        // Check if username already exists
        if (this.usernameExists(username)) {
            return {
                success: false,
                message: 'Username already exists'
            };
        }
        
        // Check if email already exists
        if (this.emailExists(email)) {
            return {
                success: false,
                message: 'Email already registered'
            };
        }
        
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return {
                success: false,
                message: 'Invalid email format'
            };
        }
        
        // Validate password length (minimum 6 characters)
        if (password.length < 6) {
            return {
                success: false,
                message: 'Password must be at least 6 characters long'
            };
        }
        
        // Get all users
        const users = this.getAllUsers();
        
        // Create new user object
        const newUser = {
            username: username.trim(),
            email: email.trim().toLowerCase(),
            password: password, // In production, this should be hashed
            name: name.trim() || username.trim(),
            createdAt: new Date().toISOString()
        };
        
        // Save user (using lowercase username as key for case-insensitive lookup)
        users[username.toLowerCase()] = newUser;
        this.saveAllUsers(users);
        
        return {
            success: true,
            message: 'Registration successful!',
            user: newUser
        };
    },
    
    /**
     * Validate login credentials
     * @param {string} username - Username
     * @param {string} password - Password
     * @returns {Object} Result object with success status, message, and user data
     */
    validateLogin(username, password) {
        // Validation
        if (!username || !password) {
            return {
                success: false,
                message: 'Username and password are required'
            };
        }
        
        // Get all users
        const users = this.getAllUsers();
        
        // Find user by username (case-insensitive)
        const userKey = username.toLowerCase();
        const user = users[userKey];
        
        if (!user) {
            return {
                success: false,
                message: 'Invalid username or password'
            };
        }
        
        // Validate password
        if (user.password !== password) {
            return {
                success: false,
                message: 'Invalid username or password'
            };
        }
        
        return {
            success: true,
            message: 'Login successful!',
            user: {
                username: user.username,
                email: user.email,
                name: user.name
            }
        };
    },
    
    /**
     * Get user data by username
     * @param {string} username - Username
     * @returns {Object|null} User object or null if not found
     */
    getUser(username) {
        const users = this.getAllUsers();
        const user = users[username.toLowerCase()];
        return user ? {
            username: user.username,
            email: user.email,
            name: user.name,
            createdAt: user.createdAt
        } : null;
    },
    
    /**
     * Set current logged-in user
     * @param {string} username - Username
     */
    setCurrentUser(username) {
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('username', username);
        
        const user = this.getUser(username);
        if (user && user.email) {
            localStorage.setItem('userEmail', user.email);
        }
    },
    
    /**
     * Clear current logged-in user
     */
    clearCurrentUser() {
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('username');
        localStorage.removeItem('userEmail');
    },
    
    /**
     * Check if user is logged in
     * @returns {boolean} True if user is logged in
     */
    isLoggedIn() {
        return localStorage.getItem('isLoggedIn') === 'true';
    },
    
    /**
     * Get current logged-in username
     * @returns {string|null} Username or null if not logged in
     */
    getCurrentUsername() {
        return this.isLoggedIn() ? localStorage.getItem('username') : null;
    },
    
    /**
     * Reset finance data for user switching
     * @param {string} newUsername - New username being logged in
     */
    resetFinanceDataForNewUser(newUsername) {
        const currentUsername = this.getCurrentUsername();
        
        if (currentUsername && currentUsername !== newUsername) {
            const financeKeys = [
                "transactions", "sinkingFunds", "assets", "liabilities", 
                "banks", "categories", "monthlyBudget", "emergencyFund"
            ];
            financeKeys.forEach(key => localStorage.removeItem(key));
        }
    }
};


/**
 * User Registration Data Storage
 * Separate file to store and manage user registration information
 */

const UserData = {
    // Storage key for registration data
    REGISTRATION_DATA_KEY: 'gastador_registration_data',
    
    /**
     * Get all registration data from localStorage
     * @returns {Array} Array of all registration records
     */
    getAllRegistrationData() {
        const dataJson = localStorage.getItem(this.REGISTRATION_DATA_KEY);
        return dataJson ? JSON.parse(dataJson) : [];
    },
    
    /**
     * Save all registration data to localStorage
     * @param {Array} data - Array of registration records
     */
    saveAllRegistrationData(data) {
        localStorage.setItem(this.REGISTRATION_DATA_KEY, JSON.stringify(data));
    },
    
    /**
     * Save a new registration record
     * @param {string} username - Username
     * @param {string} email - Email address
     * @param {string} name - Full name (optional)
     * @param {string} registrationDate - Registration date/time
     * @returns {Object} Saved registration record
     */
    saveRegistrationData(username, email, name = '', registrationDate = null) {
        const allData = this.getAllRegistrationData();
        
        const registrationRecord = {
            id: Date.now().toString(), // Unique ID
            username: username.trim(),
            email: email.trim().toLowerCase(),
            name: name.trim() || username.trim(),
            registrationDate: registrationDate || new Date().toISOString(),
            timestamp: Date.now()
        };
        
        // Add to array
        allData.push(registrationRecord);
        
        // Save back to localStorage
        this.saveAllRegistrationData(allData);
        
        return registrationRecord;
    },
    
    /**
     * Get registration data for a specific user
     * @param {string} username - Username to search for
     * @returns {Object|null} Registration record or null if not found
     */
    getRegistrationDataByUsername(username) {
        const allData = this.getAllRegistrationData();
        return allData.find(record => 
            record.username.toLowerCase() === username.toLowerCase()
        ) || null;
    },
    
    /**
     * Get all registrations sorted by date (newest first)
     * @returns {Array} Sorted array of registration records
     */
    getAllRegistrationsSorted() {
        const allData = this.getAllRegistrationData();
        return allData.sort((a, b) => b.timestamp - a.timestamp);
    },
    
    /**
     * Get total number of registrations
     * @returns {number} Total count
     */
    getTotalRegistrations() {
        return this.getAllRegistrationData().length;
    },
    
    /**
     * Clear all registration data (use with caution)
     */
    clearAllRegistrationData() {
        localStorage.removeItem(this.REGISTRATION_DATA_KEY);
    }
};


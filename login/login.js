document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');

    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const username = document.getElementById('username').value.trim();
            const password = document.getElementById('password').value;

            if (username && password) {
                const existingUser = localStorage.getItem('username');
                
                // Reset finance tracking data if a different user is logging in
                if (existingUser && existingUser !== username) {
                    const financeKeys = [
                        "transactions", "sinkingFunds", "assets", "liabilities", 
                        "banks", "categories", "monthlyBudget", "emergencyFund"
                    ];
                    financeKeys.forEach(key => localStorage.removeItem(key));
                    // Also clear any other user-specific strings
                    localStorage.removeItem('userEmail');
                }

                // Save login state
                localStorage.setItem('isLoggedIn', 'true');
                localStorage.setItem('username', username);

                // Redirect based on whether budget is set
                if (localStorage.getItem('monthlyBudget')) {
                    window.location.href = 'index.html';
                } else {
                    window.location.href = '../index.html';
                }
            }
        });
    }
});
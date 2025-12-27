document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');

    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const username = document.getElementById('username').value.trim();
            const password = document.getElementById('password').value;

            if (!username || !password) {
                alert('Please enter both username and password');
                return;
            }

            // Use centralized auth system to validate login
            const result = UserAuth.validateLogin(username, password);

            if (!result.success) {
                alert(result.message);
                return;
            }

            // Reset finance tracking data if a different user is logging in
            UserAuth.resetFinanceDataForNewUser(username);

            // Set current user and redirect
            UserAuth.setCurrentUser(username);
            window.location.href = '../index.html';
        });
    }
});
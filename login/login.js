document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const errorMessage = document.getElementById('login-error-message');
    const rememberMe = document.getElementById('remember-me');

    // Check if user wants to be remembered
    const rememberedUsername = localStorage.getItem('rememberedUsername');
    if (rememberedUsername) {
        document.getElementById('username').value = rememberedUsername;
        if (rememberMe) {
            rememberMe.checked = true;
        }
    }

    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const username = document.getElementById('username').value.trim();
            const password = document.getElementById('password').value;

            // Hide error message initially
            if (errorMessage) {
                errorMessage.classList.add('hidden');
            }

            if (!username || !password) {
                if (errorMessage) {
                    errorMessage.textContent = 'Please enter both username and password';
                    errorMessage.classList.remove('hidden');
                }
                return;
            }

            // Use centralized auth system to validate login
            const result = UserAuth.validateLogin(username, password);

            if (!result.success) {
                if (errorMessage) {
                    errorMessage.textContent = result.message;
                    errorMessage.classList.remove('hidden');
                }
                return;
            }

            // Handle remember me option
            if (rememberMe && rememberMe.checked) {
                localStorage.setItem('rememberedUsername', username);
            } else {
                localStorage.removeItem('rememberedUsername');
            }

            // Reset finance tracking data if a different user is logging in
            UserAuth.resetFinanceDataForNewUser(username);

            // Set current user and redirect
            UserAuth.setCurrentUser(username);
            window.location.href = '../index.html';
        });
    }
});
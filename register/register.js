// Register form handler using centralized auth system
document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('registerForm');
    
    if (registerForm) {
        registerForm.addEventListener('submit', function (event) {
            event.preventDefault();

            const username = document.getElementById('reg-username').value.trim();
            const email = document.getElementById('reg-gmail').value.trim();
            const password = document.getElementById('reg-password').value;
            const confirmPassword = document.getElementById('reg-confirm-password').value;
            const errorDiv = document.getElementById('error-message');

            // Check if passwords match
            if (password !== confirmPassword) {
                errorDiv.textContent = 'Passwords do not match!';
                errorDiv.classList.remove('hidden');
                return;
            }
            errorDiv.classList.add('hidden');

            // Use centralized auth system to register user
            const result = UserAuth.registerUser(username, email, password);

            if (!result.success) {
                errorDiv.textContent = result.message;
                errorDiv.classList.remove('hidden');
                return;
            }

            // Reset finance data if switching users
            UserAuth.resetFinanceDataForNewUser(username);

            // Set current user and redirect
            UserAuth.setCurrentUser(username);
            alert('Registration successful!');
            window.location.href = '../index.html';
        });
    }
});

// Login JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Check if already logged in
    if (localStorage.getItem('adminLoggedIn') === 'true') {
        window.location.href = 'index.html';
    }
    
    const loginForm = document.getElementById('loginForm');
    loginForm.addEventListener('submit', handleLogin);
});

async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    showLoading();
    
    try {
        // Simulate API call for login
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });
        
        if (response.ok) {
            const result = await response.json();
            localStorage.setItem('adminLoggedIn', 'true');
            localStorage.setItem('adminEmail', email);
            showToast('Success', 'Login successful! Redirecting...', 'success');
            
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
        } else {
            const error = await response.json();
            showToast('Error', error.message || 'Invalid credentials', 'error');
        }
    } catch (error) {
        console.error('Login error:', error);
        showToast('Error', 'Login failed. Please try again.', 'error');
    } finally {
        hideLoading();
    }
}

function togglePassword() {
    const passwordInput = document.getElementById('password');
    const toggleButton = document.querySelector('.password-toggle i');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleButton.className = 'fas fa-eye-slash';
    } else {
        passwordInput.type = 'password';
        toggleButton.className = 'fas fa-eye';
    }
}

function showLoading() {
    document.getElementById('loading-spinner').style.display = 'block';
}

function hideLoading() {
    document.getElementById('loading-spinner').style.display = 'none';
}

function showToast(title, message, type = 'info') {
    const toastContainer = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <div class="toast-title">${title}</div>
        <div class="toast-message">${message}</div>
    `;
    
    toastContainer.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 5000);
}
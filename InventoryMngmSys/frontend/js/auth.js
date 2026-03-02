const auth = {
    // Check if user is logged in
    isLoggedIn() {
        return !!api.getToken();
    },

    // Get current user
    getCurrentUser() {
        return api.getUser();
    },

    // Show login view
    showLoginView() {
        document.getElementById('login-view').classList.add('active');
        document.getElementById('register-view').classList.remove('active');
        document.getElementById('dashboard-view').classList.remove('active');
    },

    // Show register view
    showRegisterView() {
        document.getElementById('login-view').classList.remove('active');
        document.getElementById('register-view').classList.add('active');
        document.getElementById('dashboard-view').classList.remove('active');
    },

    // Show dashboard view
    showDashboardView() {
        document.getElementById('login-view').classList.remove('active');
        document.getElementById('register-view').classList.remove('active');
        document.getElementById('dashboard-view').classList.add('active');
    },

    // Update user info display
    updateUserInfo() {
        const user = this.getCurrentUser();
        if (user) {
            document.getElementById('user-info').textContent = `Welcome, ${user.username} (${user.role})`;
        }
    },

    // Handle login form submission
    async handleLogin(event) {
        event.preventDefault();
        
        const form = event.target;
        const username = form.username.value.trim();
        const password = form.password.value;
        const errorDiv = document.getElementById('login-error');
        const submitBtn = form.querySelector('button[type="submit"]');
        const btnText = submitBtn.querySelector('.btn-text');
        const btnLoader = submitBtn.querySelector('.btn-loader');

        // Clear previous errors
        errorDiv.textContent = '';
        errorDiv.classList.remove('visible');

        // Client-side validation
        if (!username || !password) {
            errorDiv.textContent = 'Please enter both username and password';
            errorDiv.classList.add('visible');
            return;
        }

        // Show loading state
        btnText.textContent = 'Signing in...';
        btnLoader.classList.remove('hidden');
        submitBtn.disabled = true;

        try {
            const response = await api.auth.login(username, password);
            
            if (response.success) {
                this.showDashboardView();
                this.updateUserInfo();
                app.loadProducts();
            } else {
                errorDiv.textContent = response.message || 'Login failed. Please try again.';
                errorDiv.classList.add('visible');
            }
        } catch (error) {
            console.error('Login error:', error);
            let errorMessage = 'An error occurred. Please try again.';
            
            if (error.data && error.data.message) {
                errorMessage = error.data.message;
            } else if (error.status === 0 || error.status === undefined) {
                errorMessage = 'Cannot connect to server. Please ensure the backend is running.';
            } else if (error.status === 500) {
                errorMessage = 'Server error. Please try again later.';
            }
            
            errorDiv.textContent = errorMessage;
            errorDiv.classList.add('visible');
        } finally {
            btnText.textContent = 'Sign In';
            btnLoader.classList.add('hidden');
            submitBtn.disabled = false;
        }
    },

    // Handle register form submission
    async handleRegister(event) {
        event.preventDefault();
        
        const form = event.target;
        const firstName = form.firstName.value.trim();
        const lastName = form.lastName.value.trim();
        const email = form.email.value.trim();
        const username = form.username.value.trim();
        const password = form.password.value;
        const errorDiv = document.getElementById('register-error');
        const submitBtn = form.querySelector('button[type="submit"]');
        const btnText = submitBtn.querySelector('.btn-text');
        const btnLoader = submitBtn.querySelector('.btn-loader');

        // Clear previous errors
        errorDiv.textContent = '';
        errorDiv.classList.remove('visible');

        // Client-side validation
        if (!firstName || !lastName || !email || !username || !password) {
            errorDiv.textContent = 'Please fill in all required fields';
            errorDiv.classList.add('visible');
            return;
        }

        if (password.length < 6) {
            errorDiv.textContent = 'Password must be at least 6 characters';
            errorDiv.classList.add('visible');
            return;
        }

        // Show loading state
        btnText.textContent = 'Creating account...';
        btnLoader.classList.remove('hidden');
        submitBtn.disabled = true;

        try {
            const userData = {
                firstName,
                lastName,
                email,
                username,
                password
            };

            console.log('Sending registration request...');
            const response = await api.auth.register(userData);
            console.log('Registration response:', response);
            
            if (response.success) {
                this.showDashboardView();
                this.updateUserInfo();
                app.loadProducts();
                app.showToast('Account created successfully!', 'success');
            } else {
                errorDiv.textContent = response.message || 'Registration failed. Please try again.';
                errorDiv.classList.add('visible');
            }
        } catch (error) {
            console.error('Registration error:', error);
            let errorMessage = 'An error occurred. Please try again.';
            
            if (error.data && error.data.message) {
                errorMessage = error.data.message;
            } else if (error.status === 0 || error.status === undefined) {
                errorMessage = 'Cannot connect to server. Please ensure the backend is running on port 8080.';
            } else if (error.status === 500) {
                errorMessage = 'Server error: ' + (error.data?.message || 'Please try again later.');
            } else if (error.status === 409) {
                errorMessage = 'Username or email already exists.';
            } else if (error.status === 400) {
                errorMessage = error.data?.message || 'Invalid input data.';
            }
            
            errorDiv.textContent = errorMessage;
            errorDiv.classList.add('visible');
        } finally {
            btnText.textContent = 'Create Account';
            btnLoader.classList.add('hidden');
            submitBtn.disabled = false;
        }
    },

    // Handle logout
    handleLogout() {
        api.auth.logout();
        this.showLoginView();
        document.getElementById('user-info').textContent = '';
    },

    // Initialize auth
    init() {
        // Set up view switching links
        document.getElementById('show-register').addEventListener('click', (e) => {
            e.preventDefault();
            this.showRegisterView();
        });

        document.getElementById('show-login').addEventListener('click', (e) => {
            e.preventDefault();
            this.showLoginView();
        });

        // Set up login form handler
        document.getElementById('login-form').addEventListener('submit', (e) => this.handleLogin(e));

        // Set up register form handler
        document.getElementById('register-form').addEventListener('submit', (e) => this.handleRegister(e));

        // Set up logout button
        document.getElementById('logout-btn').addEventListener('click', () => this.handleLogout());

        // Check if user is already logged in
        if (this.isLoggedIn()) {
            this.showDashboardView();
            this.updateUserInfo();
        } else {
            this.showLoginView();
        }
    }
};

// Make auth available globally
window.auth = auth;

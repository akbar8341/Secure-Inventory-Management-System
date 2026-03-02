const API_BASE_URL = 'http://localhost:8080/api';

const api = {
    // Get auth token from localStorage
    getToken() {
        return localStorage.getItem('authToken');
    },

    // Set auth token
    setToken(token) {
        localStorage.setItem('authToken', token);
    },

    // Remove auth token
    removeToken() {
        localStorage.removeItem('authToken');
    },

    // Get stored user data
    getUser() {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    },

    // Set user data
    setUser(user) {
        localStorage.setItem('user', JSON.stringify(user));
    },

    // Remove user data
    removeUser() {
        localStorage.removeItem('user');
    },

    // Generic request method
    async request(endpoint, options = {}) {
        const url = `${API_BASE_URL}${endpoint}`;
        const token = this.getToken();

        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        try {
            const response = await fetch(url, {
                ...options,
                headers
            });

            const data = await response.json();

            if (!response.ok) {
                throw {
                    status: response.status,
                    data: data
                };
            }

            return data;
        } catch (error) {
            if (error.status === 401) {
                this.removeToken();
                this.removeUser();
                window.location.reload();
            }
            throw error;
        }
    },

    // Auth endpoints
    auth: {
        async login(username, password) {
            const data = await api.request('/auth/login', {
                method: 'POST',
                body: JSON.stringify({ username, password })
            });
            if (data.success && data.data) {
                api.setToken(data.data.token);
                api.setUser({
                    username: data.data.username,
                    email: data.data.email,
                    role: data.data.role
                });
            }
            return data;
        },

        async register(userData) {
            const data = await api.request('/auth/register', {
                method: 'POST',
                body: JSON.stringify(userData)
            });
            if (data.success && data.data) {
                api.setToken(data.data.token);
                api.setUser({
                    username: data.data.username,
                    email: data.data.email,
                    role: data.data.role
                });
            }
            return data;
        },

        logout() {
            api.removeToken();
            api.removeUser();
        }
    },

    // Products endpoints
    products: {
        async getAll(page = 0, size = 10, sortBy = 'createdAt', sortDir = 'desc') {
            return api.request(`/products?page=${page}&size=${size}&sortBy=${sortBy}&sortDir=${sortDir}`);
        },

        async getById(id) {
            return api.request(`/products/${id}`);
        },

        async getBySku(sku) {
            return api.request(`/products/sku/${sku}`);
        },

        async search(query, page = 0, size = 10) {
            return api.request(`/products/search?q=${encodeURIComponent(query)}&page=${page}&size=${size}`);
        },

        async create(productData) {
            return api.request('/products', {
                method: 'POST',
                body: JSON.stringify(productData)
            });
        },

        async update(id, productData) {
            return api.request(`/products/${id}`, {
                method: 'PUT',
                body: JSON.stringify(productData)
            });
        },

        async patch(id, productData) {
            return api.request(`/products/${id}`, {
                method: 'PATCH',
                body: JSON.stringify(productData)
            });
        },

        async delete(id) {
            return api.request(`/products/${id}`, {
                method: 'DELETE'
            });
        }
    }
};

// Make api available globally
window.api = api;

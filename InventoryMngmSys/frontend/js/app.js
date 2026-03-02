const app = {
    // Current state
    currentPage: 0,
    pageSize: 10,
    totalPages: 0,
    currentProductId: null,
    isEditMode: false,

    // Initialize the app
    init() {
        // Initialize auth module first
        if (window.auth && typeof auth.init === 'function') {
            auth.init();
        }
        
        this.setupEventListeners();
    },

    // Set up all event listeners
    setupEventListeners() {
        // Add product button
        document.getElementById('add-product-btn').addEventListener('click', () => this.openProductModal());

        // Search button
        document.getElementById('search-btn').addEventListener('click', () => this.handleSearch());

        // Search input enter key
        document.getElementById('search-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleSearch();
            }
        });

        // Pagination buttons
        document.getElementById('prev-page').addEventListener('click', () => this.goToPrevPage());
        document.getElementById('next-page').addEventListener('click', () => this.goToNextPage());

        // Product form submission
        document.getElementById('product-form').addEventListener('submit', (e) => this.handleProductSubmit(e));

        // Modal close buttons
        document.getElementById('close-modal').addEventListener('click', () => this.closeProductModal());
        document.getElementById('cancel-btn').addEventListener('click', () => this.closeProductModal());

        // Delete modal
        document.getElementById('close-delete-modal').addEventListener('click', () => this.closeDeleteModal());
        document.getElementById('cancel-delete').addEventListener('click', () => this.closeDeleteModal());
        document.getElementById('confirm-delete').addEventListener('click', () => this.confirmDelete());

        // Close modals on outside click
        document.getElementById('product-modal').addEventListener('click', (e) => {
            if (e.target.id === 'product-modal') {
                this.closeProductModal();
            }
        });

        document.getElementById('delete-modal').addEventListener('click', (e) => {
            if (e.target.id === 'delete-modal') {
                this.closeDeleteModal();
            }
        });
    },

    // Load products from API
    async loadProducts(page = 0) {
        try {
            const response = await api.products.getAll(page, this.pageSize);
            
            if (response.success) {
                this.renderProducts(response.data.content);
                this.updatePagination(response.data);
                this.updateStats(response.data);
            }
        } catch (error) {
            console.error('Error loading products:', error);
            this.showToast('Failed to load products', 'error');
        }
    },

    // Render products table
    renderProducts(products) {
        const tbody = document.getElementById('products-table-body');
        
        if (!products || products.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="empty-state">
                        <h3>No products found</h3>
                        <p>Add your first product to get started</p>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = products.map(product => `
            <tr>
                <td class="sku">${this.escapeHtml(product.sku)}</td>
                <td>${this.escapeHtml(product.name)}</td>
                <td>${this.escapeHtml(product.description || '-')}</td>
                <td class="price">$${parseFloat(product.price).toFixed(2)}</td>
                <td class="quantity ${product.quantity < 10 ? 'low' : ''}">${product.quantity}</td>
                <td class="actions">
                    <button class="btn-action btn-edit" onclick="app.editProduct(${product.id})">Edit</button>
                    <button class="btn-action btn-delete" onclick="app.deleteProduct(${product.id})">Delete</button>
                </td>
            </tr>
        `).join('');
    },

    // Update pagination controls
    updatePagination(pageData) {
        this.currentPage = pageData.number;
        this.totalPages = pageData.totalPages;

        document.getElementById('page-info').textContent = `Page ${this.currentPage + 1} of ${this.totalPages}`;
        document.getElementById('prev-page').disabled = this.currentPage === 0;
        document.getElementById('next-page').disabled = this.currentPage >= this.totalPages - 1;
    },

    // Update statistics
    updateStats(pageData) {
        const products = pageData.content || [];
        
        // Total products
        document.getElementById('total-products').textContent = pageData.totalElements;

        // Total value
        const totalValue = products.reduce((sum, p) => sum + (parseFloat(p.price) * p.quantity), 0);
        document.getElementById('total-value').textContent = `$${totalValue.toFixed(2)}`;

        // Low stock count (less than 10)
        const lowStock = products.filter(p => p.quantity < 10).length;
        document.getElementById('low-stock').textContent = lowStock;
    },

    // Pagination navigation
    goToPrevPage() {
        if (this.currentPage > 0) {
            this.loadProducts(this.currentPage - 1);
        }
    },

    goToNextPage() {
        if (this.currentPage < this.totalPages - 1) {
            this.loadProducts(this.currentPage + 1);
        }
    },

    // Search products
    async handleSearch() {
        const query = document.getElementById('search-input').value.trim();
        
        if (!query) {
            this.loadProducts();
            return;
        }

        try {
            const response = await api.products.search(query, 0, this.pageSize);
            
            if (response.success) {
                this.renderProducts(response.data.content);
                this.updatePagination(response.data);
            }
        } catch (error) {
            console.error('Search error:', error);
            this.showToast('Search failed', 'error');
        }
    },

    // Open product modal for create/edit
    async openProductModal(productId = null) {
        const modal = document.getElementById('product-modal');
        const form = document.getElementById('product-form');
        const title = document.getElementById('modal-title');

        // Reset form
        form.reset();
        this.clearFormErrors();

        if (productId) {
            // Edit mode
            this.isEditMode = true;
            this.currentProductId = productId;
            title.textContent = 'Edit Product';

            try {
                const response = await api.products.getById(productId);
                if (response.success) {
                    const product = response.data;
                    document.getElementById('product-id').value = product.id;
                    document.getElementById('product-sku').value = product.sku;
                    document.getElementById('product-name').value = product.name;
                    document.getElementById('product-description').value = product.description || '';
                    document.getElementById('product-price').value = product.price;
                    document.getElementById('product-quantity').value = product.quantity;
                }
            } catch (error) {
                console.error('Error loading product:', error);
                this.showToast('Failed to load product data', 'error');
                return;
            }
        } else {
            // Create mode
            this.isEditMode = false;
            this.currentProductId = null;
            title.textContent = 'Add Product';
        }

        modal.classList.remove('hidden');
    },

    // Close product modal
    closeProductModal() {
        document.getElementById('product-modal').classList.add('hidden');
        this.currentProductId = null;
        this.isEditMode = false;
    },

    // Handle product form submission
    async handleProductSubmit(event) {
        event.preventDefault();

        const productData = {
            sku: document.getElementById('product-sku').value.trim(),
            name: document.getElementById('product-name').value.trim(),
            description: document.getElementById('product-description').value.trim(),
            price: parseFloat(document.getElementById('product-price').value),
            quantity: parseInt(document.getElementById('product-quantity').value)
        };

        // Client-side validation
        this.clearFormErrors();
        let hasErrors = false;

        if (!productData.sku) {
            this.showFieldError('sku-error', 'SKU is required');
            hasErrors = true;
        }

        if (!productData.name) {
            this.showFieldError('name-error', 'Product name is required');
            hasErrors = true;
        }

        if (!productData.price || productData.price <= 0) {
            this.showFieldError('price-error', 'Price must be greater than 0');
            hasErrors = true;
        }

        if (productData.quantity === undefined || productData.quantity < 0) {
            this.showFieldError('quantity-error', 'Quantity cannot be negative');
            hasErrors = true;
        }

        if (hasErrors) return;

        const submitBtn = event.target.querySelector('button[type="submit"]');
        const btnText = submitBtn.querySelector('.btn-text');
        const btnLoader = submitBtn.querySelector('.btn-loader');

        btnText.textContent = 'Saving...';
        btnLoader.classList.remove('hidden');
        submitBtn.disabled = true;

        try {
            let response;
            
            if (this.isEditMode) {
                response = await api.products.update(this.currentProductId, productData);
            } else {
                response = await api.products.create(productData);
            }

            if (response.success) {
                this.closeProductModal();
                this.loadProducts(this.currentPage);
                this.showToast(
                    this.isEditMode ? 'Product updated successfully' : 'Product created successfully',
                    'success'
                );
            } else {
                this.showFormError(response.message || 'Operation failed');
            }
        } catch (error) {
            console.error('Product save error:', error);
            if (error.data && error.data.message) {
                this.showFormError(error.data.message);
            } else {
                this.showFormError('An error occurred. Please try again.');
            }
        } finally {
            btnText.textContent = 'Save Product';
            btnLoader.classList.add('hidden');
            submitBtn.disabled = false;
        }
    },

    // Edit product
    async editProduct(id) {
        await this.openProductModal(id);
    },

    // Delete product - open confirmation modal
    deleteProduct(id) {
        this.currentProductId = id;
        const productName = document.querySelector(`button[onclick="app.deleteProduct(${id})"]`)
            ?.closest('tr')
            ?.querySelector('td:nth-child(2)')
            ?.textContent || 'this product';
        
        document.getElementById('delete-product-name').textContent = productName;
        document.getElementById('delete-modal').classList.remove('hidden');
    },

    // Close delete modal
    closeDeleteModal() {
        document.getElementById('delete-modal').classList.add('hidden');
        this.currentProductId = null;
    },

    // Confirm delete
    async confirmDelete() {
        if (!this.currentProductId) return;

        try {
            const response = await api.products.delete(this.currentProductId);
            
            if (response.success) {
                this.closeDeleteModal();
                this.loadProducts(this.currentPage);
                this.showToast('Product deleted successfully', 'success');
            }
        } catch (error) {
            console.error('Delete error:', error);
            this.showToast('Failed to delete product', 'error');
        }
    },

    // Show field error
    showFieldError(elementId, message) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = message;
        }
    },

    // Clear all form errors
    clearFormErrors() {
        document.querySelectorAll('.field-error').forEach(el => el.textContent = '');
        document.getElementById('form-error').textContent = '';
        document.getElementById('form-error').classList.remove('visible');
    },

    // Show form error
    showFormError(message) {
        const errorDiv = document.getElementById('form-error');
        errorDiv.textContent = message;
        errorDiv.classList.add('visible');
    },

    // Show toast notification
    showToast(message, type = 'success') {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <span>${message}</span>
            <button class="toast-close" onclick="this.parentElement.remove()">&times;</button>
        `;
        
        container.appendChild(toast);

        // Auto remove after 5 seconds
        setTimeout(() => {
            toast.remove();
        }, 5000);
    },

    // Escape HTML to prevent XSS
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
};

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    app.init();
});

// Make app available globally
window.app = app;

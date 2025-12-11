// Global State Management
const GlobalState = {
    cart: JSON.parse(localStorage.getItem('cart')) || [],
    wishlist: JSON.parse(localStorage.getItem('wishlist')) || [],
    products: [],
    suppliers: [],
    
    // Save state to localStorage
    saveCart() {
        localStorage.setItem('cart', JSON.stringify(this.cart));
    },
    
    saveWishlist() {
        localStorage.setItem('wishlist', JSON.stringify(this.wishlist));
    },
    
    // Update counts in UI
    updateCounts() {
        const cartCount = this.cart.reduce((total, item) => total + item.quantity, 0);
        const wishlistCount = this.wishlist.length;
        
        document.querySelectorAll('.cart-count').forEach(el => {
            el.textContent = cartCount;
        });
        
        document.querySelectorAll('.fav-count').forEach(el => {
            el.textContent = wishlistCount;
        });
    },
    
    // Cart operations
    addToCart(product) {
        const existingItem = this.cart.find(item => item.id === product.id);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.cart.push({
                ...product,
                quantity: 1
            });
        }
        
        this.saveCart();
        this.updateCounts();
        this.showNotification('Product added to cart!');
    },
    
    removeFromCart(productId) {
        this.cart = this.cart.filter(item => item.id !== productId);
        this.saveCart();
        this.updateCounts();
        this.showNotification('Item removed from cart');
    },
    
    updateQuantity(productId, newQuantity) {
        const item = this.cart.find(item => item.id === productId);
        if (item) {
            if (newQuantity < 1) {
                this.removeFromCart(productId);
            } else {
                item.quantity = newQuantity;
                this.saveCart();
                this.updateCounts();
            }
        }
    },
    
    clearCart() {
        this.cart = [];
        this.saveCart();
        this.updateCounts();
        this.showNotification('Cart cleared');
    },
    
    // Wishlist operations
    toggleWishlist(product) {
        const existingIndex = this.wishlist.findIndex(item => item.id === product.id);
        
        if (existingIndex > -1) {
            this.wishlist.splice(existingIndex, 1);
            this.saveWishlist();
            this.updateCounts();
            this.showNotification('Removed from wishlist');
            return false;
        } else {
            this.wishlist.push(product);
            this.saveWishlist();
            this.updateCounts();
            this.showNotification('Added to wishlist!');
            return true;
        }
    },
    
    clearWishlist() {
        this.wishlist = [];
        this.saveWishlist();
        this.updateCounts();
        this.showNotification('Wishlist cleared');
    },
    
    // Check if product is in wishlist
    isInWishlist(productId) {
        return this.wishlist.some(item => item.id === productId);
    },
    
    // Notification system
    showNotification(message, type = 'success') {
        // Remove existing notifications
        const existingNotifications = document.querySelectorAll('.global-notification');
        existingNotifications.forEach(notification => notification.remove());
        
        const notification = document.createElement('div');
        notification.className = `global-notification ${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;
        
        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background-color: ${type === 'success' ? '#10B981' : type === 'error' ? '#EF4444' : '#3B82F6'};
            color: white;
            padding: 15px 25px;
            border-radius: 8px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.2);
            z-index: 9999;
            animation: slideInRight 0.3s ease;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 10px;
            max-width: 400px;
        `;
        
        document.body.appendChild(notification);
        
        // Auto remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    },
    
    // Load data functions
    async loadProducts() {
        try {
            const response = await fetch('products.json');
            this.products = await response.json();
            return this.products;
        } catch (error) {
            console.error('Error loading products:', error);
            this.showNotification('Failed to load products', 'error');
            return [];
        }
    },
    
    async loadSuppliers() {
        try {
            const response = await fetch('suppliers.json');
            this.suppliers = await response.json();
            return this.suppliers;
        } catch (error) {
            console.error('Error loading suppliers:', error);
            this.showNotification('Failed to load suppliers', 'error');
            return [];
        }
    },
    
    // Search and filter functions
    searchProducts(query) {
        return this.products.filter(product =>
            product.name.toLowerCase().includes(query.toLowerCase()) ||
            product.description.toLowerCase().includes(query.toLowerCase()) ||
            product.category.toLowerCase().includes(query.toLowerCase())
        );
    },
    
    filterProductsByCategory(category) {
        return this.products.filter(product => product.category === category);
    },
    
    filterProductsBySupplier(supplierId) {
        return this.products.filter(product => product.supplierId == supplierId);
    },
    
    getSupplierProducts(supplierId) {
        return this.products.filter(product => product.supplierId == supplierId);
    },
    
    // Calculate cart total
    getCartTotal() {
        return this.cart.reduce((total, item) => {
            const product = this.products.find(p => p.id === item.id) || item;
            return total + (product.price * item.quantity);
        }, 0);
    },
    
    // Format price
    formatPrice(price) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2
        }).format(price);
    },
    
    // Mobile Menu Functions
    initMobileMenu() {
        const mobileMenuBtn = document.getElementById('mobileMenuBtn');
        const mobileMenuClose = document.getElementById('mobileMenuClose');
        const mobileMenu = document.getElementById('mobileMenu');
        const backdrop = document.getElementById('backdrop');
        
        if (mobileMenuBtn && mobileMenuClose && mobileMenu && backdrop) {
            mobileMenuBtn.addEventListener('click', () => {
                mobileMenu.classList.add('active');
                backdrop.classList.add('active');
                document.body.style.overflow = 'hidden';
            });

            mobileMenuClose.addEventListener('click', () => {
                mobileMenu.classList.remove('active');
                backdrop.classList.remove('active');
                document.body.style.overflow = '';
            });

            backdrop.addEventListener('click', () => {
                mobileMenu.classList.remove('active');
                backdrop.classList.remove('active');
                document.body.style.overflow = '';
            });
        }
    },
    
    // Initialize
    init() {
        this.updateCounts();
        this.initMobileMenu();
        this.setupScrollAnimations();
        // Add animation styles
        this.addAnimationStyles();
    },

    // Smooth reveal animations on scroll
    setupScrollAnimations() {
        const animated = document.querySelectorAll('.reveal-on-scroll');
        if (!animated.length || typeof IntersectionObserver === 'undefined') return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('reveal-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.15, rootMargin: '0px 0px -10% 0px' });

        animated.forEach(el => observer.observe(el));
    },
    
    // Add animation styles
    addAnimationStyles() {
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideInRight {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            @keyframes slideOutRight {
                from {
                    transform: translateX(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(100%);
                    opacity: 0;
                }
            }
            .reveal-on-scroll {
                opacity: 0;
                transform: translateY(24px);
                transition: opacity 0.6s ease, transform 0.6s ease;
            }
            .reveal-visible {
                opacity: 1;
                transform: translateY(0);
            }
        `;
        document.head.appendChild(style);
    },

    async fetchJson(url) {
        try {
            const res = await fetch(url);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return await res.json();
        } catch (err) {
            console.warn(`Failed to fetch ${url}`, err);
            throw err;
        }
    }
};

// Initialize global state
document.addEventListener('DOMContentLoaded', () => {
    GlobalState.init();
});

// Make GlobalState available globally
window.GlobalState = GlobalState;

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GlobalState;
}
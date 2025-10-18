// Управление видимостью regulog и корзины
class AuthManager {
    constructor() {
        this.init();
    }

    init() {
        console.log('AuthManager initialized');
        this.updateAuthState();
        this.setupEventListeners();
        this.setupCartListeners();
        this.setupLogoutHandler();
    }

    updateAuthState() {
        const isAuthenticated = this.isAuthenticated();
        console.log('Auth state:', isAuthenticated ? 'Authenticated' : 'Not authenticated');

        const regulog = document.getElementById('regulog');
        const cartHeader = document.getElementById('cartHeader');

        if (regulog && cartHeader) {
            if (isAuthenticated) {

                regulog.style.display = 'none';
                cartHeader.style.display = 'flex';
                this.updateCartCount();
            } else {

                regulog.style.display = 'block';
                cartHeader.style.display = 'none';
            }
        } else {
            console.log('Elements not found - regulog:', !!regulog, 'cartHeader:', !!cartHeader);
        }
    }

    isAuthenticated() {
        return this.isTokenValid();
    }

    isTokenValid() {
        const token = localStorage.getItem('token');
        if (!token) return false;
        
        try {
            // Пробуем декодировать токен чтобы проверить его структуру
            const payload = JSON.parse(atob(token.split('.')[1]));
            const isExpired = payload.exp * 1000 < Date.now();
            
            if (isExpired) {
                console.log('Token expired, removing...');
                localStorage.removeItem('token');
                return false;
            }
            return true;
        } catch (error) {
            console.log('Invalid token format, removing...');
            localStorage.removeItem('token');
            return false;
        }
    }

    getCart() {
        try {
            const cartData = localStorage.getItem('cart_v3');
            if (!cartData) return [];
            
            const cart = JSON.parse(cartData);
            return cart.items || [];
        } catch (error) {
            console.error('Error reading cart:', error);
            return [];
        }
    }

    updateCartCount() {
        const cartCount = document.getElementById('cart-count');
        if (!cartCount) {
            console.log('Cart count element not found');
            return;
        }

        const items = this.getCart();
        const totalItems = items.reduce((sum, item) => sum + (item.quantity || 0), 0);

        if (totalItems > 0) {
            cartCount.textContent = totalItems > 99 ? '99+' : totalItems;
            cartCount.style.display = 'flex';
            cartCount.style.fontSize = '8px';

            if (totalItems > 99) {
                cartCount.classList.add('large');
            } else {
                cartCount.classList.remove('large');
            }
        } else {
            cartCount.style.display = 'none';
        }
    }

    setupLogoutHandler() {
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', async () => {
                const result = await Swal.fire({
                    title: 'Выход из системы',
                    text: 'Вы уверены, что хотите выйти?',
                    icon: 'question',
                    showCancelButton: true,
                    confirmButtonColor: '#d33',
                    cancelButtonColor: '#5952b8ff',
                    confirmButtonText: 'Да, выйти!',
                    cancelButtonText: 'Отмена',
                    reverseButtons: true
                });

                if (result.isConfirmed) {
                    localStorage.removeItem('token');
                    localStorage.removeItem('cart_v3');
                    this.updateAuthState();

                    if (!window.location.pathname.includes('index.html')) {
                        setTimeout(() => {
                            window.location.href = 'index.html';
                        }, 500);
                    }
                }
            });
        }
    }

    setupEventListeners() {
        window.addEventListener('storage', (e) => {
            console.log('Storage changed:', e.key);
            if (e.key === 'token') {
                this.updateAuthState();
            }
            if (e.key === 'cart_v3') {
                this.updateCartCount();
            }
        });
    }

    setupCartListeners() {
        window.addEventListener('cartUpdated', () => {
            console.log('Cart updated event received');
            this.updateCartCount();
        });
        setInterval(() => {
            this.updateCartCount();
        }, 1000);
    }

    forceUpdate() {
        this.updateAuthState();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded - initializing AuthManager');
    window.authManager = new AuthManager();
});
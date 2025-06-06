
class Cart {
  constructor() {
    this.key = 'eatly_cart_v2';
    this.cart = this.loadCart();
  }

  loadCart() {
    const saved = localStorage.getItem(this.key);
    return saved ? JSON.parse(saved) : { items: [], restaurantId: null };
  }

  saveCart() {
    localStorage.setItem(this.key, JSON.stringify(this.cart));
  }

  addItem(item) {

    if (this.cart.restaurantId && this.cart.restaurantId !== item.restaurantId) {
      if (confirm('Вы хотите заказать из другого ресторана. Текущая корзина будет очищена.')) {
        this.clearCart();
      } else {
        return;
      }
    }

    if (this.cart.items.length === 0) {
      this.cart.restaurantId = item.restaurantId;
    }


    const existingItem = this.cart.items.find(i => 
      i.menuItemId === item.menuItemId && 
      i.restaurantId === item.restaurantId
    );

    if (existingItem) {
      existingItem.quantity += item.quantity || 1;
    } else {
      this.cart.items.push({
        ...item,
        quantity: item.quantity || 1,
        id: `${item.restaurantId}-${item.menuItemId}`
      });
    }

    this.saveCart();
  }

  removeItem(itemId, completely = false) {
    const itemIndex = this.cart.items.findIndex(i => i.id === itemId);
    
    if (itemIndex === -1) return false;

    if (completely || this.cart.items[itemIndex].quantity <= 1) {
      this.cart.items.splice(itemIndex, 1);

      if (this.cart.items.length === 0) {
        this.cart.restaurantId = null;
      }
    } else {
      this.cart.items[itemIndex].quantity -= 1;
    }

    this.saveCart();
    return true;
  }

  clearCart() {
    this.cart = { items: [], restaurantId: null };
    this.saveCart();
  }

  getCart() {
    return this.cart;
  }
}

const cart = new Cart();
export default cart;
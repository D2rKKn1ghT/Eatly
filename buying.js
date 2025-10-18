import { 
  fetchRestaurants, 
  fetchRestaurantMenu
} from './api.js';
const jwt_decode = window.jwt_decode;

let allRestaurants = [];

window.addEventListener('error', function(event) {
  console.error('Global error:', event.error);
  Swal.fire({
    icon: 'error',
    title: 'Ошибка',
    text: 'Произошла критическая ошибка. Пожалуйста, обновите страницу.',
    confirmButtonText: 'OK'
  });
});

document.addEventListener('DOMContentLoaded', async function() {
  try {
    const restaurants = await fetchRestaurants();
    console.log('Restaurants loaded:', restaurants);
    
    if (!restaurants || restaurants.length === 0) {
      throw new Error('Список ресторанов пуст');
    }

    renderRestaurants(restaurants);
    if (!window.location.pathname.includes('menu_choice.html')) {
        return;
    }
    if (typeof Swiper !== 'undefined') {
      initSwiper();
    }
    setupEventHandlers();
    
  } catch (error) {
    console.error('Ошибка инициализации:', error);
    Swal.fire({
      icon: 'error',
      title: 'Ошибка загрузки',
      text: 'Произошла ошибка при загрузке данных. Пожалуйста, обновите страницу.',
      confirmButtonText: 'OK'
    });
  }
});

function renderRestaurants(restaurants) {
  const restaurantsContainer = document.querySelector('.cards');
  if (!restaurantsContainer) return;

  setupRestaurantCardClickHandlers(restaurants);
}

function setupRestaurantCardClickHandlers(restaurants) {
  document.querySelectorAll('.card').forEach(card => {
    card.addEventListener('click', function() {
      const restaurantId = this.dataset.id;
      
      if (!restaurantId) {
        console.error('ID ресторана не найден');
        return;
      }
      
      localStorage.setItem('selectedRestaurantId', restaurantId);

      window.location.href = `menu_restaurant.html?id=${restaurantId}`;
    });
  });
}


function initSwiper() {
  if (typeof Swiper !== 'undefined') {
    new Swiper('.swiper-container', {
      observer: true,
      observeParents: true,
      virtualTranslate: true,
      effect: "fade",
      fadeEffect: { crossFade: true },
      pagination: {
        el: '.blog-slider__pagination',
        clickable: true,
      },
      slidesPerView: 1,
    });
  }
}

function setupEventHandlers() {

  const hearts = document.querySelectorAll('.ri-heart-line');
  hearts.forEach(heart => {
    let isClicked = false;
    
    heart.addEventListener('mouseover', function() {
      if (!isClicked) {
        this.classList.replace('ri-heart-line', 'ri-heart-fill');
      }
    });
    
    heart.addEventListener('mouseout', function() {
      if (!isClicked) {
        this.classList.replace('ri-heart-fill', 'ri-heart-line');
      }
    });
    
    heart.addEventListener('click', function() {
      isClicked = !isClicked;
      this.classList.toggle('ri-heart-fill', isClicked);
      this.classList.toggle('ri-heart-line', !isClicked);
    });
  });

  const bookmarks = document.querySelectorAll('.bookmark');
  bookmarks.forEach(bookmark => {
    let isClicked = false;
    
    bookmark.addEventListener('click', function(event) {
      if (event.target.classList.contains('ri-bookmark-fill')) {
        isClicked = !isClicked;
        const icon = this.querySelector('.ri-bookmark-fill');
        
        icon.classList.toggle('choose', isClicked);
        this.classList.toggle('spanchoose', isClicked);
      }
    });
    const foodFilterBtn = document.querySelector('.search-toggle-button[data-type="food"]');
    const restaurantFilterBtn = document.querySelector('.search-toggle-button[data-type="restaurant"]');
    
    if (foodFilterBtn && restaurantFilterBtn) {
        foodFilterBtn.addEventListener('click', () => toggleView('food'));
        restaurantFilterBtn.addEventListener('click', () => toggleView('restaurant'));
    }
  });

  const accordionItems = document.querySelectorAll('.accordion button');
  accordionItems.forEach(item => {
    item.addEventListener('click', toggleAccordion);
  });
  setupCategoryButtons();
  setupSortButtons();
}
function setupCategoryButtons() {
  const categoryButtonsContainer = document.querySelector('.category-buttons');
  
  if (!categoryButtonsContainer) return;
  
  categoryButtonsContainer.addEventListener('click', function(e) {

    const button = e.target.closest('.category-button');
    if (!button) return;

    const allButtons = this.querySelectorAll('.category-button');
    allButtons.forEach(btn => {
      btn.classList.remove('active');
    });

    button.classList.add('active');
    const category = button.dataset.category || button.classList[1];
    filterByCategory(category);
  });
}
function filterByCategory(category) {
  console.log('Фильтрация по категории:', category);
}
function setupSortButtons() {
  const sortButtonsContainer = document.querySelector('.sort-options');
  
  if (!sortButtonsContainer) return;
  
  sortButtonsContainer.addEventListener('click', function(e) {
    const button = e.target.closest('.sort-button');
    if (!button) return;
    

    const allSortButtons = this.querySelectorAll('.sort-button');
    allSortButtons.forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');
  });
}
function toggleAccordion() {
  const itemToggle = this.getAttribute('aria-expanded');

  document.querySelectorAll('.accordion button').forEach(item => {
    item.setAttribute('aria-expanded', 'false');
  });
  

  if (itemToggle === 'false') {
    this.setAttribute('aria-expanded', 'true');
  }
}
function toggleView(type) {
  const restaurantsSection = document.querySelector('.Restaurants_content');
  const dishesSection = document.querySelector('.Dishes_content');
  const foodBtn = document.querySelector('.search-toggle-button[data-type="food"]');
  const restaurantBtn = document.querySelector('.search-toggle-button[data-type="restaurant"]');

  if (type === 'food') {
    restaurantsSection.style.display = 'none';
    dishesSection.style.display = 'block';
    
    foodBtn.classList.add('active');
    restaurantBtn.classList.remove('active');
  } else {

    restaurantsSection.style.display = 'block';
    dishesSection.style.display = 'none';
    

    foodBtn.classList.remove('active');
    restaurantBtn.classList.add('active');
  }
}
// ================================================
// Код для страницы menu_restaurant.html
// ================================================

if (window.location.pathname.includes('menu_restaurant.html')) {
  document.addEventListener('DOMContentLoaded', async function() {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const restaurantId = urlParams.get('id');
      
      if (!restaurantId) {
        throw new Error('Ресторан не выбран');
      }

      allRestaurants = await fetchRestaurants();
      
      const restaurant = allRestaurants[0].find(r => r.id == restaurantId);
      
      if (!restaurant) {
        throw new Error('Ресторан не найден');
      }

      updateRestaurantInfo(restaurant);

      const menu = await fetchRestaurantMenu(restaurantId);
      renderMenu(menu);

      setupEventHandlers();
      
    } catch (error) {
      console.error('Ошибка загрузки меню ресторана:', error);
      Swal.fire({
        icon: 'error',
        title: 'Ошибка',
        text: error.message || 'Не удалось загрузить меню ресторана',
        confirmButtonText: 'OK'
      });
      window.location.href = 'menu_choice.html';
    }
  });
}
debugger;
function updateRestaurantInfo(restaurant) {
  const titleElement = document.querySelector('.mainres h3');
  if (titleElement) {
    titleElement.textContent = restaurant.name;
  }

  const timeElement = document.querySelector('.mainres .info p:first-child');
  if (timeElement) {
    timeElement.textContent = restaurant.delivery_time || 'N/A';
  }

  const ratingElement = document.querySelector('.mainres .rate');
  if (ratingElement) {
    ratingElement.textContent = restaurant.rating || 'N/A';
  }

  const restaurantImage = document.querySelector('.mainres img');
  if (restaurantImage && restaurant.image) {
    const imagePath = restaurant.image.startsWith('/') 
      ? restaurant.image.substring(1) 
      : restaurant.image;
    restaurantImage.src = imagePath;
    restaurantImage.alt = restaurant.name;
    
  }
}

function renderMenu(menuData) {
  console.log('Raw menu data:', menuData);

  let menuItems = Array.isArray(menuData) && menuData.length > 0 
    ? (Array.isArray(menuData[0]) ? menuData[0] : menuData) 
    : [];

  console.log('Extracted menu items:', menuItems);

  const menuContainer = document.querySelector('.mini-cards');
  if (!menuContainer) {
    console.error('Menu container not found');
    return;
  }

  menuContainer.innerHTML = '';

  const urlParams = new URLSearchParams(window.location.search);
  const restaurantId = urlParams.get('id');
  
  if (!restaurantId) {
    menuContainer.innerHTML = '<p class="error">Не удалось определить ресторан</p>';
    return;
  }
  const separContainer = document.querySelector('#notNeed');
  if (restaurantId === '3') {
    separContainer.style.display = 'none';
    }
  const dishContainer = document.querySelector('#notSugar');
  if (restaurantId === '3') {
    dishContainer.style.display = 'none';
    }

  const uniqueItems = [];
  const seenItems = new Set();

  menuItems.forEach(item => {

    if (item.restaurant_id != restaurantId) return;

    const itemKey = `${item.name}_${item.price}_${item.time}`;
    
    if (seenItems.has(itemKey)) return;
    seenItems.add(itemKey);
    
    uniqueItems.push(item);
  });

  console.log('Filtered unique items:', uniqueItems);

  if (uniqueItems.length === 0) {
    menuContainer.innerHTML = '<p class="empty">Меню пока пустое</p>';
    return;
  }

  uniqueItems.forEach(item => {
    const menuItem = document.createElement('div');
    menuItem.className = 'mini-card';

    let tags = item.tags;
    if (typeof tags === 'string') {
      tags = tags.replace(/^\["|"\]$/g, '');
    }

    menuItem.innerHTML = `
      <i class="ri-heart-line"></i>
      <div class="card_image dish">
        <img src="${fixImagePath(item.image)}" alt="${item.name}">
      </div>
      <div class="mini_card_content">
        ${tags ? `<span class="${tags.toLowerCase()} mini"><p>${tags}</p></span>` : ''}
        <h3>${item.name}</h3>
        <div class="info">
          <p>${item.time || '24 мин'}</p>
          <i class="ri-circle-fill"></i>
          <i class="ri-star-fill"></i>
          <p>${item.rating || '4.8'}</p>
        </div>
        <p class="price">${item.price ? `${item.price} ₽` : 'N/A'}</p>
        <span class="add_dish"><i class="ri-add-line"></i></span>
      </div>
    `;
    
    menuContainer.appendChild(menuItem);
  });
}``

function fixImagePath(path) {
  if (!path) return 'Assets/default-food.png';
  let cleanPath = path.startsWith('/') ? path.substring(1) : path;
  cleanPath = cleanPath.replace(/^["']|["']$/g, '');

  if (!cleanPath.endsWith('.png') && !cleanPath.endsWith('.jpg')) {
    cleanPath += '.png';
  }
  return cleanPath;
}

// ================================================
// Код для страницы menu_order.html
// ================================================

const API_URL = 'http://localhost:3000'; //костыль
const CART_KEY = 'cart_v3';

let cart = {
  items: [],
  restaurantId: null,
  version: 3
};

function initCart() {
  const savedCart = JSON.parse(localStorage.getItem(CART_KEY));
  if (savedCart) {
    cart = savedCart;
  }
  
  const proxyHandler = {
    set(target, property, value) {
      target[property] = value;
      if (property === 'items' || property === 'restaurantId') {
        saveCart();
      }
      return true;
    }
  };

  cart = new Proxy(cart, proxyHandler);
  
  updateCartUI();
  setupCartHandlers();
}


function resetCart() {
  cart = {
    items: [],
    restaurantId: null,
    version: 3
  };
  saveCart();
}


function saveCart() {
  if (!cart.items || !Array.isArray(cart.items)) {
    console.error('Invalid cart structure', cart);
    resetCart();
  }
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartUI();
}


function generateItemId(item) {
  return `${item.restaurantId}-${`${item.name}-${item.price}`}`;
}
async function addToCart(itemData) {
  if (!isAuthenticated()) {
    console.log('User not authenticated, redirecting to login...');
    const pendingCartItem = {
      item: itemData,
      restaurantId: localStorage.getItem('selectedRestaurantId'),
      timestamp: Date.now()
    };
    localStorage.setItem('pendingCartItem', JSON.stringify(pendingCartItem));
    localStorage.setItem('returnUrl', window.location.href);

    const result = await Swal.fire({
      title: 'Требуется авторизация',
      text: 'Для добавления в корзину необходимо войти в систему',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Войти',
      cancelButtonText: 'Отмена'
    });

    if (result.isConfirmed) {
      window.location.href = 'signin.html';
    }
    return;
  }

  const currentRestaurant = localStorage.getItem('selectedRestaurantId');

  if (cart.items.length > 0 && cart.restaurantId !== currentRestaurant) {
    const result = await Swal.fire({
      title: 'Добавить из другого ресторана?',
      text: 'Текущая корзина будет очищена.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Очистить',
      cancelButtonText: 'Отмена',
      confirmButtonColor: '#5952b8ff',
      cancelButtonColor: '#d33',
    });

    if (!result.isConfirmed) {
      return;
    }
    
    resetCart();
  }

  if (cart.items.length === 0) {
    cart.restaurantId = currentRestaurant;
  }

  const itemId = generateItemId(itemData);
  const existingItem = cart.items.find(item => item.id === itemId);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.items.push({
      ...itemData,
      id: itemId,
      quantity: 1
    });
  }

  saveCart();
}


function isAuthenticated() {
  const token = localStorage.getItem('token');
  if (!token) return false;
  
  try {
    // Проверка валидности токена
    const payload = JSON.parse(atob(token.split('.')[1]));
    const isExpired = payload.exp * 1000 < Date.now();
    
    if (isExpired) {
      localStorage.removeItem('token');
      return false;
    }
    return true;
  } catch (error) {
    localStorage.removeItem('token');
    return false;
  }
}

function increaseQuantity(itemId) {
  const item = cart.items.find(item => item.id === itemId);
  if (item) {
    item.quantity += 1;
    saveCart();
  }
}

function decreaseQuantity(itemId) {
  const itemIndex = cart.items.findIndex(item => item.id === itemId);
  if (itemIndex !== -1) {
    if (cart.items[itemIndex].quantity > 1) {
      cart.items[itemIndex].quantity -= 1;
    } else {
      cart.items.splice(itemIndex, 1);
    }
    saveCart();
  }
}
let confirm = 0;
async function placeOrder() {
  try {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Требуется авторизация');
    
    try {
      const decoded = jwt_decode(token);
      if (decoded.exp * 1000 < Date.now()) {
        const result = await Swal.fire({
          title: 'Сессия истекла',
          text: 'Войти снова?',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Войти',
          cancelButtonText: 'Отмена'
        });
        
        if (result.isConfirmed) {
          window.location.href = 'signin.html';
        }
        return;
      }
    } catch (error) {
      console.error("Ошибка декодирования токена:", error);
      localStorage.removeItem('token');
      window.location.href = 'signin.html';
      return;
    }

    if (cart.items.length === 0) throw new Error('Корзина пуста');

    await Swal.fire({
      title: "Вы уверены?",
      text: "Вы точно хотите оформить данный заказ?",
      icon: "question",
      allowOutsideClick: false,
      allowEscapeKey: false,
      showCancelButton: true,
      confirmButtonColor: "#5952b8ff",
      cancelButtonColor: "#d33",
      confirmButtonText: "Да",
      cancelButtonText: "Нет"
    }).then((result) => {
      if (result.isConfirmed) {
        confirm = 1;
      } else{
        confirm = 0;
        return;
      }
    });
    if (confirm==1){
      await Swal.fire({
        title: 'Оформление заказа...',
        text: 'Пожалуйста, подождите',
        allowOutsideClick: false,
        allowEscapeKey: false,
        timer: 2500,
        timerProgressBar: true,
        didOpen: () => {
          Swal.showLoading();
        }
      });
    
      const response = await fetch(`${API_URL}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          restaurantId: cart.restaurantId,
          items: cart.items.map(item => ({
            menu_item_id: item.menuItemId || item.id,
            quantity: item.quantity,
            price: item.price
          })),
          totalAmount: cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
        })
      });

      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Order error response:', errorText);
        throw new Error(`Ошибка сервера: ${response.status}`);
      }
      const result = await response.json();
      resetCart();
    }
    
  } catch (error) {
    console.error('Order error:', error);

    await Swal.fire({
      icon: 'error',
      title: 'Ошибка оформления заказа',
      text: error.message,
      confirmButtonText: 'Понятно'
    });
  }
}

function updateCartUI() {
  const cartContainer = document.querySelector('.cart-container');
  const summaryContainer = document.querySelector('.summary');
  
  if (cartContainer) {
    cartContainer.innerHTML = cart.items.length === 0 
      ? '<p class="empty-cart">Корзина пуста</p>'
      : cart.items.map(item => `
          <div class="food-item" data-id="${item.id}">
            <img src="${item.image}" alt="${item.name}" class="food-image">
            <div class="food-details">
              <h3 class="food-name">${item.name}</h3>
              <p class="food-tags">${item.tags}</p>
              <p class="food-price">${item.price}₽</p>
            </div>
            <div class="quantity-control">
              <button class="quantity-button minus">
                <img src="/Assets/Mins.svg" alt="Уменьшить">
              </button>
              <span class="quantity">${item.quantity}</span>
              <button class="quantity-button plus">
                <img src="/Assets/Plus.svg" alt="Увеличить">
              </button>
              <p class="total-price">${(item.price * item.quantity).toFixed(2)}₽</p>
            </div>
          </div>
        `).join('');
  }
  
  if (summaryContainer) {
    const total = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    summaryContainer.innerHTML = `
      <div class="summary-item">
        <span class="label">Итого</span>
        <span class="value">${total.toFixed(2)}₽</span>
      </div>
    `;
  }
}
function setupCartHandlers() {
  document.addEventListener('click', e => {
    const addButton = e.target.closest('.add_dish');
    if (addButton) {
      const card = addButton.closest('.mini-card');
      const itemData = {
        name: card.querySelector('h3').textContent,
        price: parseFloat(card.querySelector('.price').textContent.replace(/[^\d.]/g, '')),
        image: card.querySelector('img').src,
        tags: card.querySelector('.mini p')?.textContent || '',
        restaurantId: localStorage.getItem('selectedRestaurantId'),
        menuItemId: card.dataset.id || generateItemId({
          name: card.querySelector('h3').textContent,
          price: parseFloat(card.querySelector('.price').textContent.replace(/[^\d.]/g, ''))
        })
      };
      console.log('Adding to cart:', itemData);
      addToCart(itemData);

      addButton.classList.add('added');
      setTimeout(() => addButton.classList.remove('added'), 500);
    }
  });
  
  document.querySelector('.cart-container')?.addEventListener('click', e => {
    const itemElement = e.target.closest('.food-item');
    if (!itemElement) return;
    
    const itemId = itemElement.dataset.id;
    
    if (e.target.closest('.minus')) {
      decreaseQuantity(itemId);
    } else if (e.target.closest('.plus')) {
      increaseQuantity(itemId);
    }
  });
  const orderButton = document.querySelector('.review-payment-button');
  if (orderButton) {
    orderButton.addEventListener('click', async function(e) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      
      console.log('Order button clicked, preventing default behavior');
      await placeOrder();
    });
  }
}

document.addEventListener('DOMContentLoaded', initCart);
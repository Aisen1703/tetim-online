const products = [
  {
    id: 1,
    name: 'Костюм Active North',
    category: 'sport',
    categoryLabel: 'Спорт',
    price: 6990,
    size: 'S, M, L, XL',
    image: 'https://placehold.co/600x720?text=Active+North',
    description: 'Спортивный костюм для города, тренировок и повседневной носки.'
  },
  {
    id: 2,
    name: 'Футболка Basic TETIM',
    category: 'sport',
    categoryLabel: 'Футболки',
    price: 1990,
    size: 'S, M, L',
    image: 'https://placehold.co/600x720?text=Basic+TETIM',
    description: 'Базовая футболка из плотного хлопка с чистой посадкой.'
  },
  {
    id: 3,
    name: 'Куртка Outdoor Line',
    category: 'outdoor',
    categoryLabel: 'Outdoor',
    price: 8990,
    size: 'M, L, XL',
    image: 'https://placehold.co/600x720?text=Outdoor+Line',
    description: 'Функциональная модель для прогулок, выездов и прохладной погоды.'
  },
  {
    id: 4,
    name: 'Форма Team Motion',
    category: 'team',
    categoryLabel: 'Командные',
    price: 5490,
    size: 'Под заказ',
    image: 'https://placehold.co/600x720?text=Team+Motion',
    description: 'Комплект для команд, секций и мероприятий с возможностью брендинга.'
  },
  {
    id: 5,
    name: 'Брюки Trail Fit',
    category: 'outdoor',
    categoryLabel: 'Outdoor',
    price: 4590,
    size: 'S, M, L',
    image: 'https://placehold.co/600x720?text=Trail+Fit',
    description: 'Удобные брюки для активного ритма и повседневной носки.'
  },
  {
    id: 6,
    name: 'Худи Urban Warm',
    category: 'sport',
    categoryLabel: 'Спорт',
    price: 4290,
    size: 'M, L, XL',
    image: 'https://placehold.co/600x720?text=Urban+Warm',
    description: 'Теплое худи свободного кроя для города и межсезонья.'
  },
  {
    id: 7,
    name: 'Кепка Brand Mark',
    category: 'sport',
    categoryLabel: 'Аксессуары',
    price: 1490,
    size: 'One size',
    image: 'https://placehold.co/600x720?text=Brand+Mark',
    description: 'Повседневный аксессуар для завершения образа.'
  },
  {
    id: 8,
    name: 'Комплект Club Edition',
    category: 'team',
    categoryLabel: 'Командные',
    price: 7990,
    size: 'Под заказ',
    image: 'https://placehold.co/600x720?text=Club+Edition',
    description: 'Решение для клубов, организаций и корпоративных заказов.'
  }
];

let currentCategory = 'all';
const cart = [];

const productsEl = document.getElementById('products');
const cartItemsEl = document.getElementById('cart-items');
const cartTotalEl = document.getElementById('cart-total');
const cartCountEl = document.getElementById('cart-count');
const formEl = document.getElementById('checkout-form');
const messageEl = document.getElementById('message');
const clearCartBtn = document.getElementById('clear-cart-btn');
const openCartBtn = document.getElementById('open-cart-btn');
const filterButtons = document.querySelectorAll('.filter-btn');

function formatPrice(value) {
  return `${value.toLocaleString('ru-RU')} ₽`;
}

function getVisibleProducts() {
  if (currentCategory === 'all') return products;
  return products.filter(product => product.category === currentCategory);
}

function renderProducts() {
  const visibleProducts = getVisibleProducts();
  productsEl.innerHTML = '';

  visibleProducts.forEach(product => {
    const card = document.createElement('article');
    card.className = 'product-card';

    card.innerHTML = `
      <div class="product-image-wrap">
        <img class="product-image" src="${product.image}" alt="${product.name}">
      </div>
      <div class="product-body">
        <div class="product-category">${product.categoryLabel}</div>
        <div class="product-title">${product.name}</div>
        <div class="product-desc">${product.description}</div>
        <div class="product-meta">
          <div class="product-price">${formatPrice(product.price)}</div>
          <div class="product-size">${product.size}</div>
        </div>
        <div class="product-actions">
          <button data-id="${product.id}">В корзину</button>
        </div>
      </div>
    `;

    const button = card.querySelector('button');
    button.addEventListener('click', () => addToCart(product.id));
    productsEl.appendChild(card);
  });
}

function addToCart(productId) {
  const product = products.find(item => item.id === productId);
  const existing = cart.find(item => item.id === productId);

  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ ...product, quantity: 1 });
  }

  renderCart();
  showMessage(`Добавлено в корзину: ${product.name}`);
}

function removeFromCart(productId) {
  const index = cart.findIndex(item => item.id === productId);
  if (index !== -1) {
    cart.splice(index, 1);
  }
  renderCart();
}

function clearCart() {
  cart.length = 0;
  renderCart();
}

function renderCart() {
  cartItemsEl.innerHTML = '';

  if (cart.length === 0) {
    cartTotalEl.textContent = 'Итого: 0 ₽';
    cartCountEl.textContent = '0';
    return;
  }

  cart.forEach(item => {
    const row = document.createElement('div');
    row.className = 'cart-item';
    row.innerHTML = `
      <div>
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-meta">${item.quantity} × ${formatPrice(item.price)}</div>
      </div>
      <button class="remove-btn" type="button">Удалить</button>
    `;

    row.querySelector('.remove-btn').addEventListener('click', () => removeFromCart(item.id));
    cartItemsEl.appendChild(row);
  });

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);

  cartTotalEl.textContent = `Итого: ${formatPrice(total)}`;
  cartCountEl.textContent = count;
}

async function submitOrder(orderData) {
  const response = await fetch('http://localhost:4000/api/orders', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(orderData)
  });

  if (!response.ok) {
    throw new Error('Ошибка при отправке заказа');
  }

  return response.json();
}

function showMessage(text, isError = false) {
  messageEl.textContent = text;
  messageEl.classList.remove('hidden');
  messageEl.style.background = isError ? '#fde7e7' : '#e6f7eb';
}

filterButtons.forEach(button => {
  button.addEventListener('click', () => {
    filterButtons.forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');
    currentCategory = button.dataset.category;
    renderProducts();
  });
});

clearCartBtn.addEventListener('click', clearCart);

openCartBtn.addEventListener('click', () => {
  document.getElementById('order').scrollIntoView({ behavior: 'smooth' });
});

formEl.addEventListener('submit', async (event) => {
  event.preventDefault();

  if (cart.length === 0) {
    showMessage('Добавьте товары в корзину', true);
    return;
  }

  const order = {
    customerName: document.getElementById('customerName').value.trim(),
    phone: document.getElementById('phone').value.trim(),
    email: document.getElementById('email').value.trim(),
    comment: document.getElementById('comment').value.trim(),
    items: cart.map(item => ({
      productId: item.id,
      name: item.name,
      quantity: item.quantity,
      price: item.price
    }))
  };

  try {
    const result = await submitOrder(order);
    showMessage(`Заказ #${result.order?.id || ''} успешно отправлен`);
    formEl.reset();
    clearCart();
  } catch (error) {
    showMessage(error.message, true);
  }
});

renderProducts();
renderCart();
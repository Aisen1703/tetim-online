const API_URL = 'http://localhost:4000/api';

const cartItemsEl = document.getElementById('cart-items');
const cartTotalEl = document.getElementById('cart-total');
const cartCountEl = document.getElementById('cart-count');
const formEl = document.getElementById('checkout-form');
const messageEl = document.getElementById('message');
const clearCartBtn = document.getElementById('clear-cart-btn');

function getCart() {
  return JSON.parse(localStorage.getItem('cart') || '[]');
}

function saveCart(cart) {
  localStorage.setItem('cart', JSON.stringify(cart));
}

function formatPrice(value) {
  return `${Number(value).toLocaleString('ru-RU')} ₽`;
}

function updateCartCount() {
  const cart = getCart();
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  if (cartCountEl) cartCountEl.textContent = String(count);
}

function removeFromCart(productId) {
  const cart = getCart();
  const index = cart.findIndex(item => item.id === productId);
  if (index !== -1) cart.splice(index, 1);
  saveCart(cart);
  renderCart();
}

function clearCart() {
  saveCart([]);
  renderCart();
}

function renderCart() {
  const cart = getCart();
  cartItemsEl.innerHTML = '';

  if (!cart.length) {
    cartItemsEl.innerHTML = '<p>Корзина пуста</p>';
    cartTotalEl.textContent = 'Итого: 0 ₽';
    updateCartCount();
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
  cartTotalEl.textContent = `Итого: ${formatPrice(total)}`;
  updateCartCount();
}

async function submitOrder(orderData) {
  const token = localStorage.getItem('token');

  const response = await fetch(`${API_URL}/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: JSON.stringify(orderData)
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Ошибка при отправке заказа');
  }
  return data;
}

function showMessage(text, isError = false) {
  messageEl.textContent = text;
  messageEl.classList.remove('hidden');
  messageEl.style.background = isError ? '#fde7e7' : '#e6f7eb';
}

clearCartBtn.addEventListener('click', clearCart);

formEl.addEventListener('submit', async (event) => {
  event.preventDefault();
  const cart = getCart();

  if (!cart.length) {
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
    showMessage(`Заказ успешно отправлен. Сделка #${result.amocrm?.leadId || ''}`);
    formEl.reset();
    clearCart();
  } catch (error) {
    showMessage(error.message, true);
  }
});

renderCart();
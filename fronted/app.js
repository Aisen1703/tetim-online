const API_URL = 'http://localhost:4000/api';

let products = [];
const productsEl = document.getElementById('home-products');
const cartCountEl = document.getElementById('cart-count');

function getCart() {
  return JSON.parse(localStorage.getItem('cart') || '[]');
}

function saveCart(cart) {
  localStorage.setItem('cart', JSON.stringify(cart));
}

function updateCartCount() {
  const cart = getCart();
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  if (cartCountEl) cartCountEl.textContent = String(count);
}

function formatPrice(value) {
  return `${Number(value).toLocaleString('ru-RU')} ₽`;
}

async function loadProducts() {
  try {
    const response = await fetch(`${API_URL}/public/products`);
    const data = await response.json();
    if (!response.ok) throw new Error('Ошибка загрузки товаров');
    products = data.products || [];
    renderProducts();
  } catch {
    productsEl.innerHTML = '<p>Не удалось загрузить товары</p>';
  }
}

function addToCart(productId) {
  const product = products.find(item => item.id === productId);
  if (!product) return;

  const cart = getCart();
  const existing = cart.find(item => item.id === productId);

  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: Number(product.price),
      quantity: 1
    });
  }

  saveCart(cart);
  updateCartCount();
  alert(`Добавлено в корзину: ${product.name}`);
}

function renderProducts() {
  if (!products.length) {
    productsEl.innerHTML = '<p>Товаров пока нет</p>';
    return;
  }

  productsEl.innerHTML = products.slice(0, 8).map(product => `
    <article class="product-card">
      <div class="product-image-wrap">
        <img class="product-image" src="${product.image_url || 'https://placehold.co/600x720?text=No+Image'}" alt="${product.name}">
      </div>
      <div class="product-body">
        <div class="product-category">${product.category}</div>
        <div class="product-title">${product.name}</div>
        <div class="product-desc">${product.description || ''}</div>
        <div class="product-meta">
          <div class="product-price">${formatPrice(product.price)}</div>
          <div class="product-size">${product.sizes || ''}</div>
        </div>
        <div class="product-actions">
          <button onclick="addToCart(${product.id})">В корзину</button>
        </div>
      </div>
    </article>
  `).join('');
}

window.addToCart = addToCart;
loadProducts();
updateCartCount();
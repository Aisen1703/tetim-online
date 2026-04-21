const API_URL = 'http://localhost:4000/api';

let products = [];
let currentCategory = 'all';
let searchTerm = '';

const productsEl = document.getElementById('catalog-products');
const cartCountEl = document.getElementById('cart-count');
const searchInput = document.getElementById('catalog-search');
const filterButtons = document.querySelectorAll('.sidebar-filter');

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
    applyInitialCategoryFromUrl();
    renderProducts();
  } catch {
    productsEl.innerHTML = '<p>Не удалось загрузить товары</p>';
  }
}

function applyInitialCategoryFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const category = params.get('category');
  if (category) {
    currentCategory = category;
    filterButtons.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.category === category);
    });
  }
}

function getVisibleProducts() {
  return products.filter(product => {
    const matchCategory = currentCategory === 'all' || product.category === currentCategory;
    const matchSearch = !searchTerm || product.name.toLowerCase().includes(searchTerm) || (product.description || '').toLowerCase().includes(searchTerm);
    return matchCategory && matchSearch;
  });
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
  const visibleProducts = getVisibleProducts();

  if (!visibleProducts.length) {
    productsEl.innerHTML = '<p>По вашему запросу товары не найдены</p>';
    return;
  }

  productsEl.innerHTML = visibleProducts.map(product => `
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

filterButtons.forEach(button => {
  button.addEventListener('click', () => {
    filterButtons.forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');
    currentCategory = button.dataset.category;
    renderProducts();
  });
});

searchInput.addEventListener('input', (e) => {
  searchTerm = e.target.value.trim().toLowerCase();
  renderProducts();
});

window.addToCart = addToCart;
loadProducts();
updateCartCount();
const API_URL = 'http://localhost:4000/api';
const token = localStorage.getItem('token');
const user = JSON.parse(localStorage.getItem('user') || 'null');

if (!token || !user || user.role !== 'admin') {
  window.location.href = 'login.html';
}

const headers = {
  'Content-Type': 'application/json',
  Authorization: `Bearer ${token}`
};

function showMessage(text, isError = false) {
  const el = document.getElementById('product-message');
  el.textContent = text;
  el.classList.remove('hidden');
  el.style.background = isError ? '#fde7e7' : '#e6f7eb';
}

async function loadUsers() {
  const response = await fetch(`${API_URL}/admin/users`, { headers });
  const data = await response.json();
  const block = document.getElementById('admin-users-block');

  if (!response.ok) {
    block.innerHTML = '<p>Не удалось загрузить клиентов</p>';
    return;
  }

  block.innerHTML = data.users.map(user => `
    <div class="cart-item">
      <div>
        <div class="cart-item-name">${user.name}</div>
        <div class="cart-item-meta">${user.email}</div>
        <div class="cart-item-meta">${user.phone || ''}</div>
      </div>
      <div>${user.role}</div>
    </div>
  `).join('');
}

async function loadProducts() {
  const response = await fetch(`${API_URL}/admin/products`, { headers });
  const data = await response.json();
  const block = document.getElementById('admin-products-block');

  if (!response.ok) {
    block.innerHTML = '<p>Не удалось загрузить товары</p>';
    return;
  }

  block.innerHTML = data.products.map(product => `
    <div class="cart-item">
      <div>
        <div class="cart-item-name">${product.name}</div>
        <div class="cart-item-meta">${product.category} · ${Number(product.price).toLocaleString('ru-RU')} ₽</div>
      </div>
      <div class="admin-actions-inline">
        <button class="btn btn-secondary" onclick="editProduct(${product.id})">Изменить</button>
        <button class="btn btn-secondary" onclick="deleteProduct(${product.id})">Удалить</button>
      </div>
    </div>
  `).join('');
}

async function loadOrders() {
  const response = await fetch(`${API_URL}/admin/orders`, { headers });
  const data = await response.json();
  const block = document.getElementById('admin-orders-block');

  if (!response.ok) {
    block.innerHTML = '<p>Не удалось загрузить заказы</p>';
    return;
  }

  block.innerHTML = data.orders.map(order => `
    <div class="cart-item">
      <div>
        <div class="cart-item-name">Заказ #${order.id}</div>
        <div class="cart-item-meta">${order.customer_name} — ${order.phone}</div>
        <div class="cart-item-meta">${Number(order.total_amount).toLocaleString('ru-RU')} ₽</div>
      </div>
      <div>
        <select onchange="changeOrderStatus(${order.id}, this.value)">
          <option value="new" ${order.status === 'new' ? 'selected' : ''}>Новый</option>
          <option value="processing" ${order.status === 'processing' ? 'selected' : ''}>В обработке</option>
          <option value="shipped" ${order.status === 'shipped' ? 'selected' : ''}>Отправлен</option>
          <option value="done" ${order.status === 'done' ? 'selected' : ''}>Завершён</option>
          <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>Отменён</option>
        </select>
      </div>
    </div>
  `).join('');
}

document.getElementById('product-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const payload = {
    name: document.getElementById('product-name').value.trim(),
    category: document.getElementById('product-category').value.trim(),
    price: Number(document.getElementById('product-price').value),
    sizes: document.getElementById('product-size').value.trim(),
    image_url: document.getElementById('product-image').value.trim(),
    description: document.getElementById('product-description').value.trim()
  };

  const response = await fetch(`${API_URL}/admin/products`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload)
  });

  const data = await response.json();

  if (!response.ok) {
    showMessage(data.message || 'Ошибка добавления товара', true);
    return;
  }

  showMessage('Товар добавлен');
  e.target.reset();
  loadProducts();
});

async function deleteProduct(id) {
  const response = await fetch(`${API_URL}/admin/products/${id}`, {
    method: 'DELETE',
    headers
  });

  if (response.ok) loadProducts();
}

async function editProduct(id) {
  const name = prompt('Новое название товара');
  if (!name) return;

  const response = await fetch(`${API_URL}/admin/products/${id}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({ name })
  });

  if (response.ok) loadProducts();
}

async function changeOrderStatus(id, status) {
  await fetch(`${API_URL}/admin/orders/${id}/status`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({ status })
  });
}

document.getElementById('admin-logout-btn').addEventListener('click', () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = 'login.html';
});

window.deleteProduct = deleteProduct;
window.editProduct = editProduct;
window.changeOrderStatus = changeOrderStatus;

loadUsers();
loadProducts();
loadOrders();
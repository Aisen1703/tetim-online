const API_URL = 'http://localhost:4000/api';
const token = localStorage.getItem('token');
const user = JSON.parse(localStorage.getItem('user') || 'null');

if (!token || !user) {
  window.location.href = 'login.html';
}

async function loadProfile() {
  const response = await fetch(`${API_URL}/account/me`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  const data = await response.json();

  if (!response.ok) {
    document.getElementById('profile-block').innerHTML = '<p>Не удалось загрузить профиль</p>';
    return;
  }

  document.getElementById('profile-block').innerHTML = `
    <p><b>Имя:</b> ${data.user.name}</p>
    <p><b>Email:</b> ${data.user.email}</p>
    <p><b>Телефон:</b> ${data.user.phone || ''}</p>
    <p><b>Роль:</b> ${data.user.role}</p>
  `;
}

async function loadOrders() {
  const response = await fetch(`${API_URL}/account/orders`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  const data = await response.json();
  const block = document.getElementById('orders-block');

  if (!response.ok) {
    block.innerHTML = '<p>Не удалось загрузить заказы</p>';
    return;
  }

  if (!data.orders.length) {
    block.innerHTML = '<p>Заказов пока нет</p>';
    return;
  }

  block.innerHTML = data.orders.map(order => `
    <div class="cart-item">
      <div>
        <div class="cart-item-name">Заказ #${order.id}</div>
        <div class="cart-item-meta">Статус: ${order.status}</div>
      </div>
      <div>${Number(order.total_amount).toLocaleString('ru-RU')} ₽</div>
    </div>
  `).join('');
}

document.getElementById('logout-btn').addEventListener('click', () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = 'login.html';
});

loadProfile();
loadOrders();
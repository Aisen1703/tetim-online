const API_URL = 'http://localhost:4000/api';

function saveAuth(data) {
  localStorage.setItem('token', data.token);
  localStorage.setItem('user', JSON.stringify(data.user));
}

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = 'login.html';
}

window.saveAuth = saveAuth;
window.logout = logout;
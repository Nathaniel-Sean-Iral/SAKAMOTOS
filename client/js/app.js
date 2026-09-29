async function fetchJson(url, options = {}) {
  const response = await fetch(url, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });

  const contentType = response.headers.get('content-type') || '';
  const payload = contentType.includes('application/json') ? await response.json() : await response.text();

  if (!response.ok) {
    throw new Error(typeof payload === 'object' ? payload.message || 'Request failed.' : payload || 'Request failed.');
  }

  return payload;
}

function renderProductGrid(products) {
  const container = document.getElementById('featured-products');
  if (!container) return;

  container.innerHTML = products.map((product) => `
    <article class="product-card">
      <img src="${product.product_image || 'https://images.unsplash.com/photo-1497636577773-f1231844b336?auto=format&fit=crop&w=600&q=80'}" alt="${product.product_name}">
      <div class="content">
        <div class="title">${product.product_name}</div>
        <div class="meta">
          <span>₱${Number(product.product_price || 0).toFixed(2)}</span>
          <span>${product.minutes || 0} min</span>
        </div>
      </div>
    </article>
  `).join('');
}

function renderMenu() {
  const container = document.getElementById('menu-products');
  if (!container) return;

  fetchJson('/api/products')
    .then((data) => {
      const categories = data.categories || {};
      const html = Object.entries(categories).map(([name, items]) => `
        <div class="category-block">
          <h3>${name}</h3>
          <div class="product-grid">
            ${items.map((product) => `
              <article class="product-card">
                <img src="${product.product_image || 'https://images.unsplash.com/photo-1497636577773-f1231844b336?auto=format&fit=crop&w=600&q=80'}" alt="${product.product_name}">
                <div class="content">
                  <div class="title">${product.product_name}</div>
                  <div class="meta">
                    <span>₱${Number(product.product_price || 0).toFixed(2)}</span>
                    <span>${product.minutes || 0} min</span>
                  </div>
                </div>
              </article>
            `).join('')}
          </div>
        </div>
      `).join('');

      container.innerHTML = html;
    })
    .catch((error) => {
      container.innerHTML = `<div class="empty-state">${error.message}</div>`;
    });
}

async function loadProfile() {
  const element = document.getElementById('profile-details');
  if (!element) return;

  try {
    const response = await fetchJson('/api/users/me');
    const user = response.user || {};
    element.innerHTML = `
      <div class="list-wrap">
        <div class="list-row"><strong>Username</strong><span>${user.account_username || 'N/A'}</span></div>
        <div class="list-row"><strong>Email</strong><span>${user.account_email || 'N/A'}</span></div>
        <div class="list-row"><strong>Status</strong><span>${user.is_logged || 'NO'}</span></div>
      </div>
    `;
  } catch (error) {
    element.innerHTML = `<div class="empty-state">${error.message}</div>`;
  }
}

async function loadOrders() {
  const element = document.getElementById('orders-list');
  if (!element) return;

  try {
    const response = await fetchJson('/api/orders');
    const orders = response.orders || [];

    if (!orders.length) {
      element.innerHTML = '<div class="empty-state">No orders yet.</div>';
      return;
    }

    element.innerHTML = orders.map((order) => `
      <div class="list-row">
        <div>
          <strong>${order.order_product_name}</strong><br>
          <small>${new Date(order.order_date).toLocaleString()}</small>
        </div>
        <div>
          <span>₱${Number(order.order_total_price || 0).toFixed(2)}</span>
        </div>
      </div>
    `).join('');
  } catch (error) {
    element.innerHTML = `<div class="empty-state">${error.message}</div>`;
  }
}

function attachAuthForms() {
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const form = new FormData(loginForm);
      const payload = {
        username: form.get('username') || form.get('email'),
        password: form.get('password'),
      };

      try {
        await fetchJson('/api/auth/login', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        window.location.href = '/';
      } catch (error) {
        const target = document.getElementById('login-message');
        if (target) target.textContent = error.message;
      }
    });
  }

  const registerForm = document.getElementById('register-form');
  if (registerForm) {
    registerForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const form = new FormData(registerForm);
      const payload = {
        username: form.get('username'),
        email: form.get('email'),
        password: form.get('password'),
      };

      try {
        await fetchJson('/api/auth/register', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        window.location.href = '/';
      } catch (error) {
        const target = document.getElementById('register-message');
        if (target) target.textContent = error.message;
      }
    });
  }

  const logoutButton = document.getElementById('logout-button');
  if (logoutButton) {
    logoutButton.addEventListener('click', async () => {
      await fetchJson('/api/auth/logout', { method: 'POST' });
      window.location.href = '/login';
    });
  }
}

function pageReady() {
  renderMenu();
  fetchJson('/api/products/featured')
    .then((data) => renderProductGrid(data.items || []))
    .catch((error) => {
      const container = document.getElementById('featured-products');
      if (container) container.innerHTML = `<div class="empty-state">${error.message}</div>`;
    });

  loadProfile();
  loadOrders();
  attachAuthForms();
}

document.addEventListener('DOMContentLoaded', pageReady);

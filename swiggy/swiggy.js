// swiggy/swiggy.js

let currentCategory = 'All';

// Render menu items
function renderMenu(items) {
  const grid = document.getElementById('menuGrid');
  if (items.length === 0) {
    grid.innerHTML = '<p style="padding:20px;color:#93959f;grid-column:1/-1">No items found.</p>';
    return;
  }
  grid.innerHTML = items.map(item => `
    <div class="menu-card">
      <div class="menu-emoji">${item.emoji}</div>
      <div class="menu-name">${item.name}</div>
      <div class="menu-restaurant">${item.restaurant}</div>
      <div class="menu-bottom">
        <div class="menu-price">₹${item.price}</div>
        <div class="menu-time">⏱ ${item.time}</div>
      </div>
      <button class="add-btn" onclick="orderItem(${item.id})">ADD +</button>
    </div>
  `).join('');
}

// Render orders
function renderOrders() {
  const list = document.getElementById('ordersList');
  const title = document.getElementById('ordersTitle');

  if (store.orders.length === 0) {
    title.style.display = 'none';
    list.innerHTML = '';
    return;
  }

  title.style.display = 'block';
  list.innerHTML = store.orders.map(order => `
    <div class="order-card">
      <div class="order-top">
        <div class="order-name">${order.emoji || '🍽'} ${order.item}</div>
        <div class="order-status">✅ ${order.status}</div>
      </div>
      <div class="order-restaurant">📍 ${order.restaurant}</div>
      <div>
        <span class="order-price">₹${order.price}</span>
        <span class="order-time">${order.time}</span>
      </div>
      ${order.instructions ? `<div style="font-size:12px;color:#93959f;margin-top:6px">📝 ${order.instructions}</div>` : ''}
    </div>
  `).join('');
}

// Order item by clicking ADD button
function orderItem(itemId) {
  const item = store.menu.find(m => m.id === itemId);
  if (!item) return;

  const result = bridge.orderFood({ itemName: item.name, quantity: 1 });

  if (result.success) {
    document.getElementById('popupMsg').textContent = result.message;
    document.getElementById('popup').classList.add('show');
    renderOrders();
  }
}

// Filter by category
function filterCategory(category) {
  currentCategory = category;

  document.querySelectorAll('.cat-btn').forEach(btn => {
    btn.classList.toggle('active', btn.textContent.includes(category) || (category === 'All' && btn.textContent === 'All'));
  });

  applyFilters();
}

// Filter by search text
function filterMenu() {
  applyFilters();
}

// Apply both filters together
function applyFilters() {
  const search = document.getElementById('searchInput').value.toLowerCase();
  let items = store.menu;

  if (currentCategory !== 'All') {
    items = items.filter(item => item.category === currentCategory);
  }

  if (search) {
    items = items.filter(item =>
      item.name.toLowerCase().includes(search) ||
      item.restaurant.toLowerCase().includes(search)
    );
  }

  renderMenu(items);
}

// Close popup
function closePopup() {
  document.getElementById('popup').classList.remove('show');
}

// Auto refresh when AI places order from assistant page
window.addEventListener('storage', function(e) {
  if (e.key === 'swiggy_refresh') {
    store.load();
    renderOrders();
    document.getElementById('popupMsg').textContent = 'Your AI Assistant just placed an order!';
    document.getElementById('popup').classList.add('show');
  }
});

// Start
renderMenu(store.menu);
renderOrders();
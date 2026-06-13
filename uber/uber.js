// uber/uber.js

const rideTypes = [
  { type: "Auto", emoji: "🛺", desc: "Affordable auto rickshaw", price: 80 },
  { type: "Mini", emoji: "🚗", desc: "Compact car, upto 4 people", price: 120 },
  { type: "Sedan", emoji: "🚙", desc: "Comfortable sedan", price: 180 },
  { type: "SUV", emoji: "🚐", desc: "Spacious SUV, upto 6 people", price: 250 }
];

let selectedRide = rideTypes[0];

// Render quick location buttons
function renderQuickLocations() {
  const grid = document.getElementById('quickGrid');
  grid.innerHTML = store.locations.map(loc => `
    <button class="quick-btn" onclick="setDestination('${loc}')">
      📍 ${loc}
    </button>
  `).join('');
}

// Set destination when quick button clicked
function setDestination(location) {
  document.getElementById('toInput').value = location;
}

// Render ride type options
function renderRideTypes() {
  const list = document.getElementById('rideList');
  list.innerHTML = rideTypes.map(ride => `
    <div class="ride-card ${ride.type === selectedRide.type ? 'selected' : ''}"
         onclick="selectRide('${ride.type}')">
      <div class="ride-emoji">${ride.emoji}</div>
      <div class="ride-info">
        <div class="ride-name">${ride.type}</div>
        <div class="ride-desc">${ride.desc}</div>
      </div>
      <div class="ride-price">₹${ride.price}</div>
    </div>
  `).join('');
}

// Select a ride type
function selectRide(type) {
  selectedRide = rideTypes.find(r => r.type === type);
  renderRideTypes();
}

// Book ride when button clicked
function bookRideNow() {
  const from = document.getElementById('fromInput').value || 'Home';
  const to = document.getElementById('toInput').value;

  if (!to) {
    alert('Please enter a destination!');
    return;
  }

  const result = bridge.bookRide({
    from: from,
    to: to,
    rideType: selectedRide.type
  });

  if (result.success) {
    document.getElementById('popupMsg').textContent = result.message;
    document.getElementById('popup').classList.add('show');
    showActiveRide(result.ride);
    renderRideHistory();
  }
}

// Show active ride card
function showActiveRide(ride) {
  const activeRide = document.getElementById('activeRide');
  const driverCard = document.getElementById('driverCard');

  driverCard.innerHTML = `
    <div class="driver-name">👨 ${ride.driver}</div>
    <div class="driver-vehicle">🚗 ${ride.vehicle}</div>
    <div class="driver-rating">⭐ ${ride.rating} rating</div>
    <div class="ride-route">
      <div>🟢 From: <strong>${ride.from}</strong></div>
      <div>⚫ To: <strong>${ride.to}</strong></div>
      <div>💰 Fare: <strong>₹${ride.price}</strong></div>
    </div>
  `;

  activeRide.style.display = 'block';
}

// Render ride history
function renderRideHistory() {
  const list = document.getElementById('ridesList');
  const title = document.getElementById('historyTitle');

  if (store.rides.length === 0) {
    title.style.display = 'none';
    list.innerHTML = '';
    return;
  }

  title.style.display = 'block';
  list.innerHTML = store.rides.map(ride => `
    <div class="history-card">
      <div class="history-top">
        <div class="history-route">${ride.from} → ${ride.to}</div>
        <div class="history-status">✅ ${ride.status}</div>
      </div>
      <div class="history-detail">🚗 ${ride.rideType} • 👨 ${ride.driver}</div>
      <div class="history-detail">🚘 ${ride.vehicle} • ⭐ ${ride.rating}</div>
      <div>
        <span class="history-price">₹${ride.price}</span>
        <span class="history-time">${ride.time}</span>
      </div>
    </div>
  `).join('');
}

// Close popup
function closePopup() {
  document.getElementById('popup').classList.remove('show');
}

// Auto refresh when AI books ride from assistant page
window.addEventListener('storage', function(e) {
  if (e.key === 'uber_refresh') {
    store.load();
    renderRideHistory();
    const latestRide = store.rides[0];
    if (latestRide) {
      showActiveRide(latestRide);
      document.getElementById('popupMsg').textContent =
        `Your AI Assistant booked a ${latestRide.rideType} from ${latestRide.from} to ${latestRide.to}!`;
      document.getElementById('popup').classList.add('show');
    }
  }
});

// Start
renderQuickLocations();
renderRideTypes();
renderRideHistory();
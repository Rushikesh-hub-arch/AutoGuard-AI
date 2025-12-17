// frontend/js/dashboard.js
// Renders the fleet cards on index.html using window.AUTOGUARD_DATA

function healthClass(score) {
  if (score >= 80) return 'green';
  if (score >= 60) return 'yellow';
  return 'red';
}

function createCard(vehicle) {
  const div = document.createElement('div');
  div.className = 'card';
  // calculate live risk from factors (in case vehicle object changes)
  const risk = calcRiskPercent(vehicle.engine_temp, vehicle.harsh_braking, vehicle.vibration);
  div.innerHTML = `
    <div><strong>${vehicle.name}</strong></div>
    <div class="small">ID: ${vehicle.id}</div>
    <div style="margin-top:8px;">
      <span class="pill ${healthClass(vehicle.health_score)}">Health: ${vehicle.health_score}</span>
    </div>
    <div style="margin-top:8px;"><strong>Risk: ${risk}%</strong></div>
    <div class="small">Status: ${vehicle.status}</div>
  `;
  div.addEventListener('click', () => {
    // navigate to vehicle.html with id param
    window.location.href = `vehicle.html?id=${encodeURIComponent(vehicle.id)}`;
  });
  return div;
}

let currentVehicles = [];
function filterStatus(status) {
  const container = document.getElementById('vehicleContainer');
  container.innerHTML = '';

  const list = status === 'All'
    ? currentVehicles
    : currentVehicles.filter(v => v.status === status);

  list.forEach(v => container.appendChild(createCard(v)));
}

function renderSummary(vehicles) {
  const summary = document.getElementById('summary');
  if (!summary) return; // safety

  const total = vehicles.length;
  const critical = vehicles.filter(v => v.status === 'Critical').length;
  const warning = vehicles.filter(v => v.status === 'Warning').length;
  const normal = vehicles.filter(v => v.status === 'Normal').length;

  summary.innerHTML = `
    <div class="summary-box"><strong>${total}</strong><div>Total</div></div>
    <div class="summary-box"><strong>${critical}</strong><div>Critical</div></div>
    <div class="summary-box"><strong>${warning}</strong><div>Warning</div></div>
    <div class="summary-box"><strong>${normal}</strong><div>Normal</div></div>
  `;
}
function renderFleet() {
  const container = document.getElementById('vehicleContainer');
  container.innerHTML = '';

  const vehicles = (window.AUTOGUARD_DATA && window.AUTOGUARD_DATA.vehicles) || [];

  renderSummary(vehicles); // 🔥 THIS LINE IS WHY IT WORKS

  vehicles.forEach(v => {
    container.appendChild(createCard(v));
  });
}


document.addEventListener('DOMContentLoaded', renderFleet);

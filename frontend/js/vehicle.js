// frontend/js/vehicle.js
// Reads ?id= and renders vehicle detail, explainability, slider for counterfactual.

function getQueryParam(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

function findVehicleById(id) {
  const list = (window.AUTOGUARD_DATA && window.AUTOGUARD_DATA.vehicles) || [];
  return list.find(v => v.id === id) || null;
}

function showVehicle(v) {
  document.getElementById('vehName').textContent = `${v.name} (${v.id})`;
  const risk = calcRiskPercent(v.engine_temp, v.harsh_braking, v.vibration);
  document.getElementById('riskValue').textContent = `Risk: ${risk}%`;
  document.getElementById('vehStatus').textContent = `Status: ${v.status} | Health: ${v.health_score}`;

  // Top causes (simple heuristic: sort by contribution)
  const contributions = [
    { key: 'Engine temperature', value: v.engine_temp, contrib: Math.round(0.4 * v.engine_temp * 100) / 100 },
    { key: 'Harsh braking', value: v.harsh_braking, contrib: Math.round(0.35 * v.harsh_braking * 100) / 100 },
    { key: 'Vibration', value: v.vibration, contrib: Math.round(0.25 * v.vibration * 100) / 100 }
  ].sort((a,b) => b.contrib - a.contrib);

  const topUl = document.getElementById('topCauses');
  topUl.innerHTML = '';
  contributions.forEach(c => {
    const li = document.createElement('li');
    li.textContent = `${c.key} ↑  (value: ${c.value})`;
    topUl.appendChild(li);
  });

  // contribution table
  const tbody = document.getElementById('contribTable');
  tbody.innerHTML = '';
  const weights = { engine: 0.4, harsh: 0.35, vib: 0.25 };
  const rows = [
    ['Engine temperature', v.engine_temp, weights.engine, Math.round(weights.engine * v.engine_temp * 100) / 100],
    ['Harsh braking', v.harsh_braking, weights.harsh, Math.round(weights.harsh * v.harsh_braking * 100) / 100],
    ['Vibration', v.vibration, weights.vib, Math.round(weights.vib * v.vibration * 100) / 100]
  ];
  rows.forEach(r => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td><td>${r[3]}</td>`;
    tbody.appendChild(tr);
  });

  // slider and projected risk
  const slider = document.getElementById('harshSlider');
  const harshPercent = document.getElementById('harshPercent');
  const projectedRisk = document.getElementById('projectedRisk');
  const suggestion = document.getElementById('fixSuggestion');

  function updateProjected(pct) {
    harshPercent.textContent = pct;
    const cf = applyCounterfactual(v, pct);
    projectedRisk.textContent = `${cf.newRisk}%`;
    // Simple suggestion: if harsh contribution > 25% of risk, suggest reduce by 40%
    const harshContribution = Math.round(0.35 * v.harsh_braking * 100) / 100;
    if (harshContribution > 25) {
      suggestion.innerHTML = `<strong>Suggestion:</strong> Reduce harsh braking by 40% → projected risk drops to ${applyCounterfactual(v,40).newRisk}%`;
    } else {
      suggestion.innerHTML = `<strong>Suggestion:</strong> Reduce top contributing factor to lower risk.`;
    }
  }

  slider.addEventListener('input', e => updateProjected(Number(e.target.value)));
  updateProjected(0);

  // booking UI hook
  const bookBtn = document.getElementById('bookBtn');
  const bookResult = document.getElementById('bookResult');
  bookBtn.addEventListener('click', async () => {
    bookResult.textContent = 'Booking...';
    try {
      const resp = await booking.bookService(v.id); // booking.js handles simulation
      bookResult.textContent = `Status: ${resp.status} | Center: ${resp.center} | ${resp.datetime}`;
    } catch (err) {
      bookResult.textContent = 'Booking failed';
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const id = getQueryParam('id');
  if (!id) {
    document.body.innerHTML = '<p style="padding:20px">No vehicle selected. Return to <a href="index.html">Dashboard</a>.</p>';
    return;
  }
  const vehicle = findVehicleById(id);
  if (!vehicle) {
    document.body.innerHTML = '<p style="padding:20px">Vehicle not found. Return to <a href="index.html">Dashboard</a>.</p>';
    return;
  }
  showVehicle(vehicle);
});

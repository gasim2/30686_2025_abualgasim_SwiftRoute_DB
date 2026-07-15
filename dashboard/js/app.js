const API = '/api';
let currentPage = 'dashboard';
let editingId = null;
let charts = {};

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  setCurrentDate();
  setupNav();
  setupKeyboard();
  setupSearch();
  loadDashboard();
  startAutoRetry();

  document.addEventListener('click', e => {
    const searchBar = document.getElementById('packageSearch');
    const toggle = document.getElementById('searchToggle');
    if (searchBar && searchBar.classList.contains('expanded') &&
        !searchBar.contains(e.target) && !toggle?.contains(e.target)) {
      collapseSearch();
    }
  });
});

let autoRetryTimer = null;
function startAutoRetry() {
  if (autoRetryTimer) return;
  autoRetryTimer = setInterval(() => {
    if (serverOnline) return;
    fetch(API + '/customers', { method: 'GET', signal: AbortSignal.timeout(3000) })
      .then(r => { if (r.ok) { showServerBanner(false); refreshCurrentSection(); showNotification('Server is back online!', 'success'); }})
      .catch(() => {});
  }, 10000);
}

function setCurrentDate() {
  const el = document.getElementById('currentDate');
  if (el) el.textContent = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

// ===== KEYBOARD =====
function setupKeyboard() {
  document.addEventListener('keydown', e => {
    const overlay = document.getElementById('modalOverlay');
    const modalOpen = !overlay.classList.contains('hidden');

    if (e.key === 'Escape') {
      if (modalOpen) {
        closeModal();
        e.preventDefault();
      }
      hideNotification();
      const searchBar = document.getElementById('packageSearch');
      if (searchBar && searchBar.classList.contains('expanded')) {
        collapseSearch();
      } else {
        clearSearch();
      }
    }

    if (!modalOpen) return;

    const active = document.activeElement;
    const modalBody = document.getElementById('modalBody');
    if (!modalBody) return;

    const fields = Array.from(modalBody.querySelectorAll('input, select, textarea'));
    const currentIndex = fields.indexOf(active);

    // Arrow Down: move to next field
    if (e.key === 'ArrowDown' && currentIndex >= 0 && currentIndex < fields.length - 1) {
      e.preventDefault();
      fields[currentIndex + 1].focus();
    }

    // Arrow Up: move to previous field
    if (e.key === 'ArrowUp' && currentIndex > 0) {
      e.preventDefault();
      fields[currentIndex - 1].focus();
    }

    // Enter: save form (unless focused on a button or a select dropdown)
    if (e.key === 'Enter') {
      if (active && active.tagName === 'BUTTON') return;
      if (active && active.tagName === 'SELECT') return;
      e.preventDefault();
      document.getElementById('btnSave').click();
    }
  });
}

// ===== NAVIGATION =====
function setupNav() {
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', e => {
      e.preventDefault();
      document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
      item.classList.add('active');
      showPage(item.dataset.page);
    });
  });
}

function showPage(page) {
  currentPage = page;
  document.getElementById('page-dashboard').classList.remove('active');
  document.getElementById('page-table').classList.remove('active');

  const titleEl = document.getElementById('pageTitle');
  const subtitleEl = document.getElementById('pageSubtitle');
  const searchBar = document.getElementById('packageSearch');
  const searchToggle = document.getElementById('searchToggle');

  if (page === 'dashboard') {
    document.getElementById('page-dashboard').classList.add('active');
    titleEl.textContent = 'Delivery Dashboard';
    subtitleEl.textContent = 'Swift Route Courier Logistics & Package Delivery System';
    if (searchBar) {
      searchBar.classList.remove('expanded');
      searchBar.style.display = 'none';
    }
    if (searchToggle) searchToggle.style.display = 'flex';
    loadDashboard();
  } else {
    document.getElementById('page-table').classList.add('active');
    if (searchBar) {
      searchBar.classList.remove('expanded');
      searchBar.style.display = 'none';
    }
    if (searchToggle) searchToggle.style.display = 'none';
    clearSearch();
    loadTablePage(page);
  }
}

// ===== API =====
let serverOnline = false;

function showServerBanner(show) {
  const b = document.getElementById('serverBanner');
  if (b) b.style.display = show ? 'flex' : 'none';
  serverOnline = !show;
}

function retryServer() {
  apiFetch('/customers').then(() => {
    showServerBanner(false);
    showNotification('Server connected!', 'success');
    refreshCurrentSection();
  }).catch(() => {
    showNotification('Server still offline. Start node server.js and try again.', 'error');
  });
}

async function apiFetch(path, opts = {}) {
  try {
    const fetchOpts = {
      headers: { 'Content-Type': 'application/json' },
      ...opts,
    };
    if (opts.body) fetchOpts.body = JSON.stringify(opts.body);

    const resp = await fetch(API + path, fetchOpts);
    if (!resp.ok) {
      const errText = await resp.text().catch(() => 'Request failed');
      throw new Error(errText);
    }
    showServerBanner(false);
    return await resp.json();
  } catch (err) {
    showServerBanner(true);
    throw err;
  }
}

function showNotification(msg, type = 'success') {
  const n = document.getElementById('notification');
  const t = document.getElementById('notifText');
  const icon = n.querySelector('i');
  n.className = 'notification ' + type;
  icon.className = type === 'error' ? 'fas fa-exclamation-circle' : 'fas fa-check-circle';
  t.textContent = msg;
  n.classList.remove('hidden');
  clearTimeout(n._timer);
  n._timer = setTimeout(() => { n.classList.add('hidden'); }, 4000);
}

function hideNotification() {
  document.getElementById('notification').classList.add('hidden');
}

// ===== PACKAGE SEARCH =====
let searchTimer = null;
let allPackages = null;

function setupSearch() {
  const input = document.getElementById('packageSearchInput');
  if (!input) return;
  input.addEventListener('input', () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => searchPackage(input.value.trim()), 300);
  });
}

async function searchPackage(query) {
  const results = document.getElementById('searchResults');
  const tbody = document.getElementById('searchResultsBody');
  const empty = document.getElementById('searchResultsEmpty');
  const title = document.getElementById('searchResultsTitle');

  if (!query) { results.style.display = 'none'; return; }

  try {
    if (!allPackages) {
      allPackages = await apiFetch('/deliveries');
    }

    const q = query.toLowerCase();
    const matches = allPackages.filter(d => {
      const pkgCode = String(d.package_id?.package_code || '');
      const desc = String(d.package_id?.description || '');
      const status = String(d.package_id?.status || '');
      const sender = String(d.package_id?.sender_id?.full_name || '');
      const receiver = String(d.package_id?.receiver_id?.full_name || '');
      const driver = String(d.driver_id?.full_name || '');
      const plate = String(d.vehicle_id?.plate_no || '');
      const route = String(d.route_id?.route_name || '');
      return pkgCode.toLowerCase().includes(q) ||
             desc.toLowerCase().includes(q) ||
             status.toLowerCase().includes(q) ||
             sender.toLowerCase().includes(q) ||
             receiver.toLowerCase().includes(q) ||
             driver.toLowerCase().includes(q) ||
             plate.toLowerCase().includes(q) ||
             route.toLowerCase().includes(q);
    });

    results.style.display = 'block';
    title.textContent = 'Search: "' + query + '"';

    if (!matches.length) {
      tbody.innerHTML = '';
      empty.style.display = 'block';
      empty.textContent = 'No package found for "' + query + '"';
      return;
    }

    empty.style.display = 'none';
    tbody.innerHTML = matches.map(d => {
      const pkg = d.package_id || {};
      const fee = d.payment || 0;
      return '<tr>' +
        '<td>' + (pkg.package_code || '-') + '</td>' +
        '<td>' + (pkg.sender_id?.full_name || '-') + '</td>' +
        '<td>' + (pkg.receiver_id?.full_name || '-') + '</td>' +
        '<td>' + (pkg.weight_kg || '-') + ' kg</td>' +
        '<td>' + (pkg.description || '-') + '</td>' +
        '<td><span class="status-badge ' + String(pkg.status || '').toLowerCase().replace(/\s/g, '') + '">' + (pkg.status || '-') + '</span></td>' +
        '<td>' + (d.driver_id?.full_name || '-') + '</td>' +
        '<td>' + (d.vehicle_id?.plate_no || '-') + '</td>' +
        '<td>' + (d.route_id?.route_name || '-') + '</td>' +
        '<td>' + fee.toLocaleString() + '</td>' +
        '</tr>';
    }).join('');
  } catch (err) {
    results.style.display = 'block';
    tbody.innerHTML = '';
    empty.style.display = 'block';
    empty.textContent = 'Error searching. Make sure the server is running.';
  }
}

function clearSearch() {
  const input = document.getElementById('packageSearchInput');
  if (input) input.value = '';
  document.getElementById('searchResults').style.display = 'none';
  allPackages = null;
}

function toggleSearch() {
  const searchBar = document.getElementById('packageSearch');
  const input = document.getElementById('packageSearchInput');
  if (!searchBar) return;

  if (searchBar.classList.contains('expanded')) {
    collapseSearch();
  } else {
    searchBar.style.display = 'flex';
    requestAnimationFrame(() => {
      searchBar.classList.add('expanded');
      setTimeout(() => { if (input) input.focus(); }, 300);
    });
  }
}

function collapseSearch() {
  const searchBar = document.getElementById('packageSearch');
  const input = document.getElementById('packageSearchInput');
  if (!searchBar) return;

  if (input && input.value.trim()) {
    clearSearch();
  }
  searchBar.classList.remove('expanded');
  setTimeout(() => {
    if (!searchBar.classList.contains('expanded')) {
      searchBar.style.display = 'none';
    }
  }, 300);
}

// ===== DASHBOARD =====
async function loadDashboard() {
  allPackages = null;
  try {
    const d = await apiFetch('/dashboard');

    setText('totalDeliveries', d.totalDeliveries);
    setText('completedDeliveries', d.completedDeliveries);
    setText('pendingDeliveries', d.pendingDeliveries);
    setText('totalRevenue', (d.totalRevenue || 0).toLocaleString() + ' RWF');
    setText('avgDeliveryTime', d.avgDeliveryTime + ' days');
    setText('totalDeliveriesChange', d.driverCount + ' drivers, ' + d.vehicleCount + ' vehicles');
    setText('completionRate', d.completionRate + '% completion rate');
    setText('pendingRate', d.pendingRate + '% pending');

    renderDeliveryTrendChart(d.trend);
    renderPaymentStatusChart(d.paymentStatus);
    renderDriverPerformanceChart(d.driverPerformance);
    renderRevenueByRouteChart(d.routeRevenue);
    renderVehicleUtilChart(d.vehicleStats);
    renderRecentDeliveries(d.recentDeliveries);
    renderTopDrivers(d.driverPerformance);
  } catch (err) {
    console.error('Dashboard load error:', err);
    showNotification('Cannot connect to server. Start the backend with: node server.js', 'error');
  }
}

function setText(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

function renderDeliveryTrendChart(trend) {
  const ctx = document.getElementById('deliveryTrendChart');
  if (!ctx) return;
  if (charts.deliveryTrend) charts.deliveryTrend.destroy();
  charts.deliveryTrend = new Chart(ctx, {
    type: 'line',
    data: {
      labels: trend.labels.map(l => l.length > 5 ? l.substring(5) : l),
      datasets: [{ label: 'Deliveries', data: trend.data, borderColor: '#3b82f6', backgroundColor: 'rgba(59,130,246,0.1)', fill: true, tension: 0.4, pointRadius: 4, pointHoverRadius: 6 }]
    },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } } }
  });
}

function renderPaymentStatusChart(data) {
  const ctx = document.getElementById('paymentStatusChart');
  if (!ctx) return;
  if (charts.paymentStatus) charts.paymentStatus.destroy();
  charts.paymentStatus = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Paid', 'Unpaid'],
      datasets: [{ data: [data.paid, data.unpaid], backgroundColor: ['#22c55e', '#ef4444'], borderWidth: 0 }]
    },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } }, cutout: '60%' }
  });
}

function renderDriverPerformanceChart(data) {
  const ctx = document.getElementById('driverPerformanceChart');
  if (!ctx) return;
  if (charts.driverPerf) charts.driverPerf.destroy();
  const labels = Object.keys(data);
  charts.driverPerf = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        { label: 'Total', data: labels.map(l => data[l].total), backgroundColor: 'rgba(59,130,246,0.6)', borderRadius: 6 },
        { label: 'Completed', data: labels.map(l => data[l].completed), backgroundColor: 'rgba(34,197,94,0.6)', borderRadius: 6 }
      ]
    },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } }, scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } } }
  });
}

function renderRevenueByRouteChart(data) {
  const ctx = document.getElementById('revenueByRouteChart');
  if (!ctx) return;
  if (charts.routeRev) charts.routeRev.destroy();
  const labels = Object.keys(data);
  const colors = ['#3b82f6', '#a78bfa', '#fb923c', '#4ade80', '#f87171', '#06b6d4'];
  charts.routeRev = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{ label: 'Revenue (RWF)', data: labels.map(l => data[l]), backgroundColor: labels.map((_, i) => colors[i % colors.length]), borderRadius: 6 }]
    },
    options: { responsive: true, maintainAspectRatio: false, indexAxis: 'y', plugins: { legend: { display: false } }, scales: { x: { beginAtZero: true } } }
  });
}

function renderVehicleUtilChart(data) {
  const ctx = document.getElementById('vehicleUtilChart');
  if (!ctx) return;
  if (charts.vehicleUtil) charts.vehicleUtil.destroy();
  const labels = Object.keys(data);
  const colors = ['#3b82f6', '#22c55e', '#a78bfa', '#fb923c', '#f87171'];
  charts.vehicleUtil = new Chart(ctx, {
    type: 'pie',
    data: {
      labels,
      datasets: [{ data: labels.map(l => data[l]), backgroundColor: labels.map((_, i) => colors[i % colors.length]), borderWidth: 0 }]
    },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }
  });
}

function renderRecentDeliveries(items) {
  const tbody = document.getElementById('recentDeliveries');
  const empty = document.getElementById('recentDeliveriesEmpty');
  if (!items || !items.length) { tbody.innerHTML = ''; empty.style.display = 'block'; return; }
  empty.style.display = 'none';
  tbody.innerHTML = items.map(d => `<tr>
    <td>${(d._id || '').substring(0, 8)}</td>
    <td>${d.package_desc || (d.package_weight ? d.package_weight + ' kg' : '-')}</td>
    <td>${d.driver_name || '-'}</td>
    <td>${d.plate_no || '-'}</td>
    <td>${d.route_name || '-'}</td>
    <td><span class="status-badge ${(d.status || '').toLowerCase().replace(/\s/g, '')}">${d.status || '-'}</span></td>
    <td>${(d.fee || 0).toLocaleString()}</td>
  </tr>`).join('');
}

function renderTopDrivers(data) {
  const tbody = document.getElementById('topDrivers');
  const empty = document.getElementById('topDriversEmpty');
  const entries = Object.entries(data || {});
  if (!entries.length) { tbody.innerHTML = ''; empty.style.display = 'block'; return; }
  empty.style.display = 'none';
  tbody.innerHTML = entries.map(([name, s]) => `<tr>
    <td>${name}</td>
    <td>${s.total}</td>
    <td>${s.total > 0 ? ((s.completed / s.total) * 100).toFixed(0) : 0}%</td>
    <td>${(s.revenue || 0).toLocaleString()} RWF</td>
  </tr>`).join('');
}

// ===== TABLE PAGES =====
const TABLE_CONFIG = {
  customers:  { title: 'Customers',  icon: 'fa-users',         endpoint: '/customers/with-roles',  writeEndpoint: '/customers',  columns: ['full_name', 'phone', 'email', 'address', 'order_role', 'created_date'] },
  drivers:    { title: 'Drivers',    icon: 'fa-id-card',       endpoint: '/drivers',    columns: ['full_name', 'phone', 'license_no', 'plate_no', 'is_available'] },
  vehicles:   { title: 'Vehicles',   icon: 'fa-car',           endpoint: '/vehicles',   columns: ['plate_no', 'vehicle_type', 'capacity_kg', 'status'] },
  routes:     { title: 'Routes',     icon: 'fa-route',         endpoint: '/routes/with-assignments',  writeEndpoint: '/routes',  columns: ['route_name', 'origin', 'destination', 'est_distance_km', 'plate_no', 'vehicle_type', 'driver_name', 'license_no'] },
  packages:   { title: 'Packages',   icon: 'fa-box',           endpoint: '/packages',   columns: ['package_code', 'sender_id', 'receiver_id', 'weight_kg', 'description', 'status'] },
  deliveries: { title: 'Deliveries', icon: 'fa-truck',         endpoint: '/deliveries', columns: ['package_id', 'driver_id', 'vehicle_id', 'route_id', 'delivery_status'] },
  payments:   { title: 'Payments',   icon: 'fa-credit-card',   endpoint: '/payments',   columns: ['package_id', 'amount', 'payment_method', 'is_paid', 'payment_date'] },
  holidays:   { title: 'Holidays',   icon: 'fa-calendar-day',  endpoint: '/holidays',   columns: ['holiday_name', 'holiday_date'] },
  audit:      { title: 'Audit Log',  icon: 'fa-clipboard-list',endpoint: '/audit',      columns: ['table_name', 'operation', 'old_value', 'new_value', 'changed_by', 'changed_date'] }
};

const FORM_FIELDS = {
  customers: [
    { name: 'full_name', label: 'Full Name', type: 'text', required: true },
    { name: 'phone', label: 'Phone', type: 'text', required: true },
    { name: 'email', label: 'Email', type: 'email' },
    { name: 'address', label: 'Address', type: 'text' },
    { name: 'order_role', label: 'Order Role', type: 'select', options: ['Sender', 'Receiver'], required: true }
  ],
  drivers: [
    { name: 'full_name', label: 'Full Name', type: 'text', required: true },
    { name: 'phone', label: 'Phone', type: 'text', required: true },
    { name: 'license_no', label: 'License No', type: 'text', required: true },
    { name: 'plate_no', label: 'Plate Number', type: 'ref', refEndpoint: '/vehicles', refLabel: 'plate_no' },
    { name: 'is_available', label: 'Available', type: 'select', options: ['true', 'false'] }
  ],
  vehicles: [
    { name: 'plate_no', label: 'Plate No', type: 'text', required: true },
    { name: 'vehicle_type', label: 'Vehicle Type', type: 'select', options: ['Motorcycle', 'Van', 'Truck', 'Car'] },
    { name: 'capacity_kg', label: 'Capacity (kg)', type: 'number', required: true },
    { name: 'status', label: 'Status', type: 'select', options: ['Active', 'Maintenance', 'Retired'] }
  ],
  routes: [
    { name: 'route_name', label: 'Route Name', type: 'text', required: true },
    { name: 'origin', label: 'Origin', type: 'text', required: true },
    { name: 'destination', label: 'Destination', type: 'text', required: true },
    { name: 'est_distance_km', label: 'Distance (km)', type: 'number' }
  ],
  packages: [
    { name: 'sender_id', label: 'Sender', type: 'ref', refEndpoint: '/customers', refLabel: 'full_name' },
    { name: 'receiver_id', label: 'Receiver', type: 'ref', refEndpoint: '/customers', refLabel: 'full_name' },
    { name: 'weight_kg', label: 'Weight (kg)', type: 'number', required: true },
    { name: 'description', label: 'Description', type: 'text' },
    { name: 'status', label: 'Status', type: 'select', options: ['Pending', 'Assigned', 'In Transit', 'Delivered', 'Returned'] }
  ],
  deliveries: [
    { name: 'package_id', label: 'Package', type: 'ref', refEndpoint: '/packages', refLabel: 'package_code' },
    { name: 'driver_id', label: 'Driver', type: 'ref', refEndpoint: '/drivers', refLabel: 'full_name' },
    { name: 'vehicle_id', label: 'Vehicle', type: 'ref', refEndpoint: '/vehicles', refLabel: 'plate_no' },
    { name: 'origin', label: 'Origin', type: 'text', required: true },
    { name: 'destination', label: 'Destination', type: 'text', required: true },
    { name: 'delivery_status', label: 'Status', type: 'select', options: ['Assigned', 'Picked Up', 'In Transit', 'Delivered', 'Failed'] }
  ],
  payments: [
    { name: 'package_id', label: 'Package', type: 'ref', refEndpoint: '/packages', refLabel: 'package_code' },
    { name: 'amount', label: 'Amount (RWF)', type: 'number', required: true },
    { name: 'payment_method', label: 'Method', type: 'select', options: ['Cash', 'Mobile Money', 'Card', 'Bank Transfer'] },
    { name: 'is_paid', label: 'Paid', type: 'select', options: ['true', 'false'] }
  ],
  holidays: [
    { name: 'holiday_name', label: 'Holiday Name', type: 'text', required: true },
    { name: 'holiday_date', label: 'Date', type: 'date', required: true }
  ],
  audit: [
    { name: 'table_name', label: 'Table', type: 'text' },
    { name: 'operation', label: 'Operation', type: 'text' },
    { name: 'old_value', label: 'Old Value', type: 'text' },
    { name: 'new_value', label: 'New Value', type: 'text' }
  ]
};

async function loadTablePage(page) {
  const config = TABLE_CONFIG[page];
  if (!config) return;

  document.getElementById('pageTitle').textContent = config.title;
  document.getElementById('pageSubtitle').textContent = 'Manage ' + config.title.toLowerCase();
  document.getElementById('tablePageTitle').innerHTML = '<i class="fas ' + config.icon + '"></i> ' + config.title;

  const thead = document.getElementById('dynamicTableHead');
  const tbody = document.getElementById('dynamicTableBody');
  const empty = document.getElementById('dynamicTableEmpty');

  thead.innerHTML = '<tr>' + config.columns.map(c => '<th scope="col">' + c.replace(/_/g, ' ').toUpperCase() + '</th>').join('') + '<th scope="col">Actions</th></tr>';

  try {
    const data = await apiFetch(config.endpoint);
    if (!data || !data.length) { tbody.innerHTML = ''; empty.style.display = 'block'; return; }
    empty.style.display = 'none';

    tbody.innerHTML = data.map(item => {
      const cells = config.columns.map(c => {
        let val = item[c];
        if (val === null || val === undefined) return '<td>-</td>';
        if (typeof val === 'object') {
          if (val.package_code) val = val.package_code;
          else if (val.full_name) val = val.full_name;
          else if (val.plate_no) val = val.plate_no;
          else if (val.route_name) val = val.route_name;
          else if (val.description) val = val.description;
          else if (val._id) val = val._id.substring(0, 8);
          else return '<td>-</td>';
        }
        if (typeof val === 'boolean') val = val ? 'Yes' : 'No';
        if (c.includes('date') || c === 'created_date') {
          try { val = new Date(val).toLocaleDateString(); } catch(e) { val = String(val); }
        }
        if (c === 'status' || c === 'delivery_status') {
          const cls = String(val).toLowerCase().replace(/\s/g, '');
          return '<td><span class="status-badge ' + cls + '">' + val + '</span></td>';
        }
        if (c === 'order_role') {
          const roles = String(val).split(', ');
          const roleColors = { Sender: '#3b82f6', Receiver: '#22c55e', None: '#94a3b8' };
          return '<td>' + roles.map(r => '<span class="status-badge" style="background:' + (roleColors[r] || '#94a3b8') + '22;color:' + (roleColors[r] || '#94a3b8') + '">' + r + '</span>').join(' ') + '</td>';
        }
        return '<td>' + escapeHtml(String(val)) + '</td>';
      }).join('');

      return '<tr>' + cells + `<td><div class="actions-cell">
        <button class="btn-icon btn-edit" aria-label="Edit record" title="Edit" onclick="openEditModal('${page}','${item._id}')"><i class="fas fa-edit"></i></button>
        <button class="btn-icon btn-delete" aria-label="Delete record" title="Delete" onclick="deleteRecord('${page}','${item._id}')"><i class="fas fa-trash"></i></button>
      </div></td></tr>`;
    }).join('');
  } catch (err) {
    tbody.innerHTML = '';
    empty.style.display = 'block';
    empty.textContent = 'Cannot connect to server. Make sure the backend is running.';
    console.error('Load table error:', err);
  }
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// ===== MODAL =====
function openAddModal() {
  if (currentPage === 'dashboard') {
    showNotification('Switch to a table page first to add records', 'error');
    return;
  }
  editingId = null;
  const config = TABLE_CONFIG[currentPage];
  document.getElementById('modalTitle').textContent = 'Add ' + (config?.title || '').replace(/s$/, '');
  buildForm(currentPage);
  showModal();
}

async function openEditModal(page, id) {
  editingId = id;
  const config = TABLE_CONFIG[page];
  document.getElementById('modalTitle').textContent = 'Edit ' + (config?.title || '').replace(/s$/, '');
  await buildForm(page);

  try {
    const readEndpoint = config.writeEndpoint || config.endpoint;
    const item = await apiFetch('/' + readEndpoint.substring(1) + '/' + id);
    if (item) {
      FORM_FIELDS[page].forEach(f => {
        const el = document.getElementById('field_' + f.name);
        if (!el) return;
        let val = item[f.name];
        if (val === null || val === undefined) return;
        if (typeof val === 'object' && val._id) val = val._id;
        if (typeof val === 'boolean') el.value = String(val);
        else el.value = val;
      });
    }
  } catch (err) {
    console.error('Load record error:', err);
    showNotification('Failed to load record from server', 'error');
  }

  showModal();
}

function showModal() {
  const overlay = document.getElementById('modalOverlay');
  overlay.classList.remove('hidden');
  overlay.setAttribute('aria-hidden', 'false');
  setTimeout(() => {
    const firstInput = overlay.querySelector('input, select');
    if (firstInput) firstInput.focus();
  }, 100);
}

function closeModal(e) {
  if (e && e.target && e.target !== e.currentTarget && !e.target.classList.contains('modal-close') && !e.target.closest('.modal-close')) return;
  const overlay = document.getElementById('modalOverlay');
  overlay.classList.add('hidden');
  overlay.setAttribute('aria-hidden', 'true');
  editingId = null;
}

async function buildForm(page) {
  const fields = FORM_FIELDS[page];
  if (!fields) return;
  const body = document.getElementById('modalBody');
  body.innerHTML = '<div style="text-align:center;padding:20px;color:#64748b;"><i class="fas fa-spinner fa-spin"></i> Loading form...</div>';

  const htmlParts = [];
  for (const f of fields) {
    if (f.type === 'ref' && f.refEndpoint) {
      try {
        const items = await apiFetch(f.refEndpoint);
        const options = (items || []).map(i => {
          const label = i[f.refLabel] || i.plate_no || i.route_name || i.description || i._id;
          return '<option value="' + i._id + '">' + escapeHtml(String(label)) + '</option>';
        }).join('');
        htmlParts.push(`<div class="form-group">
          <label for="field_${f.name}">${f.label}${f.required ? ' <span class="required">*</span>' : ''}</label>
          <select id="field_${f.name}" ${f.required ? 'required' : ''}>
            <option value="">Select ${f.label}...</option>${options}
          </select></div>`);
      } catch(e) {
        htmlParts.push(`<div class="form-group">
          <label for="field_${f.name}">${f.label}</label>
          <select id="field_${f.name}"><option value="">Failed to load - is server running?</option></select></div>`);
      }
    } else if (f.type === 'select') {
      const options = f.options.map(o => '<option value="' + o + '">' + o + '</option>').join('');
      htmlParts.push(`<div class="form-group">
        <label for="field_${f.name}">${f.label}${f.required ? ' <span class="required">*</span>' : ''}</label>
        <select id="field_${f.name}" ${f.required ? 'required' : ''}>${options}</select></div>`);
    } else {
      htmlParts.push(`<div class="form-group">
        <label for="field_${f.name}">${f.label}${f.required ? ' <span class="required">*</span>' : ''}</label>
        <input type="${f.type}" id="field_${f.name}" ${f.required ? 'required' : ''} autocomplete="off"></div>`);
    }
  }

  body.innerHTML = htmlParts.join('');
}

async function saveRecord() {
  if (!currentPage || currentPage === 'dashboard') return;
  const config = TABLE_CONFIG[currentPage];
  const fields = FORM_FIELDS[currentPage];
  const data = {};
  let hasError = false;

  fields.forEach(f => {
    const el = document.getElementById('field_' + f.name);
    if (!el) return;
    if (f.required && !el.value.trim()) {
      el.style.borderColor = '#ef4444';
      el.style.boxShadow = '0 0 0 3px rgba(239,68,68,0.15)';
      hasError = true;
    } else {
      el.style.borderColor = '';
      el.style.boxShadow = '';
    }
  });

  if (hasError) {
    showNotification('Please fill in all required fields', 'error');
    return;
  }

  fields.forEach(f => {
    const el = document.getElementById('field_' + f.name);
    if (!el) return;
    let val = el.value;
    if (f.type === 'number' && val !== '') val = Number(val);
    if (f.type === 'select' && (val === 'true' || val === 'false')) val = val === 'true';
    if (val !== '' && val !== null && val !== undefined) data[f.name] = val;
  });

  try {
    const writeBase = config.writeEndpoint || config.endpoint;
    if (editingId) {
      await apiFetch('/' + writeBase.substring(1) + '/' + editingId, { method: 'PUT', body: data });
      showNotification('Record updated successfully!');
    } else {
      await apiFetch(writeBase, { method: 'POST', body: data });
      showNotification('Record added successfully!');
    }
    closeModal();
    loadTablePage(currentPage);
  } catch (err) {
    let msg = err.message || '';
    if (msg.includes('Failed to fetch') || msg.includes('NetworkError') || msg.includes('server')) {
      msg = 'Cannot connect to server. Start the backend with: node server.js';
    } else if (msg.includes('duplicate key')) {
      msg = 'This package already has a payment record.';
    } else if (msg.length > 10) {
      msg = 'Save failed: ' + msg.substring(0, 100);
    } else {
      msg = 'Error saving record. Check all fields and try again.';
    }
    showNotification(msg, 'error');
    console.error('Save error:', err);
  }
}

async function deleteRecord(page, id) {
  if (!confirm('Are you sure you want to delete this record?')) return;
  const config = TABLE_CONFIG[page];
  try {
    const writeBase = config.writeEndpoint || config.endpoint;
    await apiFetch('/' + writeBase.substring(1) + '/' + id, { method: 'DELETE' });
    showNotification('Record deleted!');
    loadTablePage(page);
  } catch (err) {
    let msg = err.message || '';
    if (msg.includes('Failed to fetch') || msg.includes('NetworkError')) {
      msg = 'Cannot connect to server. Start the backend with: node server.js';
    } else {
      msg = 'Error deleting record.';
    }
    showNotification(msg, 'error');
    console.error('Delete error:', err);
  }
}

function refreshDashboard() {
  refreshCurrentSection();
  showNotification('Data refreshed!');
}

function refreshCurrentSection() {
  if (currentPage === 'dashboard') loadDashboard();
  else loadTablePage(currentPage);
}

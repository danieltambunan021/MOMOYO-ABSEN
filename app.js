/**
 * ============================================================
 * MOMOYO ABSENSI — FRONTEND APPLICATION (PWA)
 * ============================================================
 * GANTI URL di bawah ini dengan URL Web App Google Apps Script Anda
 * (akan dipandu langkah demi langkah di Tahap 4).
 */
const API_URL = 'https://script.google.com/macros/s/AKfycbyrbl6vBqA1uatZYi2kEn6gv5AxwrB4LEnmEIwh5NW0DwCowh0so6uZOIbzV3F8wVeg/exec';

const HARI_ID = ['MINGGU', 'SENIN', 'SELASA', 'RABU', 'KAMIS', 'JUMAT', 'SABTU'];
const BULAN_ID = [
  'JANUARI', 'FEBRUARI', 'MARET', 'APRIL', 'MEI', 'JUNI',
  'JULI', 'AGUSTUS', 'SEPTEMBER', 'OKTOBER', 'NOVEMBER', 'DESEMBER'
];

const state = {
  token: localStorage.getItem('momoyo_token') || '',
  user: JSON.parse(localStorage.getItem('momoyo_user') || 'null'),
  publicStores: [],
  publicCrews: [],
  stores: [],
  crews: [],
  photoBase64: '',
  pendingDelete: null,
  lastRecap: null,
  charts: { store: null, days: null },
  deferredInstallPrompt: null
};

/* ======================== INISIALISASI ======================== */

document.addEventListener('DOMContentLoaded', () => {
  initServiceWorker();
  initPwaInstall();
  initOfflineIndicator();
  initClock();
  bindEvents();
  initRecapSelectors();

  if (state.token && state.user) {
    enterApp();
  } else {
    loadPublicInit();
  }
});

function initServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./service-worker.js').catch(() => {});
  }
}

function initPwaInstall() {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    state.deferredInstallPrompt = e;
    document.getElementById('pwaInstallBanner').classList.remove('hidden');
  });

  document.getElementById('btnInstallPwa').addEventListener('click', async () => {
    if (!state.deferredInstallPrompt) return;
    state.deferredInstallPrompt.prompt();
    await state.deferredInstallPrompt.userChoice;
    state.deferredInstallPrompt = null;
    document.getElementById('pwaInstallBanner').classList.add('hidden');
  });

  document.getElementById('btnDismissPwa').addEventListener('click', () => {
    document.getElementById('pwaInstallBanner').classList.add('hidden');
  });
}

function initOfflineIndicator() {
  const badge = document.getElementById('offlineBadge');
  const update = () => badge.classList.toggle('hidden', navigator.onLine);
  window.addEventListener('online', update);
  window.addEventListener('offline', update);
  update();
}

function initClock() {
  const render = () => {
    const now = new Date();
    const hari = HARI_ID[now.getDay()];
    const tgl = now.getDate();
    const bln = BULAN_ID[now.getMonth()];
    const thn = now.getFullYear();
    const jam = now.toTimeString().slice(0, 8);
    const dateEl = document.getElementById('liveDate');
    const clockEl = document.getElementById('liveClock');
    if (dateEl) dateEl.textContent = `${hari}, ${tgl} ${bln} ${thn}`;
    if (clockEl) clockEl.textContent = jam;
  };
  render();
  setInterval(render, 1000);
}

/* ======================== API HELPER ======================== */

async function apiCall(payload, timeoutMs = 35000) {
  if (!navigator.onLine) {
    throw new Error('Tidak ada koneksi internet. Periksa jaringan HP Anda.');
  }
  if (!API_URL || API_URL.includes('PASTE_URL')) {
    throw new Error('URL Server belum diatur di file app.js.');
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ ...payload, token: state.token }),
      redirect: 'follow',
      signal: controller.signal
    });
    const text = await res.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error('Respon server tidak valid. Pastikan Web App Apps Script sudah di-deploy ulang.');
    }

    if (data.code === 'SESSION_EXPIRED') {
      handleForceLogout(data.message);
      throw new Error(data.message);
    }
    if (!data.ok) {
      throw new Error(data.message || 'Permintaan gagal diproses.');
    }
    return data;
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new Error('Koneksi terlalu lambat (timeout). Silakan coba lagi.');
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

/* ======================== AUTH & LOGIN ======================== */

async function loadPublicInit() {
  try {
    const res = await apiCall({ action: 'getPublicInit' });
    state.publicStores = res.stores || [];
    state.publicCrews = res.crews || [];

    const storeSelect = document.getElementById('loginStore');
    storeSelect.innerHTML = '<option value="">-- Pilih Cabang Toko --</option>' +
      state.publicStores.map((s) => `<option value="${esc(s.nama)}">${esc(s.nama)}</option>`).join('');
  } catch (err) {
    showToast(err.message, 'error');
  }
}

function onLoginStoreChange() {
  const toko = document.getElementById('loginStore').value;
  const crewSelect = document.getElementById('loginCrew');
  if (!toko) {
    crewSelect.disabled = true;
    crewSelect.innerHTML = '<option value="">Pilih toko dulu</option>';
    return;
  }
  const filtered = state.publicCrews.filter((c) => c.toko.toUpperCase() === toko.toUpperCase());
  crewSelect.disabled = false;
  if (filtered.length === 0) {
    crewSelect.innerHTML = '<option value="">Belum ada crew di toko ini</option>';
    return;
  }
  crewSelect.innerHTML = '<option value="">-- Pilih Nama Anda --</option>' +
    filtered.map((c) => `<option value="${esc(c.id)}">${esc(c.nama)}</option>`).join('');
}

async function handleLoginCrew(e) {
  e.preventDefault();
  const crewId = document.getElementById('loginCrew').value;
  const pin = document.getElementById('loginPin').value.trim();
  if (!crewId || !pin) return showToast('Pilih nama dan masukkan PIN.', 'error');

  setLoading(true, 'Memverifikasi PIN...');
  try {
    const res = await apiCall({ action: 'login', role: 'CREW', crewId, pin });
    saveSession(res.token, res.user, res.stores);
    document.getElementById('loginPin').value = '';
    enterApp();
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    setLoading(false);
  }
}

async function handleLoginAdmin(e) {
  e.preventDefault();
  const password = document.getElementById('loginAdminPass').value;
  if (!password) return showToast('Masukkan password Admin.', 'error');

  setLoading(true, 'Masuk sebagai Admin...');
  try {
    const res = await apiCall({ action: 'login', role: 'ADMIN', password });
    saveSession(res.token, res.user, res.stores);
    document.getElementById('loginAdminPass').value = '';
    enterApp();
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    setLoading(false);
  }
}

function saveSession(token, user, stores) {
  state.token = token;
  state.user = user;
  state.stores = stores || [];
  localStorage.setItem('momoyo_token', token);
  localStorage.setItem('momoyo_user', JSON.stringify(user));
  localStorage.setItem('momoyo_stores', JSON.stringify(state.stores));
}

async function handleLogout() {
  try { await apiCall({ action: 'logout' }); } catch {}
  handleForceLogout('Berhasil keluar.');
}

function handleForceLogout(msg) {
  state.token = '';
  state.user = null;
  localStorage.removeItem('momoyo_token');
  localStorage.removeItem('momoyo_user');
  document.getElementById('appShell').classList.add('hidden');
  document.getElementById('loginView').classList.remove('hidden');
  if (msg) showToast(msg);
  loadPublicInit();
}

/* ======================== ENTER APP & NAVIGASI ======================== */

function enterApp() {
  state.stores = state.stores.length ? state.stores : JSON.parse(localStorage.getItem('momoyo_stores') || '[]');
  const isAdmin = state.user.role === 'ADMIN';

  document.getElementById('loginView').classList.add('hidden');
  document.getElementById('appShell').classList.remove('hidden');

  document.getElementById('headerAvatar').textContent = (state.user.nama || 'M')[0].toUpperCase();
  document.getElementById('headerName').textContent = state.user.nama;
  document.getElementById('headerRoleStore').textContent = isAdmin ? 'Administrator • Semua Cabang' : `Crew • ${state.user.toko}`;

  // Tampilkan/sembunyikan elemen khusus Admin
  document.querySelectorAll('.admin-only').forEach((el) => {
    el.classList.toggle('hidden', !isAdmin);
  });

  setupAbsenForm();
  buildBottomNav(isAdmin);

  if (isAdmin) {
    populateFilterStores();
    switchView('viewDashboard');
  } else {
    switchView('viewAbsen');
  }
}

function buildBottomNav(isAdmin) {
  const nav = document.getElementById('bottomNav');
  const items = isAdmin
    ? [
        { view: 'viewDashboard', icon: '📊', label: 'Dashboard' },
        { view: 'viewRiwayat', icon: '📋', label: 'Riwayat' },
        { view: 'viewAbsen', icon: '📸', label: 'Absen', center: true },
        { view: 'viewInsight', icon: '📈', label: 'Insight' },
        { view: 'viewKelola', icon: '⚙️', label: 'Kelola' }
      ]
    : [
        { view: 'viewRiwayat', icon: '📋', label: 'Riwayat Saya' },
        { view: 'viewAbsen', icon: '📸', label: 'Absen Sekarang', center: true }
      ];

  nav.innerHTML = items.map((it) => `
    <button type="button" class="nav-item ${it.center ? 'nav-center' : ''}" data-view="${it.view}">
      <span class="nav-icon">${it.icon}</span>
      <span>${it.label}</span>
    </button>
  `).join('');

  nav.querySelectorAll('.nav-item').forEach((btn) => {
    btn.addEventListener('click', () => switchView(btn.dataset.view));
  });
}

function switchView(viewId) {
  document.querySelectorAll('.page-view').forEach((v) => v.classList.add('hidden'));
  const target = document.getElementById(viewId);
  if (target) target.classList.remove('hidden');

  document.querySelectorAll('#bottomNav .nav-item').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.view === viewId);
  });

  if (viewId === 'viewRiwayat') loadHistory();
  if (viewId === 'viewDashboard') loadDashboard();
  if (viewId === 'viewInsight') loadInsights();
  if (viewId === 'viewKelola') loadMasterData();
}

/* ======================== FORM ABSENSI & KOMPRESI FOTO ======================== */

function setupAbsenForm() {
  const isAdmin = state.user.role === 'ADMIN';
  const tokoSel = document.getElementById('absenToko');
  const namaInp = document.getElementById('absenNama');
  const shiftSel = document.getElementById('absenShift');

  if (isAdmin) {
    tokoSel.disabled = false;
    tokoSel.innerHTML = state.stores.map((s) => `<option value="${esc(s.nama)}">${esc(s.nama)}</option>`).join('');
    namaInp.readOnly = false;
    namaInp.value = state.user.nama;
  } else {
    tokoSel.innerHTML = `<option value="${esc(state.user.toko)}">${esc(state.user.toko)}</option>`;
    tokoSel.disabled = true;
    namaInp.readOnly = true;
    namaInp.value = state.user.nama;
  }

  // Deteksi shift otomatis berdasarkan jam sekarang (sebelum 12:30 = PAGI, sisanya = SIANG)
  const hour = new Date().getHours();
  shiftSel.value = hour < 13 ? 'PAGI' : 'SIANG';

  updateGpsHint();
}

function updateGpsHint() {
  const toko = document.getElementById('absenToko').value;
  const st = state.stores.find((s) => s.nama.toUpperCase() === toko.toUpperCase());
  const box = document.getElementById('gpsStatusBox');
  if (st && st.wajibGps && state.user.role !== 'ADMIN') {
    box.classList.remove('hidden');
    document.getElementById('gpsStatusText').textContent = `Toko ${st.nama} mewajibkan verifikasi GPS (radius maks. ${st.radius}m).`;
  } else {
    box.classList.add('hidden');
  }
}

function handlePhotoSelected(e) {
  const file = e.target.files && e.target.files[0];
  if (!file) return;
  if (!file.type.startsWith('image/')) {
    showToast('File harus berupa gambar/foto.', 'error');
    return;
  }

  setLoading(true, 'Mengompres foto...');
  compressImage(file, 1200, 0.72)
    .then(({ base64, sizeKB }) => {
      state.photoBase64 = base64;
      document.getElementById('photoPreviewImg').src = base64;
      document.getElementById('photoSizeInfo').textContent = `Siap dikirim (${sizeKB} KB)`;
      document.getElementById('photoPreviewBox').classList.remove('hidden');
      document.getElementById('photoEmptyBox').classList.add('hidden');
      document.getElementById('absenRetryBox').classList.add('hidden');
    })
    .catch(() => {
      showToast('Gagal memproses foto. Coba pilih ulang foto.', 'error');
    })
    .finally(() => {
      setLoading(false);
      e.target.value = '';
    });
}

function compressImage(file, maxDim, quality) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = (ev) => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        const base64 = canvas.toDataURL('image/jpeg', quality);
        const sizeKB = Math.round((base64.length * 3) / 4 / 1024);
        resolve({ base64, sizeKB });
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  });
}

function clearPhoto() {
  state.photoBase64 = '';
  document.getElementById('photoPreviewImg').src = '';
  document.getElementById('photoPreviewBox').classList.add('hidden');
  document.getElementById('photoEmptyBox').classList.remove('hidden');
}

function getCurrentPositionPromise() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Browser HP tidak mendukung GPS.'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => reject(new Error('Izin lokasi GPS ditolak. Aktifkan GPS di pengaturan HP lalu coba lagi.')),
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
    );
  });
}

async function submitAttendance(e) {
  if (e) e.preventDefault();
  const jenis = document.getElementById('absenJenis').value;
  const shift = document.getElementById('absenShift').value;
  const toko = document.getElementById('absenToko').value;
  const nama = document.getElementById('absenNama').value.trim();

  if (!nama || !toko) return showToast('Nama dan toko wajib terisi.', 'error');
  if (!state.photoBase64) return showToast('Wajib unggah foto selfie terlebih dahulu.', 'error');

  document.getElementById('absenRetryBox').classList.add('hidden');
  let coords = {};
  const st = state.stores.find((s) => s.nama.toUpperCase() === toko.toUpperCase());
  if (st && st.wajibGps && state.user.role !== 'ADMIN') {
    setLoading(true, 'Mengambil lokasi GPS...');
    try {
      coords = await getCurrentPositionPromise();
    } catch (err) {
      setLoading(false);
      showToast(err.message, 'error');
      return;
    }
  }

  setLoading(true, 'Mengunggah foto & mencatat absen...');
  try {
    const res = await apiCall({
      action: 'submitAttendance',
      jenis,
      shift,
      toko,
      nama,
      photoBase64: state.photoBase64,
      lat: coords.lat,
      lng: coords.lng
    }, 45000);

    const d = res.data;
    document.getElementById('successDetails').innerHTML = `
      <div class="detail-row"><span>Nama</span><strong>${esc(d.nama)}</strong></div>
      <div class="detail-row"><span>Outlet</span><strong>${esc(d.toko)}</strong></div>
      <div class="detail-row"><span>Jenis</span><strong>${esc(d.jenis)}</strong></div>
      <div class="detail-row"><span>Shift</span><strong>${esc(d.shift)}</strong></div>
      <div class="detail-row"><span>Tanggal</span><strong>${esc(d.tanggalLengkap)}</strong></div>
      <div class="detail-row"><span>Jam Server</span><strong>${esc(d.jam)} WIB</strong></div>
      <div class="detail-row"><span>Status</span><strong>${esc(d.status)}</strong></div>
      ${d.jenis === 'PULANG' ? `<div class="detail-row"><span>Total Jam Kerja</span><strong>${esc(d.totalJamKerja)}</strong></div>` : ''}
    `;
    openModal('modalSuccess');
    clearPhoto();
  } catch (err) {
    document.getElementById('absenRetryMsg').textContent = err.message;
    document.getElementById('absenRetryBox').classList.remove('hidden');
    showToast(err.message, 'error');
  } finally {
    setLoading(false);
  }
}

/* ======================== RIWAYAT ======================== */

function populateFilterStores() {
  const sel = document.getElementById('filterToko');
  sel.innerHTML = '<option value="SEMUA">Semua Toko</option>' +
    state.stores.map((s) => `<option value="${esc(s.nama)}">${esc(s.nama)}</option>`).join('');
}

async function loadHistory() {
  const container = document.getElementById('historyList');
  container.innerHTML = '<div class="empty-state">Memuat riwayat absensi...</div>';

  const filters = {
    search: document.getElementById('filterSearch').value.trim(),
    toko: document.getElementById('filterToko').value,
    shift: document.getElementById('filterShift').value,
    startDate: document.getElementById('filterStart').value,
    endDate: document.getElementById('filterEnd').value
  };

  try {
    const res = await apiCall({ action: 'getHistory', filters });
    renderRecordList(container, res.records || [], state.user.role === 'ADMIN');
  } catch (err) {
    container.innerHTML = `<div class="empty-state">${esc(err.message)}</div>`;
  }
}

function renderRecordList(container, records, allowAdminActions) {
  if (!records.length) {
    container.innerHTML = '<div class="empty-state">Belum ada data absensi sesuai filter.</div>';
    return;
  }

  container.innerHTML = records.map((r) => {
    const jenisClass = r.jenis === 'MASUK' ? 'badge-masuk' : 'badge-pulang';
    const statusClass = r.isLate ? 'badge-danger' : 'badge-neutral';
    const encoded = encodeURIComponent(JSON.stringify(r));

    return `
      <div class="record-card">
        <div class="record-top">
          <div>
            <div class="record-title">${esc(r.nama)}</div>
            <div class="record-sub">${esc(r.toko)} • Shift ${esc(r.shift)} • ${esc(r.hari)}, ${esc(r.tanggalDisplay)}</div>
          </div>
          <span class="badge ${jenisClass}">${esc(r.jenis)}</span>
        </div>
        <div class="record-bottom">
          <div>
            <strong>${esc(r.jam)}</strong>
            ${r.status && r.status !== '-' ? `<span class="badge ${statusClass}" style="margin-left:6px">${esc(r.status)}</span>` : ''}
          </div>
          <div class="record-actions">
            ${r.foto ? `<button type="button" class="btn-ghost-sm" onclick="previewPhoto('${esc(r.foto)}')">Foto</button>` : ''}
            ${allowAdminActions ? `
              <button type="button" class="btn-ghost-sm" onclick="openEditModal('${encoded}')">Edit</button>
              <button type="button" class="btn-ghost-sm text-danger" onclick="openDeleteModal(${r.rowNumber}, '${esc(r.id)}', '${esc(r.nama)} (${esc(r.jenis)})')">Hapus</button>
            ` : ''}
          </div>
        </div>
      </div>
    `;
  }).join('');
}

/* ======================== DASHBOARD ADMIN ======================== */

async function loadDashboard() {
  setLoading(true, 'Memuat dashboard...');
  try {
    const res = await apiCall({ action: 'getDashboard' });
    document.getElementById('dashDateLabel').textContent = res.serverDate;
    document.getElementById('kpiMasuk').textContent = res.summary.masuk;
    document.getElementById('kpiPulang').textContent = res.summary.pulang;
    document.getElementById('kpiBelumPulang').textContent = res.summary.belumPulangHariIni;
    document.getElementById('kpiTelat').textContent = res.summary.terlambat;

    // Belum absen pulang
    const bpCard = document.getElementById('belumPulangCard');
    const bpList = document.getElementById('belumPulangList');
    if (res.belumPulang && res.belumPulang.length) {
      bpCard.classList.remove('hidden');
      bpList.innerHTML = res.belumPulang.map((b) => `
        <div class="mini-item">
          <div>
            <strong>${esc(b.nama)}</strong> (${esc(b.toko)})
            <div class="record-sub">${esc(b.tanggal)} • Shift ${esc(b.shift)} • Masuk ${esc(b.jamMasuk)}</div>
          </div>
          <span class="badge ${b.hariIni ? 'badge-warning' : 'badge-danger'}">${b.hariIni ? 'Hari Ini' : 'Terlewat'}</span>
        </div>
      `).join('');
    } else {
      bpCard.classList.add('hidden');
    }

    // Tabel per toko
    document.getElementById('dashStoreTable').innerHTML = (res.perStore || []).map((s) => `
      <tr>
        <td><strong>${esc(s.toko)}</strong></td>
        <td>${s.masuk}</td>
        <td>${s.pulang}</td>
        <td>${s.belumPulang > 0 ? `<span class="badge badge-warning">${s.belumPulang}</span>` : '0'}</td>
        <td>${s.terlambat > 0 ? `<span class="badge badge-danger">${s.terlambat}</span>` : '0'}</td>
      </tr>
    `).join('');

    renderCharts(res.chartPerStore || [], res.chart7Days || []);
    renderRecordList(document.getElementById('dashTodayList'), res.todayRecords || [], true);
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    setLoading(false);
  }
}

function renderCharts(perStore, days7) {
  if (typeof Chart === 'undefined') return;
  if (state.charts.store) state.charts.store.destroy();
  if (state.charts.days) state.charts.days.destroy();

  const ctxStore = document.getElementById('chartPerStore').getContext('2d');
  state.charts.store = new Chart(ctxStore, {
    type: 'bar',
    data: {
      labels: perStore.map((s) => s.label),
      datasets: [
        { label: 'Masuk', data: perStore.map((s) => s.masuk), backgroundColor: '#E11D48', borderRadius: 6 },
        { label: 'Pulang', data: perStore.map((s) => s.pulang), backgroundColor: '#3B82F6', borderRadius: 6 }
      ]
    },
    options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } } }
  });

  const ctxDays = document.getElementById('chart7Days').getContext('2d');
  state.charts.days = new Chart(ctxDays, {
    type: 'line',
    data: {
      labels: days7.map((d) => d.label),
      datasets: [
        { label: 'Masuk', data: days7.map((d) => d.masuk), borderColor: '#E11D48', backgroundColor: 'rgba(225,29,72,0.12)', tension: 0.35, fill: true },
        { label: 'Pulang', data: days7.map((d) => d.pulang), borderColor: '#059669', backgroundColor: 'rgba(5,150,105,0.08)', tension: 0.35, fill: true }
      ]
    },
    options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } } }
  });
}

/* ======================== INSIGHT & REKAP BULANAN ======================== */

async function loadInsights(period) {
  const activeBtn = document.querySelector('#insightPeriodToggle .seg-btn.active');
  const p = period || (activeBtn ? activeBtn.dataset.period : 'week');

  setLoading(true, 'Menghitung insight...');
  try {
    const res = await apiCall({ action: 'getInsights', period: p });
    document.getElementById('insightPeriodDesc').textContent = `Perbandingan ${res.periodLabel} dibanding ${res.prevLabel}`;

    const o = res.overall;
    document.getElementById('insJam').textContent = `${o.curJam} jam`;
    document.getElementById('insJamDiff').textContent = formatDiff(o.curJam, o.prevJam, ' jam');
    document.getElementById('insHadir').textContent = `${o.curHadir} hari`;
    document.getElementById('insHadirDiff').textContent = formatDiff(o.curHadir, o.prevHadir, ' hari');
    document.getElementById('insTelat').textContent = `${o.curTelat}x`;
    document.getElementById('insTelatDiff').textContent = formatDiff(o.curTelat, o.prevTelat, 'x');

    document.getElementById('insStoreTable').innerHTML = (res.perStore || []).map((s) => `
      <tr>
        <td><strong>${esc(s.toko)}</strong></td>
        <td>${s.curJam}j <small class="subtitle">(lalu ${s.prevJam}j)</small></td>
        <td>${s.curHadir} <small class="subtitle">(lalu ${s.prevHadir})</small></td>
        <td>${s.curTelat} <small class="subtitle">(lalu ${s.prevTelat})</small></td>
      </tr>
    `).join('') || '<tr><td colspan="4" class="text-center">Belum ada data.</td></tr>';

    document.getElementById('insCrewTable').innerHTML = (res.perCrew || []).map((c) => `
      <tr>
        <td><strong>${esc(c.nama)}</strong></td>
        <td>${esc(c.toko)}</td>
        <td>${c.curJam}j <small class="subtitle">(${c.prevJam}j)</small></td>
        <td>${c.curHadir} <small class="subtitle">(${c.prevHadir})</small></td>
        <td>${c.curTelat} <small class="subtitle">(${c.prevTelat})</small></td>
      </tr>
    `).join('') || '<tr><td colspan="5" class="text-center">Belum ada data.</td></tr>';
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    setLoading(false);
  }
}

function formatDiff(cur, prev, unit) {
  const diff = Math.round((cur - prev) * 10) / 10;
  const sign = diff > 0 ? '+' : '';
  return `${sign}${diff}${unit} vs lalu (${prev}${unit})`;
}

function initRecapSelectors() {
  const now = new Date();
  const mSel = document.getElementById('recapMonth');
  const ySel = document.getElementById('recapYear');
  mSel.innerHTML = BULAN_ID.map((b, i) => `<option value="${i + 1}" ${i === now.getMonth() ? 'selected' : ''}>${b}</option>`).join('');
  const curY = now.getFullYear();
  ySel.innerHTML = [curY - 1, curY, curY + 1].map((y) => `<option value="${y}" ${y === curY ? 'selected' : ''}>${y}</option>`).join('');
}

async function loadMonthlyRecap() {
  const month = Number(document.getElementById('recapMonth').value);
  const year = Number(document.getElementById('recapYear').value);
  setLoading(true, 'Menyiapkan rekap bulanan...');
  try {
    const res = await apiCall({ action: 'getMonthlyRecap', month, year });
    state.lastRecap = res;
    const tbody = document.getElementById('recapTableBody');
    if (!res.recap.length) {
      tbody.innerHTML = '<tr><td colspan="6" class="text-center">Tidak ada data absensi di bulan ini.</td></tr>';
      return;
    }
    tbody.innerHTML = res.recap.map((r) => `
      <tr>
        <td><strong>${esc(r.nama)}</strong></td>
        <td>${esc(r.toko)}</td>
        <td>${r.hariHadir}</td>
        <td>${esc(r.totalJamFormatted)}</td>
        <td>${r.jumlahTerlambat}</td>
        <td>${r.lupaAbsenPulang}</td>
      </tr>
    `).join('');
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    setLoading(false);
  }
}

function exportRecapCsv() {
  if (!state.lastRecap || !state.lastRecap.recap.length) {
    showToast('Klik "Tampilkan" dulu untuk memuat data bulan yang dipilih.', 'error');
    return;
  }
  const headers = ['Nama Crew', 'Toko', 'Hari Hadir', 'Total Jam Kerja', 'Total Jam (Desimal)', 'Jumlah Terlambat', 'Lupa Absen Pulang'];
  const lines = [headers.join(',')];
  state.lastRecap.recap.forEach((r) => {
    lines.push([
      `"${r.nama}"`, `"${r.toko}"`, r.hariHadir, `"${r.totalJamFormatted}"`,
      r.totalJamDesimal, r.jumlahTerlambat, r.lupaAbsenPulang
    ].join(','));
  });
  const blob = new Blob(['\uFEFF' + lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `Rekap_Gaji_MOMOYO_${state.lastRecap.monthName}_${state.lastRecap.year}.csv`;
  a.click();
  URL.revokeObjectURL(a.href);
}

/* ======================== EDIT & HAPUS ABSENSI ======================== */

window.previewPhoto = function (url) {
  document.getElementById('modalPhotoImg').src = url;
  document.getElementById('modalPhotoLink').href = url;
  openModal('modalPhoto');
};

window.openEditModal = function (encoded) {
  const r = JSON.parse(decodeURIComponent(encoded));
  document.getElementById('editRowNumber').value = r.rowNumber;
  document.getElementById('editRecordId').value = r.id || '';
  document.getElementById('editJenis').value = r.jenis === 'PULANG' ? 'PULANG' : 'MASUK';
  document.getElementById('editShift').value = r.shift === 'SIANG' ? 'SIANG' : 'PAGI';
  document.getElementById('editNama').value = r.nama;
  document.getElementById('editToko').value = r.toko;
  document.getElementById('editJam').value = r.jam === '-' ? '' : r.jam;
  document.getElementById('editStatus').value = r.status === '-' ? '' : r.status;
  openModal('modalEditRecord');
};

async function submitEditRecord(e) {
  e.preventDefault();
  setLoading(true, 'Menyimpan perubahan...');
  try {
    await apiCall({
      action: 'editAttendance',
      rowNumber: Number(document.getElementById('editRowNumber').value),
      id: document.getElementById('editRecordId').value,
      updates: {
        jenis: document.getElementById('editJenis').value,
        shift: document.getElementById('editShift').value,
        nama: document.getElementById('editNama').value.trim(),
        toko: document.getElementById('editToko').value.trim(),
        jam: document.getElementById('editJam').value.trim(),
        status: document.getElementById('editStatus').value.trim()
      }
    });
    closeModal('modalEditRecord');
    showToast('Data berhasil diperbarui.', 'success');
    refreshCurrentAdminView();
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    setLoading(false);
  }
}

window.openDeleteModal = function (rowNumber, id, label) {
  state.pendingDelete = { type: 'attendance', rowNumber, id };
  document.getElementById('deleteConfirmText').textContent = `Hapus absensi "${label}" secara permanen dari Google Sheets?`;
  openModal('modalConfirmDelete');
};

async function confirmDeleteAction() {
  const item = state.pendingDelete;
  if (!item) return;
  closeModal('modalConfirmDelete');
  setLoading(true, 'Menghapus data...');
  try {
    if (item.type === 'attendance') {
      await apiCall({ action: 'deleteAttendance', rowNumber: item.rowNumber, id: item.id });
      showToast('Data absensi dihapus.', 'success');
      refreshCurrentAdminView();
    } else if (item.type === 'crew') {
      await apiCall({ action: 'deleteCrew', id: item.id });
      showToast('Crew dihapus.', 'success');
      loadMasterData();
    } else if (item.type === 'store') {
      await apiCall({ action: 'deleteStore', nama: item.nama });
      showToast('Toko dihapus.', 'success');
      loadMasterData();
    }
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    state.pendingDelete = null;
    setLoading(false);
  }
}

function refreshCurrentAdminView() {
  if (!document.getElementById('viewDashboard').classList.contains('hidden')) loadDashboard();
  if (!document.getElementById('viewRiwayat').classList.contains('hidden')) loadHistory();
}

/* ======================== KELOLA MASTER (ADMIN) ======================== */

async function loadMasterData() {
  setLoading(true, 'Memuat data master...');
  try {
    const res = await apiCall({ action: 'getMasterData' });
    state.stores = res.stores || [];
    state.crews = res.crews || [];
    localStorage.setItem('momoyo_stores', JSON.stringify(state.stores));
    populateFilterStores();

    // Render Crew
    const crewEl = document.getElementById('manageCrewList');
    crewEl.innerHTML = state.crews.map((c) => {
      const enc = encodeURIComponent(JSON.stringify(c));
      return `
        <div class="record-card">
          <div class="record-top">
            <div>
              <div class="record-title">${esc(c.nama)}</div>
              <div class="record-sub">${esc(c.toko)} • Shift ${esc(c.shiftDefault)}</div>
            </div>
            <span class="badge ${c.aktif ? 'badge-masuk' : 'badge-neutral'}">${c.aktif ? 'Aktif' : 'Nonaktif'}</span>
          </div>
          <div class="record-bottom">
            <span class="record-sub">ID: ${esc(c.id)}</span>
            <div class="record-actions">
              <button type="button" class="btn-ghost-sm" onclick="openCrewModal('${enc}')">Edit / Ganti PIN</button>
              <button type="button" class="btn-ghost-sm text-danger" onclick="askDeleteCrew('${esc(c.id)}', '${esc(c.nama)}')">Hapus</button>
            </div>
          </div>
        </div>
      `;
    }).join('') || '<div class="empty-state">Belum ada data crew.</div>';

    // Render Toko
    const storeEl = document.getElementById('manageStoreList');
    storeEl.innerHTML = state.stores.map((s) => {
      const enc = encodeURIComponent(JSON.stringify(s));
      return `
        <div class="record-card">
          <div class="record-top">
            <div>
              <div class="record-title">${esc(s.nama)}</div>
              <div class="record-sub">Pagi ${s.pagiMulai}–${s.pagiSelesai} | Siang ${s.siangMulai}–${s.siangSelesai} | Telat ${s.toleransi}m</div>
            </div>
            <span class="badge ${s.wajibGps ? 'badge-masuk' : 'badge-neutral'}">${s.wajibGps ? 'GPS Aktif' : 'GPS Off'}</span>
          </div>
          <div class="record-bottom">
            <span class="record-sub">${s.wajibGps ? `Radius ${s.radius}m` : 'Absen fleksibel'}</span>
            <div class="record-actions">
              <button type="button" class="btn-ghost-sm" onclick="openStoreModal('${enc}')">Edit</button>
              <button type="button" class="btn-ghost-sm text-danger" onclick="askDeleteStore('${esc(s.nama)}')">Hapus</button>
            </div>
          </div>
        </div>
      `;
    }).join('') || '<div class="empty-state">Belum ada data toko.</div>';
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    setLoading(false);
  }
}

window.openCrewModal = function (encoded) {
  const tokoSel = document.getElementById('crewTokoInput');
  tokoSel.innerHTML = state.stores.map((s) => `<option value="${esc(s.nama)}">${esc(s.nama)}</option>`).join('');

  if (encoded) {
    const c = JSON.parse(decodeURIComponent(encoded));
    document.getElementById('modalCrewTitle').textContent = 'Edit Crew / Ganti PIN';
    document.getElementById('crewIdInput').value = c.id;
    document.getElementById('crewNamaInput').value = c.nama;
    tokoSel.value = c.toko;
    document.getElementById('crewShiftInput').value = c.shiftDefault;
    document.getElementById('crewPinInput').value = '';
    document.getElementById('crewAktifInput').checked = c.aktif;
  } else {
    document.getElementById('modalCrewTitle').textContent = 'Tambah Crew Baru';
    document.getElementById('crewIdInput').value = '';
    document.getElementById('crewNamaInput').value = '';
    document.getElementById('crewShiftInput').value = 'PAGI';
    document.getElementById('crewPinInput').value = '';
    document.getElementById('crewAktifInput').checked = true;
  }
  openModal('modalCrew');
};

async function submitCrewForm(e) {
  e.preventDefault();
  setLoading(true, 'Menyimpan data crew...');
  try {
    await apiCall({
      action: 'saveCrew',
      crew: {
        id: document.getElementById('crewIdInput').value,
        nama: document.getElementById('crewNamaInput').value.trim(),
        toko: document.getElementById('crewTokoInput').value,
        shiftDefault: document.getElementById('crewShiftInput').value,
        pin: document.getElementById('crewPinInput').value.trim(),
        aktif: document.getElementById('crewAktifInput').checked
      }
    });
    closeModal('modalCrew');
    showToast('Data crew tersimpan.', 'success');
    loadMasterData();
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    setLoading(false);
  }
}

window.askDeleteCrew = function (id, nama) {
  state.pendingDelete = { type: 'crew', id };
  document.getElementById('deleteConfirmText').textContent = `Hapus akun crew "${nama}"? Riwayat absen lamanya di spreadsheet tetap aman.`;
  openModal('modalConfirmDelete');
};

window.openStoreModal = function (encoded) {
  const gpsToggle = document.getElementById('storeWajibGps');
  const gpsFields = document.getElementById('storeGpsFields');

  if (encoded) {
    const s = JSON.parse(decodeURIComponent(encoded));
    document.getElementById('modalStoreTitle').textContent = 'Edit Cabang Toko';
    document.getElementById('storeOriginalName').value = s.nama;
    document.getElementById('storeNamaInput').value = s.nama;
    document.getElementById('storePagiMulai').value = s.pagiMulai;
    document.getElementById('storePagiSelesai').value = s.pagiSelesai;
    document.getElementById('storeSiangMulai').value = s.siangMulai;
    document.getElementById('storeSiangSelesai').value = s.siangSelesai;
    document.getElementById('storeToleransi').value = s.toleransi;
    gpsToggle.checked = s.wajibGps;
    document.getElementById('storeLat').value = s.lat || '';
    document.getElementById('storeLng').value = s.lng || '';
    document.getElementById('storeRadius').value = s.radius || 100;
  } else {
    document.getElementById('modalStoreTitle').textContent = 'Tambah Cabang Toko';
    document.getElementById('storeOriginalName').value = '';
    document.getElementById('storeNamaInput').value = '';
    document.getElementById('storePagiMulai').value = '08:00';
    document.getElementById('storePagiSelesai').value = '16:00';
    document.getElementById('storeSiangMulai').value = '14:00';
    document.getElementById('storeSiangSelesai').value = '22:00';
    document.getElementById('storeToleransi').value = 10;
    gpsToggle.checked = false;
    document.getElementById('storeLat').value = '';
    document.getElementById('storeLng').value = '';
    document.getElementById('storeRadius').value = 100;
  }
  gpsFields.classList.toggle('hidden', !gpsToggle.checked);
  openModal('modalStore');
};

async function submitStoreForm(e) {
  e.preventDefault();
  setLoading(true, 'Menyimpan data toko...');
  try {
    await apiCall({
      action: 'saveStore',
      originalName: document.getElementById('storeOriginalName').value,
      store: {
        nama: document.getElementById('storeNamaInput').value.trim(),
        pagiMulai: document.getElementById('storePagiMulai').value,
        pagiSelesai: document.getElementById('storePagiSelesai').value,
        siangMulai: document.getElementById('storeSiangMulai').value,
        siangSelesai: document.getElementById('storeSiangSelesai').value,
        toleransi: Number(document.getElementById('storeToleransi').value),
        wajibGps: document.getElementById('storeWajibGps').checked,
        lat: document.getElementById('storeLat').value.trim(),
        lng: document.getElementById('storeLng').value.trim(),
        radius: Number(document.getElementById('storeRadius').value) || 100
      }
    });
    closeModal('modalStore');
    showToast('Data toko tersimpan.', 'success');
    loadMasterData();
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    setLoading(false);
  }
}

window.askDeleteStore = function (nama) {
  state.pendingDelete = { type: 'store', nama };
  document.getElementById('deleteConfirmText').textContent = `Hapus cabang "${nama}" dari daftar master toko?`;
  openModal('modalConfirmDelete');
};

async function submitChangeAdminPass(e) {
  e.preventDefault();
  const oldPassword = document.getElementById('oldAdminPass').value;
  const newPassword = document.getElementById('newAdminPass').value;
  setLoading(true, 'Mengganti password...');
  try {
    await apiCall({ action: 'changeAdminPassword', oldPassword, newPassword });
    document.getElementById('oldAdminPass').value = '';
    document.getElementById('newAdminPass').value = '';
    showToast('Password Admin berhasil diganti!', 'success');
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    setLoading(false);
  }
}

/* ======================== EVENT BINDING & UTILITAS ======================== */

function bindEvents() {
  // Tabs Login
  document.getElementById('tabRoleCrew').addEventListener('click', () => {
    document.getElementById('tabRoleCrew').classList.add('active');
    document.getElementById('tabRoleAdmin').classList.remove('active');
    document.getElementById('formLoginCrew').classList.remove('hidden');
    document.getElementById('formLoginAdmin').classList.add('hidden');
  });
  document.getElementById('tabRoleAdmin').addEventListener('click', () => {
    document.getElementById('tabRoleAdmin').classList.add('active');
    document.getElementById('tabRoleCrew').classList.remove('active');
    document.getElementById('formLoginAdmin').classList.remove('hidden');
    document.getElementById('formLoginCrew').classList.add('hidden');
  });

  document.getElementById('loginStore').addEventListener('change', onLoginStoreChange);
  document.getElementById('formLoginCrew').addEventListener('submit', handleLoginCrew);
  document.getElementById('formLoginAdmin').addEventListener('submit', handleLoginAdmin);
  document.getElementById('btnLogout').addEventListener('click', handleLogout);

  // Toggle Jenis Absen
  document.querySelectorAll('#formAbsen .seg-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#formAbsen .seg-btn').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById('absenJenis').value = btn.dataset.jenis;
    });
  });

  document.getElementById('absenToko').addEventListener('change', updateGpsHint);
  document.getElementById('btnPickGallery').addEventListener('click', () => document.getElementById('inputFotoGaleri').click());
  document.getElementById('btnOpenCamera').addEventListener('click', () => document.getElementById('inputFotoKamera').click());
  document.getElementById('inputFotoGaleri').addEventListener('change', handlePhotoSelected);
  document.getElementById('inputFotoKamera').addEventListener('change', handlePhotoSelected);
  document.getElementById('btnRemovePhoto').addEventListener('click', clearPhoto);
  document.getElementById('formAbsen').addEventListener('submit', submitAttendance);
  document.getElementById('btnRetryAbsen').addEventListener('click', () => submitAttendance());

  // Riwayat & Dashboard
  document.getElementById('btnApplyFilter').addEventListener('click', loadHistory);
  document.getElementById('btnRefreshHistory').addEventListener('click', loadHistory);
  document.getElementById('btnResetFilter').addEventListener('click', () => {
    document.getElementById('filterSearch').value = '';
    document.getElementById('filterToko').value = 'SEMUA';
    document.getElementById('filterShift').value = 'SEMUA';
    document.getElementById('filterStart').value = '';
    document.getElementById('filterEnd').value = '';
    loadHistory();
  });
  document.getElementById('btnRefreshDash').addEventListener('click', loadDashboard);

  // Insight & Rekap
  document.querySelectorAll('#insightPeriodToggle .seg-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#insightPeriodToggle .seg-btn').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      loadInsights(btn.dataset.period);
    });
  });
  document.getElementById('btnLoadRecap').addEventListener('click', loadMonthlyRecap);
  document.getElementById('btnExportCsv').addEventListener('click', exportRecapCsv);

  // Admin Modals & Kelola
  document.getElementById('formEditRecord').addEventListener('submit', submitEditRecord);
  document.getElementById('btnConfirmDelete').addEventListener('click', confirmDeleteAction);
  document.getElementById('btnAddCrew').addEventListener('click', () => openCrewModal());
  document.getElementById('formCrew').addEventListener('submit', submitCrewForm);
  document.getElementById('btnAddStore').addEventListener('click', () => openStoreModal());
  document.getElementById('formStore').addEventListener('submit', submitStoreForm);
  document.getElementById('storeWajibGps').addEventListener('change', (e) => {
    document.getElementById('storeGpsFields').classList.toggle('hidden', !e.target.checked);
  });
  document.getElementById('btnGetCurrentGps').addEventListener('click', async () => {
    setLoading(true, 'Mengambil titik koordinat...');
    try {
      const pos = await getCurrentPositionPromise();
      document.getElementById('storeLat').value = pos.lat.toFixed(6);
      document.getElementById('storeLng').value = pos.lng.toFixed(6);
      showToast('Koordinat GPS berhasil diambil.', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  });
  document.getElementById('formChangeAdminPass').addEventListener('submit', submitChangeAdminPass);
}

function openModal(id) { document.getElementById(id).classList.remove('hidden'); }
window.closeModal = function (id) { document.getElementById(id).classList.add('hidden'); };

function setLoading(show, text = 'Memproses...') {
  document.getElementById('loadingText').textContent = text;
  document.getElementById('loadingOverlay').classList.toggle('hidden', !show);
}

let toastTimer;
function showToast(msg, type = '') {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.className = 'toast' + (type ? ` toast-${type}` : '');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.add('hidden'), 3500);
}

function esc(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

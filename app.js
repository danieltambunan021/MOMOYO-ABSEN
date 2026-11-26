/**
 * ============================================================
 * MOMOYO ABSENSI — FRONTEND APPLICATION v2.1 (PWA)
 * ============================================================
 * URL Web App Apps Script sudah terpasang di baris ke-8.
 * Fitur v2.1: Tema/Wallpaper Global, Kalender Crew, Detail Toko,
 * Profil Crew (Read-Only untuk Crew, Full Edit hanya Admin), Shift Full Day, Current PIN.
 */
const API_URL = 'https://script.google.com/macros/s/AKfycbyrbl6vBqA1uatZYi2kEn6gv5AxwrB4LEnmEIwh5NW0DwCowh0so6uZOIbzV3F8wVeg/exec';

const HARI_ID = ['MINGGU', 'SENIN', 'SELASA', 'RABU', 'KAMIS', 'JUMAT', 'SABTU'];
const BULAN_ID = [
  'JANUARI', 'FEBRUARI', 'MARET', 'APRIL', 'MEI', 'JUNI',
  'JULI', 'AGUSTUS', 'SEPTEMBER', 'OKTOBER', 'NOVEMBER', 'DESEMBER'
];

const THEME_META = {
  default: { color: '#E11D48', icon: '✨' },
  lebaran: { color: '#047857', icon: '🌙' },
  natal: { color: '#B91C1C', icon: '🎄' },
  imlek: { color: '#B91C1C', icon: '🏮' },
  merdeka: { color: '#DC2626', icon: '🇮🇩' },
  custom: { color: '#E11D48', icon: '✨' }
};

const nowInit = new Date();

const state = {
  token: localStorage.getItem('momoyo_token') || '',
  user: JSON.parse(localStorage.getItem('momoyo_user') || 'null'),
  theme: JSON.parse(localStorage.getItem('momoyo_theme') || '{"preset":"default","bannerText":"","customBgUrl":""}'),
  publicStores: [],
  publicCrews: [],
  stores: [],
  crews: [],
  photoBase64: '',
  pendingDelete: null,
  lastRecap: null,
  charts: { store: null, days: null },
  deferredInstallPrompt: null,
  // State Kalender Crew
  calYear: nowInit.getFullYear(),
  calMonth: nowInit.getMonth() + 1,
  calRecordsByDate: {},
  calSelectedDate: '',
  // State Detail Toko
  activeStoreDetail: '',
  // Draft Upload Foto Crew (Admin Modal)
  crewPhotoDraft: '',
  crewClearPhoto: false,
  // Draft Tema (Admin Kelola)
  themeDraftPreset: 'default',
  themeWallpaperDraft: '',
  themeClearWallpaper: false
};

/* ======================== INISIALISASI ======================== */

document.addEventListener('DOMContentLoaded', () => {
  applyAppTheme(state.theme);
  initServiceWorker();
  initPwaInstall();
  initOfflineIndicator();
  initClock();
  bindEvents();
  initMonthYearSelectors();

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

/* ======================== TEMA & WALLPAPER GLOBAL ======================== */

function applyAppTheme(themeObj) {
  if (!themeObj) return;
  const preset = THEME_META[themeObj.preset] ? themeObj.preset : 'default';
  const bannerText = String(themeObj.bannerText || '').trim();
  const customBgUrl = String(themeObj.customBgUrl || '').trim();

  state.theme = { preset, bannerText, customBgUrl };
  localStorage.setItem('momoyo_theme', JSON.stringify(state.theme));

  document.body.setAttribute('data-theme', preset);
  const metaTheme = document.querySelector('meta[name="theme-color"]');
  if (metaTheme) metaTheme.setAttribute('content', THEME_META[preset].color);

  const wallEl = document.getElementById('themeWallpaper');
  if (wallEl) {
    if (customBgUrl) {
      wallEl.classList.add('has-custom-img');
      wallEl.style.backgroundImage = `url("${customBgUrl}")`;
    } else {
      wallEl.classList.remove('has-custom-img');
      wallEl.style.backgroundImage = '';
    }
  }

  const bannerEl = document.getElementById('themeBanner');
  if (bannerEl) {
    if (bannerText) {
      document.getElementById('themeBannerIcon').textContent = THEME_META[preset].icon;
      document.getElementById('themeBannerText').textContent = bannerText;
      bannerEl.classList.remove('hidden');
    } else {
      bannerEl.classList.add('hidden');
    }
  }
}

function syncThemeControls() {
  state.themeDraftPreset = state.theme.preset || 'default';
  state.themeWallpaperDraft = '';
  state.themeClearWallpaper = false;

  document.querySelectorAll('#themePresetGrid .theme-chip').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.themePreset === state.themeDraftPreset);
  });
  document.getElementById('themeBannerInput').value = state.theme.bannerText || '';

  const previewBox = document.getElementById('themeWallpaperPreviewBox');
  const previewImg = document.getElementById('themeWallpaperPreviewImg');
  if (state.theme.customBgUrl) {
    previewImg.src = state.theme.customBgUrl;
    previewBox.classList.remove('hidden');
  } else {
    previewImg.src = '';
    previewBox.classList.add('hidden');
  }
}

function handleThemeWallpaperPick(e) {
  const file = e.target.files && e.target.files[0];
  if (!file) return;
  if (!file.type.startsWith('image/')) return showToast('Pilih file gambar.', 'error');

  setLoading(true, 'Menyiapkan wallpaper...');
  compressImage(file, 1440, 0.78)
    .then(({ base64 }) => {
      state.themeWallpaperDraft = base64;
      state.themeClearWallpaper = false;
      document.getElementById('themeWallpaperPreviewImg').src = base64;
      document.getElementById('themeWallpaperPreviewBox').classList.remove('hidden');
    })
    .catch(() => showToast('Gagal memproses gambar wallpaper.', 'error'))
    .finally(() => {
      setLoading(false);
      e.target.value = '';
    });
}

async function saveAppTheme() {
  setLoading(true, 'Menerapkan tema ke seluruh HP...');
  try {
    const res = await apiCall({
      action: 'saveAppTheme',
      preset: state.themeDraftPreset,
      bannerText: document.getElementById('themeBannerInput').value.trim(),
      wallpaperBase64: state.themeWallpaperDraft,
      clearWallpaper: state.themeClearWallpaper
    }, 45000);
    applyAppTheme(res.theme);
    syncThemeControls();
    showToast(res.message || 'Tema berhasil diterapkan!', 'success');
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    setLoading(false);
  }
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
      throw new Error('Respon server tidak valid. Pastikan Web App Apps Script sudah di-deploy.');
    }

    if (data.theme) applyAppTheme(data.theme);

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
    if (res.theme) applyAppTheme(res.theme);

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
  if (stores) state.stores = stores;
  localStorage.setItem('momoyo_token', token);
  localStorage.setItem('momoyo_user', JSON.stringify(user));
  if (stores) localStorage.setItem('momoyo_stores', JSON.stringify(state.stores));
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

/* ======================== ENTER APP, PROFIL & NAVIGASI ======================== */

function enterApp() {
  state.stores = state.stores.length ? state.stores : JSON.parse(localStorage.getItem('momoyo_stores') || '[]');
  const isAdmin = state.user.role === 'ADMIN';

  document.getElementById('loginView').classList.add('hidden');
  document.getElementById('appShell').classList.remove('hidden');

  renderHeaderUser();

  document.querySelectorAll('.admin-only').forEach((el) => {
    el.classList.toggle('hidden', !isAdmin);
  });

  setupAbsenForm();
  buildBottomNav(isAdmin);
  refreshMyProfileSilently();

  if (isAdmin) {
    populateFilterStores();
    switchView('viewDashboard');
  } else {
    switchView('viewAbsen');
  }
}

function renderHeaderUser() {
  const isAdmin = state.user.role === 'ADMIN';
  renderAvatar(document.getElementById('headerAvatar'), state.user.fotoProfil, state.user.nama);
  document.getElementById('headerName').textContent = state.user.nama;
  if (isAdmin) {
    document.getElementById('headerRoleStore').textContent = 'Administrator • Semua Cabang';
  } else {
    const pos = state.user.posisi || 'Crew';
    const areaTxt = state.user.area ? ` • ${state.user.area}` : '';
    document.getElementById('headerRoleStore').textContent = `${pos} • ${state.user.toko}${areaTxt}`;
  }
}

function renderAvatar(el, fotoUrl, nama) {
  if (!el) return;
  const initial = (nama || 'M').trim()[0].toUpperCase();
  if (fotoUrl) {
    el.innerHTML = `<img src="${esc(toDisplayImageUrl(fotoUrl))}" alt="${esc(nama)}" onerror="this.remove();this.parentNode.textContent='${esc(initial)}';" />`;
  } else {
    el.textContent = initial;
  }
}

async function refreshMyProfileSilently() {
  try {
    const res = await apiCall({ action: 'getMyProfile' });
    if (res.user) {
      state.user = res.user;
      localStorage.setItem('momoyo_user', JSON.stringify(res.user));
      renderHeaderUser();
    }
  } catch {}
}

async function openProfileModal() {
  await refreshMyProfileSilently();
  const u = state.user;
  const isAdmin = u.role === 'ADMIN';

  renderAvatar(document.getElementById('profileAvatarLg'), u.fotoProfil, u.nama);
  document.getElementById('profileNameLg').textContent = u.nama;
  document.getElementById('profileSubLg').textContent = isAdmin
    ? 'Administrator MOMOYO'
    : `${u.posisi || 'CREW'} • ${u.toko}`;

  const detailEl = document.getElementById('profileDetails');
  if (isAdmin) {
    detailEl.innerHTML = `
      <div class="detail-row"><span>Peran</span><strong>Admin (Akses Penuh)</strong></div>
      <div class="detail-row"><span>Cakupan</span><strong>Semua Cabang Toko</strong></div>
    `;
  } else {
    detailEl.innerHTML = `
      <div class="detail-row"><span>ID Crew</span><strong>${esc(u.crewId || '-')}</strong></div>
      <div class="detail-row"><span>Cabang Toko</span><strong>${esc(u.toko || '-')}</strong></div>
      <div class="detail-row"><span>Area</span><strong>${esc(u.area || '-')}</strong></div>
      <div class="detail-row"><span>Posisi</span><strong>${esc(u.posisi || 'CREW')}</strong></div>
      <div class="detail-row"><span>Shift Utama</span><strong>${esc(u.shiftDefault || 'PAGI')}</strong></div>
      <div class="detail-row"><span>No. Telepon Aktif</span><strong>${esc(u.noTelp || '-')}</strong></div>
    `;
  }

  document.getElementById('adminProfileEditBox').classList.toggle('hidden', !isAdmin);
  document.getElementById('crewProfileReadOnlyNote').classList.toggle('hidden', isAdmin);
  openModal('modalProfile');
}

function handleAdminPhotoPick(e) {
  const file = e.target.files && e.target.files[0];
  if (!file) return;
  setLoading(true, 'Mengunggah foto profil Admin...');
  compressImage(file, 450, 0.8)
    .then(({ base64 }) => apiCall({ action: 'updateAdminProfile', photoBase64: base64 }))
    .then((res) => {
      state.user.fotoProfil = res.fotoProfil || '';
      localStorage.setItem('momoyo_user', JSON.stringify(state.user));
      renderHeaderUser();
      renderAvatar(document.getElementById('profileAvatarLg'), state.user.fotoProfil, state.user.nama);
      showToast('Foto profil Admin diperbarui!', 'success');
    })
    .catch((err) => showToast(err.message, 'error'))
    .finally(() => {
      setLoading(false);
      e.target.value = '';
    });
}

async function clearAdminPhoto() {
  setLoading(true, 'Menghapus foto profil...');
  try {
    await apiCall({ action: 'updateAdminProfile', clearPhoto: true });
    state.user.fotoProfil = '';
    localStorage.setItem('momoyo_user', JSON.stringify(state.user));
    renderHeaderUser();
    renderAvatar(document.getElementById('profileAvatarLg'), '', state.user.nama);
    showToast('Foto profil dihapus.', 'success');
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    setLoading(false);
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
        { view: 'viewRiwayat', icon: '📅', label: 'Kalender Saya' },
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

  if (viewId === 'viewRiwayat') {
    if (state.user.role === 'ADMIN') loadHistory();
    else loadCrewCalendar();
  }
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

  updateShiftOptionLabels();

  const defShift = normalizeShift(state.user.shiftDefault || '');
  if (defShift === 'FULL DAY') {
    shiftSel.value = 'FULL DAY';
  } else {
    const hour = new Date().getHours();
    shiftSel.value = hour < 13 ? 'PAGI' : 'SIANG';
  }

  updateGpsHint();
}

function updateShiftOptionLabels() {
  const toko = document.getElementById('absenToko').value;
  const st = state.stores.find((s) => s.nama.toUpperCase() === toko.toUpperCase()) || {};
  const pagi = `${st.pagiMulai || '08:00'}–${st.pagiSelesai || '16:00'}`;
  const siang = `${st.siangMulai || '14:00'}–${st.siangSelesai || '22:00'}`;
  const fd = `${st.fullDayMulai || st.pagiMulai || '08:00'}–${st.fullDaySelesai || st.siangSelesai || '22:00'}`;

  const shiftSel = document.getElementById('absenShift');
  const prev = shiftSel.value || 'PAGI';
  shiftSel.innerHTML = `
    <option value="PAGI">Shift Pagi (${pagi})</option>
    <option value="SIANG">Shift Siang (${siang})</option>
    <option value="FULL DAY">Full Day (${fd})</option>
  `;
  shiftSel.value = prev;
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
    .catch(() => showToast('Gagal memproses foto. Coba pilih ulang foto.', 'error'))
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
        canvas.getContext('2d').drawImage(img, 0, 0, width, height);
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

/* ======================== RIWAYAT CREW: MODE KALENDER 1 BULAN ======================== */

async function loadCrewCalendar() {
  document.getElementById('riwayatPageTitle').textContent = 'Kalender Absensi Saya';
  document.getElementById('crewCalendarContainer').classList.remove('hidden');
  document.getElementById('adminHistoryContainer').classList.add('hidden');

  const y = state.calYear;
  const m = state.calMonth;
  const daysInMonth = new Date(y, m, 0).getDate();
  const startDate = `${y}-${pad2(m)}-01`;
  const endDate = `${y}-${pad2(m)}-${pad2(daysInMonth)}`;

  document.getElementById('calMonthLabel').textContent = `${BULAN_ID[m - 1]} ${y}`;
  document.getElementById('crewCalendarGrid').innerHTML = '<div class="empty-state" style="grid-column:1/-1">Memuat kalender...</div>';

  try {
    const res = await apiCall({ action: 'getHistory', filters: { startDate, endDate } });
    const records = res.records || [];

    const byDate = {};
    records.forEach((r) => {
      if (!r.dateKey) return;
      if (!byDate[r.dateKey]) byDate[r.dateKey] = [];
      byDate[r.dateKey].push(r);
    });
    state.calRecordsByDate = byDate;

    // Hitung ringkasan bulan ini
    let totalMasuk = 0;
    let pagi = 0;
    let siang = 0;
    let fullDay = 0;
    Object.keys(byDate).forEach((dk) => {
      const masuk = byDate[dk].find((r) => r.jenis === 'MASUK');
      if (masuk) {
        totalMasuk++;
        const sh = normalizeShift(masuk.shift);
        if (sh === 'PAGI') pagi++;
        else if (sh === 'SIANG') siang++;
        else if (sh === 'FULL DAY') fullDay++;
      }
    });

    document.getElementById('calTotalMasuk').textContent = `${totalMasuk} hari`;
    document.getElementById('calTotalPagi').textContent = `${pagi}x`;
    document.getElementById('calTotalSiang').textContent = `${siang}x`;
    document.getElementById('calTotalFullDay').textContent = `${fullDay}x`;

    renderCrewCalendarGrid(y, m, daysInMonth, byDate);

    // Pilih otomatis hari ini (jika bulan ini) atau tanggal terakhir yang ada absen
    const todayKey = `${nowInit.getFullYear()}-${pad2(nowInit.getMonth() + 1)}-${pad2(nowInit.getDate())}`;
    const attendedKeys = Object.keys(byDate).sort();
    if (todayKey.startsWith(`${y}-${pad2(m)}-`)) {
      selectCrewCalendarDay(todayKey);
    } else if (attendedKeys.length) {
      selectCrewCalendarDay(attendedKeys[attendedKeys.length - 1]);
    } else {
      state.calSelectedDate = '';
      document.getElementById('crewDayDetailTitle').textContent = `${BULAN_ID[m - 1]} ${y}`;
      document.getElementById('crewDayDetailBody').innerHTML = '<p class="subtitle">Belum ada catatan absensi pada bulan ini.</p>';
    }
  } catch (err) {
    document.getElementById('crewCalendarGrid').innerHTML = `<div class="empty-state" style="grid-column:1/-1">${esc(err.message)}</div>`;
  }
}

function renderCrewCalendarGrid(year, month, daysInMonth, byDate) {
  const firstWeekday = new Date(year, month - 1, 1).getDay(); // 0=Min..6=Sab
  const todayKey = `${nowInit.getFullYear()}-${pad2(nowInit.getMonth() + 1)}-${pad2(nowInit.getDate())}`;
  let html = '';

  for (let i = 0; i < firstWeekday; i++) {
    html += '<div class="cal-day empty"></div>';
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const dk = `${year}-${pad2(month)}-${pad2(day)}`;
    const list = byDate[dk] || [];
    const masuk = list.find((r) => r.jenis === 'MASUK');
    const pulang = list.find((r) => r.jenis === 'PULANG');

    let statusCls = '';
    let dotHtml = '';
    if (masuk) {
      if (masuk.isLate) {
        statusCls = 'has-late';
        dotHtml = '<span class="cal-dot-row"><i class="dot dot-late"></i></span>';
      } else if (pulang) {
        statusCls = 'has-ok';
        dotHtml = '<span class="cal-dot-row"><i class="dot dot-ok"></i></span>';
      } else {
        statusCls = 'has-warn';
        dotHtml = '<span class="cal-dot-row"><i class="dot dot-warn"></i></span>';
      }
    } else if (pulang) {
      statusCls = 'has-warn';
      dotHtml = '<span class="cal-dot-row"><i class="dot dot-warn"></i></span>';
    }

    const isToday = dk === todayKey ? 'today' : '';
    const isSel = dk === state.calSelectedDate ? 'selected' : '';

    html += `
      <button type="button" class="cal-day ${statusCls} ${isToday} ${isSel}" data-date="${dk}">
        <span>${day}</span>
        ${dotHtml}
      </button>
    `;
  }

  const grid = document.getElementById('crewCalendarGrid');
  grid.innerHTML = html;
  grid.querySelectorAll('.cal-day[data-date]').forEach((btn) => {
    btn.addEventListener('click', () => selectCrewCalendarDay(btn.dataset.date));
  });
}

function selectCrewCalendarDay(dateKey) {
  state.calSelectedDate = dateKey;
  document.querySelectorAll('#crewCalendarGrid .cal-day').forEach((btn) => {
    btn.classList.toggle('selected', btn.dataset.date === dateKey);
  });

  const parts = dateKey.split('-').map(Number);
  const dtObj = new Date(parts[0], parts[1] - 1, parts[2]);
  const titleStr = `${HARI_ID[dtObj.getDay()]}, ${parts[2]} ${BULAN_ID[parts[1] - 1]} ${parts[0]}`;
  document.getElementById('crewDayDetailTitle').textContent = titleStr;

  const list = state.calRecordsByDate[dateKey] || [];
  const bodyEl = document.getElementById('crewDayDetailBody');
  const totalBulanIni = document.getElementById('calTotalMasuk').textContent;

  if (!list.length) {
    bodyEl.innerHTML = `
      <div class="day-detail-box">
        <p class="subtitle">Tidak ada absensi pada tanggal ini.</p>
        <div class="detail-row mt-8"><span>Total Hari Masuk Bulan Ini</span><strong>${esc(totalBulanIni)}</strong></div>
      </div>
    `;
    return;
  }

  const masukList = list.filter((r) => r.jenis === 'MASUK');
  const pulangList = list.filter((r) => r.jenis === 'PULANG');
  const masuk = masukList[0] || null;
  const pulang = pulangList[pulangList.length - 1] || null;
  const shiftLabel = (masuk && masuk.shift) || (pulang && pulang.shift) || '-';
  const statusMasuk = masuk ? masuk.status : '-';
  const statusPulang = pulang ? pulang.status : 'Belum Absen Pulang';

  bodyEl.innerHTML = `
    <div class="day-detail-box">
      <div class="detail-grid" style="margin-top:0;padding:0;background:transparent">
        <div class="detail-row"><span>Shift</span><strong>${esc(shiftLabel)}</strong></div>
        <div class="detail-row"><span>Jam Masuk</span><strong>${masuk ? esc(masuk.jam) + ' WIB' : '-'}</strong></div>
        <div class="detail-row"><span>Status Masuk</span><strong>${esc(statusMasuk)}</strong></div>
        <div class="detail-row"><span>Jam Keluar</span><strong>${pulang ? esc(pulang.jam) + ' WIB' : 'Belum absen pulang'}</strong></div>
        <div class="detail-row"><span>Durasi / Status Pulang</span><strong>${esc(statusPulang)}</strong></div>
        <div class="detail-row"><span>Total Hari Masuk Bulan Ini</span><strong>${esc(totalBulanIni)}</strong></div>
      </div>
      <div class="photo-btn-row">
        ${masuk && masuk.foto
          ? `<button type="button" class="btn btn-outline btn-sm" onclick="previewPhoto('${esc(masuk.foto)}')">Lihat Foto Masuk</button>`
          : `<button type="button" class="btn btn-outline btn-sm" disabled>Foto Masuk (-)</button>`}
        ${pulang && pulang.foto
          ? `<button type="button" class="btn btn-soft btn-sm" onclick="previewPhoto('${esc(pulang.foto)}')">Lihat Foto Pulang</button>`
          : `<button type="button" class="btn btn-soft btn-sm" disabled>Foto Pulang (-)</button>`}
      </div>
    </div>
  `;
}

/* ======================== RIWAYAT ADMIN: DAFTAR & FILTER ======================== */

function populateFilterStores() {
  const sel = document.getElementById('filterToko');
  sel.innerHTML = '<option value="SEMUA">Semua Toko</option>' +
    state.stores.map((s) => `<option value="${esc(s.nama)}">${esc(s.nama)}</option>`).join('');
}

async function loadHistory() {
  document.getElementById('riwayatPageTitle').textContent = 'Riwayat Absensi';
  document.getElementById('crewCalendarContainer').classList.add('hidden');
  document.getElementById('adminHistoryContainer').classList.remove('hidden');

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

/* ======================== DASHBOARD ADMIN & DETAIL TOKO ======================== */

async function loadDashboard() {
  setLoading(true, 'Memuat dashboard...');
  try {
    const res = await apiCall({ action: 'getDashboard' });
    document.getElementById('dashDateLabel').textContent = res.serverDate;
    document.getElementById('kpiMasuk').textContent = res.summary.masuk;
    document.getElementById('kpiPulang').textContent = res.summary.pulang;
    document.getElementById('kpiBelumPulang').textContent = res.summary.belumPulangHariIni;
    document.getElementById('kpiTelat').textContent = res.summary.terlambat;

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

    // Tabel per toko — setiap baris bisa diklik ke Detail Crew Toko
    document.getElementById('dashStoreTable').innerHTML = (res.perStore || []).map((s) => `
      <tr class="clickable-row" onclick="openStoreDetail(decodeURIComponent('${encodeURIComponent(s.toko)}'))">
        <td><strong>${esc(s.toko)} &rsaquo;</strong></td>
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

  const primaryColor = (THEME_META[state.theme.preset] || THEME_META.default).color;

  const ctxStore = document.getElementById('chartPerStore').getContext('2d');
  state.charts.store = new Chart(ctxStore, {
    type: 'bar',
    data: {
      labels: perStore.map((s) => s.label),
      datasets: [
        { label: 'Masuk', data: perStore.map((s) => s.masuk), backgroundColor: primaryColor, borderRadius: 6 },
        { label: 'Pulang', data: perStore.map((s) => s.pulang), backgroundColor: '#3B82F6', borderRadius: 6 }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } },
      onHover: (evt, elements) => {
        if (evt.native && evt.native.target) {
          evt.native.target.style.cursor = elements.length ? 'pointer' : 'default';
        }
      },
      onClick: (evt, elements) => {
        if (elements.length > 0) {
          const idx = elements[0].index;
          const storeName = perStore[idx] && perStore[idx].label;
          if (storeName) openStoreDetail(storeName);
        }
      }
    }
  });

  const ctxDays = document.getElementById('chart7Days').getContext('2d');
  state.charts.days = new Chart(ctxDays, {
    type: 'line',
    data: {
      labels: days7.map((d) => d.label),
      datasets: [
        { label: 'Masuk', data: days7.map((d) => d.masuk), borderColor: primaryColor, backgroundColor: 'rgba(225,29,72,0.1)', tension: 0.35, fill: true },
        { label: 'Pulang', data: days7.map((d) => d.pulang), borderColor: '#059669', backgroundColor: 'rgba(5,150,105,0.08)', tension: 0.35, fill: true }
      ]
    },
    options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } } }
  });
}

window.openStoreDetail = function (toko) {
  state.activeStoreDetail = toko;
  document.getElementById('storeDetailTitle').textContent = `Detail Crew — ${toko}`;
  openModal('modalStoreDetail');
  loadStoreDetailData();
};

async function loadStoreDetailData() {
  if (!state.activeStoreDetail) return;
  const month = Number(document.getElementById('storeDetailMonth').value);
  const year = Number(document.getElementById('storeDetailYear').value);
  const listEl = document.getElementById('storeDetailList');
  listEl.innerHTML = '<div class="empty-state">Memuat detail crew toko...</div>';

  try {
    const res = await apiCall({
      action: 'getStoreDetail',
      toko: state.activeStoreDetail,
      month,
      year
    });
    document.getElementById('storeDetailPeriod').textContent = `Rekap Bulan ${res.monthName} ${res.year}`;
    const crews = res.crews || [];
    if (!crews.length) {
      listEl.innerHTML = '<div class="empty-state">Belum ada crew atau data absensi di toko ini.</div>';
      return;
    }

    listEl.innerHTML = crews.map((c) => {
      const initial = (c.nama || 'C')[0].toUpperCase();
      const avatarHtml = c.fotoProfil
        ? `<img src="${esc(toDisplayImageUrl(c.fotoProfil))}" alt="${esc(c.nama)}" />`
        : esc(initial);
      const metaParts = [c.posisi || 'CREW'];
      if (c.area && c.area !== '-') metaParts.push(c.area);
      if (c.noTelp && c.noTelp !== '-') metaParts.push(c.noTelp);

      return `
        <div class="crew-stat-card">
          <div class="crew-stat-header">
            <div class="crew-mini-avatar">${avatarHtml}</div>
            <div>
              <div class="record-title">${esc(c.nama)}</div>
              <div class="record-sub">${esc(metaParts.join(' • '))}</div>
            </div>
          </div>
          <div class="crew-stat-grid">
            <div class="crew-stat-pill">
              <span>Total Masuk</span>
              <strong class="text-primary">${c.totalMasuk}x</strong>
            </div>
            <div class="crew-stat-pill">
              <span>Pagi</span>
              <strong>${c.masukPagi}x</strong>
            </div>
            <div class="crew-stat-pill">
              <span>Siang</span>
              <strong>${c.masukSiang}x</strong>
            </div>
            <div class="crew-stat-pill">
              <span>Full Day</span>
              <strong>${c.masukFullDay}x</strong>
            </div>
            <div class="crew-stat-pill">
              <span>Total Telat</span>
              <strong class="${c.totalTelatMenit > 0 ? 'text-danger' : 'text-success'}">${c.totalTelatMenit} mnt</strong>
            </div>
          </div>
        </div>
      `;
    }).join('');
  } catch (err) {
    listEl.innerHTML = `<div class="empty-state">${esc(err.message)}</div>`;
  }
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
      <tr class="clickable-row" onclick="openStoreDetail(decodeURIComponent('${encodeURIComponent(s.toko)}'))">
        <td><strong>${esc(s.toko)} &rsaquo;</strong></td>
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

function initMonthYearSelectors() {
  const now = new Date();
  const curM = now.getMonth();
  const curY = now.getFullYear();
  const monthOpts = BULAN_ID.map((b, i) => `<option value="${i + 1}" ${i === curM ? 'selected' : ''}>${b}</option>`).join('');
  const yearOpts = [curY - 1, curY, curY + 1].map((y) => `<option value="${y}" ${y === curY ? 'selected' : ''}>${y}</option>`).join('');

  ['recapMonth', 'storeDetailMonth'].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = monthOpts;
  });
  ['recapYear', 'storeDetailYear'].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = yearOpts;
  });
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
      tbody.innerHTML = '<tr><td colspan="7" class="text-center">Tidak ada data absensi di bulan ini.</td></tr>';
      return;
    }
    tbody.innerHTML = res.recap.map((r) => `
      <tr>
        <td><strong>${esc(r.nama)}</strong></td>
        <td>${esc(r.toko)}</td>
        <td>${r.hariHadir}</td>
        <td>${r.masukPagi || 0} / ${r.masukSiang || 0} / ${r.masukFullDay || 0}</td>
        <td>${esc(r.totalJamFormatted)}</td>
        <td>${r.jumlahTerlambat} (${r.totalTelatMenit || 0}m)</td>
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
  const headers = [
    'Nama Crew', 'Toko', 'Hari Hadir', 'Masuk Pagi', 'Masuk Siang', 'Masuk Full Day',
    'Total Jam Kerja', 'Total Jam (Desimal)', 'Jumlah Terlambat', 'Total Telat (Menit)', 'Lupa Absen Pulang'
  ];
  const lines = [headers.join(',')];
  state.lastRecap.recap.forEach((r) => {
    lines.push([
      `"${r.nama}"`, `"${r.toko}"`, r.hariHadir, r.masukPagi || 0, r.masukSiang || 0, r.masukFullDay || 0,
      `"${r.totalJamFormatted}"`, r.totalJamDesimal, r.jumlahTerlambat, r.totalTelatMenit || 0, r.lupaAbsenPulang
    ].join(','));
  });
  const blob = new Blob(['\uFEFF' + lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `Rekap_Gaji_MOMOYO_${state.lastRecap.monthName}_${state.lastRecap.year}.csv`;
  a.click();
  URL.revokeObjectURL(a.href);
}

/* ======================== EDIT & HAPUS ABSENSI (ADMIN) ======================== */

window.previewPhoto = function (url) {
  document.getElementById('modalPhotoImg').src = toDisplayImageUrl(url);
  document.getElementById('modalPhotoLink').href = url;
  openModal('modalPhoto');
};

window.openEditModal = function (encoded) {
  const r = JSON.parse(decodeURIComponent(encoded));
  document.getElementById('editRowNumber').value = r.rowNumber;
  document.getElementById('editRecordId').value = r.id || '';
  document.getElementById('editJenis').value = r.jenis === 'PULANG' ? 'PULANG' : 'MASUK';
  const normShift = normalizeShift(r.shift);
  document.getElementById('editShift').value = ['PAGI', 'SIANG', 'FULL DAY'].includes(normShift) ? normShift : 'PAGI';
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

/* ======================== KELOLA MASTER (ADMIN ONLY) ======================== */

async function loadMasterData() {
  setLoading(true, 'Memuat data master...');
  try {
    const res = await apiCall({ action: 'getMasterData' });
    state.stores = res.stores || [];
    state.crews = res.crews || [];
    localStorage.setItem('momoyo_stores', JSON.stringify(state.stores));
    populateFilterStores();
    syncThemeControls();

    const crewEl = document.getElementById('manageCrewList');
    crewEl.innerHTML = state.crews.map((c) => {
      const enc = encodeURIComponent(JSON.stringify(c));
      const initial = (c.nama || 'C')[0].toUpperCase();
      const avatarHtml = c.fotoProfil
        ? `<img src="${esc(toDisplayImageUrl(c.fotoProfil))}" alt="${esc(c.nama)}" />`
        : esc(initial);
      const subParts = [c.toko, `Shift ${c.shiftDefault}`];
      if (c.posisi) subParts.push(c.posisi);
      if (c.area) subParts.push(c.area);

      return `
        <div class="record-card">
          <div class="record-top">
            <div style="display:flex;align-items:center;gap:10px">
              <div class="crew-mini-avatar">${avatarHtml}</div>
              <div>
                <div class="record-title">${esc(c.nama)}</div>
                <div class="record-sub">${esc(subParts.join(' • '))}</div>
                ${c.noTelp ? `<div class="record-sub">Telp: ${esc(c.noTelp)}</div>` : ''}
              </div>
            </div>
            <span class="badge ${c.aktif ? 'badge-masuk' : 'badge-neutral'}">${c.aktif ? 'Aktif' : 'Nonaktif'}</span>
          </div>
          <div class="record-bottom">
            <span class="record-sub">ID: ${esc(c.id)}</span>
            <div class="record-actions">
              <button type="button" class="btn-ghost-sm" onclick="openCrewModal('${enc}')">Edit / Profil &amp; PIN</button>
              <button type="button" class="btn-ghost-sm text-danger" onclick="askDeleteCrew('${esc(c.id)}', '${esc(c.nama)}')">Hapus</button>
            </div>
          </div>
        </div>
      `;
    }).join('') || '<div class="empty-state">Belum ada data crew.</div>';

    const storeEl = document.getElementById('manageStoreList');
    storeEl.innerHTML = state.stores.map((s) => {
      const enc = encodeURIComponent(JSON.stringify(s));
      return `
        <div class="record-card">
          <div class="record-top">
            <div>
              <div class="record-title">${esc(s.nama)}</div>
              <div class="record-sub">Pagi ${s.pagiMulai}–${s.pagiSelesai} | Siang ${s.siangMulai}–${s.siangSelesai} | Full Day ${s.fullDayMulai || s.pagiMulai}–${s.fullDaySelesai || s.siangSelesai}</div>
              <div class="record-sub">Toleransi telat: ${s.toleransi} menit</div>
            </div>
            <span class="badge ${s.wajibGps ? 'badge-masuk' : 'badge-neutral'}">${s.wajibGps ? 'GPS Aktif' : 'GPS Off'}</span>
          </div>
          <div class="record-bottom">
            <span class="record-sub">${s.wajibGps ? `Radius ${s.radius}m` : 'Absen fleksibel'}</span>
            <div class="record-actions">
              <button type="button" class="btn-ghost-sm" onclick="openStoreModal('${enc}')">Edit</button>
              <button type="button" class="btn-ghost-sm text-danger" onclick="askDeleteStore(decodeURIComponent('${encodeURIComponent(s.nama)}'))">Hapus</button>
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

  state.crewPhotoDraft = '';
  state.crewClearPhoto = false;

  const curPinGroup = document.getElementById('crewCurrentPinGroup');
  const curPinInput = document.getElementById('crewCurrentPinDisplay');
  const toggleBtn = document.getElementById('btnToggleCurrentPin');
  const photoPrev = document.getElementById('crewPhotoPreview');
  const clearPhotoBtn = document.getElementById('btnClearCrewPhoto');

  if (encoded) {
    const c = JSON.parse(decodeURIComponent(encoded));
    document.getElementById('modalCrewTitle').textContent = 'Edit Crew / Profil & PIN';
    document.getElementById('crewIdInput').value = c.id;
    document.getElementById('crewNamaInput').value = c.nama;
    tokoSel.value = c.toko;
    document.getElementById('crewShiftInput').value = normalizeShift(c.shiftDefault || 'PAGI');
    document.getElementById('crewAreaInput').value = c.area || '';
    document.getElementById('crewPosisiInput').value = c.posisi || 'CREW';
    document.getElementById('crewTelpInput').value = c.noTelp || '';
    document.getElementById('crewPinInput').value = '';
    document.getElementById('crewAktifInput').checked = c.aktif;

    renderAvatar(photoPrev, c.fotoProfil, c.nama);
    clearPhotoBtn.classList.toggle('hidden', !c.fotoProfil);

    curPinGroup.classList.remove('hidden');
    if (c.currentPin) {
      curPinInput.type = 'password';
      curPinInput.value = c.currentPin;
      curPinInput.placeholder = '';
      toggleBtn.textContent = 'Lihat';
      toggleBtn.classList.remove('hidden');
    } else {
      curPinInput.type = 'text';
      curPinInput.value = '';
      curPinInput.placeholder = 'Belum tercatat (simpan PIN baru di bawah)';
      toggleBtn.classList.add('hidden');
    }
  } else {
    document.getElementById('modalCrewTitle').textContent = 'Tambah Crew Baru';
    document.getElementById('crewIdInput').value = '';
    document.getElementById('crewNamaInput').value = '';
    document.getElementById('crewShiftInput').value = 'PAGI';
    document.getElementById('crewAreaInput').value = '';
    document.getElementById('crewPosisiInput').value = 'CREW';
    document.getElementById('crewTelpInput').value = '';
    document.getElementById('crewPinInput').value = '';
    document.getElementById('crewAktifInput').checked = true;
    renderAvatar(photoPrev, '', 'C');
    clearPhotoBtn.classList.add('hidden');
    curPinGroup.classList.add('hidden');
  }
  openModal('modalCrew');
};

function handleCrewPhotoPick(e) {
  const file = e.target.files && e.target.files[0];
  if (!file) return;
  if (!file.type.startsWith('image/')) return showToast('Pilih file gambar.', 'error');

  setLoading(true, 'Menyiapkan foto profil...');
  compressImage(file, 450, 0.8)
    .then(({ base64 }) => {
      state.crewPhotoDraft = base64;
      state.crewClearPhoto = false;
      document.getElementById('crewPhotoPreview').innerHTML = `<img src="${base64}" alt="Pratinjau" />`;
      document.getElementById('btnClearCrewPhoto').classList.remove('hidden');
    })
    .catch(() => showToast('Gagal memproses foto profil.', 'error'))
    .finally(() => {
      setLoading(false);
      e.target.value = '';
    });
}

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
        area: document.getElementById('crewAreaInput').value,
        posisi: document.getElementById('crewPosisiInput').value,
        noTelp: document.getElementById('crewTelpInput').value.trim(),
        pin: document.getElementById('crewPinInput').value.trim(),
        aktif: document.getElementById('crewAktifInput').checked,
        photoBase64: state.crewPhotoDraft,
        clearPhoto: state.crewClearPhoto
      }
    }, 45000);
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
    document.getElementById('storeFullDayMulai').value = s.fullDayMulai || s.pagiMulai || '08:00';
    document.getElementById('storeFullDaySelesai').value = s.fullDaySelesai || s.siangSelesai || '22:00';
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
    document.getElementById('storeFullDayMulai').value = '08:00';
    document.getElementById('storeFullDaySelesai').value = '22:00';
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
        fullDayMulai: document.getElementById('storeFullDayMulai').value,
        fullDaySelesai: document.getElementById('storeFullDaySelesai').value,
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

  // Profil Header
  document.getElementById('btnOpenProfile').addEventListener('click', openProfileModal);
  document.getElementById('btnPickAdminPhoto').addEventListener('click', () => document.getElementById('inputAdminPhoto').click());
  document.getElementById('inputAdminPhoto').addEventListener('change', handleAdminPhotoPick);
  document.getElementById('btnClearAdminPhoto').addEventListener('click', clearAdminPhoto);

  // Form Absen
  document.querySelectorAll('#formAbsen .seg-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#formAbsen .seg-btn').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById('absenJenis').value = btn.dataset.jenis;
    });
  });

  document.getElementById('absenToko').addEventListener('change', () => {
    updateShiftOptionLabels();
    updateGpsHint();
  });
  document.getElementById('btnPickGallery').addEventListener('click', () => document.getElementById('inputFotoGaleri').click());
  document.getElementById('btnOpenCamera').addEventListener('click', () => document.getElementById('inputFotoKamera').click());
  document.getElementById('inputFotoGaleri').addEventListener('change', handlePhotoSelected);
  document.getElementById('inputFotoKamera').addEventListener('change', handlePhotoSelected);
  document.getElementById('btnRemovePhoto').addEventListener('click', clearPhoto);
  document.getElementById('formAbsen').addEventListener('submit', submitAttendance);
  document.getElementById('btnRetryAbsen').addEventListener('click', () => submitAttendance());

  // Kalender Crew Navigasi Bulan
  document.getElementById('btnCalPrev').addEventListener('click', () => {
    state.calMonth -= 1;
    if (state.calMonth < 1) { state.calMonth = 12; state.calYear -= 1; }
    loadCrewCalendar();
  });
  document.getElementById('btnCalNext').addEventListener('click', () => {
    state.calMonth += 1;
    if (state.calMonth > 12) { state.calMonth = 1; state.calYear += 1; }
    loadCrewCalendar();
  });

  // Riwayat & Dashboard
  document.getElementById('btnApplyFilter').addEventListener('click', loadHistory);
  document.getElementById('btnRefreshHistory').addEventListener('click', () => {
    if (state.user.role === 'ADMIN') loadHistory();
    else loadCrewCalendar();
  });
  document.getElementById('btnResetFilter').addEventListener('click', () => {
    document.getElementById('filterSearch').value = '';
    document.getElementById('filterToko').value = 'SEMUA';
    document.getElementById('filterShift').value = 'SEMUA';
    document.getElementById('filterStart').value = '';
    document.getElementById('filterEnd').value = '';
    loadHistory();
  });
  document.getElementById('btnRefreshDash').addEventListener('click', loadDashboard);
  document.getElementById('btnReloadStoreDetail').addEventListener('click', loadStoreDetailData);

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

  // Tema (Admin Kelola)
  document.querySelectorAll('#themePresetGrid .theme-chip').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.themeDraftPreset = btn.dataset.themePreset;
      document.querySelectorAll('#themePresetGrid .theme-chip').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });
  document.getElementById('btnPickThemeWallpaper').addEventListener('click', () => document.getElementById('inputThemeWallpaper').click());
  document.getElementById('inputThemeWallpaper').addEventListener('change', handleThemeWallpaperPick);
  document.getElementById('btnClearThemeWallpaper').addEventListener('click', () => {
    state.themeWallpaperDraft = '';
    state.themeClearWallpaper = true;
    document.getElementById('themeWallpaperPreviewImg').src = '';
    document.getElementById('themeWallpaperPreviewBox').classList.add('hidden');
    showToast('Wallpaper akan dihapus saat Anda klik Terapkan Tema.');
  });
  document.getElementById('btnSaveTheme').addEventListener('click', saveAppTheme);

  // Admin Modals & Kelola Crew/Toko
  document.getElementById('formEditRecord').addEventListener('submit', submitEditRecord);
  document.getElementById('btnConfirmDelete').addEventListener('click', confirmDeleteAction);
  document.getElementById('btnAddCrew').addEventListener('click', () => openCrewModal());
  document.getElementById('btnPickCrewPhoto').addEventListener('click', () => document.getElementById('inputCrewPhoto').click());
  document.getElementById('inputCrewPhoto').addEventListener('change', handleCrewPhotoPick);
  document.getElementById('btnClearCrewPhoto').addEventListener('click', () => {
    state.crewPhotoDraft = '';
    state.crewClearPhoto = true;
    const nm = document.getElementById('crewNamaInput').value || 'C';
    renderAvatar(document.getElementById('crewPhotoPreview'), '', nm);
    document.getElementById('btnClearCrewPhoto').classList.add('hidden');
  });
  document.getElementById('btnToggleCurrentPin').addEventListener('click', () => {
    const inp = document.getElementById('crewCurrentPinDisplay');
    const btn = document.getElementById('btnToggleCurrentPin');
    if (inp.type === 'password') {
      inp.type = 'text';
      btn.textContent = 'Tutup';
    } else {
      inp.type = 'password';
      btn.textContent = 'Lihat';
    }
  });
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

function normalizeShift(val) {
  const s = String(val || '').toUpperCase().trim().replace(/\s+/g, ' ');
  if (s === 'FULLDAY' || s === 'FULL DAY' || s === 'FULL') return 'FULL DAY';
  if (s === 'SIANG') return 'SIANG';
  if (s === 'PAGI') return 'PAGI';
  return s;
}

function toDisplayImageUrl(url) {
  const s = String(url || '').trim();
  const match = s.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (match && s.includes('drive.google.com') && !s.includes('thumbnail')) {
    return `https://drive.google.com/thumbnail?id=${match[1]}&sz=w1200`;
  }
  return s;
}

function pad2(n) { return n < 10 ? '0' + n : String(n); }

function esc(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

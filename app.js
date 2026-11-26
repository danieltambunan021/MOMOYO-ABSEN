/**
 * ============================================================
 * MOMOYO ABSENSI — FRONTEND APPLICATION v3.1 (PWA)
 * ============================================================
 * - Shift baku: Pagi, Siang, Full Day (tanpa Shift Utama di data karyawan).
 * - Posisi: Supervisor, Kepala Toko, Kepala Bakery, Crew Minuman, Crew Bakery, + Tambah Lainnya.
 * - Wallpaper responsif: slot terpisah HP (Auto-Portrait) & Laptop (Auto-Landscape).
 * - Istilah: Karyawan, Admin Only, Management Monitoring.
 * - Status Jadwal: Pagi, Siang, Full Day, Izin, Sakit, + Lainnya (khusus Admin Only).
 */
const API_URL = 'https://script.google.com/macros/s/AKfycbyrbl6vBqA1uatZYi2kEn6gv5AxwrB4LEnmEIwh5NW0DwCowh0so6uZOIbzV3F8wVeg/exec';

const HARI_ID = ['MINGGU', 'SENIN', 'SELASA', 'RABU', 'KAMIS', 'JUMAT', 'SABTU'];
const HARI_SHORT = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
const BULAN_ID = [
  'JANUARI', 'FEBRUARI', 'MARET', 'APRIL', 'MEI', 'JUNI',
  'JULI', 'AGUSTUS', 'SEPTEMBER', 'OKTOBER', 'NOVEMBER', 'DESEMBER'
];
const VALID_WORK_SHIFTS = ['PAGI', 'SIANG', 'FULL DAY'];
const PRESET_POSISI = [
  'Supervisor',
  'Kepala Toko',
  'Kepala Bakery',
  'Crew Minuman',
  'Crew Bakery'
];
const JADWAL_PRESET_OPTIONS = [
  { val: '', label: '-' },
  { val: 'PAGI', label: 'PAGI' },
  { val: 'SIANG', label: 'SIANG' },
  { val: 'FULL DAY', label: 'FULL DAY' },
  { val: 'IZIN', label: 'IZIN' },
  { val: 'SAKIT', label: 'SAKIT' },
  { val: '__CUSTOM__', label: '+ Lainnya...' }
];

const THEME_META = {
  default: { color: '#E11D48', icon: '✨' },
  lebaran: { color: '#047857', icon: '🌙' },
  natal: { color: '#B91C1C', icon: '🎄' },
  imlek: { color: '#B91C1C', icon: '🏮' },
  merdeka: { color: '#DC2626', icon: '🇮🇩' },
  custom: { color: '#E11D48', icon: '✨' }
};

const DEFAULT_GREETINGS = {
  masuk: 'SELAMAT BEKERJA',
  istirahat: 'SELAMAT ISTIRAHAT',
  pulang: 'PEKERJAAN SELESAI, HATI HATI DI JALAN'
};

const nowInit = new Date();

const state = {
  token: localStorage.getItem('momoyo_token') || '',
  user: JSON.parse(localStorage.getItem('momoyo_user') || 'null'),
  theme: JSON.parse(localStorage.getItem('momoyo_theme') || '{"preset":"default","bannerText":"","customBgUrl":"","customBgMobileUrl":"","customBgDesktopUrl":""}'),
  greetings: JSON.parse(localStorage.getItem('momoyo_greetings') || JSON.stringify(DEFAULT_GREETINGS)),
  todaySchedule: null,
  publicStores: [],
  publicCrews: [],
  stores: [],
  crews: [],
  photoBase64: '',
  pendingDelete: null,
  lastRecap: null,
  charts: { store: null, days: null },
  deferredInstallPrompt: null,
  // Sinkronisasi jam server & istirahat live
  serverOffsetMs: 0,
  myBreak: null,
  storeBreaks: [],
  dashActiveBreaks: [],
  // Riwayat & Galeri Foto
  historyRecords: [],
  historyMode: 'list',
  // Kalender Karyawan Pribadi
  calYear: nowInit.getFullYear(),
  calMonth: nowInit.getMonth() + 1,
  calRecordsByDate: {},
  calSchedulesByDate: {},
  calSelectedDate: '',
  // Modal Detail Toko & Modal DETAILS Kalender Karyawan
  activeStoreDetail: '',
  adminCalTarget: null,
  adminCalYear: nowInit.getFullYear(),
  adminCalMonth: nowInit.getMonth() + 1,
  adminCalRecordsByDate: {},
  adminCalSchedulesByDate: {},
  adminCalSelectedDate: '',
  // Jadwal Shift Matrix per Toko
  jadwalStore: '',
  jadwalCrews: [],
  jadwalMap: {},
  jadwalDirty: {},
  jadwalBkoPending: null,
  // Draft Upload Foto Karyawan (Admin Modal)
  crewPhotoDraft: '',
  crewClearPhoto: false,
  // Draft Tema & Dual Wallpaper (Admin Kelola)
  themeDraftPreset: 'default',
  themeWallpaperMobileDraft: '',
  themeClearWallpaperMobile: false,
  themeWallpaperDesktopDraft: '',
  themeClearWallpaperDesktop: false
};

// State Crop & Zoom Foto Profil
const cropper = {
  img: null,
  baseScale: 1,
  zoom: 1,
  offsetX: 0,
  offsetY: 0,
  dragging: false,
  startX: 0,
  startY: 0,
  onDone: null
};

/* ======================== INISIALISASI ======================== */

document.addEventListener('DOMContentLoaded', () => {
  applyAppTheme(state.theme);
  initServiceWorker();
  initPwaInstall();
  initOfflineIndicator();
  initClock();
  bindEvents();
  initCropperEvents();
  initMonthYearSelectors();

  const params = new URLSearchParams(window.location.search);
  const wantMonitor = params.has('monitoring') || window.location.hash === '#monitoring';

  if (state.token && state.user && state.user.role !== 'MONITORING') {
    enterApp();
  } else if (wantMonitor) {
    enterMonitoringMode();
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
    const now = new Date(Date.now() + state.serverOffsetMs);
    const hari = HARI_ID[now.getDay()];
    const tgl = now.getDate();
    const bln = BULAN_ID[now.getMonth()];
    const thn = now.getFullYear();
    const jam = `${pad2(now.getHours())}:${pad2(now.getMinutes())}:${pad2(now.getSeconds())}`;

    const dateEl = document.getElementById('liveDate');
    const clockEl = document.getElementById('liveClock');
    if (dateEl) dateEl.textContent = `${hari}, ${tgl} ${bln} ${thn}`;
    if (clockEl) clockEl.textContent = jam;

    tickAllBreakCountdowns();
  };
  render();
  setInterval(render, 1000);
}

/* ======================== TEMA, WALLPAPER RESPONSIF & UCAPAN DINAMIS ======================== */

function applyAppTheme(themeObj) {
  if (!themeObj) return;
  const preset = THEME_META[themeObj.preset] ? themeObj.preset : 'default';
  const bannerText = String(themeObj.bannerText || '').trim();
  const legacyUrl = String(themeObj.customBgUrl || '').trim();
  const customBgMobileUrl = themeObj.customBgMobileUrl !== undefined
    ? String(themeObj.customBgMobileUrl || '').trim()
    : legacyUrl;
  const customBgDesktopUrl = themeObj.customBgDesktopUrl !== undefined
    ? String(themeObj.customBgDesktopUrl || '').trim()
    : legacyUrl;

  state.theme = {
    preset,
    bannerText,
    customBgUrl: customBgDesktopUrl || customBgMobileUrl || '',
    customBgMobileUrl,
    customBgDesktopUrl
  };
  localStorage.setItem('momoyo_theme', JSON.stringify(state.theme));

  document.body.setAttribute('data-theme', preset);
  const metaTheme = document.querySelector('meta[name="theme-color"]');
  if (metaTheme) metaTheme.setAttribute('content', THEME_META[preset].color);

  const wallEl = document.getElementById('themeWallpaper');
  if (wallEl) {
    if (customBgMobileUrl || customBgDesktopUrl) {
      wallEl.classList.add('has-custom-img');
      wallEl.style.backgroundImage = '';
      if (customBgMobileUrl) {
        wallEl.style.setProperty('--wp-mobile', `url("${customBgMobileUrl}")`);
      } else {
        wallEl.style.removeProperty('--wp-mobile');
      }
      if (customBgDesktopUrl) {
        wallEl.style.setProperty('--wp-desktop', `url("${customBgDesktopUrl}")`);
      } else {
        wallEl.style.removeProperty('--wp-desktop');
      }
    } else {
      wallEl.classList.remove('has-custom-img');
      wallEl.style.removeProperty('--wp-mobile');
      wallEl.style.removeProperty('--wp-desktop');
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

function applyGreetings(gObj) {
  if (!gObj) return;
  state.greetings = {
    masuk: String(gObj.masuk || DEFAULT_GREETINGS.masuk).trim(),
    istirahat: String(gObj.istirahat || DEFAULT_GREETINGS.istirahat).trim(),
    pulang: String(gObj.pulang || DEFAULT_GREETINGS.pulang).trim()
  };
  localStorage.setItem('momoyo_greetings', JSON.stringify(state.greetings));
  updateAbsenGreetingDisplay();
  syncGreetingInputs();
}

function updateAbsenGreetingDisplay() {
  const el = document.getElementById('absenGreetingText');
  if (!el) return;
  const jenis = (document.getElementById('absenJenis')?.value || 'MASUK').toUpperCase();
  if (jenis === 'ISTIRAHAT') el.textContent = state.greetings.istirahat || DEFAULT_GREETINGS.istirahat;
  else if (jenis === 'PULANG') el.textContent = state.greetings.pulang || DEFAULT_GREETINGS.pulang;
  else el.textContent = state.greetings.masuk || DEFAULT_GREETINGS.masuk;
}

function syncGreetingInputs() {
  const m = document.getElementById('greetMasukInput');
  const i = document.getElementById('greetIstirahatInput');
  const p = document.getElementById('greetPulangInput');
  if (m) m.value = state.greetings.masuk || DEFAULT_GREETINGS.masuk;
  if (i) i.value = state.greetings.istirahat || DEFAULT_GREETINGS.istirahat;
  if (p) p.value = state.greetings.pulang || DEFAULT_GREETINGS.pulang;
}

async function saveAbsenGreetings(e) {
  e.preventDefault();
  setLoading(true, 'Menyimpan teks ucapan...');
  try {
    const res = await apiCall({
      action: 'saveAbsenGreetings',
      masuk: document.getElementById('greetMasukInput').value.trim(),
      istirahat: document.getElementById('greetIstirahatInput').value.trim(),
      pulang: document.getElementById('greetPulangInput').value.trim()
    });
    applyGreetings(res.greetings);
    showToast(res.message || 'Teks ucapan diperbarui!', 'success');
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    setLoading(false);
  }
}

function syncThemeControls() {
  state.themeDraftPreset = state.theme.preset || 'default';
  state.themeWallpaperMobileDraft = '';
  state.themeClearWallpaperMobile = false;
  state.themeWallpaperDesktopDraft = '';
  state.themeClearWallpaperDesktop = false;

  document.querySelectorAll('#themePresetGrid .theme-chip').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.themePreset === state.themeDraftPreset);
  });
  document.getElementById('themeBannerInput').value = state.theme.bannerText || '';

  const mobBox = document.getElementById('wallpaperMobilePreviewBox');
  const mobImg = document.getElementById('wallpaperMobilePreviewImg');
  if (state.theme.customBgMobileUrl) {
    mobImg.src = state.theme.customBgMobileUrl;
    mobBox.classList.remove('hidden');
  } else {
    mobImg.src = '';
    mobBox.classList.add('hidden');
  }

  const deskBox = document.getElementById('wallpaperDesktopPreviewBox');
  const deskImg = document.getElementById('wallpaperDesktopPreviewImg');
  if (state.theme.customBgDesktopUrl) {
    deskImg.src = state.theme.customBgDesktopUrl;
    deskBox.classList.remove('hidden');
  } else {
    deskImg.src = '';
    deskBox.classList.add('hidden');
  }
}

function handleWallpaperSlotPick(e, target) {
  const file = e.target.files && e.target.files[0];
  e.target.value = '';
  if (!file) return;
  if (!file.type.startsWith('image/')) return showToast('Pilih file gambar.', 'error');

  setLoading(true, target === 'mobile' ? 'Menyiapkan wallpaper HP...' : 'Menyiapkan wallpaper Laptop...');
  const maxDim = target === 'mobile' ? 1280 : 1600;
  compressImage(file, maxDim, 0.8)
    .then(({ base64 }) => {
      if (target === 'mobile') {
        state.themeWallpaperMobileDraft = base64;
        state.themeClearWallpaperMobile = false;
        document.getElementById('wallpaperMobilePreviewImg').src = base64;
        document.getElementById('wallpaperMobilePreviewBox').classList.remove('hidden');
      } else {
        state.themeWallpaperDesktopDraft = base64;
        state.themeClearWallpaperDesktop = false;
        document.getElementById('wallpaperDesktopPreviewImg').src = base64;
        document.getElementById('wallpaperDesktopPreviewBox').classList.remove('hidden');
      }
    })
    .catch(() => showToast('Gagal memproses gambar wallpaper.', 'error'))
    .finally(() => setLoading(false));
}

async function saveAppTheme() {
  setLoading(true, 'Menerapkan tema & wallpaper ke semua perangkat...');
  try {
    const res = await apiCall({
      action: 'saveAppTheme',
      preset: state.themeDraftPreset,
      bannerText: document.getElementById('themeBannerInput').value.trim(),
      wallpaperMobileBase64: state.themeWallpaperMobileDraft,
      clearWallpaperMobile: state.themeClearWallpaperMobile,
      wallpaperDesktopBase64: state.themeWallpaperDesktopDraft,
      clearWallpaperDesktop: state.themeClearWallpaperDesktop
    }, 55000);
    applyAppTheme(res.theme);
    syncThemeControls();
    showToast(res.message || 'Tema & wallpaper berhasil diterapkan!', 'success');
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    setLoading(false);
  }
}

/* ======================== API HELPER ======================== */

async function apiCall(payload, timeoutMs = 35000) {
  if (!navigator.onLine) {
    throw new Error('Tidak ada koneksi internet. Periksa jaringan Anda.');
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
    if (data.greetings) applyGreetings(data.greetings);
    if (data.serverNowMs) state.serverOffsetMs = data.serverNowMs - Date.now();

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

/* ======================== AUTH, LOGIN & MANAGEMENT MONITORING ======================== */

async function loadPublicInit() {
  try {
    const res = await apiCall({ action: 'getPublicInit' });
    state.publicStores = res.stores || [];
    state.publicCrews = res.crews || [];
    if (res.stores) state.stores = res.stores;

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
    crewSelect.innerHTML = '<option value="">Belum ada karyawan di toko ini</option>';
    return;
  }
  crewSelect.innerHTML = '<option value="">-- Pilih Nama Anda --</option>' +
    filtered.map((c) => `<option value="${esc(c.id)}">${esc(c.nama)}</option>`).join('');
}

async function handleLoginCrew(e) {
  e.preventDefault();
  const crewId = document.getElementById('loginCrew').value;
  const pin = document.getElementById('loginPin').value.trim();
  if (!crewId || !pin) return showToast('Pilih nama karyawan dan masukkan PIN.', 'error');

  setLoading(true, 'Memverifikasi PIN...');
  try {
    const res = await apiCall({ action: 'login', role: 'CREW', crewId, pin });
    state.todaySchedule = res.todaySchedule || null;
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
  if (!password) return showToast('Masukkan password Admin Only.', 'error');

  setLoading(true, 'Masuk sebagai Admin Only...');
  try {
    const res = await apiCall({ action: 'login', role: 'ADMIN', password });
    state.todaySchedule = null;
    saveSession(res.token, res.user, res.stores);
    document.getElementById('loginAdminPass').value = '';
    enterApp();
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    setLoading(false);
  }
}

function enterMonitoringMode() {
  state.token = '';
  state.user = {
    role: 'MONITORING',
    crewId: 'MONITOR',
    nama: 'Management Monitoring',
    toko: 'SEMUA',
    posisi: 'Mode Pantau (Read-Only)',
    fotoProfil: ''
  };
  state.todaySchedule = null;
  enterApp();
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
  if (state.user && state.user.role === 'MONITORING') {
    handleForceLogout('');
    return;
  }
  try { await apiCall({ action: 'logout' }); } catch {}
  handleForceLogout('Berhasil keluar.');
}

function handleForceLogout(msg) {
  state.token = '';
  state.user = null;
  state.todaySchedule = null;
  state.myBreak = null;
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
  const role = state.user.role;
  const isAdmin = role === 'ADMIN';
  const isMonitor = role === 'MONITORING';

  document.getElementById('loginView').classList.add('hidden');
  document.getElementById('appShell').classList.remove('hidden');

  renderHeaderUser();
  document.getElementById('btnLogout').textContent = isMonitor ? 'Login' : 'Keluar';

  document.querySelectorAll('.admin-only').forEach((el) => {
    el.classList.toggle('hidden', !isAdmin);
  });

  populateFilterStores();
  buildBottomNav(role);

  if (isAdmin) {
    setupAbsenForm();
    refreshMyProfileSilently();
    switchView('viewDashboard');
  } else if (isMonitor) {
    switchView('viewDashboard');
  } else {
    setupAbsenForm();
    refreshMyProfileSilently();
    switchView('viewAbsen');
  }
}

function renderHeaderUser() {
  const role = state.user.role;
  renderAvatar(document.getElementById('headerAvatar'), state.user.fotoProfil, state.user.nama);
  document.getElementById('headerName').textContent = state.user.nama;
  if (role === 'ADMIN') {
    document.getElementById('headerRoleStore').textContent = `${state.user.posisi || 'Administrasi'} • Admin Only`;
  } else if (role === 'MONITORING') {
    document.getElementById('headerRoleStore').textContent = 'Pantauan Live • Hanya Lihat';
  } else {
    const pos = state.user.posisi || 'Karyawan';
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
  if (!state.user || state.user.role === 'MONITORING') return;
  try {
    const res = await apiCall({ action: 'getMyProfile' });
    if (res.user) {
      state.user = res.user;
      localStorage.setItem('momoyo_user', JSON.stringify(res.user));
      renderHeaderUser();
    }
    if (res.todaySchedule !== undefined) {
      state.todaySchedule = res.todaySchedule;
      applyTodayScheduleToForm();
    }
  } catch {}
}

async function openProfileModal() {
  if (!state.user || state.user.role === 'MONITORING') {
    showToast('Mode Management Monitoring hanya untuk memantau (Read-Only).');
    return;
  }

  await refreshMyProfileSilently();
  const u = state.user;
  const isAdmin = u.role === 'ADMIN';

  renderAvatar(document.getElementById('profileAvatarLg'), u.fotoProfil, u.nama);
  document.getElementById('profileNameLg').textContent = u.nama;
  document.getElementById('profileSubLg').textContent = isAdmin
    ? `${u.posisi || 'Administrasi'} • Admin Only`
    : `${u.posisi || 'Karyawan'} • ${u.toko}`;

  const detailEl = document.getElementById('profileDetails');
  const formAdmin = document.getElementById('formAdminProfile');
  const crewNote = document.getElementById('crewProfileReadOnlyNote');

  if (isAdmin) {
    detailEl.classList.add('hidden');
    crewNote.classList.add('hidden');
    formAdmin.classList.remove('hidden');
    document.getElementById('adminProfNama').value = u.nama || 'Admin MOMOYO';
    document.getElementById('adminProfPosisi').value = u.posisi || 'Administrasi';
    document.getElementById('adminProfTelp').value = u.noTelp || '';
  } else {
    formAdmin.classList.add('hidden');
    detailEl.classList.remove('hidden');
    crewNote.classList.remove('hidden');
    detailEl.innerHTML = `
      <div class="detail-row"><span>ID Karyawan</span><strong>${esc(u.crewId || '-')}</strong></div>
      <div class="detail-row"><span>Cabang Toko</span><strong>${esc(u.toko || '-')}</strong></div>
      <div class="detail-row"><span>Area</span><strong>${esc(u.area || '-')}</strong></div>
      <div class="detail-row"><span>Posisi</span><strong>${esc(u.posisi || 'Karyawan')}</strong></div>
      <div class="detail-row"><span>No. Telepon Aktif</span><strong>${esc(u.noTelp || '-')}</strong></div>
    `;
  }

  openModal('modalProfile');
}

async function submitAdminProfileForm(e) {
  e.preventDefault();
  setLoading(true, 'Menyimpan profil Admin...');
  try {
    const res = await apiCall({
      action: 'updateAdminProfile',
      nama: document.getElementById('adminProfNama').value.trim(),
      posisi: document.getElementById('adminProfPosisi').value.trim(),
      noTelp: document.getElementById('adminProfTelp').value.trim()
    });
    if (res.user) {
      state.user = res.user;
      localStorage.setItem('momoyo_user', JSON.stringify(res.user));
      renderHeaderUser();
      document.getElementById('profileNameLg').textContent = res.user.nama;
      document.getElementById('profileSubLg').textContent = `${res.user.posisi || 'Administrasi'} • Admin Only`;
    }
    showToast(res.message || 'Profil Admin diperbarui!', 'success');
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    setLoading(false);
  }
}

function handleMyPhotoPick(e) {
  const file = e.target.files && e.target.files[0];
  e.target.value = '';
  if (!file) return;
  if (!file.type.startsWith('image/')) return showToast('Pilih file gambar.', 'error');

  openCropModalForFile(file, async (croppedBase64) => {
    setLoading(true, 'Mengunggah foto profil...');
    try {
      const res = await apiCall({
        action: 'updateMyPhoto',
        photoBase64: croppedBase64
      }, 45000);
      if (res.user) {
        state.user = res.user;
      } else {
        state.user.fotoProfil = res.fotoProfil || '';
      }
      localStorage.setItem('momoyo_user', JSON.stringify(state.user));
      renderHeaderUser();
      renderAvatar(document.getElementById('profileAvatarLg'), state.user.fotoProfil, state.user.nama);
      showToast(res.message || 'Foto profil diperbarui!', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  });
}

async function clearMyPhoto() {
  setLoading(true, 'Menghapus foto profil...');
  try {
    const res = await apiCall({ action: 'updateMyPhoto', clearPhoto: true });
    state.user.fotoProfil = '';
    if (res.user) state.user = res.user;
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

/* ======================== CROP & ZOOM FOTO PROFIL (ALA SOSMED) ======================== */

function openCropModalForFile(file, onDone) {
  const reader = new FileReader();
  reader.onload = (ev) => {
    const img = new Image();
    img.onload = () => {
      const canvasSize = 320;
      const baseScale = Math.max(canvasSize / img.width, canvasSize / img.height);
      cropper.img = img;
      cropper.baseScale = baseScale;
      cropper.zoom = 1;
      cropper.offsetX = 0;
      cropper.offsetY = 0;
      cropper.onDone = onDone;

      const slider = document.getElementById('cropZoomSlider');
      slider.value = '1';
      document.getElementById('cropZoomVal').textContent = '1.0x';
      drawCropCanvas();
      openModal('modalCropPhoto');
    };
    img.onerror = () => showToast('Gagal memuat gambar.', 'error');
    img.src = ev.target.result;
  };
  reader.readAsDataURL(file);
}

function clampCropOffsets() {
  if (!cropper.img) return;
  const size = 320;
  const drawW = cropper.img.width * cropper.baseScale * cropper.zoom;
  const drawH = cropper.img.height * cropper.baseScale * cropper.zoom;
  const maxX = Math.max(0, (drawW - size) / 2);
  const maxY = Math.max(0, (drawH - size) / 2);
  cropper.offsetX = Math.max(-maxX, Math.min(maxX, cropper.offsetX));
  cropper.offsetY = Math.max(-maxY, Math.min(maxY, cropper.offsetY));
}

function drawCropCanvas() {
  const canvas = document.getElementById('cropCanvas');
  if (!canvas || !cropper.img) return;
  clampCropOffsets();
  const ctx = canvas.getContext('2d');
  const size = canvas.width;
  ctx.clearRect(0, 0, size, size);
  ctx.fillStyle = '#0F172A';
  ctx.fillRect(0, 0, size, size);

  const drawW = cropper.img.width * cropper.baseScale * cropper.zoom;
  const drawH = cropper.img.height * cropper.baseScale * cropper.zoom;
  const x = (size - drawW) / 2 + cropper.offsetX;
  const y = (size - drawH) / 2 + cropper.offsetY;
  ctx.drawImage(cropper.img, x, y, drawW, drawH);
}

function exportCroppedBase64() {
  const out = document.createElement('canvas');
  out.width = 400;
  out.height = 400;
  const ctx = out.getContext('2d');
  const ratio = out.width / 320;
  const drawW = cropper.img.width * cropper.baseScale * cropper.zoom * ratio;
  const drawH = cropper.img.height * cropper.baseScale * cropper.zoom * ratio;
  const x = (out.width - drawW) / 2 + cropper.offsetX * ratio;
  const y = (out.height - drawH) / 2 + cropper.offsetY * ratio;
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, out.width, out.height);
  ctx.drawImage(cropper.img, x, y, drawW, drawH);
  return out.toDataURL('image/jpeg', 0.85);
}

function initCropperEvents() {
  const stage = document.getElementById('cropStage');
  const slider = document.getElementById('cropZoomSlider');

  stage.addEventListener('pointerdown', (e) => {
    if (!cropper.img) return;
    cropper.dragging = true;
    cropper.startX = e.clientX;
    cropper.startY = e.clientY;
    stage.setPointerCapture(e.pointerId);
  });

  stage.addEventListener('pointermove', (e) => {
    if (!cropper.dragging) return;
    const rect = stage.getBoundingClientRect();
    const scaleFactor = 320 / rect.width;
    cropper.offsetX += (e.clientX - cropper.startX) * scaleFactor;
    cropper.offsetY += (e.clientY - cropper.startY) * scaleFactor;
    cropper.startX = e.clientX;
    cropper.startY = e.clientY;
    drawCropCanvas();
  });

  const endDrag = () => { cropper.dragging = false; };
  stage.addEventListener('pointerup', endDrag);
  stage.addEventListener('pointercancel', endDrag);

  slider.addEventListener('input', () => {
    cropper.zoom = parseFloat(slider.value) || 1;
    document.getElementById('cropZoomVal').textContent = `${cropper.zoom.toFixed(1)}x`;
    drawCropCanvas();
  });

  const cancelCrop = () => {
    closeModal('modalCropPhoto');
    cropper.img = null;
    cropper.onDone = null;
  };
  document.getElementById('btnCancelCrop').addEventListener('click', cancelCrop);
  document.getElementById('btnCropCancelBtn').addEventListener('click', cancelCrop);

  document.getElementById('btnCropApply').addEventListener('click', () => {
    if (!cropper.img) return;
    const b64 = exportCroppedBase64();
    const cb = cropper.onDone;
    closeModal('modalCropPhoto');
    cropper.img = null;
    cropper.onDone = null;
    if (cb) cb(b64);
  });
}

/* ======================== NAVIGASI BAWAH ======================== */

function buildBottomNav(role) {
  const nav = document.getElementById('bottomNav');
  let items;
  if (role === 'ADMIN') {
    items = [
      { view: 'viewDashboard', icon: '📊', label: 'Dashboard' },
      { view: 'viewJadwal', icon: '🗓️', label: 'Jadwal' },
      { view: 'viewAbsen', icon: '📸', label: 'Absen', center: true },
      { view: 'viewRiwayat', icon: '📋', label: 'Riwayat' },
      { view: 'viewKelola', icon: '⚙️', label: 'Kelola' }
    ];
  } else if (role === 'MONITORING') {
    items = [
      { view: 'viewDashboard', icon: '📊', label: 'Live' },
      { view: 'viewJadwal', icon: '🗓️', label: 'Jadwal' },
      { view: 'viewRiwayat', icon: '🖼️', label: 'Riwayat & Foto' },
      { view: 'viewInsight', icon: '📈', label: 'Insight' }
    ];
  } else {
    // KARYAWAN
    items = [
      { view: 'viewKalenderSaya', icon: '📅', label: 'Kalender' },
      { view: 'viewJadwal', icon: '🗓️', label: 'Jadwal' },
      { view: 'viewAbsen', icon: '📸', label: 'Absen', center: true },
      { view: 'viewDashboard', icon: '👁️', label: 'Pantau' },
      { view: 'viewRiwayat', icon: '🖼️', label: 'Galeri' }
    ];
  }

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

  const navHighlight = viewId === 'viewInsight' && state.user.role !== 'MONITORING' ? 'viewDashboard' : viewId;
  document.querySelectorAll('#bottomNav .nav-item').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.view === navHighlight);
  });

  if (viewId === 'viewAbsen') {
    updateAbsenGreetingDisplay();
    applyTodayScheduleToForm();
    loadActiveBreaksForAbsen();
  }
  if (viewId === 'viewKalenderSaya') loadCrewCalendar();
  if (viewId === 'viewRiwayat') loadHistory();
  if (viewId === 'viewDashboard') loadDashboard();
  if (viewId === 'viewJadwal') loadJadwalView();
  if (viewId === 'viewInsight') loadInsights();
  if (viewId === 'viewKelola') loadMasterData();
}

/* ======================== FORM ABSENSI, JADWAL HARI INI & ISTIRAHAT ======================== */

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

  const hour = new Date().getHours();
  shiftSel.value = hour < 13 ? 'PAGI' : 'SIANG';

  applyTodayScheduleToForm();
  updateAbsenGreetingDisplay();
  updateGpsHint();
}

function applyTodayScheduleToForm() {
  const banner = document.getElementById('todayScheduleBanner');
  const valEl = document.getElementById('todayScheduleValue');
  const badgeEl = document.getElementById('todayScheduleBadge');
  const shiftSel = document.getElementById('absenShift');
  const lockBadge = document.getElementById('shiftLockBadge');

  if (!state.user || state.user.role !== 'CREW' || !state.todaySchedule || !state.todaySchedule.status) {
    banner.classList.add('hidden');
    lockBadge.classList.add('hidden');
    shiftSel.disabled = false;
    return;
  }

  const sched = state.todaySchedule;
  const st = normalizeShift(sched.status);
  const displayStatus = sched.catatan ? `${sched.status} (${sched.catatan})` : sched.status;

  banner.classList.remove('hidden');
  valEl.textContent = displayStatus;

  if (VALID_WORK_SHIFTS.includes(st)) {
    banner.classList.remove('is-off');
    badgeEl.className = 'badge badge-masuk';
    badgeEl.textContent = 'SHIFT HARI INI';
    shiftSel.value = st;
    shiftSel.disabled = true;
    lockBadge.classList.remove('hidden');
  } else if (['IZIN', 'SAKIT', 'OFF DAY', 'OUT'].includes(st)) {
    banner.classList.add('is-off');
    badgeEl.className = 'badge badge-danger';
    badgeEl.textContent = st;
    shiftSel.disabled = false;
    lockBadge.classList.add('hidden');
  } else {
    banner.classList.remove('is-off');
    badgeEl.className = 'badge badge-warning';
    badgeEl.textContent = 'LAINNYA';
    shiftSel.disabled = false;
    lockBadge.classList.add('hidden');
  }
}

function updateShiftOptionLabels() {
  const toko = document.getElementById('absenToko').value;
  const st = state.stores.find((s) => s.nama.toUpperCase() === toko.toUpperCase()) || {};
  const pagi = `${st.pagiMulai || '08:00'}–${st.pagiSelesai || '16:00'}`;
  const siang = `${st.siangMulai || '14:00'}–${st.siangSelesai || '22:00'}`;
  const fd = `${st.fullDayMulai || st.pagiMulai || '08:00'}–${st.fullDaySelesai || st.siangSelesai || '22:00'}`;

  const shiftSel = document.getElementById('absenShift');
  const prev = normalizeShift(shiftSel.value || 'PAGI');
  shiftSel.innerHTML = `
    <option value="PAGI">Shift Pagi (${pagi})</option>
    <option value="SIANG">Shift Siang (${siang})</option>
    <option value="FULL DAY">Full Day (${fd})</option>
  `;
  shiftSel.value = VALID_WORK_SHIFTS.includes(prev) ? prev : 'PAGI';
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

async function loadActiveBreaksForAbsen() {
  if (!state.user || state.user.role === 'MONITORING') return;
  const toko = document.getElementById('absenToko').value || state.user.toko;
  try {
    const res = await apiCall({ action: 'getActiveBreaks', toko });
    state.myBreak = res.myBreak || null;
    state.storeBreaks = res.breaks || [];
    renderStoreBreaksCard(res.toko || toko);
    tickAllBreakCountdowns();
  } catch {}
}

function renderStoreBreaksCard(tokoName) {
  const card = document.getElementById('storeBreaksCard');
  const listEl = document.getElementById('storeBreaksList');
  document.getElementById('storeBreaksTitle').textContent = tokoName || 'Outlet';

  if (!state.storeBreaks.length) {
    card.classList.add('hidden');
    return;
  }
  card.classList.remove('hidden');
  listEl.innerHTML = state.storeBreaks.map((b) => `
    <div class="mini-item">
      <div>
        <strong>${esc(b.nama)}</strong> <span class="record-sub">(${esc(b.shift)})</span>
        <div class="record-sub">Mulai ${esc(b.startJam)} • Selesai ${esc(b.endJam)} WIB</div>
      </div>
      <span class="badge ${b.isOngoing ? 'badge-warning' : 'badge-masuk'} live-break-badge" data-end-ms="${b.endMs}">
        ${b.isOngoing ? formatRemainingMs(b.endMs - (Date.now() + state.serverOffsetMs)) : 'Selesai'}
      </span>
    </div>
  `).join('');
}

function tickAllBreakCountdowns() {
  const nowMs = Date.now() + state.serverOffsetMs;

  const myCard = document.getElementById('myBreakCountdownCard');
  if (myCard) {
    if (state.myBreak && state.user && state.user.role !== 'MONITORING') {
      const rem = state.myBreak.endMs - nowMs;
      const doneTooLong = rem < -60 * 60000;
      if (doneTooLong) {
        myCard.classList.add('hidden');
      } else {
        myCard.classList.remove('hidden');
        document.getElementById('myBreakEndLabel').textContent = `Batas kembali: ${state.myBreak.endJam} WIB`;
        if (rem > 0) {
          myCard.classList.remove('is-done');
          document.getElementById('myBreakTimer').textContent = formatRemainingMs(rem);
          document.getElementById('myBreakSubInfo').textContent = rem <= 10 * 60000
            ? 'Kurang dari 10 menit lagi! Bersiap kembali bertugas.'
            : `Durasi ${state.myBreak.durationMin === 90 ? '1 jam 30 menit' : '1 jam'} (Mulai ${state.myBreak.startJam} WIB)`;
        } else {
          myCard.classList.add('is-done');
          document.getElementById('myBreakTimer').textContent = '00:00:00';
          document.getElementById('myBreakSubInfo').textContent = 'Waktu istirahat selesai! Silakan kembali bertugas agar rekan lain bisa bergantian.';
        }
      }
    } else {
      myCard.classList.add('hidden');
    }
  }

  document.querySelectorAll('.live-break-badge[data-end-ms]').forEach((badge) => {
    const endMs = Number(badge.dataset.endMs);
    if (!endMs) return;
    const rem = endMs - nowMs;
    if (rem > 0) {
      badge.textContent = `Sisa ${formatRemainingMs(rem)}`;
      badge.classList.remove('badge-masuk');
      badge.classList.add('badge-warning');
    } else {
      badge.textContent = 'Selesai';
      badge.classList.remove('badge-warning');
      badge.classList.add('badge-masuk');
    }
  });
}

function formatRemainingMs(ms) {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return `${pad2(h)}:${pad2(m)}:${pad2(s)}`;
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
      ${d.breakInfo ? `<div class="detail-row"><span>Selesai Istirahat</span><strong>${esc(d.breakInfo.endJam)} WIB</strong></div>` : ''}
    `;
    openModal('modalSuccess');
    clearPhoto();

    if (d.jenis === 'ISTIRAHAT') {
      loadActiveBreaksForAbsen();
    }
  } catch (err) {
    document.getElementById('absenRetryMsg').textContent = err.message;
    document.getElementById('absenRetryBox').classList.remove('hidden');
    showToast(err.message, 'error');
  } finally {
    setLoading(false);
  }
}

/* ======================== KALENDER KARYAWAN PRIBADI & MODAL DETAILS ======================== */

function buildCalendarMaps(records, schedules) {
  const byDate = {};
  (records || []).forEach((r) => {
    if (!r.dateKey) return;
    if (!byDate[r.dateKey]) byDate[r.dateKey] = [];
    byDate[r.dateKey].push(r);
  });
  const schedByDate = {};
  (schedules || []).forEach((s) => {
    if (s.dateKey) schedByDate[s.dateKey] = s;
  });

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
      else if (isFullDayShift(sh)) fullDay++;
    }
  });
  return { byDate, schedByDate, totalMasuk, pagi, siang, fullDay };
}

function renderCalendarGridInto(gridEl, year, month, byDate, schedByDate, selectedDate, onPickDate) {
  const daysInMonth = new Date(year, month, 0).getDate();
  const firstWeekday = new Date(year, month - 1, 1).getDay();
  const todayKey = `${nowInit.getFullYear()}-${pad2(nowInit.getMonth() + 1)}-${pad2(nowInit.getDate())}`;
  let html = '';

  for (let i = 0; i < firstWeekday; i++) {
    html += '<div class="cal-day empty"></div>';
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const dk = `${year}-${pad2(month)}-${pad2(day)}`;
    const list = byDate[dk] || [];
    const sched = schedByDate[dk] || null;
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
    } else if (sched && ['IZIN', 'SAKIT', 'OFF DAY', 'OUT'].includes(sched.status)) {
      statusCls = 'has-off';
    } else if (sched) {
      dotHtml = '<span class="cal-dot-row"><i class="dot dot-sched"></i></span>';
    }

    const schedShort = sched ? shortScheduleLabel(sched.status) : '';
    const isToday = dk === todayKey ? 'today' : '';
    const isSel = dk === selectedDate ? 'selected' : '';

    html += `
      <button type="button" class="cal-day ${statusCls} ${isToday} ${isSel}" data-date="${dk}">
        <span>${day}</span>
        ${schedShort ? `<span class="cal-sched-mini">${esc(schedShort)}</span>` : dotHtml}
      </button>
    `;
  }

  gridEl.innerHTML = html;
  gridEl.querySelectorAll('.cal-day[data-date]').forEach((btn) => {
    btn.addEventListener('click', () => onPickDate(btn.dataset.date));
  });
}

function renderCalendarDayDetailInto(titleEl, bodyEl, dateKey, list, sched, totalBulanIni) {
  const parts = dateKey.split('-').map(Number);
  const dtObj = new Date(parts[0], parts[1] - 1, parts[2]);
  titleEl.textContent = `${HARI_ID[dtObj.getDay()]}, ${parts[2]} ${BULAN_ID[parts[1] - 1]} ${parts[0]}`;

  const schedText = sched
    ? (sched.catatan ? `${sched.status} (${sched.catatan})` : sched.status)
    : 'Belum dijadwalkan';

  if (!list || !list.length) {
    bodyEl.innerHTML = `
      <div class="day-detail-box">
        <div class="detail-grid" style="margin-top:0;padding:0;background:transparent">
          <div class="detail-row"><span>Jadwal</span><strong>${esc(schedText)}</strong></div>
          <div class="detail-row"><span>Absensi</span><strong>Tidak ada catatan absensi</strong></div>
          <div class="detail-row"><span>Total Masuk Bulan Ini</span><strong>${esc(totalBulanIni)}</strong></div>
        </div>
      </div>
    `;
    return;
  }

  const masuk = list.find((r) => r.jenis === 'MASUK') || null;
  const istirahat = list.find((r) => r.jenis === 'ISTIRAHAT') || null;
  const pulangList = list.filter((r) => r.jenis === 'PULANG');
  const pulang = pulangList[pulangList.length - 1] || null;
  const shiftLabel = (masuk && masuk.shift) || (istirahat && istirahat.shift) || (pulang && pulang.shift) || '-';

  bodyEl.innerHTML = `
    <div class="day-detail-box">
      <div class="detail-grid" style="margin-top:0;padding:0;background:transparent">
        <div class="detail-row"><span>Jadwal</span><strong>${esc(schedText)}</strong></div>
        <div class="detail-row"><span>Shift Absen</span><strong>${esc(shiftLabel)}</strong></div>
        <div class="detail-row"><span>Jam Masuk</span><strong>${masuk ? esc(masuk.jam) + ' WIB' : '-'}</strong></div>
        <div class="detail-row"><span>Status Masuk</span><strong>${masuk ? esc(masuk.status) : '-'}</strong></div>
        <div class="detail-row"><span>Jam Istirahat</span><strong>${istirahat ? esc(istirahat.jam) + ' WIB' : '-'}</strong></div>
        ${istirahat ? `<div class="detail-row"><span>Info Istirahat</span><strong>${esc(istirahat.status)}</strong></div>` : ''}
        <div class="detail-row"><span>Jam Keluar</span><strong>${pulang ? esc(pulang.jam) + ' WIB' : 'Belum absen pulang'}</strong></div>
        <div class="detail-row"><span>Durasi Kerja</span><strong>${pulang ? esc(pulang.status) : '-'}</strong></div>
        <div class="detail-row"><span>Total Masuk Bulan Ini</span><strong>${esc(totalBulanIni)}</strong></div>
      </div>
      <div class="photo-btn-row photo-btn-row-3">
        ${masuk && masuk.foto
          ? `<button type="button" class="btn btn-outline btn-sm" onclick="previewPhoto('${esc(masuk.foto)}')">Foto Masuk</button>`
          : `<button type="button" class="btn btn-outline btn-sm" disabled>Foto Masuk (-)</button>`}
        ${istirahat && istirahat.foto
          ? `<button type="button" class="btn btn-outline btn-sm" onclick="previewPhoto('${esc(istirahat.foto)}')">Foto Istirahat</button>`
          : `<button type="button" class="btn btn-outline btn-sm" disabled>Foto Istirahat (-)</button>`}
        ${pulang && pulang.foto
          ? `<button type="button" class="btn btn-soft btn-sm" onclick="previewPhoto('${esc(pulang.foto)}')">Foto Pulang</button>`
          : `<button type="button" class="btn btn-soft btn-sm" disabled>Foto Pulang (-)</button>`}
      </div>
    </div>
  `;
}

async function loadCrewCalendar() {
  const y = state.calYear;
  const m = state.calMonth;
  const daysInMonth = new Date(y, m, 0).getDate();
  const startDate = `${y}-${pad2(m)}-01`;
  const endDate = `${y}-${pad2(m)}-${pad2(daysInMonth)}`;

  document.getElementById('calMonthLabel').textContent = `${BULAN_ID[m - 1]} ${y}`;
  document.getElementById('crewCalendarGrid').innerHTML = '<div class="empty-state" style="grid-column:1/-1">Memuat kalender...</div>';

  try {
    const res = await apiCall({ action: 'getHistory', filters: { startDate, endDate } });
    const built = buildCalendarMaps(res.records, res.schedules);
    state.calRecordsByDate = built.byDate;
    state.calSchedulesByDate = built.schedByDate;

    document.getElementById('calTotalMasuk').textContent = `${built.totalMasuk} hari`;
    document.getElementById('calTotalPagi').textContent = `${built.pagi}x`;
    document.getElementById('calTotalSiang').textContent = `${built.siang}x`;
    document.getElementById('calTotalFullDay').textContent = `${built.fullDay}x`;

    const todayKey = `${nowInit.getFullYear()}-${pad2(nowInit.getMonth() + 1)}-${pad2(nowInit.getDate())}`;
    const attendedKeys = Object.keys(built.byDate).sort();
    state.calSelectedDate = todayKey.startsWith(`${y}-${pad2(m)}-`)
      ? todayKey
      : (attendedKeys[attendedKeys.length - 1] || `${y}-${pad2(m)}-01`);

    renderCalendarGridInto(
      document.getElementById('crewCalendarGrid'),
      y, m, built.byDate, built.schedByDate, state.calSelectedDate,
      selectCrewCalendarDay
    );
    selectCrewCalendarDay(state.calSelectedDate);
  } catch (err) {
    document.getElementById('crewCalendarGrid').innerHTML = `<div class="empty-state" style="grid-column:1/-1">${esc(err.message)}</div>`;
  }
}

function selectCrewCalendarDay(dateKey) {
  state.calSelectedDate = dateKey;
  document.querySelectorAll('#crewCalendarGrid .cal-day').forEach((btn) => {
    btn.classList.toggle('selected', btn.dataset.date === dateKey);
  });
  renderCalendarDayDetailInto(
    document.getElementById('crewDayDetailTitle'),
    document.getElementById('crewDayDetailBody'),
    dateKey,
    state.calRecordsByDate[dateKey],
    state.calSchedulesByDate[dateKey],
    document.getElementById('calTotalMasuk').textContent
  );
}

/* ======================== MODAL DETAILS: KALENDER KARYAWAN (ADMIN & MONITORING) ======================== */

window.openCrewCalendarModal = function (encodedCrew) {
  const crew = JSON.parse(decodeURIComponent(encodedCrew));
  state.adminCalTarget = crew;
  state.adminCalMonth = Number(document.getElementById('storeDetailMonth').value) || (nowInit.getMonth() + 1);
  state.adminCalYear = Number(document.getElementById('storeDetailYear').value) || nowInit.getFullYear();

  document.getElementById('modalCrewCalTitle').textContent = crew.nama;
  const meta = [crew.toko, crew.posisi || 'Karyawan'];
  if (crew.area && crew.area !== '-') meta.push(crew.area);
  document.getElementById('modalCrewCalSub').textContent = meta.join(' • ');

  openModal('modalCrewCalendar');
  loadAdminCrewCalendar();
};

async function loadAdminCrewCalendar() {
  if (!state.adminCalTarget) return;
  const y = state.adminCalYear;
  const m = state.adminCalMonth;
  const daysInMonth = new Date(y, m, 0).getDate();
  const startDate = `${y}-${pad2(m)}-01`;
  const endDate = `${y}-${pad2(m)}-${pad2(daysInMonth)}`;

  document.getElementById('adminCalMonthLabel').textContent = `${BULAN_ID[m - 1]} ${y}`;
  document.getElementById('adminCrewCalGrid').innerHTML = '<div class="empty-state" style="grid-column:1/-1">Memuat kalender karyawan...</div>';

  const actionName = state.user.role === 'ADMIN' ? 'getHistory' : 'getMonitoringHistory';
  try {
    const res = await apiCall({
      action: actionName,
      filters: { crewName: state.adminCalTarget.nama, startDate, endDate }
    });
    const built = buildCalendarMaps(res.records, res.schedules);
    state.adminCalRecordsByDate = built.byDate;
    state.adminCalSchedulesByDate = built.schedByDate;

    document.getElementById('adminCalTotalMasuk').textContent = `${built.totalMasuk} hari`;
    document.getElementById('adminCalTotalPagi').textContent = `${built.pagi}x`;
    document.getElementById('adminCalTotalSiang').textContent = `${built.siang}x`;
    document.getElementById('adminCalTotalFullDay').textContent = `${built.fullDay}x`;

    const todayKey = `${nowInit.getFullYear()}-${pad2(nowInit.getMonth() + 1)}-${pad2(nowInit.getDate())}`;
    const attendedKeys = Object.keys(built.byDate).sort();
    state.adminCalSelectedDate = todayKey.startsWith(`${y}-${pad2(m)}-`)
      ? todayKey
      : (attendedKeys[attendedKeys.length - 1] || `${y}-${pad2(m)}-01`);

    renderCalendarGridInto(
      document.getElementById('adminCrewCalGrid'),
      y, m, built.byDate, built.schedByDate, state.adminCalSelectedDate,
      selectAdminCrewCalendarDay
    );
    selectAdminCrewCalendarDay(state.adminCalSelectedDate);
  } catch (err) {
    document.getElementById('adminCrewCalGrid').innerHTML = `<div class="empty-state" style="grid-column:1/-1">${esc(err.message)}</div>`;
  }
}

function selectAdminCrewCalendarDay(dateKey) {
  state.adminCalSelectedDate = dateKey;
  document.querySelectorAll('#adminCrewCalGrid .cal-day').forEach((btn) => {
    btn.classList.toggle('selected', btn.dataset.date === dateKey);
  });
  renderCalendarDayDetailInto(
    document.getElementById('adminCalDayTitle'),
    document.getElementById('adminCalDayBody'),
    dateKey,
    state.adminCalRecordsByDate[dateKey],
    state.adminCalSchedulesByDate[dateKey],
    document.getElementById('adminCalTotalMasuk').textContent
  );
}

/* ======================== RIWAYAT & GALERI FOTO ======================== */

function populateFilterStores(storeNames) {
  const names = storeNames && storeNames.length
    ? storeNames
    : state.stores.map((s) => (typeof s === 'string' ? s : s.nama));
  const sel = document.getElementById('filterToko');
  if (sel) {
    const prev = sel.value || 'SEMUA';
    sel.innerHTML = '<option value="SEMUA">Semua Toko</option>' +
      names.map((n) => `<option value="${esc(n)}">${esc(n)}</option>`).join('');
    if ([...sel.options].some((o) => o.value === prev)) sel.value = prev;
  }
  const jSel = document.getElementById('jadwalTokoSelect');
  if (jSel && names.length) {
    const prevJ = jSel.value || state.jadwalStore || (state.user && state.user.role === 'CREW' ? state.user.toko : names[0]);
    jSel.innerHTML = names.map((n) => `<option value="${esc(n)}">${esc(n)}</option>`).join('');
    if ([...jSel.options].some((o) => o.value === prevJ)) jSel.value = prevJ;
  }
}

async function loadHistory() {
  const isAdmin = state.user.role === 'ADMIN';
  document.getElementById('riwayatModeSub').textContent = isAdmin
    ? 'Semua cabang • Admin Only dapat edit/hapus'
    : 'Management Monitoring lintas cabang (Hanya Lihat)';

  const container = document.getElementById('historyList');
  const gallery = document.getElementById('historyGallery');
  container.innerHTML = '<div class="empty-state">Memuat riwayat absensi...</div>';
  gallery.innerHTML = '';

  const filters = {
    search: document.getElementById('filterSearch').value.trim(),
    toko: document.getElementById('filterToko').value,
    jenis: document.getElementById('filterJenis').value,
    shift: document.getElementById('filterShift').value,
    startDate: document.getElementById('filterStart').value,
    endDate: document.getElementById('filterEnd').value
  };

  const actionName = isAdmin ? 'getHistory' : 'getMonitoringHistory';
  try {
    const res = await apiCall({ action: actionName, filters });
    if (res.stores && res.stores.length) populateFilterStores(res.stores);
    state.historyRecords = res.records || [];
    renderHistoryCurrentMode();
  } catch (err) {
    container.innerHTML = `<div class="empty-state">${esc(err.message)}</div>`;
  }
}

function renderHistoryCurrentMode() {
  const isAdmin = state.user.role === 'ADMIN';
  const listEl = document.getElementById('historyList');
  const galEl = document.getElementById('historyGallery');

  document.getElementById('btnHistoryListMode').classList.toggle('active', state.historyMode === 'list');
  document.getElementById('btnHistoryGalleryMode').classList.toggle('active', state.historyMode === 'gallery');

  if (state.historyMode === 'gallery') {
    listEl.classList.add('hidden');
    galEl.classList.remove('hidden');
    renderHistoryGallery(galEl, state.historyRecords);
  } else {
    galEl.classList.add('hidden');
    listEl.classList.remove('hidden');
    renderRecordList(listEl, state.historyRecords, isAdmin);
  }
}

function renderHistoryGallery(container, records) {
  const withPhoto = (records || []).filter((r) => r.foto);
  if (!withPhoto.length) {
    container.innerHTML = '<div class="empty-state" style="grid-column:1/-1">Belum ada bukti foto sesuai filter.</div>';
    return;
  }
  container.innerHTML = withPhoto.map((r) => `
    <div class="gallery-card" onclick="previewPhoto('${esc(r.foto)}')">
      <img class="gallery-thumb" loading="lazy" src="${esc(toDisplayImageUrl(r.foto, 500))}" alt="${esc(r.nama)}" />
      <div class="gallery-meta">
        <div style="display:flex;justify-content:space-between;align-items:center;gap:6px">
          <strong>${esc(r.nama)}</strong>
          <span class="badge ${jenisBadgeClass(r.jenis)}">${esc(r.jenis)}</span>
        </div>
        <span>${esc(r.toko)} • ${esc(r.shift)}</span>
        <span>${esc(r.tanggalDisplay)} • ${esc(r.jam)}</span>
      </div>
    </div>
  `).join('');
}

function renderRecordList(container, records, allowAdminActions) {
  if (!records.length) {
    container.innerHTML = '<div class="empty-state">Belum ada data absensi sesuai filter.</div>';
    return;
  }

  container.innerHTML = records.map((r) => {
    const statusClass = r.isLate ? 'badge-danger' : 'badge-neutral';
    const encoded = encodeURIComponent(JSON.stringify(r));

    return `
      <div class="record-card">
        <div class="record-top">
          <div>
            <div class="record-title">${esc(r.nama)}</div>
            <div class="record-sub">${esc(r.toko)} • Shift ${esc(r.shift)} • ${esc(r.hari)}, ${esc(r.tanggalDisplay)}</div>
          </div>
          <span class="badge ${jenisBadgeClass(r.jenis)}">${esc(r.jenis)}</span>
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

/* ======================== DASHBOARD LIVE & DETAIL TOKO ======================== */

async function loadDashboard() {
  const isAdmin = state.user.role === 'ADMIN';
  document.getElementById('dashHeadingTitle').textContent = isAdmin ? 'Dashboard Hari Ini' : 'Management Monitoring — Live';
  document.getElementById('dashTopSwitcher').classList.toggle('hidden', state.user.role === 'MONITORING');

  setLoading(true, 'Memuat data live...');
  try {
    const res = await apiCall({ action: isAdmin ? 'getDashboard' : 'getMonitoringDashboard' });
    if (res.stores && res.stores.length) populateFilterStores(res.stores);

    document.getElementById('dashDateLabel').textContent = res.serverDate;
    document.getElementById('kpiMasuk').textContent = res.summary.masuk;
    document.getElementById('kpiIstirahat').textContent = res.summary.sedangIstirahat || 0;
    document.getElementById('kpiPulang').textContent = res.summary.pulang;
    document.getElementById('kpiBelumPulang').textContent = res.summary.belumPulangHariIni;
    document.getElementById('kpiTelat').textContent = res.summary.terlambat;

    const brCard = document.getElementById('dashActiveBreaksCard');
    const brList = document.getElementById('dashActiveBreaksList');
    state.dashActiveBreaks = res.activeBreaks || [];
    if (state.dashActiveBreaks.length) {
      brCard.classList.remove('hidden');
      brList.innerHTML = state.dashActiveBreaks.map((b) => `
        <div class="mini-item">
          <div>
            <strong>${esc(b.nama)}</strong> (${esc(b.toko)})
            <div class="record-sub">Shift ${esc(b.shift)} • Mulai ${esc(b.startJam)} s/d ${esc(b.endJam)} WIB</div>
          </div>
          <div style="display:flex;align-items:center;gap:6px">
            ${b.foto ? `<button type="button" class="btn-ghost-sm" onclick="previewPhoto('${esc(b.foto)}')">Foto</button>` : ''}
            <span class="badge ${b.isOngoing ? 'badge-warning' : 'badge-masuk'} live-break-badge" data-end-ms="${b.endMs}">
              ${b.isOngoing ? `Sisa ${formatRemainingMs(b.endMs - (Date.now() + state.serverOffsetMs))}` : 'Selesai'}
            </span>
          </div>
        </div>
      `).join('');
    } else {
      brCard.classList.add('hidden');
    }

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

    document.getElementById('dashStoreTable').innerHTML = (res.perStore || []).map((s) => `
      <tr class="clickable-row" onclick="openStoreDetail(decodeURIComponent('${encodeURIComponent(s.toko)}'))">
        <td><strong>${esc(s.toko)} &rsaquo;</strong></td>
        <td>${s.masuk}</td>
        <td>${s.istirahat || 0}</td>
        <td>${s.pulang}</td>
        <td>${s.belumPulang > 0 ? `<span class="badge badge-warning">${s.belumPulang}</span>` : '0'}</td>
        <td>${s.terlambat > 0 ? `<span class="badge badge-danger">${s.terlambat}</span>` : '0'}</td>
      </tr>
    `).join('');

    renderCharts(res.chartPerStore || [], res.chart7Days || []);
    renderRecordList(document.getElementById('dashTodayList'), res.todayRecords || [], isAdmin);
    tickAllBreakCountdowns();
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
  document.getElementById('storeDetailTitle').textContent = `Detail Karyawan — ${toko}`;
  openModal('modalStoreDetail');
  loadStoreDetailData();
};

async function loadStoreDetailData() {
  if (!state.activeStoreDetail) return;
  const month = Number(document.getElementById('storeDetailMonth').value);
  const year = Number(document.getElementById('storeDetailYear').value);
  const listEl = document.getElementById('storeDetailList');
  listEl.innerHTML = '<div class="empty-state">Memuat detail karyawan toko...</div>';

  const actionName = state.user.role === 'ADMIN' ? 'getStoreDetail' : 'getMonitoringStoreDetail';
  try {
    const res = await apiCall({
      action: actionName,
      toko: state.activeStoreDetail,
      month,
      year
    });
    document.getElementById('storeDetailPeriod').textContent = `Rekap Bulan ${res.monthName} ${res.year}`;
    const crews = res.crews || [];
    if (!crews.length) {
      listEl.innerHTML = '<div class="empty-state">Belum ada karyawan atau data absensi di toko ini.</div>';
      return;
    }

    listEl.innerHTML = crews.map((c) => {
      const initial = (c.nama || 'K')[0].toUpperCase();
      const avatarHtml = c.fotoProfil
        ? `<img src="${esc(toDisplayImageUrl(c.fotoProfil))}" alt="${esc(c.nama)}" />`
        : esc(initial);
      const metaParts = [c.posisi || 'Karyawan'];
      if (c.area && c.area !== '-') metaParts.push(c.area);
      if (c.noTelp && c.noTelp !== '-') metaParts.push(c.noTelp);

      const encCrew = encodeURIComponent(JSON.stringify({
        nama: c.nama,
        toko: c.toko,
        posisi: c.posisi,
        area: c.area
      }));

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
          <button type="button" class="crew-details-bar" onclick="openCrewCalendarModal('${encCrew}')">
            DETAILS &mdash; Lihat Kalender &amp; Foto &rsaquo;
          </button>
        </div>
      `;
    }).join('');
  } catch (err) {
    listEl.innerHTML = `<div class="empty-state">${esc(err.message)}</div>`;
  }
}

/* ======================== JADWAL SHIFT MINGGUAN & BULANAN PER TOKO ======================== */

async function loadJadwalView() {
  const isAdmin = state.user.role === 'ADMIN';
  document.getElementById('jadwalModeSubtitle').textContent = isAdmin
    ? 'Klik kotak tanggal untuk mengatur/mengubah jadwal, lalu Simpan.'
    : 'Jadwal resmi per outlet dari Admin Only (Hanya Lihat).';

  const tokoSel = document.getElementById('jadwalTokoSelect');
  const month = Number(document.getElementById('jadwalMonthSelect').value) || (nowInit.getMonth() + 1);
  const year = Number(document.getElementById('jadwalYearSelect').value) || nowInit.getFullYear();
  let toko = tokoSel.value || state.jadwalStore || (state.user.role === 'CREW' ? state.user.toko : '');

  const wrap = document.getElementById('jadwalMatrixWrap');
  wrap.innerHTML = '<div class="empty-state">Memuat jadwal toko...</div>';

  try {
    const res = await apiCall({ action: 'getSchedules', toko, month, year });
    if (res.stores && res.stores.length) {
      populateFilterStores(res.stores);
      if (!toko) {
        toko = (state.user.role === 'CREW' && res.stores.includes(state.user.toko))
          ? state.user.toko
          : res.stores[0];
        tokoSel.value = toko;
        state.jadwalStore = toko;
        return loadJadwalView();
      }
    }

    state.jadwalStore = toko;
    state.jadwalCrews = res.crews || [];
    state.jadwalMap = {};
    state.jadwalDirty = {};
    (res.schedules || []).forEach((s) => {
      const k = `${s.dateKey}|${s.crewId || s.nama.toUpperCase()}`;
      state.jadwalMap[k] = s.status;
    });
    updateJadwalDirtyInfo();
    renderJadwalMatrix(year, month);
  } catch (err) {
    wrap.innerHTML = `<div class="empty-state">${esc(err.message)}</div>`;
  }
}

function renderJadwalMatrix(year, month) {
  const wrap = document.getElementById('jadwalMatrixWrap');
  const crews = state.jadwalCrews || [];
  if (!crews.length) {
    wrap.innerHTML = '<div class="empty-state">Belum ada karyawan terdaftar di cabang ini.</div>';
    return;
  }

  const isAdmin = state.user.role === 'ADMIN';
  const daysInMonth = new Date(year, month, 0).getDate();
  const weekFilter = document.getElementById('jadwalWeekSelect').value;
  let startDay = 1;
  let endDay = daysInMonth;
  if (weekFilter !== 'ALL') {
    const w = Number(weekFilter);
    startDay = (w - 1) * 7 + 1;
    endDay = Math.min(daysInMonth, w * 7);
  }

  const todayKey = `${nowInit.getFullYear()}-${pad2(nowInit.getMonth() + 1)}-${pad2(nowInit.getDate())}`;

  const thead = `
    <thead>
      <tr>
        <th class="sticky-date">Tanggal</th>
        ${crews.map((c) => {
          const pUp = (c.posisi || '').toUpperCase();
          let cls = '';
          if (pUp.includes('SUPERVISOR')) cls = 'col-supervisor';
          else if (pUp.includes('KEPALA')) cls = 'col-captain';
          else if (c.area === 'BAKERY' || pUp.includes('BAKERY')) cls = 'col-bakery';
          else if (c.area === 'DRINK' || pUp.includes('MINUMAN')) cls = 'col-drink';
          const sub = c.posisi || c.area || 'Karyawan';
          return `<th class="${cls}">${esc(c.nama)}<br><small style="opacity:0.85;font-weight:600">${esc(sub)}</small></th>`;
        }).join('')}
      </tr>
    </thead>
  `;

  let rowsHtml = '';
  for (let d = startDay; d <= endDay; d++) {
    const dk = `${year}-${pad2(month)}-${pad2(d)}`;
    const dtObj = new Date(year, month - 1, d);
    const dayIdx = dtObj.getDay();
    const rowCls = [
      dk === todayKey ? 'is-today-row' : '',
      dayIdx === 0 ? 'is-weekend-row' : ''
    ].filter(Boolean).join(' ');

    const cells = crews.map((c) => {
      const key = `${dk}|${c.id || c.nama.toUpperCase()}`;
      const val = state.jadwalDirty[key] !== undefined
        ? state.jadwalDirty[key].status
        : (state.jadwalMap[key] || '');
      const colorCls = getScheduleStyleClass(val);

      if (!isAdmin) {
        return `<td><span class="sched-tag ${colorCls}">${esc(val || '-')}</span></td>`;
      }

      const presetVals = JADWAL_PRESET_OPTIONS.map((o) => o.val);
      const isCustomVal = val && !presetVals.includes(val);
      const optsHtml = JADWAL_PRESET_OPTIONS.map((o) =>
        `<option value="${esc(o.val)}" ${val === o.val ? 'selected' : ''}>${esc(o.label)}</option>`
      ).join('') + (isCustomVal ? `<option value="${esc(val)}" selected>${esc(val)}</option>` : '');

      return `
        <td>
          <select class="jadwal-cell-select ${colorCls}"
            data-dk="${dk}"
            data-cid="${esc(c.id)}"
            data-nama="${esc(c.nama)}"
            data-prev="${esc(val)}">
            ${optsHtml}
          </select>
        </td>
      `;
    }).join('');

    rowsHtml += `
      <tr class="${rowCls}">
        <td class="sticky-date">${pad2(d)}/${pad2(month)} <small>${HARI_SHORT[dayIdx]}</small></td>
        ${cells}
      </tr>
    `;
  }

  wrap.innerHTML = `<table class="jadwal-table">${thead}<tbody>${rowsHtml}</tbody></table>`;

  if (isAdmin) {
    wrap.querySelectorAll('.jadwal-cell-select').forEach((sel) => {
      sel.addEventListener('change', onJadwalCellChange);
    });
  }
}

function onJadwalCellChange(e) {
  const sel = e.target;
  const dk = sel.dataset.dk;
  const cid = sel.dataset.cid;
  const nama = sel.dataset.nama;
  const val = sel.value;

  if (val === '__CUSTOM__') {
    state.jadwalBkoPending = { sel, dk, cid, nama, prev: sel.dataset.prev || '' };
    document.getElementById('jadwalBkoDesc').textContent = `Status jadwal tambahan untuk ${nama} (${dk}). Contoh: OFF DAY, BKO TAPOS, CUTI.`;
    document.getElementById('jadwalBkoInput').value = '';
    openModal('modalJadwalBko');
    sel.value = sel.dataset.prev || '';
    return;
  }

  applyJadwalCellValue(sel, dk, cid, nama, val);
}

function applyJadwalCellValue(sel, dk, cid, nama, val) {
  const key = `${dk}|${cid || nama.toUpperCase()}`;
  const cleanVal = String(val || '').toUpperCase().trim();
  state.jadwalDirty[key] = { dateKey: dk, crewId: cid, nama, status: cleanVal, catatan: '' };
  sel.dataset.prev = cleanVal;

  sel.className = `jadwal-cell-select ${getScheduleStyleClass(cleanVal)}`;
  updateJadwalDirtyInfo();
}

function updateJadwalDirtyInfo() {
  const count = Object.keys(state.jadwalDirty).length;
  const info = document.getElementById('jadwalDirtyInfo');
  const btn = document.getElementById('btnSaveJadwal');
  if (!info || !btn) return;
  if (count > 0) {
    info.textContent = `${count} perubahan belum disimpan.`;
    info.style.color = 'var(--primary)';
    btn.textContent = `Simpan Jadwal (${count})`;
  } else {
    info.textContent = 'Pilih jadwal pada kotak tanggal, lalu klik Simpan.';
    info.style.color = '';
    btn.textContent = 'Simpan Jadwal';
  }
}

async function saveJadwalChanges() {
  const entries = Object.values(state.jadwalDirty);
  if (!entries.length) {
    showToast('Belum ada perubahan jadwal untuk disimpan.');
    return;
  }
  setLoading(true, 'Menyimpan jadwal ke server...');
  try {
    const res = await apiCall({
      action: 'saveSchedules',
      toko: state.jadwalStore,
      entries
    }, 45000);
    entries.forEach((ent) => {
      const k = `${ent.dateKey}|${ent.crewId || ent.nama.toUpperCase()}`;
      if (ent.status) state.jadwalMap[k] = ent.status;
      else delete state.jadwalMap[k];
    });
    state.jadwalDirty = {};
    updateJadwalDirtyInfo();
    showToast(res.message || 'Jadwal tersimpan!', 'success');
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    setLoading(false);
  }
}

function getScheduleStyleClass(val) {
  const s = String(val || '').toUpperCase().trim();
  if (!s) return 'st-empty';
  if (s === 'PAGI') return 'st-pagi';
  if (s === 'SIANG') return 'st-siang';
  if (isFullDayShift(s)) return 'st-fullday';
  if (s === 'IZIN') return 'st-izin';
  if (s === 'SAKIT') return 'st-sakit';
  return 'st-lainnya';
}

function shortScheduleLabel(val) {
  const s = String(val || '').toUpperCase().trim();
  if (!s) return '';
  if (s === 'PAGI') return 'PAGI';
  if (s === 'SIANG') return 'SIANG';
  if (isFullDayShift(s)) return 'FULL';
  if (s === 'IZIN') return 'IZIN';
  if (s === 'SAKIT') return 'SAKIT';
  return s.slice(0, 6);
}

/* ======================== INSIGHT & REKAP BULANAN ======================== */

async function loadInsights(period) {
  const isAdmin = state.user.role === 'ADMIN';
  document.getElementById('insightTopSwitcher').classList.toggle('hidden', state.user.role === 'MONITORING');
  document.getElementById('insightPageTitle').textContent = isAdmin ? 'Insight & Rekap Gaji' : 'Insight Performa Outlet';

  const activeBtn = document.querySelector('#insightPeriodToggle .seg-btn.active');
  const p = period || (activeBtn ? activeBtn.dataset.period : 'week');

  setLoading(true, 'Menghitung insight...');
  try {
    const res = await apiCall({
      action: isAdmin ? 'getInsights' : 'getMonitoringInsights',
      period: p
    });
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

  ['recapMonth', 'storeDetailMonth', 'jadwalMonthSelect'].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = monthOpts;
  });
  ['recapYear', 'storeDetailYear', 'jadwalYearSelect'].forEach((id) => {
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
    'Nama Karyawan', 'Toko', 'Hari Hadir', 'Masuk Pagi', 'Masuk Siang', 'Masuk Full Day',
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

/* ======================== EDIT & HAPUS ABSENSI (ADMIN ONLY) ======================== */

window.previewPhoto = function (url) {
  document.getElementById('modalPhotoImg').src = toDisplayImageUrl(url, 1200);
  document.getElementById('modalPhotoLink').href = url;
  openModal('modalPhoto');
};

window.openEditModal = function (encoded) {
  const r = JSON.parse(decodeURIComponent(encoded));
  document.getElementById('editRowNumber').value = r.rowNumber;
  document.getElementById('editRecordId').value = r.id || '';
  document.getElementById('editJenis').value = ['MASUK', 'ISTIRAHAT', 'PULANG'].includes(r.jenis) ? r.jenis : 'MASUK';
  const normShift = normalizeShift(r.shift);
  document.getElementById('editShift').value = VALID_WORK_SHIFTS.includes(normShift) ? normShift : 'PAGI';
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
      showToast('Karyawan dihapus.', 'success');
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
    syncGreetingInputs();

    const crewEl = document.getElementById('manageCrewList');
    crewEl.innerHTML = state.crews.map((c) => {
      const enc = encodeURIComponent(JSON.stringify(c));
      const initial = (c.nama || 'K')[0].toUpperCase();
      const avatarHtml = c.fotoProfil
        ? `<img src="${esc(toDisplayImageUrl(c.fotoProfil))}" alt="${esc(c.nama)}" />`
        : esc(initial);
      const subParts = [c.toko];
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
    }).join('') || '<div class="empty-state">Belum ada data karyawan.</div>';

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

function setPosisiFieldValue(rawPosisi) {
  const sel = document.getElementById('crewPosisiInput');
  const customGroup = document.getElementById('crewPosisiCustomGroup');
  const customInput = document.getElementById('crewPosisiCustomInput');
  const clean = String(rawPosisi || '').trim();

  if (!clean) {
    sel.value = 'Crew Minuman';
    customGroup.classList.add('hidden');
    customInput.value = '';
    return;
  }

  const matched = PRESET_POSISI.find((p) => p.toLowerCase() === clean.toLowerCase());
  if (matched) {
    sel.value = matched;
    customGroup.classList.add('hidden');
    customInput.value = '';
  } else {
    sel.value = '__CUSTOM__';
    customGroup.classList.remove('hidden');
    customInput.value = clean;
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
    document.getElementById('modalCrewTitle').textContent = 'Edit Karyawan / Profil & PIN';
    document.getElementById('crewIdInput').value = c.id;
    document.getElementById('crewNamaInput').value = c.nama;
    tokoSel.value = c.toko;
    document.getElementById('crewAreaInput').value = c.area || '';
    setPosisiFieldValue(c.posisi || '');
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
    document.getElementById('modalCrewTitle').textContent = 'Tambah Karyawan Baru';
    document.getElementById('crewIdInput').value = '';
    document.getElementById('crewNamaInput').value = '';
    document.getElementById('crewAreaInput').value = '';
    setPosisiFieldValue('Crew Minuman');
    document.getElementById('crewTelpInput').value = '';
    document.getElementById('crewPinInput').value = '';
    document.getElementById('crewAktifInput').checked = true;
    renderAvatar(photoPrev, '', 'K');
    clearPhotoBtn.classList.add('hidden');
    curPinGroup.classList.add('hidden');
  }
  openModal('modalCrew');
};

function handleCrewPhotoPick(e) {
  const file = e.target.files && e.target.files[0];
  e.target.value = '';
  if (!file) return;
  if (!file.type.startsWith('image/')) return showToast('Pilih file gambar.', 'error');

  openCropModalForFile(file, (croppedBase64) => {
    state.crewPhotoDraft = croppedBase64;
    state.crewClearPhoto = false;
    document.getElementById('crewPhotoPreview').innerHTML = `<img src="${croppedBase64}" alt="Pratinjau" />`;
    document.getElementById('btnClearCrewPhoto').classList.remove('hidden');
  });
}

async function submitCrewForm(e) {
  e.preventDefault();
  const posSelVal = document.getElementById('crewPosisiInput').value;
  let finalPosisi = posSelVal;
  if (posSelVal === '__CUSTOM__') {
    finalPosisi = document.getElementById('crewPosisiCustomInput').value.trim();
    if (!finalPosisi) {
      showToast('Isi nama posisi tambahan terlebih dahulu.', 'error');
      document.getElementById('crewPosisiCustomInput').focus();
      return;
    }
  }

  setLoading(true, 'Menyimpan data karyawan...');
  try {
    await apiCall({
      action: 'saveCrew',
      crew: {
        id: document.getElementById('crewIdInput').value,
        nama: document.getElementById('crewNamaInput').value.trim(),
        toko: document.getElementById('crewTokoInput').value,
        area: document.getElementById('crewAreaInput').value,
        posisi: finalPosisi,
        noTelp: document.getElementById('crewTelpInput').value.trim(),
        pin: document.getElementById('crewPinInput').value.trim(),
        aktif: document.getElementById('crewAktifInput').checked,
        photoBase64: state.crewPhotoDraft,
        clearPhoto: state.crewClearPhoto
      }
    }, 45000);
    closeModal('modalCrew');
    showToast('Data karyawan tersimpan.', 'success');
    loadMasterData();
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    setLoading(false);
  }
}

window.askDeleteCrew = function (id, nama) {
  state.pendingDelete = { type: 'crew', id };
  document.getElementById('deleteConfirmText').textContent = `Hapus akun karyawan "${nama}"? Riwayat absen lamanya di spreadsheet tetap aman.`;
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
  // Tabs Login (Karyawan / Admin Only / Management Monitoring)
  const switchLoginTab = (tab) => {
    document.getElementById('tabRoleCrew').classList.toggle('active', tab === 'crew');
    document.getElementById('tabRoleAdmin').classList.toggle('active', tab === 'admin');
    document.getElementById('tabRoleMonitor').classList.toggle('active', tab === 'monitor');
    document.getElementById('formLoginCrew').classList.toggle('hidden', tab !== 'crew');
    document.getElementById('formLoginAdmin').classList.toggle('hidden', tab !== 'admin');
    document.getElementById('panelLoginMonitor').classList.toggle('hidden', tab !== 'monitor');
  };
  document.getElementById('tabRoleCrew').addEventListener('click', () => switchLoginTab('crew'));
  document.getElementById('tabRoleAdmin').addEventListener('click', () => switchLoginTab('admin'));
  document.getElementById('tabRoleMonitor').addEventListener('click', () => switchLoginTab('monitor'));
  document.getElementById('btnEnterMonitoring').addEventListener('click', enterMonitoringMode);

  document.getElementById('loginStore').addEventListener('change', onLoginStoreChange);
  document.getElementById('formLoginCrew').addEventListener('submit', handleLoginCrew);
  document.getElementById('formLoginAdmin').addEventListener('submit', handleLoginAdmin);
  document.getElementById('btnLogout').addEventListener('click', handleLogout);

  // Switcher Dashboard <-> Insight
  document.querySelectorAll('[data-switch-view]').forEach((btn) => {
    btn.addEventListener('click', () => switchView(btn.dataset.switchView));
  });

  // Profil Header & Edit Profil (Admin Only Lengkap, Karyawan Khusus Foto)
  document.getElementById('btnOpenProfile').addEventListener('click', openProfileModal);
  document.getElementById('btnPickMyPhoto').addEventListener('click', () => document.getElementById('inputMyPhoto').click());
  document.getElementById('inputMyPhoto').addEventListener('change', handleMyPhotoPick);
  document.getElementById('btnClearMyPhoto').addEventListener('click', clearMyPhoto);
  document.getElementById('formAdminProfile').addEventListener('submit', submitAdminProfileForm);

  // Form Absen (Masuk / Istirahat / Pulang)
  document.querySelectorAll('#formAbsen .seg-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#formAbsen .seg-btn').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      const jenis = btn.dataset.jenis;
      document.getElementById('absenJenis').value = jenis;
      document.getElementById('breakRuleHint').classList.toggle('hidden', jenis !== 'ISTIRAHAT');
      updateAbsenGreetingDisplay();
    });
  });

  document.getElementById('absenToko').addEventListener('change', () => {
    updateShiftOptionLabels();
    updateGpsHint();
    loadActiveBreaksForAbsen();
  });
  document.getElementById('btnRefreshStoreBreaks').addEventListener('click', loadActiveBreaksForAbsen);
  document.getElementById('btnPickGallery').addEventListener('click', () => document.getElementById('inputFotoGaleri').click());
  document.getElementById('btnOpenCamera').addEventListener('click', () => document.getElementById('inputFotoKamera').click());
  document.getElementById('inputFotoGaleri').addEventListener('change', handlePhotoSelected);
  document.getElementById('inputFotoKamera').addEventListener('change', handlePhotoSelected);
  document.getElementById('btnRemovePhoto').addEventListener('click', clearPhoto);
  document.getElementById('formAbsen').addEventListener('submit', submitAttendance);
  document.getElementById('btnRetryAbsen').addEventListener('click', () => submitAttendance());

  // Kalender Karyawan Pribadi
  document.getElementById('btnRefreshMyCalendar').addEventListener('click', loadCrewCalendar);
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

  // Modal DETAILS Kalender Karyawan (Admin & Monitoring)
  document.getElementById('btnAdminCalPrev').addEventListener('click', () => {
    state.adminCalMonth -= 1;
    if (state.adminCalMonth < 1) { state.adminCalMonth = 12; state.adminCalYear -= 1; }
    loadAdminCrewCalendar();
  });
  document.getElementById('btnAdminCalNext').addEventListener('click', () => {
    state.adminCalMonth += 1;
    if (state.adminCalMonth > 12) { state.adminCalMonth = 1; state.adminCalYear += 1; }
    loadAdminCrewCalendar();
  });

  // Riwayat & Galeri Foto
  document.getElementById('btnApplyFilter').addEventListener('click', loadHistory);
  document.getElementById('btnRefreshHistory').addEventListener('click', loadHistory);
  document.getElementById('btnResetFilter').addEventListener('click', () => {
    document.getElementById('filterSearch').value = '';
    document.getElementById('filterToko').value = 'SEMUA';
    document.getElementById('filterJenis').value = 'SEMUA';
    document.getElementById('filterShift').value = 'SEMUA';
    document.getElementById('filterStart').value = '';
    document.getElementById('filterEnd').value = '';
    loadHistory();
  });
  document.getElementById('btnHistoryListMode').addEventListener('click', () => {
    state.historyMode = 'list';
    renderHistoryCurrentMode();
  });
  document.getElementById('btnHistoryGalleryMode').addEventListener('click', () => {
    state.historyMode = 'gallery';
    renderHistoryCurrentMode();
  });

  // Dashboard & Detail Toko
  document.getElementById('btnRefreshDash').addEventListener('click', loadDashboard);
  document.getElementById('btnReloadStoreDetail').addEventListener('click', loadStoreDetailData);

  // Jadwal Shift per Toko
  document.getElementById('jadwalTokoSelect').addEventListener('change', loadJadwalView);
  document.getElementById('jadwalMonthSelect').addEventListener('change', loadJadwalView);
  document.getElementById('jadwalYearSelect').addEventListener('change', loadJadwalView);
  document.getElementById('jadwalWeekSelect').addEventListener('change', () => {
    const m = Number(document.getElementById('jadwalMonthSelect').value);
    const y = Number(document.getElementById('jadwalYearSelect').value);
    renderJadwalMatrix(y, m);
  });
  document.getElementById('btnReloadJadwal').addEventListener('click', loadJadwalView);
  document.getElementById('btnSaveJadwal').addEventListener('click', saveJadwalChanges);

  document.getElementById('btnConfirmJadwalBko').addEventListener('click', () => {
    const pending = state.jadwalBkoPending;
    const label = document.getElementById('jadwalBkoInput').value.trim().toUpperCase();
    closeModal('modalJadwalBko');
    if (!pending || !label) return;

    const { sel, dk, cid, nama } = pending;
    if (![...sel.options].some((o) => o.value === label)) {
      const opt = document.createElement('option');
      opt.value = label;
      opt.textContent = label;
      sel.appendChild(opt);
    }
    sel.value = label;
    applyJadwalCellValue(sel, dk, cid, nama, label);
    state.jadwalBkoPending = null;
  });

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

  // Teks Ucapan & Tema + Dual Wallpaper (Admin Only Kelola)
  document.getElementById('formAbsenGreetings').addEventListener('submit', saveAbsenGreetings);
  document.querySelectorAll('#themePresetGrid .theme-chip').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.themeDraftPreset = btn.dataset.themePreset;
      document.querySelectorAll('#themePresetGrid .theme-chip').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  // Slot Wallpaper HP (Portrait)
  document.getElementById('btnPickWallpaperMobile').addEventListener('click', () => document.getElementById('inputWallpaperMobile').click());
  document.getElementById('inputWallpaperMobile').addEventListener('change', (e) => handleWallpaperSlotPick(e, 'mobile'));
  document.getElementById('btnClearWallpaperMobile').addEventListener('click', () => {
    state.themeWallpaperMobileDraft = '';
    state.themeClearWallpaperMobile = true;
    document.getElementById('wallpaperMobilePreviewImg').src = '';
    document.getElementById('wallpaperMobilePreviewBox').classList.add('hidden');
    showToast('Wallpaper HP akan dihapus saat Anda klik Terapkan.');
  });

  // Slot Wallpaper Laptop (Landscape)
  document.getElementById('btnPickWallpaperDesktop').addEventListener('click', () => document.getElementById('inputWallpaperDesktop').click());
  document.getElementById('inputWallpaperDesktop').addEventListener('change', (e) => handleWallpaperSlotPick(e, 'desktop'));
  document.getElementById('btnClearWallpaperDesktop').addEventListener('click', () => {
    state.themeWallpaperDesktopDraft = '';
    state.themeClearWallpaperDesktop = true;
    document.getElementById('wallpaperDesktopPreviewImg').src = '';
    document.getElementById('wallpaperDesktopPreviewBox').classList.add('hidden');
    showToast('Wallpaper Laptop akan dihapus saat Anda klik Terapkan.');
  });

  document.getElementById('btnSaveTheme').addEventListener('click', saveAppTheme);

  // Admin Modals & Kelola Karyawan/Toko
  document.getElementById('formEditRecord').addEventListener('submit', submitEditRecord);
  document.getElementById('btnConfirmDelete').addEventListener('click', confirmDeleteAction);
  document.getElementById('btnAddCrew').addEventListener('click', () => openCrewModal());

  document.getElementById('crewPosisiInput').addEventListener('change', (e) => {
    const isCustom = e.target.value === '__CUSTOM__';
    document.getElementById('crewPosisiCustomGroup').classList.toggle('hidden', !isCustom);
    if (isCustom) {
      document.getElementById('crewPosisiCustomInput').focus();
    }
  });

  document.getElementById('btnPickCrewPhoto').addEventListener('click', () => document.getElementById('inputCrewPhoto').click());
  document.getElementById('inputCrewPhoto').addEventListener('change', handleCrewPhotoPick);
  document.getElementById('btnClearCrewPhoto').addEventListener('click', () => {
    state.crewPhotoDraft = '';
    state.crewClearPhoto = true;
    const nm = document.getElementById('crewNamaInput').value || 'K';
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
  if (s === 'FULLDAY' || s === 'FULL DAY' || s === 'FULL' || s === 'FULL PAGI' || s === 'FULL SIANG') return 'FULL DAY';
  if (s === 'SIANG') return 'SIANG';
  if (s === 'PAGI') return 'PAGI';
  return s;
}

function isFullDayShift(shift) {
  return normalizeShift(shift) === 'FULL DAY';
}

function jenisBadgeClass(jenis) {
  const j = String(jenis || '').toUpperCase();
  if (j === 'MASUK') return 'badge-masuk';
  if (j === 'ISTIRAHAT') return 'badge-istirahat';
  return 'badge-pulang';
}

function toDisplayImageUrl(url, size = 1200) {
  const s = String(url || '').trim();
  const match = s.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (match && s.includes('drive.google.com')) {
    return `https://drive.google.com/thumbnail?id=${match[1]}&sz=w${size}`;
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

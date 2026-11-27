/**
 * ============================================================
 * MOMOYO ABSENSI KARYAWAN — FRONTEND APPLICATION v4.1 (PWA)
 * ============================================================
 * - Kamera Selfie Live dalam aplikasi + Watermark waktu aktual (Foto & Submit).
 * - Absen Pintar: Jejak Progres Harian + otomatis arahkan ke tahap berikutnya.
 * - Dashboard & Monitoring: Filter cepat per outlet, Auto-Refresh 60 detik,
 *   deteksi Belum Hadir/Izin/Sakit, Accordion ringkas, 1-Klik WhatsApp,
 *   dan 1 kartu tombol Detail Absensi Hari Ini.
 * - Jadwal Shift: Tombol "Salin Minggu Lalu" (termasuk lintas bulan).
 * - Kelola: Outlet & Karyawan terpadu per cabang + Edit ID Karyawan.
 * - Pindah tab instan (Instant Cache) tanpa layar loading penuh.
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

const DEFAULT_GREETINGS = {
  masuk: 'SELAMAT BEKERJA',
  istirahat: 'SELAMAT ISTIRAHAT',
  pulang: 'PEKERJAAN SELESAI, HATI HATI DI JALAN'
};

const MASCOT_FALLBACK_SVG = 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">' +
  '<circle cx="60" cy="60" r="58" fill="#FFF0F2" stroke="#C81E2B" stroke-width="4"/>' +
  '<circle cx="34" cy="34" r="14" fill="#D97742"/>' +
  '<circle cx="86" cy="34" r="14" fill="#D97742"/>' +
  '<circle cx="34" cy="34" r="7" fill="#FDE2E4"/>' +
  '<circle cx="86" cy="34" r="7" fill="#FDE2E4"/>' +
  '<circle cx="60" cy="64" r="36" fill="#E89D6C"/>' +
  '<ellipse cx="60" cy="72" rx="18" ry="13" fill="#FFF7F0"/>' +
  '<circle cx="46" cy="58" r="4.5" fill="#2B1B17"/>' +
  '<circle cx="74" cy="58" r="4.5" fill="#2B1B17"/>' +
  '<circle cx="37" cy="68" r="5.5" fill="#FB7185" opacity="0.55"/>' +
  '<circle cx="83" cy="68" r="5.5" fill="#FB7185" opacity="0.55"/>' +
  '<ellipse cx="60" cy="67" rx="5.5" ry="4" fill="#4A2511"/>' +
  '<path d="M53 75 Q60 81 67 75" fill="none" stroke="#4A2511" stroke-width="3" stroke-linecap="round"/>' +
  '<path d="M35 30 Q60 12 85 30 Q80 42 60 39 Q40 42 35 30 Z" fill="#C81E2B"/>' +
  '<circle cx="60" cy="24" r="5" fill="#FFFFFF"/>' +
  '</svg>'
);

const WA_ICON_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>';

const NAV_ICONS = {
  dashboard: '<svg class="nav-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>',
  jadwal: '<svg class="nav-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="3"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',
  kalender: '<svg class="nav-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="3"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><path d="M9 15l2 2 4-4"/></svg>',
  riwayat: '<svg class="nav-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/><polyline points="12 7 12 12 15 14"/></svg>',
  galeri: '<svg class="nav-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>',
  kelola: '<svg class="nav-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9c.26.6.85 1 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>',
  pantau: '<svg class="nav-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>',
  insight: '<svg class="nav-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>'
};

const nowInit = new Date();

const state = {
  token: localStorage.getItem('momoyo_token') || '',
  user: JSON.parse(localStorage.getItem('momoyo_user') || 'null'),
  greetings: JSON.parse(localStorage.getItem('momoyo_greetings') || JSON.stringify(DEFAULT_GREETINGS)),
  activeView: '',
  todaySchedule: null,
  todayProgress: null,
  userManualJenisPick: false,
  publicStores: [],
  publicCrews: [],
  stores: [],
  crews: [],
  // Foto absensi + waktu aktual
  photoRawBase64: '',
  photoCapturedAt: null,
  pendingDelete: null,
  lastRecap: null,
  charts: { store: null, days: null },
  deferredInstallPrompt: null,
  serverOffsetMs: 0,
  myBreak: null,
  storeBreaks: [],
  // Dashboard & Monitoring
  dashData: null,
  dashOutletFilter: 'SEMUA',
  dashAutoRefreshTimer: null,
  dashLastUpdatedAt: null,
  // Instant cache antar tab
  cache: {
    insight: {},
    jadwal: {},
    masterLoaded: false
  },
  bgSyncCount: 0,
  // Riwayat & Kalender
  historyRecords: [],
  historyMode: 'list',
  calYear: nowInit.getFullYear(),
  calMonth: nowInit.getMonth() + 1,
  calRecordsByDate: {},
  calSchedulesByDate: {},
  calSelectedDate: '',
  activeStoreDetail: '',
  adminCalTarget: null,
  adminCalYear: nowInit.getFullYear(),
  adminCalMonth: nowInit.getMonth() + 1,
  adminCalRecordsByDate: {},
  adminCalSchedulesByDate: {},
  adminCalSelectedDate: '',
  // Jadwal
  jadwalStore: '',
  jadwalCrews: [],
  jadwalMap: {},
  jadwalDirty: {},
  jadwalBkoPending: null,
  // Kelola Outlet & Karyawan
  openManageOutlets: {},
  crewPhotoDraft: '',
  crewClearPhoto: false
};

const liveCam = {
  stream: null,
  facingMode: 'user',
  active: false
};

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
  applyMascotAssets(document);
  initServiceWorker();
  initPwaInstall();
  initOfflineIndicator();
  initPullToRefresh();
  initClock();
  bindEvents();
  initCropperEvents();
  initMonthYearSelectors();

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      stopLiveCamera();
    } else if (state.activeView === 'viewDashboard' && state.user) {
      loadDashboard(true);
    }
  });

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

function applyMascotAssets(root = document) {
  root.querySelectorAll('img[data-mascot-img]').forEach((img) => {
    if (img.dataset.mascotBound) return;
    img.dataset.mascotBound = '1';
    img.onerror = () => {
      if (img.src !== MASCOT_FALLBACK_SVG) {
        img.src = MASCOT_FALLBACK_SVG;
      }
    };
    img.src = './mascot.png';
  });
}

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

    if (liveCam.active) {
      const camTime = document.getElementById('liveCamTimeOverlay');
      if (camTime) camTime.textContent = `${hari}, ${pad2(tgl)} ${bln} ${thn} • ${jam} WIB`;
    }

    tickAllBreakCountdowns();
  };
  render();
  setInterval(render, 1000);
}

/* ======================== BACKGROUND SYNC INDICATOR ======================== */

function setBgSync(active) {
  state.bgSyncCount = Math.max(0, state.bgSyncCount + (active ? 1 : -1));
  const bar = document.getElementById('bgSyncBar');
  if (bar) bar.classList.toggle('hidden', state.bgSyncCount === 0);
}

/* ======================== PULL-TO-REFRESH (60HZ SMOOTH) ======================== */

function initPullToRefresh() {
  const indicator = document.getElementById('ptrIndicator');
  const ptrText = document.getElementById('ptrText');
  const ptrSpinner = indicator ? indicator.querySelector('.ptr-spinner') : null;
  if (!indicator) return;

  let startY = 0;
  let startX = 0;
  let pulling = false;
  let refreshing = false;
  let pullDist = 0;
  let rafId = 0;

  const isBlockedTarget = (target) => {
    if (!target) return true;
    if (document.querySelector('.modal-backdrop:not(.hidden)')) return true;
    if (target.closest('.jadwal-matrix-wrap, .table-wrap, .outlet-filter-bar, .crop-stage, input, select, textarea')) return true;
    return false;
  };

  const renderFrame = () => {
    rafId = 0;
    const clamped = Math.max(0, Math.min(96, pullDist));
    const yPos = -48 + clamped * 0.72;
    indicator.style.transform = `translate3d(0, ${yPos}px, 0)`;
    if (ptrSpinner) ptrSpinner.style.transform = `rotate(${clamped * 4}deg)`;
    ptrText.textContent = clamped >= 56 ? 'Lepas untuk muat ulang' : 'Tarik untuk muat ulang';
  };

  window.addEventListener('touchstart', (e) => {
    if (refreshing || e.touches.length !== 1) return;
    if (window.scrollY > 2) return;
    if (document.getElementById('appShell').classList.contains('hidden')) return;
    if (isBlockedTarget(e.target)) return;

    startY = e.touches[0].clientY;
    startX = e.touches[0].clientX;
    pulling = true;
    pullDist = 0;
  }, { passive: true });

  window.addEventListener('touchmove', (e) => {
    if (!pulling || refreshing || e.touches.length !== 1) return;
    const dy = e.touches[0].clientY - startY;
    const dx = e.touches[0].clientX - startX;

    if (dy <= 6 || window.scrollY > 2 || Math.abs(dx) > Math.abs(dy) * 0.85) {
      if (pullDist > 0) {
        pullDist = 0;
        indicator.classList.remove('is-visible', 'is-dragging');
        indicator.style.transform = 'translate3d(0, -48px, 0)';
      }
      if (Math.abs(dx) > 14) pulling = false;
      return;
    }

    pullDist = Math.min(96, dy * 0.46);
    indicator.classList.add('is-visible', 'is-dragging');
    if (!rafId) rafId = requestAnimationFrame(renderFrame);
  }, { passive: true });

  const finishPull = async () => {
    if (!pulling) return;
    pulling = false;
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = 0;
    }
    indicator.classList.remove('is-dragging');

    if (pullDist >= 56 && !refreshing) {
      refreshing = true;
      indicator.classList.add('is-visible', 'is-refreshing');
      indicator.style.transform = 'translate3d(0, 10px, 0)';
      ptrText.textContent = 'Memuat ulang...';
      try {
        await refreshActiveView(true);
      } finally {
        setTimeout(() => {
          indicator.classList.remove('is-visible', 'is-refreshing');
          indicator.style.transform = 'translate3d(0, -48px, 0)';
          if (ptrSpinner) ptrSpinner.style.transform = '';
          refreshing = false;
          pullDist = 0;
        }, 260);
      }
    } else {
      indicator.classList.remove('is-visible');
      indicator.style.transform = 'translate3d(0, -48px, 0)';
      pullDist = 0;
    }
  };

  window.addEventListener('touchend', finishPull, { passive: true });
  window.addEventListener('touchcancel', finishPull, { passive: true });
}

async function refreshActiveView(silent = false) {
  const v = state.activeView;
  if (v === 'viewDashboard') return loadDashboard(silent);
  if (v === 'viewJadwal') return loadJadwalView(true);
  if (v === 'viewRiwayat') return loadHistory();
  if (v === 'viewKalenderSaya') return loadCrewCalendar();
  if (v === 'viewInsight') return loadInsights(null, true);
  if (v === 'viewKelola') return loadMasterData(true);
  if (v === 'viewAbsen') {
    await refreshMyProfileSilently();
    return loadActiveBreaksForAbsen();
  }
}

/* ======================== TEKS UCAPAN DINAMIS ======================== */

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

/* ======================== API HELPER & 1-KLIK WHATSAPP ======================== */

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

function normalizeWaPhone(rawPhone) {
  const digits = String(rawPhone || '').replace(/\D/g, '');
  if (digits.length < 9) return '';
  if (digits.startsWith('0')) return '62' + digits.slice(1);
  if (digits.startsWith('8')) return '62' + digits;
  return digits;
}

function buildWaButtonHtml(rawPhone, message, label = 'WA') {
  const phone = normalizeWaPhone(rawPhone);
  if (!phone) return '';
  const url = `https://wa.me/${phone}?text=${encodeURIComponent(message || '')}`;
  return `<a class="btn-wa-sm" href="${esc(url)}" target="_blank" rel="noopener" onclick="event.stopPropagation()">${WA_ICON_SVG}<span>${esc(label)}</span></a>`;
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
    state.todayProgress = res.todayProgress || null;
    state.userManualJenisPick = false;
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
    state.todayProgress = null;
    state.userManualJenisPick = false;
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
  state.todayProgress = null;
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
  stopDashboardAutoRefresh();
  stopLiveCamera();
  if (state.user && state.user.role === 'MONITORING') {
    handleForceLogout('');
    return;
  }
  try { await apiCall({ action: 'logout' }); } catch {}
  handleForceLogout('Berhasil keluar.');
}

function handleForceLogout(msg) {
  stopDashboardAutoRefresh();
  stopLiveCamera();
  state.token = '';
  state.user = null;
  state.todaySchedule = null;
  state.todayProgress = null;
  state.myBreak = null;
  state.dashData = null;
  state.dashOutletFilter = 'SEMUA';
  state.cache = { insight: {}, jadwal: {}, masterLoaded: false };
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

function getInitials(name) {
  const clean = String(name || 'M').trim().replace(/\s+/g, ' ');
  const parts = clean.split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return clean.slice(0, 2).toUpperCase();
}

function renderAvatar(el, fotoUrl, nama) {
  if (!el) return;
  const initials = getInitials(nama);
  if (fotoUrl) {
    el.innerHTML = `<img src="${esc(toDisplayImageUrl(fotoUrl))}" alt="${esc(nama)}" onerror="this.remove();this.parentNode.textContent='${esc(initials)}';" />`;
  } else {
    el.textContent = initials;
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
    if (res.todayProgress !== undefined) {
      state.todayProgress = res.todayProgress;
      renderTodayProgress(true);
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
      if (res.user) state.user = res.user;
      else state.user.fotoProfil = res.fotoProfil || '';
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

/* ======================== CROP & ZOOM FOTO PROFIL ======================== */

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
  ctx.fillStyle = '#141824';
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

/* ======================== FLOATING PILL BOTTOM NAVIGATION ======================== */

function buildBottomNav(role) {
  const nav = document.getElementById('bottomNav');
  let items;
  if (role === 'ADMIN') {
    items = [
      { view: 'viewDashboard', icon: NAV_ICONS.dashboard, label: 'Dashboard' },
      { view: 'viewJadwal', icon: NAV_ICONS.jadwal, label: 'Jadwal' },
      { view: 'viewAbsen', label: 'Absen', center: true },
      { view: 'viewRiwayat', icon: NAV_ICONS.riwayat, label: 'Riwayat' },
      { view: 'viewKelola', icon: NAV_ICONS.kelola, label: 'Kelola' }
    ];
  } else if (role === 'MONITORING') {
    items = [
      { view: 'viewDashboard', icon: NAV_ICONS.dashboard, label: 'Live' },
      { view: 'viewJadwal', icon: NAV_ICONS.jadwal, label: 'Jadwal' },
      { view: 'viewRiwayat', icon: NAV_ICONS.galeri, label: 'Riwayat' },
      { view: 'viewInsight', icon: NAV_ICONS.insight, label: 'Insight' }
    ];
  } else {
    items = [
      { view: 'viewKalenderSaya', icon: NAV_ICONS.kalender, label: 'Kalender' },
      { view: 'viewJadwal', icon: NAV_ICONS.jadwal, label: 'Jadwal' },
      { view: 'viewAbsen', label: 'Absen', center: true },
      { view: 'viewDashboard', icon: NAV_ICONS.pantau, label: 'Pantau' },
      { view: 'viewRiwayat', icon: NAV_ICONS.galeri, label: 'Galeri' }
    ];
  }

  nav.innerHTML = items.map((it) => {
    if (it.center) {
      return `
        <button type="button" class="nav-item nav-center" data-view="${it.view}" aria-label="${it.label}">
          <span class="nav-center-btn">
            <span class="nav-center-mascot"><img data-mascot-img alt="" /></span>
            <span class="nav-center-label">${it.label}</span>
          </span>
        </button>
      `;
    }
    return `
      <button type="button" class="nav-item" data-view="${it.view}">
        ${it.icon}
        <span>${it.label}</span>
      </button>
    `;
  }).join('');

  applyMascotAssets(nav);

  nav.querySelectorAll('.nav-item').forEach((btn) => {
    btn.addEventListener('click', () => switchView(btn.dataset.view));
  });
}

function switchView(viewId, opts = {}) {
  state.activeView = viewId;
  document.querySelectorAll('.page-view').forEach((v) => v.classList.add('hidden'));
  const target = document.getElementById(viewId);
  if (target) target.classList.remove('hidden');

  const navHighlight = viewId === 'viewInsight' && state.user.role !== 'MONITORING' ? 'viewDashboard' : viewId;
  document.querySelectorAll('#bottomNav .nav-item').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.view === navHighlight);
  });

  if (viewId === 'viewDashboard') {
    startDashboardAutoRefresh();
  } else {
    stopDashboardAutoRefresh();
  }

  window.scrollTo({ top: 0, behavior: 'instant' });

  if (viewId === 'viewAbsen') {
    updateAbsenGreetingDisplay();
    applyTodayScheduleToForm();
    renderTodayProgress(false);
    loadActiveBreaksForAbsen();
  }
  if (viewId === 'viewKalenderSaya') loadCrewCalendar();
  if (viewId === 'viewRiwayat' && !opts.skipLoad) loadHistory();
  if (viewId === 'viewDashboard') loadDashboard(true);
  if (viewId === 'viewJadwal') loadJadwalView();
  if (viewId === 'viewInsight') loadInsights();
  if (viewId === 'viewKelola') loadMasterData();
}

/* ======================== ABSEN PINTAR, JEJAK PROGRES & KAMERA LIVE ======================== */

function setSelectedAbsenJenis(jenis, isManual = false) {
  const clean = ['MASUK', 'ISTIRAHAT', 'PULANG'].includes(jenis) ? jenis : 'MASUK';
  if (isManual) state.userManualJenisPick = true;

  document.getElementById('absenJenis').value = clean;
  document.querySelectorAll('#formAbsen .seg-btn').forEach((b) => {
    b.classList.toggle('active', b.dataset.jenis === clean);
  });
  document.getElementById('breakRuleHint').classList.toggle('hidden', clean !== 'ISTIRAHAT');
  updateAbsenGreetingDisplay();
}

function renderTodayProgress(autoSelectNext = false) {
  const card = document.getElementById('todayProgressCard');
  if (!card || !state.user || state.user.role === 'MONITORING' || !state.todayProgress) {
    if (card) card.classList.add('hidden');
    return;
  }

  const p = state.todayProgress;
  card.classList.remove('hidden');

  const stepMasuk = document.getElementById('progStepMasuk');
  const stepIst = document.getElementById('progStepIstirahat');
  const stepPulang = document.getElementById('progStepPulang');
  const lines = card.querySelectorAll('.progress-line');
  const nextHint = document.getElementById('progressNextHint');

  const fmtShort = (rec) => (rec && rec.jam ? rec.jam.slice(0, 5) : 'Belum');

  document.getElementById('progTimeMasuk').textContent = fmtShort(p.masuk);
  document.getElementById('progTimeIstirahat').textContent = fmtShort(p.istirahat);
  document.getElementById('progTimePulang').textContent = fmtShort(p.pulang);

  stepMasuk.classList.toggle('is-done', Boolean(p.masuk));
  stepIst.classList.toggle('is-done', Boolean(p.istirahat));
  stepPulang.classList.toggle('is-done', Boolean(p.pulang));

  stepMasuk.querySelector('.prog-dot').textContent = p.masuk ? '✓' : '1';
  stepIst.querySelector('.prog-dot').textContent = p.istirahat ? '✓' : '2';
  stepPulang.querySelector('.prog-dot').textContent = p.pulang ? '✓' : '3';

  stepMasuk.classList.toggle('is-current', p.nextSuggestedJenis === 'MASUK');
  stepIst.classList.toggle('is-current', p.nextSuggestedJenis === 'ISTIRAHAT');
  stepPulang.classList.toggle('is-current', p.nextSuggestedJenis === 'PULANG');

  if (lines[0]) lines[0].classList.toggle('is-done', Boolean(p.masuk));
  if (lines[1]) lines[1].classList.toggle('is-done', Boolean(p.istirahat || p.pulang));

  if (p.nextSuggestedJenis === 'DONE') {
    nextHint.className = 'badge badge-masuk';
    nextHint.textContent = 'Absen Hari Ini Lengkap';
  } else if (p.nextSuggestedJenis === 'PULANG') {
    nextHint.className = 'badge badge-pulang';
    nextHint.textContent = 'Berikutnya: Pulang';
  } else if (p.nextSuggestedJenis === 'ISTIRAHAT') {
    nextHint.className = 'badge badge-istirahat';
    nextHint.textContent = 'Berikutnya: Istirahat / Pulang';
  } else {
    nextHint.className = 'badge badge-warning';
    nextHint.textContent = 'Berikutnya: Masuk';
  }

  if (autoSelectNext && !state.userManualJenisPick && p.nextSuggestedJenis && p.nextSuggestedJenis !== 'DONE') {
    setSelectedAbsenJenis(p.nextSuggestedJenis, false);
  }
}

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
  renderTodayProgress(true);
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
  setBgSync(true);
  try {
    const res = await apiCall({ action: 'getActiveBreaks', toko });
    state.myBreak = res.myBreak || null;
    state.storeBreaks = res.breaks || [];
    if (res.todayProgress) {
      state.todayProgress = res.todayProgress;
      renderTodayProgress(true);
    }
    renderStoreBreaksCard(res.toko || toko);
    tickAllBreakCountdowns();
  } catch {
  } finally {
    setBgSync(false);
  }
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

function formatFullIndoDateTime(dtObj) {
  const d = dtObj instanceof Date ? dtObj : new Date();
  const hari = HARI_ID[d.getDay()];
  const tgl = pad2(d.getDate());
  const bln = BULAN_ID[d.getMonth()];
  const thn = d.getFullYear();
  const jam = `${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())}`;
  return `${hari}, ${tgl} ${bln} ${thn} • ${jam} WIB`;
}

/* --- KAMERA LIVE DALAM APLIKASI (ANTI-CURANG 100%) --- */

async function openLiveCameraModal() {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    document.getElementById('inputFotoKamera').click();
    return;
  }

  const jenis = document.getElementById('absenJenis').value || 'MASUK';
  const shift = document.getElementById('absenShift').value || 'PAGI';
  const nama = document.getElementById('absenNama').value || (state.user && state.user.nama) || '';
  const toko = document.getElementById('absenToko').value || '';

  document.getElementById('liveCamTitleOverlay').textContent = `MOMOYO • ${jenis} (${shift}) — ${nama} (${toko})`;
  openModal('modalLiveCamera');
  await startLiveCameraStream();
}

async function startLiveCameraStream() {
  stopLiveCameraStreamOnly();
  const video = document.getElementById('liveCamVideo');
  const sub = document.getElementById('liveCamSubInfo');
  sub.textContent = 'Menyiapkan kamera...';

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: { ideal: liveCam.facingMode },
        width: { ideal: 1280 },
        height: { ideal: 1280 }
      },
      audio: false
    });
    liveCam.stream = stream;
    liveCam.active = true;
    video.srcObject = stream;
    video.classList.toggle('is-mirrored', liveCam.facingMode === 'user');
    await video.play().catch(() => {});
    sub.textContent = 'Pastikan wajah terlihat jelas, lalu ketuk Jepret Foto.';
  } catch (err) {
    stopLiveCamera();
    showToast('Izin kamera browser tidak aktif, beralih ke kamera bawaan HP.');
    document.getElementById('inputFotoKamera').click();
  }
}

function stopLiveCameraStreamOnly() {
  if (liveCam.stream) {
    liveCam.stream.getTracks().forEach((t) => t.stop());
    liveCam.stream = null;
  }
  const video = document.getElementById('liveCamVideo');
  if (video) video.srcObject = null;
  liveCam.active = false;
}

function stopLiveCamera() {
  stopLiveCameraStreamOnly();
  const modal = document.getElementById('modalLiveCamera');
  if (modal) modal.classList.add('hidden');
}

async function captureFromLiveCamera() {
  const video = document.getElementById('liveCamVideo');
  if (!video || !video.videoWidth || !video.videoHeight) {
    showToast('Kamera belum siap, tunggu sebentar.', 'error');
    return;
  }

  let w = video.videoWidth;
  let h = video.videoHeight;
  const maxDim = 1200;
  if (w > maxDim || h > maxDim) {
    if (w > h) {
      h = Math.round((h * maxDim) / w);
      w = maxDim;
    } else {
      w = Math.round((w * maxDim) / h);
      h = maxDim;
    }
  }

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (liveCam.facingMode === 'user') {
    ctx.translate(w, 0);
    ctx.scale(-1, 1);
  }
  ctx.drawImage(video, 0, 0, w, h);
  const rawBase64 = canvas.toDataURL('image/jpeg', 0.8);
  const capturedNow = new Date(Date.now() + state.serverOffsetMs);

  stopLiveCamera();
  await applyCapturedPhotoPreview(rawBase64, capturedNow);
}

function handleNativeCameraSelected(e) {
  const file = e.target.files && e.target.files[0];
  e.target.value = '';
  if (!file) return;
  if (!file.type.startsWith('image/')) {
    showToast('File harus berupa gambar/foto.', 'error');
    return;
  }

  const capturedNow = new Date(Date.now() + state.serverOffsetMs);
  setLoading(true, 'Memproses foto kamera...');
  compressImage(file, 1200, 0.78)
    .then(({ base64 }) => applyCapturedPhotoPreview(base64, capturedNow))
    .catch(() => showToast('Gagal memproses foto. Coba ambil ulang.', 'error'))
    .finally(() => setLoading(false));
}

async function applyCapturedPhotoPreview(rawBase64, capturedNow) {
  state.photoRawBase64 = rawBase64;
  state.photoCapturedAt = capturedNow;

  const jenis = document.getElementById('absenJenis').value || 'MASUK';
  const shift = document.getElementById('absenShift').value || 'PAGI';
  const toko = document.getElementById('absenToko').value || '';
  const nama = document.getElementById('absenNama').value.trim() || (state.user && state.user.nama) || '';

  const previewStamped = await bakeTimestampWatermark(rawBase64, {
    nama,
    toko,
    jenis,
    shift,
    capturedAt: capturedNow,
    submittedAt: null
  });

  const sizeKB = Math.round((previewStamped.length * 3) / 4 / 1024);
  const capTimeStr = `${pad2(capturedNow.getHours())}:${pad2(capturedNow.getMinutes())}:${pad2(capturedNow.getSeconds())} WIB`;
  document.getElementById('photoPreviewImg').src = previewStamped;
  document.getElementById('photoSizeInfo').textContent = `Siap kirim (${sizeKB} KB) • Foto ${capTimeStr}`;
  document.getElementById('photoPreviewBox').classList.remove('hidden');
  document.getElementById('photoEmptyBox').classList.add('hidden');
  document.getElementById('absenRetryBox').classList.add('hidden');
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
        resolve({ base64 });
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  });
}

function bakeTimestampWatermark(rawBase64, meta) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onerror = reject;
    img.onload = () => {
      const w = img.width;
      const h = img.height;
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, w, h);

      const scale = Math.max(0.65, Math.min(1.35, w / 900));
      const padX = Math.round(22 * scale);
      const padY = Math.round(16 * scale);
      const fontLg = Math.round(24 * scale);
      const fontMd = Math.round(19 * scale);
      const fontSm = Math.round(17 * scale);
      const lineGap = Math.round(8 * scale);

      const hasSubmit = Boolean(meta.submittedAt);
      const lineCountSm = hasSubmit ? 2 : 1;
      const boxH = padY * 2 + fontLg + fontMd + fontSm * lineCountSm + lineGap * (lineCountSm + 1) + Math.round(10 * scale);
      const boxY = Math.max(0, h - boxH);

      const grad = ctx.createLinearGradient(0, boxY - Math.round(24 * scale), 0, h);
      grad.addColorStop(0, 'rgba(15, 20, 32, 0)');
      grad.addColorStop(0.2, 'rgba(15, 20, 32, 0.72)');
      grad.addColorStop(1, 'rgba(15, 20, 32, 0.88)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, boxY - Math.round(24 * scale), w, boxH + Math.round(24 * scale));

      ctx.fillStyle = '#E52B3B';
      ctx.fillRect(padX, boxY + padY, Math.round(5 * scale), boxH - padY * 2);

      const textX = padX + Math.round(15 * scale);
      let curY = boxY + padY + fontLg;

      ctx.textBaseline = 'alphabetic';
      ctx.fillStyle = '#FFFFFF';
      ctx.font = `800 ${fontLg}px "Plus Jakarta Sans", -apple-system, sans-serif`;
      ctx.fillText(`MOMOYO ABSENSI • ${meta.jenis} (${meta.shift})`, textX, curY);

      curY += fontMd + lineGap;
      ctx.fillStyle = '#FFE4E7';
      ctx.font = `700 ${fontMd}px "Plus Jakarta Sans", -apple-system, sans-serif`;
      ctx.fillText(`${meta.nama}  •  ${meta.toko}`, textX, curY);

      curY += fontSm + lineGap + Math.round(2 * scale);
      ctx.fillStyle = '#F8FAFC';
      ctx.font = `600 ${fontSm}px "Plus Jakarta Sans", -apple-system, sans-serif`;
      ctx.fillText(`Waktu Foto   : ${formatFullIndoDateTime(meta.capturedAt)}`, textX, curY);

      if (hasSubmit) {
        curY += fontSm + lineGap;
        ctx.fillStyle = '#FDE68A';
        ctx.font = `700 ${fontSm}px "Plus Jakarta Sans", -apple-system, sans-serif`;
        ctx.fillText(`Waktu Submit : ${formatFullIndoDateTime(meta.submittedAt)}`, textX, curY);
      }

      resolve(canvas.toDataURL('image/jpeg', 0.8));
    };
    img.src = rawBase64;
  });
}

function clearPhoto() {
  state.photoRawBase64 = '';
  state.photoCapturedAt = null;
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
  if (!state.photoRawBase64) return showToast('Wajib ambil foto selfie dari kamera langsung terlebih dahulu.', 'error');

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

  setLoading(true, 'Menyematkan stempel waktu & mengunggah foto...');
  try {
    const submittedAt = new Date(Date.now() + state.serverOffsetMs);
    const stampedPhoto = await bakeTimestampWatermark(state.photoRawBase64, {
      nama,
      toko,
      jenis,
      shift,
      capturedAt: state.photoCapturedAt || submittedAt,
      submittedAt
    });

    const res = await apiCall({
      action: 'submitAttendance',
      jenis,
      shift,
      toko,
      nama,
      photoBase64: stampedPhoto,
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

    state.userManualJenisPick = false;
    if (res.todayProgress) {
      state.todayProgress = res.todayProgress;
      renderTodayProgress(true);
    }
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

function encodePhotoMeta(rec) {
  if (!rec) return '';
  return encodeURIComponent(JSON.stringify({
    nama: rec.nama || '',
    toko: rec.toko || '',
    jenis: rec.jenis || '',
    shift: rec.shift || '',
    hari: rec.hari || '',
    tanggalDisplay: rec.tanggalDisplay || '',
    jam: rec.jam || '',
    status: rec.status || ''
  }));
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
        <div class="detail-grid" style="margin-top:0;padding:0;background:transparent;border:none">
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
      <div class="detail-grid" style="margin-top:0;padding:0;background:transparent;border:none">
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
          ? `<button type="button" class="btn btn-outline btn-sm" onclick="previewPhoto('${esc(masuk.foto)}','${encodePhotoMeta(masuk)}')">Foto Masuk</button>`
          : `<button type="button" class="btn btn-outline btn-sm" disabled>Foto Masuk (-)</button>`}
        ${istirahat && istirahat.foto
          ? `<button type="button" class="btn btn-outline btn-sm" onclick="previewPhoto('${esc(istirahat.foto)}','${encodePhotoMeta(istirahat)}')">Foto Istirahat</button>`
          : `<button type="button" class="btn btn-outline btn-sm" disabled>Foto Istirahat (-)</button>`}
        ${pulang && pulang.foto
          ? `<button type="button" class="btn btn-blush btn-sm" onclick="previewPhoto('${esc(pulang.foto)}','${encodePhotoMeta(pulang)}')">Foto Pulang</button>`
          : `<button type="button" class="btn btn-blush btn-sm" disabled>Foto Pulang (-)</button>`}
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
  if (!Object.keys(state.calRecordsByDate).length) {
    document.getElementById('crewCalendarGrid').innerHTML = '<div class="empty-state" style="grid-column:1/-1">Memuat kalender...</div>';
  }

  setBgSync(true);
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
  } finally {
    setBgSync(false);
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

/* ======================== MODAL DETAILS: KALENDER KARYAWAN ======================== */

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
  setBgSync(true);
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
  } finally {
    setBgSync(false);
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

function openTodayHistoryFromDashboard() {
  const now = new Date(Date.now() + state.serverOffsetMs);
  const todayKey = (state.dashData && state.dashData.todayDateKey) ||
    `${now.getFullYear()}-${pad2(now.getMonth() + 1)}-${pad2(now.getDate())}`;

  document.getElementById('filterSearch').value = '';
  document.getElementById('filterJenis').value = 'SEMUA';
  document.getElementById('filterShift').value = 'SEMUA';
  document.getElementById('filterStart').value = todayKey;
  document.getElementById('filterEnd').value = todayKey;

  const filterTokoSel = document.getElementById('filterToko');
  if (filterTokoSel) {
    const targetToko = state.dashOutletFilter || 'SEMUA';
    if ([...filterTokoSel.options].some((o) => o.value === targetToko)) {
      filterTokoSel.value = targetToko;
    } else {
      filterTokoSel.value = 'SEMUA';
    }
  }

  state.historyMode = 'list';
  switchView('viewRiwayat', { skipLoad: true });
  loadHistory();
}

async function loadHistory() {
  const isAdmin = state.user.role === 'ADMIN';
  document.getElementById('riwayatModeSub').textContent = isAdmin
    ? 'Semua cabang • Admin Only dapat edit/hapus'
    : 'Management Monitoring lintas cabang (Hanya Lihat)';

  const container = document.getElementById('historyList');
  if (!state.historyRecords.length) {
    container.innerHTML = '<div class="empty-state">Memuat riwayat absensi...</div>';
  }

  const filters = {
    search: document.getElementById('filterSearch').value.trim(),
    toko: document.getElementById('filterToko').value,
    jenis: document.getElementById('filterJenis').value,
    shift: document.getElementById('filterShift').value,
    startDate: document.getElementById('filterStart').value,
    endDate: document.getElementById('filterEnd').value
  };

  const actionName = isAdmin ? 'getHistory' : 'getMonitoringHistory';
  setBgSync(true);
  try {
    const res = await apiCall({ action: actionName, filters });
    if (res.stores && res.stores.length) populateFilterStores(res.stores);
    state.historyRecords = res.records || [];
    renderHistoryCurrentMode();
  } catch (err) {
    container.innerHTML = `<div class="empty-state">${esc(err.message)}</div>`;
  } finally {
    setBgSync(false);
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
    <div class="gallery-card" onclick="previewPhoto('${esc(r.foto)}','${encodePhotoMeta(r)}')">
      <img class="gallery-thumb" loading="lazy" src="${esc(toDisplayImageUrl(r.foto, 500))}" alt="${esc(r.nama)}" />
      <div class="gallery-meta">
        <div style="display:flex;justify-content:space-between;align-items:center;gap:6px">
          <strong>${esc(r.nama)}</strong>
          <span class="badge ${jenisBadgeClass(r.jenis)}">${esc(r.jenis)}</span>
        </div>
        <span>${esc(r.toko)} • ${esc(r.shift)}</span>
        <span>${esc(r.tanggalDisplay)} • ${esc(r.jam)} WIB</span>
      </div>
    </div>
  `).join('');
}

function renderRecordList(container, records, allowAdminActions) {
  if (!records.length) {
    container.innerHTML = `
      <div class="mascot-empty-box">
        <div class="mascot-empty-circle"><img data-mascot-img alt="" /></div>
        <strong>Belum ada data absensi sesuai filter</strong>
        <span>Coba klik Reset atau ubah rentang tanggal.</span>
      </div>
    `;
    applyMascotAssets(container);
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
            ${r.foto ? `<button type="button" class="btn-ghost-sm" onclick="previewPhoto('${esc(r.foto)}','${encodePhotoMeta(r)}')">Foto</button>` : ''}
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

/* ======================== DASHBOARD LIVE & MANAGEMENT MONITORING ======================== */

function startDashboardAutoRefresh() {
  stopDashboardAutoRefresh();
  state.dashAutoRefreshTimer = setInterval(() => {
    if (state.activeView !== 'viewDashboard' || document.hidden) return;
    if (document.querySelector('.modal-backdrop:not(.hidden)')) return;
    loadDashboard(true);
  }, 60000);
}

function stopDashboardAutoRefresh() {
  if (state.dashAutoRefreshTimer) {
    clearInterval(state.dashAutoRefreshTimer);
    state.dashAutoRefreshTimer = null;
  }
}

async function loadDashboard(silent = false) {
  const isAdmin = state.user.role === 'ADMIN';
  document.getElementById('dashHeadingTitle').textContent = isAdmin ? 'Dashboard Hari Ini' : 'Management Monitoring — Live';
  document.getElementById('dashTopSwitcher').classList.toggle('hidden', state.user.role === 'MONITORING');

  // Instant Cache: tampilkan data terakhir segera sambil menyegarkan diam-diam di latar belakang
  if (state.dashData) {
    renderDashboardFromData();
  }

  if (!silent && !state.dashData) {
    setLoading(true, 'Memuat data live...');
  } else {
    setBgSync(true);
  }

  try {
    const res = await apiCall({ action: isAdmin ? 'getDashboard' : 'getMonitoringDashboard' });
    if (res.stores && res.stores.length) populateFilterStores(res.stores);
    state.dashData = res;
    state.dashLastUpdatedAt = new Date(Date.now() + state.serverOffsetMs);
    renderDashboardFromData();
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    if (!silent && !state.dashData) {
      setLoading(false);
    } else {
      setBgSync(false);
    }
    setLoading(false);
  }
}

function renderDashboardOutletPills(stores) {
  const bar = document.getElementById('dashOutletFilterBar');
  if (!bar) return;
  const list = ['SEMUA', ...(stores || [])];
  if (!list.includes(state.dashOutletFilter)) state.dashOutletFilter = 'SEMUA';

  bar.innerHTML = list.map((name) => {
    const label = name === 'SEMUA' ? 'Semua Outlet' : name;
    const activeCls = state.dashOutletFilter === name ? 'active' : '';
    return `<button type="button" class="outlet-pill ${activeCls}" data-outlet="${esc(name)}">${esc(label)}</button>`;
  }).join('');

  bar.querySelectorAll('.outlet-pill').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.dashOutletFilter = btn.dataset.outlet || 'SEMUA';
      renderDashboardFromData();
    });
  });
}

function renderDashboardFromData() {
  const res = state.dashData;
  if (!res) return;

  const filterOutlet = state.dashOutletFilter || 'SEMUA';
  const matchOutlet = (toko) => filterOutlet === 'SEMUA' || String(toko || '').toUpperCase() === filterOutlet.toUpperCase();

  renderDashboardOutletPills(res.stores || []);

  document.getElementById('dashDateLabel').textContent = res.serverDate || '-';
  const updEl = document.getElementById('dashLiveUpdated');
  if (updEl && state.dashLastUpdatedAt) {
    const hh = pad2(state.dashLastUpdatedAt.getHours());
    const mm = pad2(state.dashLastUpdatedAt.getMinutes());
    updEl.innerHTML = `<i class="live-pulse-dot"></i> Live • ${hh}:${mm} WIB`;
  }

  const perStoreAll = res.perStore || [];
  const perStoreFiltered = filterOutlet === 'SEMUA'
    ? perStoreAll
    : perStoreAll.filter((s) => matchOutlet(s.toko));

  const activeBreaks = (res.activeBreaks || []).filter((b) => matchOutlet(b.toko));
  const belumPulang = (res.belumPulang || []).filter((b) => matchOutlet(b.toko));
  const belumHadir = (res.belumHadir || []).filter((b) => matchOutlet(b.toko));
  const izinSakit = (res.izinSakitHariIni || []).filter((b) => matchOutlet(b.toko));
  const terlambat = (res.terlambatHariIni || []).filter((b) => matchOutlet(b.toko));
  const todayRecords = (res.todayRecords || []).filter((r) => matchOutlet(r.toko));

  // Hitung 6 KPI sesuai outlet terpilih
  const kpiMasuk = perStoreFiltered.reduce((sum, s) => sum + (s.masuk || 0), 0);
  const kpiPulang = perStoreFiltered.reduce((sum, s) => sum + (s.pulang || 0), 0);
  const kpiTelat = perStoreFiltered.reduce((sum, s) => sum + (s.terlambat || 0), 0);
  const kpiBelumPulang = belumPulang.filter((b) => b.hariIni).length;
  const kpiIstirahat = activeBreaks.filter((b) => b.isOngoing).length;
  const kpiBelumHadir = belumHadir.length;

  document.getElementById('kpiMasuk').textContent = kpiMasuk;
  document.getElementById('kpiIstirahat').textContent = kpiIstirahat;
  document.getElementById('kpiPulang').textContent = kpiPulang;
  document.getElementById('kpiBelumHadir').textContent = kpiBelumHadir;
  document.getElementById('kpiBelumPulang').textContent = kpiBelumPulang;
  document.getElementById('kpiTelat').textContent = kpiTelat;

  const canWa = state.user && (state.user.role === 'ADMIN' || state.user.role === 'MONITORING');

  // 1. Accordion Belum Hadir & Izin/Sakit
  const bhCard = document.getElementById('accBelumHadirCard');
  const bhTotal = belumHadir.length + izinSakit.length;
  if (bhTotal > 0) {
    bhCard.classList.remove('hidden');
    const lewatCnt = belumHadir.filter((b) => b.sudahLewatJam).length;
    document.getElementById('accBelumHadirCount').textContent = bhTotal;
    document.getElementById('accBelumHadirSub').textContent =
      `${belumHadir.length} belum absen${lewatCnt ? ` (${lewatCnt} lewat jam mulai)` : ''} • ${izinSakit.length} izin/sakit/off`;

    const bhItemsHtml = belumHadir.map((b) => {
      const waMsg = `Halo ${b.nama}, jadwal shift ${b.shift} hari ini di MOMOYO ${b.toko} dimulai pukul ${b.shiftMulai} WIB. Mohon konfirmasi kehadiran & segera absen masuk ya. Terima kasih!`;
      const waBtn = canWa ? buildWaButtonHtml(b.noTelp, waMsg) : '';
      return `
        <div class="mini-item">
          <div>
            <strong>${esc(b.nama)}</strong> <span class="record-sub">(${esc(b.toko)})</span>
            <div class="record-sub">Jadwal Shift ${esc(b.shift)} • Mulai ${esc(b.shiftMulai)} WIB</div>
          </div>
          <div class="mini-item-actions">
            ${waBtn}
            <span class="badge ${b.sudahLewatJam ? 'badge-danger' : 'badge-berry'}">
              ${b.sudahLewatJam ? `Lewat ${b.lewatMenit}m` : 'Belum Absen'}
            </span>
          </div>
        </div>
      `;
    }).join('');

    const izinItemsHtml = izinSakit.map((it) => {
      const waMsg = `Halo ${it.nama} (MOMOYO ${it.toko}), terkait status jadwal ${it.status} hari ini. Semoga lancar ya!`;
      const waBtn = canWa ? buildWaButtonHtml(it.noTelp, waMsg) : '';
      return `
        <div class="mini-item">
          <div>
            <strong>${esc(it.nama)}</strong> <span class="record-sub">(${esc(it.toko)})</span>
            <div class="record-sub">${esc(it.catatan || 'Tercatat di jadwal shift hari ini')}</div>
          </div>
          <div class="mini-item-actions">
            ${waBtn}
            <span class="badge badge-neutral">${esc(it.status)}</span>
          </div>
        </div>
      `;
    }).join('');

    document.getElementById('dashBelumHadirList').innerHTML = bhItemsHtml + izinItemsHtml;
  } else {
    bhCard.classList.add('hidden');
  }

  // 2. Accordion Sedang / Baru Selesai Istirahat
  const brCard = document.getElementById('dashActiveBreaksCard');
  if (activeBreaks.length) {
    brCard.classList.remove('hidden');
    document.getElementById('accActiveBreaksCount').textContent = activeBreaks.length;
    const ongoingCnt = activeBreaks.filter((b) => b.isOngoing).length;
    document.getElementById('accActiveBreaksSub').textContent = `${ongoingCnt} sedang istirahat • ${activeBreaks.length - ongoingCnt} baru selesai`;

    document.getElementById('dashActiveBreaksList').innerHTML = activeBreaks.map((b) => {
      const meta = encodePhotoMeta({
        nama: b.nama, toko: b.toko, jenis: 'ISTIRAHAT', shift: b.shift,
        hari: '', tanggalDisplay: res.serverDate, jam: b.startJam, status: `s/d ${b.endJam} WIB`
      });
      const waMsg = `Halo ${b.nama}, mengingatkan waktu istirahat shift ${b.shift} di MOMOYO ${b.toko} berakhir pukul ${b.endJam} WIB. Mohon bersiap kembali bertugas ya. Terima kasih!`;
      const waBtn = canWa ? buildWaButtonHtml(b.noTelp, waMsg) : '';
      return `
        <div class="mini-item">
          <div>
            <strong>${esc(b.nama)}</strong> <span class="record-sub">(${esc(b.toko)})</span>
            <div class="record-sub">Shift ${esc(b.shift)} • ${esc(b.startJam)} s/d ${esc(b.endJam)} WIB</div>
          </div>
          <div class="mini-item-actions">
            ${b.foto ? `<button type="button" class="btn-ghost-sm" onclick="previewPhoto('${esc(b.foto)}','${meta}')">Foto</button>` : ''}
            ${waBtn}
            <span class="badge ${b.isOngoing ? 'badge-warning' : 'badge-masuk'} live-break-badge" data-end-ms="${b.endMs}">
              ${b.isOngoing ? `Sisa ${formatRemainingMs(b.endMs - (Date.now() + state.serverOffsetMs))}` : 'Selesai'}
            </span>
          </div>
        </div>
      `;
    }).join('');
  } else {
    brCard.classList.add('hidden');
  }

  // 3. Accordion Belum Absen Pulang
  const bpCard = document.getElementById('belumPulangCard');
  if (belumPulang.length) {
    bpCard.classList.remove('hidden');
    document.getElementById('accBelumPulangCount').textContent = belumPulang.length;
    const pastCnt = belumPulang.filter((b) => !b.hariIni).length;
    document.getElementById('accBelumPulangSub').textContent =
      `${kpiBelumPulang} hari ini${pastCnt ? ` • ${pastCnt} terlewat dari hari sebelumnya` : ''}`;

    document.getElementById('belumPulangList').innerHTML = belumPulang.map((b) => {
      const waMsg = `Halo ${b.nama}, tercatat belum melakukan absen PULANG untuk shift ${b.shift} tanggal ${b.tanggal} di MOMOYO ${b.toko}. Mohon segera lengkapi/konfirmasi ke Admin ya. Terima kasih!`;
      const waBtn = canWa ? buildWaButtonHtml(b.noTelp, waMsg) : '';
      return `
        <div class="mini-item">
          <div>
            <strong>${esc(b.nama)}</strong> <span class="record-sub">(${esc(b.toko)})</span>
            <div class="record-sub">${esc(b.tanggal)} • Shift ${esc(b.shift)} • Masuk ${esc(b.jamMasuk)}</div>
          </div>
          <div class="mini-item-actions">
            ${waBtn}
            <span class="badge ${b.hariIni ? 'badge-warning' : 'badge-danger'}">${b.hariIni ? 'Hari Ini' : 'Terlewat'}</span>
          </div>
        </div>
      `;
    }).join('');
  } else {
    bpCard.classList.add('hidden');
  }

  // 4. Accordion Terlambat Hari Ini
  const tlCard = document.getElementById('accTerlambatCard');
  if (terlambat.length) {
    tlCard.classList.remove('hidden');
    document.getElementById('accTerlambatCount').textContent = terlambat.length;
    document.getElementById('accTerlambatSub').textContent = `${terlambat.length} karyawan terlambat masuk hari ini`;

    document.getElementById('dashTerlambatList').innerHTML = terlambat.map((t) => {
      const meta = encodePhotoMeta({
        nama: t.nama, toko: t.toko, jenis: 'MASUK', shift: t.shift,
        hari: '', tanggalDisplay: res.serverDate, jam: t.jam, status: t.status
      });
      const waMsg = `Halo ${t.nama}, tercatat absen masuk hari ini di MOMOYO ${t.toko} pukul ${t.jam} WIB (${t.status}). Mohon tetap jaga ketepatan waktu di shift berikutnya ya. Terima kasih!`;
      const waBtn = canWa ? buildWaButtonHtml(t.noTelp, waMsg) : '';
      return `
        <div class="mini-item">
          <div>
            <strong>${esc(t.nama)}</strong> <span class="record-sub">(${esc(t.toko)})</span>
            <div class="record-sub">Shift ${esc(t.shift)} • Masuk ${esc(t.jam)} WIB</div>
          </div>
          <div class="mini-item-actions">
            ${t.foto ? `<button type="button" class="btn-ghost-sm" onclick="previewPhoto('${esc(t.foto)}','${meta}')">Foto</button>` : ''}
            ${waBtn}
            <span class="badge badge-danger">${esc(t.status)}</span>
          </div>
        </div>
      `;
    }).join('');
  } else {
    tlCard.classList.add('hidden');
  }

  // Tabel Ringkasan per Cabang Toko (7 Kolom)
  document.getElementById('dashStoreTable').innerHTML = perStoreFiltered.map((s) => `
    <tr class="clickable-row" onclick="openStoreDetail(decodeURIComponent('${encodeURIComponent(s.toko)}'))">
      <td>
        <div class="row-entity-cell">
          <span class="row-init-badge">${esc(getInitials(s.toko))}</span>
          <span class="row-entity-name">${esc(s.toko)}</span>
        </div>
      </td>
      <td class="text-center"><strong>${s.masuk}</strong></td>
      <td class="text-center">${s.istirahat || 0}</td>
      <td class="text-center">${s.pulang}</td>
      <td class="text-center">${(s.belumHadir || 0) > 0 ? `<span class="num-pill num-pill-berry">${s.belumHadir}</span>` : '0'}</td>
      <td class="text-center">${s.belumPulang > 0 ? `<span class="num-pill num-pill-warn">${s.belumPulang}</span>` : '0'}</td>
      <td class="text-center">${s.terlambat > 0 ? `<span class="num-pill num-pill-danger">${s.terlambat}</span>` : '0'}</td>
    </tr>
  `).join('');

  // 1 Kartu Tombol Ringkas Detail Absensi Hari Ini
  const recMasuk = todayRecords.filter((r) => r.jenis === 'MASUK').length;
  const recIst = todayRecords.filter((r) => r.jenis === 'ISTIRAHAT').length;
  const recPulang = todayRecords.filter((r) => r.jenis === 'PULANG').length;
  const scopeTxt = filterOutlet === 'SEMUA' ? 'Semua outlet' : filterOutlet;
  document.getElementById('dashTodayCountBadge').textContent = todayRecords.length;
  document.getElementById('dashTodaySummaryText').textContent = todayRecords.length
    ? `${scopeTxt}: ${recMasuk} Masuk • ${recIst} Istirahat • ${recPulang} Pulang`
    : `${scopeTxt}: Belum ada aktivitas absensi hari ini`;

  const chartStores = filterOutlet === 'SEMUA'
    ? (res.chartPerStore || [])
    : (res.chartPerStore || []).filter((c) => matchOutlet(c.label));
  renderCharts(chartStores, res.chart7Days || []);
  tickAllBreakCountdowns();
}

const bar3DGlossPlugin = {
  id: 'bar3DGloss',
  beforeDatasetsDraw(chart) {
    const { ctx } = chart;
    ctx.save();
    ctx.shadowColor = 'rgba(180, 26, 44, 0.22)';
    ctx.shadowBlur = 12;
    ctx.shadowOffsetX = 3;
    ctx.shadowOffsetY = 6;
  },
  afterDatasetsDraw(chart) {
    const { ctx } = chart;
    ctx.restore();
    chart.data.datasets.forEach((ds, dsIdx) => {
      const meta = chart.getDatasetMeta(dsIdx);
      if (meta.hidden) return;
      meta.data.forEach((bar) => {
        const props = bar.getProps(['x', 'y', 'base', 'width'], true);
        const h = props.base - props.y;
        if (h < 8 || props.width < 6) return;
        const left = props.x - props.width / 2;
        const glossW = Math.max(3, props.width * 0.26);
        ctx.save();
        const sheen = ctx.createLinearGradient(left, props.y, left + glossW, props.base);
        sheen.addColorStop(0, 'rgba(255, 255, 255, 0.42)');
        sheen.addColorStop(1, 'rgba(255, 255, 255, 0.04)');
        ctx.fillStyle = sheen;
        ctx.beginPath();
        if (ctx.roundRect) {
          ctx.roundRect(left + 2, props.y + 3, glossW, Math.max(4, h - 6), 6);
        } else {
          ctx.rect(left + 2, props.y + 3, glossW, Math.max(4, h - 6));
        }
        ctx.fill();
        ctx.restore();
      });
    });
  }
};

const line3DGlowPlugin = {
  id: 'line3DGlow',
  beforeDatasetDraw(chart, args) {
    const { ctx } = chart;
    ctx.save();
    ctx.shadowColor = args.index === 0 ? 'rgba(220, 38, 54, 0.34)' : 'rgba(13, 150, 104, 0.28)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 5;
  },
  afterDatasetDraw(chart) {
    chart.ctx.restore();
  }
};

function renderCharts(perStore, days7) {
  if (typeof Chart === 'undefined') return;
  if (state.charts.store) state.charts.store.destroy();
  if (state.charts.days) state.charts.days.destroy();

  const ctxStore = document.getElementById('chartPerStore').getContext('2d');
  const redBarGrad = ctxStore.createLinearGradient(0, 0, 0, 230);
  redBarGrad.addColorStop(0, '#F04352');
  redBarGrad.addColorStop(0.5, '#D42232');
  redBarGrad.addColorStop(1, '#9E1424');

  const blueBarGrad = ctxStore.createLinearGradient(0, 0, 0, 230);
  blueBarGrad.addColorStop(0, '#60A5FA');
  blueBarGrad.addColorStop(0.55, '#2563EB');
  blueBarGrad.addColorStop(1, '#1D4ED8');

  state.charts.store = new Chart(ctxStore, {
    type: 'bar',
    data: {
      labels: perStore.map((s) => s.label),
      datasets: [
        {
          label: 'Masuk',
          data: perStore.map((s) => s.masuk),
          backgroundColor: redBarGrad,
          borderRadius: 10,
          borderSkipped: false,
          maxBarThickness: 28
        },
        {
          label: 'Pulang',
          data: perStore.map((s) => s.pulang),
          backgroundColor: blueBarGrad,
          borderRadius: 10,
          borderSkipped: false,
          maxBarThickness: 28
        }
      ]
    },
    plugins: [bar3DGlossPlugin],
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
          labels: { usePointStyle: true, pointStyle: 'circle', boxWidth: 8, font: { family: 'Plus Jakarta Sans', weight: '700', size: 11 } }
        }
      },
      scales: {
        x: {
          grid: { display: false },
          border: { display: false },
          ticks: { color: '#6C7486', font: { family: 'Plus Jakarta Sans', size: 10, weight: '600' } }
        },
        y: {
          beginAtZero: true,
          border: { display: false },
          grid: { color: '#F5E8EB' },
          ticks: { stepSize: 1, color: '#8A92A4', font: { family: 'Plus Jakarta Sans', size: 10 } }
        }
      },
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
  const redAreaGrad = ctxDays.createLinearGradient(0, 0, 0, 220);
  redAreaGrad.addColorStop(0, 'rgba(220, 38, 54, 0.28)');
  redAreaGrad.addColorStop(1, 'rgba(220, 38, 54, 0.01)');

  const greenAreaGrad = ctxDays.createLinearGradient(0, 0, 0, 220);
  greenAreaGrad.addColorStop(0, 'rgba(13, 150, 104, 0.22)');
  greenAreaGrad.addColorStop(1, 'rgba(13, 150, 104, 0.01)');

  state.charts.days = new Chart(ctxDays, {
    type: 'line',
    data: {
      labels: days7.map((d) => d.label),
      datasets: [
        {
          label: 'Masuk',
          data: days7.map((d) => d.masuk),
          borderColor: '#DC2636',
          backgroundColor: redAreaGrad,
          borderWidth: 3,
          pointBackgroundColor: '#FFFFFF',
          pointBorderColor: '#DC2636',
          pointBorderWidth: 3,
          pointRadius: 4.5,
          pointHoverRadius: 7,
          tension: 0.42,
          fill: true
        },
        {
          label: 'Pulang',
          data: days7.map((d) => d.pulang),
          borderColor: '#0D9668',
          backgroundColor: greenAreaGrad,
          borderWidth: 3,
          pointBackgroundColor: '#FFFFFF',
          pointBorderColor: '#0D9668',
          pointBorderWidth: 3,
          pointRadius: 4.5,
          pointHoverRadius: 7,
          tension: 0.42,
          fill: true
        }
      ]
    },
    plugins: [line3DGlowPlugin],
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
          labels: { usePointStyle: true, pointStyle: 'circle', boxWidth: 8, font: { family: 'Plus Jakarta Sans', weight: '700', size: 11 } }
        }
      },
      scales: {
        x: {
          grid: { display: false },
          border: { display: false },
          ticks: { color: '#6C7486', font: { family: 'Plus Jakarta Sans', size: 10, weight: '600' } }
        },
        y: {
          beginAtZero: true,
          border: { display: false },
          grid: { color: '#F5E8EB' },
          ticks: { stepSize: 1, color: '#8A92A4', font: { family: 'Plus Jakarta Sans', size: 10 } }
        }
      }
    }
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
  const canWa = state.user && (state.user.role === 'ADMIN' || state.user.role === 'MONITORING');

  setBgSync(true);
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
      const initials = getInitials(c.nama);
      const avatarHtml = c.fotoProfil
        ? `<img src="${esc(toDisplayImageUrl(c.fotoProfil))}" alt="${esc(c.nama)}" />`
        : esc(initials);
      const metaParts = [c.posisi || 'Karyawan'];
      if (c.area && c.area !== '-') metaParts.push(c.area);
      if (c.id) metaParts.push(`ID: ${c.id}`);

      const waBtn = canWa
        ? buildWaButtonHtml(c.noTelp, `Halo ${c.nama} (MOMOYO ${c.toko}), `)
        : '';

      const encCrew = encodeURIComponent(JSON.stringify({
        nama: c.nama,
        toko: c.toko,
        posisi: c.posisi,
        area: c.area
      }));

      return `
        <div class="crew-stat-card">
          <div class="crew-stat-header">
            <div class="crew-stat-header-left">
              <div class="crew-mini-avatar">${avatarHtml}</div>
              <div>
                <div class="record-title">${esc(c.nama)}</div>
                <div class="record-sub">${esc(metaParts.join(' • '))}</div>
              </div>
            </div>
            ${waBtn}
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
  } finally {
    setBgSync(false);
  }
}

/* ======================== JADWAL SHIFT PER TOKO + SALIN MINGGU LALU ======================== */

async function loadJadwalView(forceRefresh = false) {
  const isAdmin = state.user.role === 'ADMIN';
  document.getElementById('jadwalModeSubtitle').textContent = isAdmin
    ? 'Klik kotak tanggal untuk mengatur jadwal, atau gunakan Salin Minggu Lalu.'
    : 'Jadwal resmi per outlet dari Admin Only (Hanya Lihat).';

  const tokoSel = document.getElementById('jadwalTokoSelect');
  const month = Number(document.getElementById('jadwalMonthSelect').value) || (nowInit.getMonth() + 1);
  const year = Number(document.getElementById('jadwalYearSelect').value) || nowInit.getFullYear();
  let toko = tokoSel.value || state.jadwalStore || (state.user.role === 'CREW' ? state.user.toko : '');

  const cacheKey = `${toko}|${year}|${month}`;
  const cached = !forceRefresh && toko ? state.cache.jadwal[cacheKey] : null;
  const wrap = document.getElementById('jadwalMatrixWrap');

  if (cached) {
    state.jadwalStore = toko;
    state.jadwalCrews = cached.crews;
    state.jadwalMap = Object.assign({}, cached.map);
    state.jadwalDirty = {};
    updateJadwalDirtyInfo();
    renderJadwalMatrix(year, month);
  } else {
    wrap.innerHTML = '<div class="empty-state">Memuat jadwal toko...</div>';
  }

  setBgSync(true);
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
        setBgSync(false);
        return loadJadwalView(forceRefresh);
      }
    }

    const newMap = {};
    (res.schedules || []).forEach((s) => {
      const k = `${s.dateKey}|${s.crewId || s.nama.toUpperCase()}`;
      newMap[k] = s.status;
    });

    state.cache.jadwal[`${toko}|${year}|${month}`] = {
      crews: res.crews || [],
      map: newMap
    };

    state.jadwalStore = toko;
    state.jadwalCrews = res.crews || [];
    state.jadwalMap = newMap;
    state.jadwalDirty = {};
    updateJadwalDirtyInfo();
    renderJadwalMatrix(year, month);
  } catch (err) {
    if (!cached) wrap.innerHTML = `<div class="empty-state">${esc(err.message)}</div>`;
    else showToast(err.message, 'error');
  } finally {
    setBgSync(false);
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

async function copyPreviousWeekSchedules() {
  if (!state.jadwalStore || !state.jadwalCrews.length) {
    showToast('Pilih outlet yang sudah memiliki karyawan.', 'error');
    return;
  }

  const year = Number(document.getElementById('jadwalYearSelect').value);
  const month = Number(document.getElementById('jadwalMonthSelect').value);
  const weekFilter = document.getElementById('jadwalWeekSelect').value;
  const daysInMonth = new Date(year, month, 0).getDate();

  let startDay = 1;
  let endDay = daysInMonth;
  if (weekFilter !== 'ALL') {
    const w = Number(weekFilter);
    startDay = (w - 1) * 7 + 1;
    endDay = Math.min(daysInMonth, w * 7);
  }

  // Ambil jadwal 7 hari terakhir dari bulan sebelumnya agar salin lintas bulan tetap mulus
  const prevEnd = new Date(year, month - 1, 0);
  const prevStart = new Date(prevEnd.getFullYear(), prevEnd.getMonth(), prevEnd.getDate() - 6);
  const prevStartKey = `${prevStart.getFullYear()}-${pad2(prevStart.getMonth() + 1)}-${pad2(prevStart.getDate())}`;
  const prevEndKey = `${prevEnd.getFullYear()}-${pad2(prevEnd.getMonth() + 1)}-${pad2(prevEnd.getDate())}`;

  setLoading(true, 'Mengambil pola jadwal minggu lalu...');
  try {
    const prevMap = Object.assign({}, state.jadwalMap);
    Object.keys(state.jadwalDirty).forEach((k) => {
      prevMap[k] = state.jadwalDirty[k].status;
    });

    if (startDay <= 7) {
      const resPrev = await apiCall({
        action: 'getSchedules',
        toko: state.jadwalStore,
        startDate: prevStartKey,
        endDate: prevEndKey
      });
      (resPrev.schedules || []).forEach((s) => {
        const k = `${s.dateKey}|${s.crewId || s.nama.toUpperCase()}`;
        prevMap[k] = s.status;
      });
    }

    let copiedCount = 0;
    for (let d = startDay; d <= endDay; d++) {
      const targetDate = new Date(year, month - 1, d);
      const sourceDate = new Date(year, month - 1, d - 7);
      const targetDk = `${targetDate.getFullYear()}-${pad2(targetDate.getMonth() + 1)}-${pad2(targetDate.getDate())}`;
      const sourceDk = `${sourceDate.getFullYear()}-${pad2(sourceDate.getMonth() + 1)}-${pad2(sourceDate.getDate())}`;

      state.jadwalCrews.forEach((c) => {
        const crewKey = c.id || c.nama.toUpperCase();
        const targetKey = `${targetDk}|${crewKey}`;
        const sourceKey = `${sourceDk}|${crewKey}`;

        // Di mode 1 Bulan Penuh, jangan menimpa tanggal yang sudah diisi manual
        const existingTarget = state.jadwalDirty[targetKey] !== undefined
          ? state.jadwalDirty[targetKey].status
          : (state.jadwalMap[targetKey] || '');
        if (weekFilter === 'ALL' && existingTarget) return;

        const srcVal = prevMap[sourceKey] || '';
        if (srcVal) {
          state.jadwalDirty[targetKey] = {
            dateKey: targetDk,
            crewId: c.id,
            nama: c.nama,
            status: srcVal,
            catatan: ''
          };
          prevMap[targetKey] = srcVal;
          copiedCount++;
        }
      });
    }

    if (copiedCount === 0) {
      showToast('Tidak ditemukan jadwal 7 hari sebelumnya untuk disalin.', 'error');
    } else {
      renderJadwalMatrix(year, month);
      updateJadwalDirtyInfo();
      showToast(`${copiedCount} kotak jadwal disalin! Cek kembali lalu klik Simpan Jadwal.`, 'success');
    }
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    setLoading(false);
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
    const m = Number(document.getElementById('jadwalMonthSelect').value);
    const y = Number(document.getElementById('jadwalYearSelect').value);
    state.cache.jadwal[`${state.jadwalStore}|${y}|${m}`] = {
      crews: state.jadwalCrews,
      map: Object.assign({}, state.jadwalMap)
    };
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

function renderInsightData(res) {
  document.getElementById('insightPeriodDesc').textContent = `Perbandingan ${res.periodLabel} dibanding ${res.prevLabel}`;

  const o = res.overall;
  document.getElementById('insJam').textContent = `${o.curJam} jam`;
  setDiffPill(document.getElementById('insJamDiff'), o.curJam, o.prevJam, ' jam', false);

  document.getElementById('insHadir').textContent = `${o.curHadir} hari`;
  setDiffPill(document.getElementById('insHadirDiff'), o.curHadir, o.prevHadir, ' hari', false);

  document.getElementById('insTelat').textContent = `${o.curTelat}x`;
  setDiffPill(document.getElementById('insTelatDiff'), o.curTelat, o.prevTelat, 'x', true);

  document.getElementById('insStoreTable').innerHTML = (res.perStore || []).map((s) => `
    <tr class="clickable-row" onclick="openStoreDetail(decodeURIComponent('${encodeURIComponent(s.toko)}'))">
      <td>
        <div class="row-entity-cell">
          <span class="row-init-badge">${esc(getInitials(s.toko))}</span>
          <span class="row-entity-name">${esc(s.toko)}</span>
        </div>
      </td>
      <td><strong>${s.curJam}j</strong> <small class="subtitle">(lalu ${s.prevJam}j)</small></td>
      <td><span class="num-pill num-pill-ok">${s.curHadir}</span> <small class="subtitle">(lalu ${s.prevHadir})</small></td>
      <td>${s.curTelat > 0 ? `<span class="num-pill num-pill-danger">${s.curTelat}</span>` : '0'} <small class="subtitle">(lalu ${s.prevTelat})</small></td>
    </tr>
  `).join('') || '<tr><td colspan="4" class="text-center">Belum ada data.</td></tr>';

  document.getElementById('insCrewTable').innerHTML = (res.perCrew || []).map((c) => `
    <tr>
      <td>
        <div class="row-entity-cell">
          <span class="row-init-badge">${esc(getInitials(c.nama))}</span>
          <span class="row-entity-name">${esc(c.nama)}</span>
        </div>
      </td>
      <td>${esc(c.toko)}</td>
      <td><strong>${c.curJam}j</strong> <small class="subtitle">(${c.prevJam}j)</small></td>
      <td><span class="num-pill num-pill-ok">${c.curHadir}</span> <small class="subtitle">(${c.prevHadir})</small></td>
      <td>${c.curTelat > 0 ? `<span class="num-pill num-pill-danger">${c.curTelat}</span>` : '0'} <small class="subtitle">(${c.prevTelat})</small></td>
    </tr>
  `).join('') || '<tr><td colspan="5" class="text-center">Belum ada data.</td></tr>';
}

async function loadInsights(period, forceRefresh = false) {
  const isAdmin = state.user.role === 'ADMIN';
  document.getElementById('insightTopSwitcher').classList.toggle('hidden', state.user.role === 'MONITORING');
  document.getElementById('insightPageTitle').textContent = isAdmin ? 'Insight & Rekap Gaji' : 'Insight Performa Outlet';

  const activeBtn = document.querySelector('#insightPeriodToggle .seg-btn.active');
  const p = period || (activeBtn ? activeBtn.dataset.period : 'week');

  if (!forceRefresh && state.cache.insight[p]) {
    renderInsightData(state.cache.insight[p]);
  }

  setBgSync(true);
  try {
    const res = await apiCall({
      action: isAdmin ? 'getInsights' : 'getMonitoringInsights',
      period: p
    });
    state.cache.insight[p] = res;
    renderInsightData(res);
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    setBgSync(false);
  }
}

function setDiffPill(el, cur, prev, unit, invertColor) {
  if (!el) return;
  const diff = Math.round((cur - prev) * 10) / 10;
  const sign = diff > 0 ? '+' : '';
  const arrow = diff > 0 ? '↑ ' : (diff < 0 ? '↓ ' : '');
  el.textContent = `${arrow}${sign}${diff}${unit} vs lalu (${prev}${unit})`;
  el.classList.remove('diff-pos', 'diff-neg');
  if (diff > 0) el.classList.add(invertColor ? 'diff-neg' : 'diff-pos');
  else if (diff < 0) el.classList.add(invertColor ? 'diff-pos' : 'diff-neg');
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
      tbody.innerHTML = `
        <tr>
          <td colspan="7" class="recap-empty-cell">
            <div class="mascot-empty-box">
              <div class="mascot-empty-circle"><img data-mascot-img alt="" /></div>
              <strong>Tidak ada data absensi di bulan ini.</strong>
              <span>Pilih bulan lain lalu klik Tampilkan.</span>
            </div>
          </td>
        </tr>
      `;
      applyMascotAssets(tbody);
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

/* ======================== BUKTI FOTO (+ META WAKTU), EDIT & HAPUS ======================== */

window.previewPhoto = function (url, encodedMeta = '') {
  document.getElementById('modalPhotoImg').src = toDisplayImageUrl(url, 1200);
  document.getElementById('modalPhotoLink').href = url;

  const metaEl = document.getElementById('modalPhotoMeta');
  if (encodedMeta) {
    try {
      const m = JSON.parse(decodeURIComponent(encodedMeta));
      const dateLine = [m.hari, m.tanggalDisplay].filter(Boolean).join(', ');
      const timeLine = m.jam && m.jam !== '-' ? `${m.jam} WIB` : '-';
      const statusLine = m.status && m.status !== '-' ? ` • ${m.status}` : '';
      metaEl.innerHTML = `
        <strong>${esc(m.nama || '-')} • ${esc(m.toko || '-')} • ${esc(m.jenis || '-')} (${esc(m.shift || '-')})</strong>
        <span>Waktu Tercatat: ${esc(dateLine || '-')} • ${esc(timeLine)}${esc(statusLine)}</span>
      `;
      metaEl.classList.remove('hidden');
    } catch {
      metaEl.classList.add('hidden');
    }
  } else {
    metaEl.classList.add('hidden');
  }

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
      loadMasterData(true);
    } else if (item.type === 'store') {
      await apiCall({ action: 'deleteStore', nama: item.nama });
      showToast('Toko dihapus.', 'success');
      loadMasterData(true);
    }
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    state.pendingDelete = null;
    setLoading(false);
  }
}

function refreshCurrentAdminView() {
  if (!document.getElementById('viewDashboard').classList.contains('hidden')) loadDashboard(true);
  if (!document.getElementById('viewRiwayat').classList.contains('hidden')) loadHistory();
}

/* ======================== KELOLA OUTLET & KARYAWAN TERPADU (ADMIN ONLY) ======================== */

async function loadMasterData(forceRefresh = false) {
  if (!forceRefresh && state.cache.masterLoaded) {
    renderManagedOutletsAndCrews();
  }

  setBgSync(true);
  try {
    const res = await apiCall({ action: 'getMasterData' });
    state.stores = res.stores || [];
    state.crews = res.crews || [];
    state.cache.masterLoaded = true;
    localStorage.setItem('momoyo_stores', JSON.stringify(state.stores));
    populateFilterStores();
    syncGreetingInputs();
    renderManagedOutletsAndCrews();
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    setBgSync(false);
  }
}

function getPosRankClient(posisi) {
  const p = String(posisi || '').toUpperCase();
  if (p.includes('SUPERVISOR')) return 0;
  if (p.includes('KEPALA TOKO')) return 1;
  if (p.includes('KEPALA')) return 2;
  return 3;
}

function renderManagedOutletsAndCrews() {
  const container = document.getElementById('manageOutletCrewList');
  if (!container) return;

  const query = (document.getElementById('manageCrewSearch')?.value || '').trim().toLowerCase();
  const stores = state.stores || [];
  const crews = state.crews || [];

  if (!stores.length && !crews.length) {
    container.innerHTML = '<div class="empty-state">Belum ada data outlet atau karyawan.</div>';
    return;
  }

  const knownStoreUps = new Set(stores.map((s) => s.nama.toUpperCase()));
  const groups = stores.map((st) => ({
    store: st,
    name: st.nama,
    crews: crews.filter((c) => c.toko.toUpperCase() === st.nama.toUpperCase())
  }));

  const orphanCrews = crews.filter((c) => !knownStoreUps.has(c.toko.toUpperCase()));
  if (orphanCrews.length) {
    groups.push({ store: null, name: 'LAINNYA', crews: orphanCrews });
  }

  const html = groups.map((g) => {
    const sortedCrews = [...g.crews].sort((a, b) => {
      if (a.aktif !== b.aktif) return a.aktif ? -1 : 1;
      const ra = getPosRankClient(a.posisi);
      const rb = getPosRankClient(b.posisi);
      if (ra !== rb) return ra - rb;
      return a.nama.localeCompare(b.nama);
    });

    const filteredCrews = query
      ? sortedCrews.filter((c) =>
          c.nama.toLowerCase().includes(query) ||
          c.id.toLowerCase().includes(query) ||
          (c.posisi || '').toLowerCase().includes(query) ||
          g.name.toLowerCase().includes(query)
        )
      : sortedCrews;

    if (query && !filteredCrews.length && !g.name.toLowerCase().includes(query)) {
      return '';
    }

    const activeCount = sortedCrews.filter((c) => c.aktif).length;
    const isOpen = query ? true : Boolean(state.openManageOutlets[g.name]);
    const st = g.store;
    const encStore = st ? encodeURIComponent(JSON.stringify(st)) : '';
    const encName = encodeURIComponent(g.name);

    const crewItemsHtml = filteredCrews.length
      ? filteredCrews.map((c) => {
          const encCrew = encodeURIComponent(JSON.stringify(c));
          const initials = getInitials(c.nama);
          const avatarHtml = c.fotoProfil
            ? `<img src="${esc(toDisplayImageUrl(c.fotoProfil))}" alt="${esc(c.nama)}" />`
            : esc(initials);
          const subParts = [c.posisi || 'Karyawan'];
          if (c.area) subParts.push(c.area);
          const waBtn = buildWaButtonHtml(c.noTelp, `Halo ${c.nama} (MOMOYO ${c.toko}), `);

          return `
            <div class="outlet-crew-item">
              <div class="record-top">
                <div style="display:flex;align-items:center;gap:10px;min-width:0">
                  <div class="crew-mini-avatar">${avatarHtml}</div>
                  <div style="min-width:0">
                    <div class="record-title">${esc(c.nama)}</div>
                    <div class="record-sub">${esc(subParts.join(' • '))}</div>
                    ${c.noTelp ? `<div class="record-sub">Telp: ${esc(c.noTelp)}</div>` : ''}
                  </div>
                </div>
                <span class="badge ${c.aktif ? 'badge-masuk' : 'badge-neutral'}">${c.aktif ? 'Aktif' : 'Nonaktif'}</span>
              </div>
              <div class="record-bottom">
                <span class="record-sub"><strong>ID: ${esc(c.id)}</strong></span>
                <div class="record-actions">
                  ${waBtn}
                  <button type="button" class="btn-ghost-sm" onclick="openCrewModal('${encCrew}')">Edit / ID &amp; PIN</button>
                  <button type="button" class="btn-ghost-sm text-danger" onclick="askDeleteCrew('${esc(c.id)}', '${esc(c.nama)}')">Hapus</button>
                </div>
              </div>
            </div>
          `;
        }).join('')
      : '<div class="empty-state" style="padding:16px">Belum ada karyawan di cabang ini.</div>';

    return `
      <div class="outlet-manage-card">
        <div class="outlet-manage-head">
          <div class="outlet-manage-top" onclick="toggleManageOutlet(decodeURIComponent('${encName}'))">
            <div class="outlet-manage-title-wrap">
              <span class="row-init-badge">${esc(getInitials(g.name))}</span>
              <div>
                <div class="record-title">${esc(g.name)}</div>
                ${st ? `
                  <div class="record-sub">Pagi ${st.pagiMulai}–${st.pagiSelesai} | Siang ${st.siangMulai}–${st.siangSelesai} | Full Day ${st.fullDayMulai || st.pagiMulai}–${st.fullDaySelesai || st.siangSelesai}</div>
                  <div class="record-sub">Toleransi telat: ${st.toleransi} menit • ${st.wajibGps ? `GPS Radius ${st.radius}m` : 'Absen fleksibel'}</div>
                ` : '<div class="record-sub">Cabang belum terdaftar di Master Toko</div>'}
              </div>
            </div>
            <div class="outlet-manage-badges">
              <span class="outlet-count-pill">${activeCount}/${sortedCrews.length} Karyawan</span>
              ${st ? `<span class="badge ${st.wajibGps ? 'badge-masuk' : 'badge-neutral'}">${st.wajibGps ? 'GPS On' : 'GPS Off'}</span>` : ''}
            </div>
          </div>

          <div class="outlet-manage-actions">
            <button type="button" class="btn-pill-soft" onclick="toggleManageOutlet(decodeURIComponent('${encName}'))">
              ${isOpen ? 'Tutup Daftar Karyawan ▲' : `Lihat Karyawan (${filteredCrews.length}) ▼`}
            </button>
            <div class="record-actions">
              ${st ? `<button type="button" class="btn-ghost-sm text-primary" onclick="openCrewModal('', decodeURIComponent('${encName}'))">+ Karyawan</button>` : ''}
              ${st ? `<button type="button" class="btn-ghost-sm" onclick="openStoreModal('${encStore}')">Setting Outlet</button>` : ''}
              ${st ? `<button type="button" class="btn-ghost-sm text-danger" onclick="askDeleteStore(decodeURIComponent('${encName}'))">Hapus</button>` : ''}
            </div>
          </div>
        </div>

        <div class="outlet-crew-panel ${isOpen ? '' : 'hidden'}">
          ${crewItemsHtml}
        </div>
      </div>
    `;
  }).filter(Boolean).join('');

  container.innerHTML = html || '<div class="empty-state">Tidak ditemukan outlet atau karyawan yang cocok.</div>';
}

window.toggleManageOutlet = function (storeName) {
  state.openManageOutlets[storeName] = !state.openManageOutlets[storeName];
  renderManagedOutletsAndCrews();
};

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

window.openCrewModal = function (encoded, presetStore = '') {
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
    document.getElementById('modalCrewTitle').textContent = 'Edit Karyawan / ID, Profil & PIN';
    document.getElementById('crewOriginalIdInput').value = c.id;
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
    document.getElementById('crewOriginalIdInput').value = '';
    document.getElementById('crewIdInput').value = '';
    document.getElementById('crewNamaInput').value = '';
    if (presetStore && [...tokoSel.options].some((o) => o.value === presetStore)) {
      tokoSel.value = presetStore;
    }
    document.getElementById('crewAreaInput').value = '';
    setPosisiFieldValue('Crew Minuman');
    document.getElementById('crewTelpInput').value = '';
    document.getElementById('crewPinInput').value = '';
    document.getElementById('crewAktifInput').checked = true;
    renderAvatar(photoPrev, '', 'KR');
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

  const tokoVal = document.getElementById('crewTokoInput').value;
  setLoading(true, 'Menyimpan data karyawan...');
  try {
    const res = await apiCall({
      action: 'saveCrew',
      crew: {
        originalId: document.getElementById('crewOriginalIdInput').value.trim(),
        id: document.getElementById('crewIdInput').value.trim(),
        nama: document.getElementById('crewNamaInput').value.trim(),
        toko: tokoVal,
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
    state.openManageOutlets[tokoVal] = true;
    showToast(res.message || 'Data karyawan tersimpan.', 'success');
    loadMasterData(true);
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
    document.getElementById('modalStoreTitle').textContent = 'Setting Cabang Outlet';
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
    document.getElementById('modalStoreTitle').textContent = 'Tambah Cabang Outlet';
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
  setLoading(true, 'Menyimpan data outlet...');
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
    showToast('Data outlet tersimpan.', 'success');
    loadMasterData(true);
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

  document.querySelectorAll('[data-switch-view]').forEach((btn) => {
    btn.addEventListener('click', () => switchView(btn.dataset.switchView));
  });

  // Accordion Dashboard & Monitoring
  document.querySelectorAll('.acc-head[data-acc-target]').forEach((headBtn) => {
    headBtn.addEventListener('click', () => {
      const body = document.getElementById(headBtn.dataset.accTarget);
      if (!body) return;
      const opening = body.classList.contains('hidden');
      body.classList.toggle('hidden', !opening);
      headBtn.classList.toggle('is-open', opening);
    });
  });

  // Kartu ringkas Detail Absensi Hari Ini -> buka Riwayat terfilter hari ini
  document.getElementById('btnOpenTodayHistoryCard').addEventListener('click', openTodayHistoryFromDashboard);

  // Profil
  document.getElementById('btnOpenProfile').addEventListener('click', openProfileModal);
  document.getElementById('btnPickMyPhoto').addEventListener('click', () => document.getElementById('inputMyPhoto').click());
  document.getElementById('inputMyPhoto').addEventListener('change', handleMyPhotoPick);
  document.getElementById('btnClearMyPhoto').addEventListener('click', clearMyPhoto);
  document.getElementById('formAdminProfile').addEventListener('submit', submitAdminProfileForm);

  // Form Absensi & Kamera Live
  document.querySelectorAll('#formAbsen .seg-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      setSelectedAbsenJenis(btn.dataset.jenis, true);
    });
  });

  document.getElementById('absenToko').addEventListener('change', () => {
    updateShiftOptionLabels();
    updateGpsHint();
    loadActiveBreaksForAbsen();
  });
  document.getElementById('btnRefreshStoreBreaks').addEventListener('click', loadActiveBreaksForAbsen);
  document.getElementById('btnOpenCamera').addEventListener('click', openLiveCameraModal);
  document.getElementById('inputFotoKamera').addEventListener('change', handleNativeCameraSelected);
  document.getElementById('btnCloseLiveCamera').addEventListener('click', stopLiveCamera);
  document.getElementById('btnFlipCamera').addEventListener('click', () => {
    liveCam.facingMode = liveCam.facingMode === 'user' ? 'environment' : 'user';
    startLiveCameraStream();
  });
  document.getElementById('btnCaptureLivePhoto').addEventListener('click', captureFromLiveCamera);
  document.getElementById('btnFallbackNativeCam').addEventListener('click', () => {
    stopLiveCamera();
    document.getElementById('inputFotoKamera').click();
  });
  document.getElementById('btnRemovePhoto').addEventListener('click', clearPhoto);
  document.getElementById('formAbsen').addEventListener('submit', submitAttendance);
  document.getElementById('btnRetryAbsen').addEventListener('click', () => submitAttendance());

  // Kalender
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

  // Riwayat & Galeri
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
  document.getElementById('btnRefreshDash').addEventListener('click', () => loadDashboard(true));
  document.getElementById('btnReloadStoreDetail').addEventListener('click', loadStoreDetailData);

  // Jadwal Shift
  document.getElementById('jadwalTokoSelect').addEventListener('change', () => loadJadwalView());
  document.getElementById('jadwalMonthSelect').addEventListener('change', () => loadJadwalView());
  document.getElementById('jadwalYearSelect').addEventListener('change', () => loadJadwalView());
  document.getElementById('jadwalWeekSelect').addEventListener('change', () => {
    const m = Number(document.getElementById('jadwalMonthSelect').value);
    const y = Number(document.getElementById('jadwalYearSelect').value);
    renderJadwalMatrix(y, m);
  });
  document.getElementById('btnReloadJadwal').addEventListener('click', () => loadJadwalView(true));
  document.getElementById('btnCopyPrevWeek').addEventListener('click', copyPreviousWeekSchedules);
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

  // Kelola
  document.getElementById('manageCrewSearch').addEventListener('input', renderManagedOutletsAndCrews);
  document.getElementById('formAbsenGreetings').addEventListener('submit', saveAbsenGreetings);
  document.getElementById('formEditRecord').addEventListener('submit', submitEditRecord);
  document.getElementById('btnConfirmDelete').addEventListener('click', confirmDeleteAction);
  document.getElementById('btnAddCrew').addEventListener('click', () => openCrewModal());

  document.getElementById('crewPosisiInput').addEventListener('change', (e) => {
    const isCustom = e.target.value === '__CUSTOM__';
    document.getElementById('crewPosisiCustomGroup').classList.toggle('hidden', !isCustom);
    if (isCustom) document.getElementById('crewPosisiCustomInput').focus();
  });

  document.getElementById('btnPickCrewPhoto').addEventListener('click', () => document.getElementById('inputCrewPhoto').click());
  document.getElementById('inputCrewPhoto').addEventListener('change', handleCrewPhotoPick);
  document.getElementById('btnClearCrewPhoto').addEventListener('click', () => {
    state.crewPhotoDraft = '';
    state.crewClearPhoto = true;
    const nm = document.getElementById('crewNamaInput').value || 'KR';
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

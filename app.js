/**
 * ============================================================
 * MOMOYO ABSENSI KARYAWAN — FRONTEND APPLICATION v4.2 FINAL
 * ============================================================
 */
const API_URL = 'https://script.google.com/macros/s/AKfycbyrbl6vBqA1uatZYi2kEn6gv5AxwrB4LEnmEIwh5NW0DwCowh0so6uZOIbzV3F8wVeg/exec';

const HARI_MAP = {
  id: ['MINGGU', 'SENIN', 'SELASA', 'RABU', 'KAMIS', 'JUMAT', 'SABTU'],
  en: ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'],
  zh: ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
};
const HARI_SHORT_MAP = {
  id: ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'],
  en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  zh: ['日', '一', '二', '三', '四', '五', '六']
};
const BULAN_MAP = {
  id: ['JANUARI', 'FEBRUARI', 'MARET', 'APRIL', 'MEI', 'JUNI', 'JULI', 'AGUSTUS', 'SEPTEMBER', 'OKTOBER', 'NOVEMBER', 'DESEMBER'],
  en: ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'],
  zh: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
};

const VALID_WORK_SHIFTS = ['PAGI', 'SIANG', 'FULL DAY'];
const PRESET_POSISI = ['Supervisor', 'Kepala Toko', 'Kepala Bakery', 'Crew Minuman', 'Crew Bakery'];
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

/* ======================== KAMUS MULTI-BAHASA (ID | EN | 中文) ======================== */

const I18N = {
  id: {
    appTitle: 'MOMOYO ABSENSI KARYAWAN', cheer: 'SEMANGATT',
    pwaTitle: 'Pasang Aplikasi MOMOYO', pwaSub: 'Akses cepat 1 ketukan dari layar utama HP', pwaInstall: 'Pasang',
    loginSub: 'Sistem Absensi, Jadwal & Monitoring Outlet',
    roleCrew: 'Karyawan', roleAdmin: 'Admin Only', roleMonitor: 'Management Monitoring',
    lblSelectStore: 'Pilih Cabang Toko', lblCrewName: 'Nama Karyawan', lblCrewPin: 'PIN / Password Karyawan',
    phCrewPin: 'Masukkan PIN dari Admin', btnLoginCrew: 'Masuk sebagai Karyawan',
    lblAdminPass: 'Password Admin Only', phAdminPass: 'Masukkan password Admin', btnLoginAdmin: 'Masuk Dashboard Admin Only',
    monitorTitle: 'Management Monitoring — Live Outlet',
    monitorDesc: 'Pantau kehadiran hari ini, deteksi belum hadir, istirahat, keterlambatan, jadwal shift per toko, kalender karyawan, dan bukti foto absensi secara langsung (hanya lihat).',
    btnEnterMonitor: 'Buka Management Monitoring', loginNote: 'Lupa PIN atau belum terdaftar? Hubungi Admin MOMOYO.',
    btnLogout: 'Keluar', btnLogin: 'Login',
    clockNote: 'Jam resmi tercatat otomatis mengikuti waktu server (WIB)',
    todayProgressTitle: 'Progres Absen Hari Ini', typeMasuk: 'Masuk', typeIstirahat: 'Istirahat', typePulang: 'Pulang',
    btnRequestLeave: 'Ajukan Izin / Sakit', todaySchedLabel: 'Jadwal Anda Hari Ini', onBreakBadge: 'SEDANG ISTIRAHAT',
    lblAbsenType: 'Jenis Absensi', breakRuleHint: 'Aturan Istirahat: Shift Pagi & Siang = 1 jam, Full Day = 1 jam 30 menit. Wajib foto selfie kamera langsung.',
    lblBkoToggle: 'Sedang BKO di cabang outlet lain?', lblOutlet: 'Outlet', lblShift: 'Shift', badgeMatchSched: 'Sesuai Jadwal',
    lblAbsenNote: 'Catatan Singkat (Opsional)', phAbsenNote: 'Contoh: Lembur stock opname, hujan deras...',
    lblSelfieReq: 'Foto Selfie Wajib (Kamera Langsung)', btnTakeSelfie: 'Ambil Foto Selfie Sekarang', btnRetake: 'Foto Ulang',
    photoEmptyTitle: 'Belum ada foto selfie', photoEmptySub: 'Tekan tombol di atas untuk mengambil foto langsung dari kamera. Stempel waktu aktual otomatis tertanam di foto.',
    btnRetry: 'Coba Kirim Lagi', btnSubmitAbsen: 'Kirim Absen Sekarang',
    todayPhotosTitle: 'Bukti Foto Absen Hari Ini', tapPhotoHint: 'Ketuk foto untuk perbesar',
    storeBreaksTitle: 'Status Istirahat', btnRefresh: 'Segarkan',
    myCalTitle: 'Kalender Absensi & Rekap Saya', btnReload: 'Muat Ulang',
    statTotalIn: 'Total Masuk', shiftPagi: 'Pagi', shiftSiang: 'Siang', shiftFullDay: 'Full Day',
    statWorkHours: 'Total Jam', statLateMins: 'Total Telat', statLeaveSick: 'Izin/Sakit', statNoOut: 'Lupa Pulang',
    legComplete: 'Hadir lengkap', legNoOut: 'Belum pulang', legLate: 'Terlambat', legSched: 'Jadwal / Izin / Sakit',
    pickCalDate: 'Pilih tanggal di kalender', pickCalDateSub: 'Ketuk salah satu tanggal untuk melihat jadwal, jam masuk, istirahat, pulang, dan bukti foto.',
    historyTitle: 'Riwayat & Bukti Foto', btnAddManual: '+ Absen Manual', phSearchCrew: 'Cari nama karyawan...',
    btnApply: 'Terapkan', btnReset: 'Reset', modeList: 'Daftar', modeGallery: 'Galeri Foto',
    swLiveToday: 'Live Hari Ini', swInsightRecap: 'Insight & Rekap', btnDailyReportWa: 'Laporan WA',
    kpiAbsent: 'Belum Hadir', kpiNoOut: 'Belum Pulang', kpiLate: 'Terlambat',
    accLeaveTitle: 'Pengajuan Izin / Sakit Menunggu Persetujuan', accAbsentTitle: 'Belum Hadir / Izin / Sakit',
    accBreakTitle: 'Sedang / Baru Selesai Istirahat', accNoOutTitle: 'Belum Absen Pulang', accLateTitle: 'Terlambat Hari Ini',
    storeSummaryTitle: 'Ringkasan per Cabang Toko', storeSummaryHint: 'Ketuk toko untuk detail & kalender karyawan',
    thStore: 'Toko', thAbsent: 'Blm Hadir', thNoOut: 'Blm Pulang', thLate: 'Telat', thPresent: 'Hadir', thName: 'Nama',
    chartStoreTitle: 'Grafik Hari Ini per Toko', chartStoreHint: 'Ketuk bar toko', chart7dTitle: 'Tren 7 Hari Terakhir', chart7dHint: 'Masuk & Pulang',
    todayDetailCta: 'Detail Absensi & Foto Hari Ini', seeDetail: 'Lihat Detail ›',
    jadwalTitle: 'Jadwal Shift per Toko', btnThisWeek: 'Minggu Ini', btnExportPng: 'Unduh PNG', btnShareWa: 'Kirim WA',
    btnCopyPrevWeek: 'Salin Minggu Lalu', btnSaveJadwal: 'Simpan Jadwal',
    insightTitle: 'Insight & Rekap Gaji', insWeek: 'Minggu Ini vs Lalu', insMonth: 'Bulan Ini vs Lalu',
    insTotalHours: 'Total Jam Kerja', insTotalPresent: 'Total Hari Hadir', insTotalLate: 'Total Keterlambatan',
    topDisciplineTitle: 'Top Disiplin', needAttentionTitle: 'Perlu Perhatian',
    compPerStore: 'Perbandingan per Toko', compPerCrew: 'Perbandingan per Karyawan',
    recapExportTitle: 'Ekspor Rekap Bulanan (Keperluan Gaji)', btnShow: 'Tampilkan', btnExportCsv: 'Unduh CSV (Excel)',
    recapEmptyTitle: 'Pilih bulan lalu klik Tampilkan.', recapEmptySub: 'Rekap gaji akan muncul di sini.',
    manageTitle: 'Kelola MOMOYO', annAdminTitle: 'Papan Pengumuman Outlet',
    annAdminSub: 'Kirim info SOP/promo ke semua cabang atau outlet tertentu & pantau siapa yang sudah membaca.',
    lblAnnTarget: 'Tujuan Outlet', lblAnnTitle: 'Judul Pengumuman', lblAnnBody: 'Isi Pesan', btnSendAnn: 'Kirim Pengumuman',
    outletCrewTitle: 'Outlet & Daftar Karyawan', outletCrewSub: 'Ketuk cabang untuk melihat daftar karyawan, edit ID, profil, PIN, dan setting shift/GPS.',
    btnAddStore: '+ Tambah Outlet', btnAddCrew: '+ Tambah Karyawan', phSearchAllCrew: 'Cari nama karyawan atau ID di semua outlet...',
    greetTitle: 'Teks Ucapan Layar Absensi', greetSub: 'Tampil otomatis di bawah jam saat karyawan memilih Masuk, Istirahat, atau Pulang.',
    btnSaveGreet: 'Simpan Teks Ucapan', changeAdminPassTitle: 'Ganti Password Admin Only', btnSaveNewPass: 'Simpan Password Baru',
    liveCamTitle: 'Kamera Selfie Live', btnFlipCam: 'Putar Kamera', btnSnapPhoto: 'Jepret Foto', btnFallbackCam: 'Kamera tidak muncul? Gunakan kamera bawaan HP',
    lblLeaveType: 'Jenis Pengajuan', lblStartDate: 'Dari Tanggal', lblEndDate: 'Sampai Tanggal',
    lblLeaveReason: 'Alasan / Keterangan', lblLeaveProof: 'Foto Bukti / Surat Dokter (Opsional)',
    btnSubmitLeave: 'Kirim Pengajuan ke Admin', myLeaveHistTitle: 'Riwayat Pengajuan Saya',
    manualAbsenTitle: 'Input Absen Susulan (Admin)', profileTitle: 'Profil Akun',
    btnChangePhoto: 'Ganti Foto Profil', btnDeletePhoto: 'Hapus Foto',
    changeMyPinTitle: 'Ganti PIN Pribadi', lblOldPin: 'PIN Lama', lblNewPin: 'PIN Baru (min. 4)', btnSaveNewPin: 'Simpan PIN Baru',
    btnClose: 'Tutup', btnView: 'Lihat', absenSuccessTitle: 'Absensi Berhasil Dicatat!', btnDone: 'Selesai',
    photoProofTitle: 'Bukti Foto Absensi', btnOpenDrive: 'Buka di Google Drive',
    navDashboard: 'Dashboard', navLive: 'Live', navJadwal: 'Jadwal', navAbsen: 'Absen', navRiwayat: 'Riwayat',
    navKelola: 'Kelola', navInsight: 'Insight', navKalender: 'Kalender', navPantau: 'Pantau', navGaleri: 'Galeri',
    allOutlets: 'Semua Outlet', notYet: 'Belum', alreadyDonePrefix: 'Kamu sudah melakukan absen', todayWord: 'hari ini',
    recordedAt: 'Tercatat pada jam', jumpNext: 'Lanjut ke Absen', markRead: '✓ Sudah Dibaca',
    approveBtn: 'Setujui', rejectBtn: 'Tolak', allDoneMsg: 'Absen Hari Ini Lengkap', nextStagePrefix: 'Berikutnya:'
  },
  en: {
    appTitle: 'MOMOYO STAFF ATTENDANCE', cheer: 'STAY AWESOME',
    pwaTitle: 'Install MOMOYO App', pwaSub: '1-tap fast access from your home screen', pwaInstall: 'Install',
    loginSub: 'Attendance, Shift Schedule & Outlet Monitoring',
    roleCrew: 'Staff', roleAdmin: 'Admin Only', roleMonitor: 'Management Monitoring',
    lblSelectStore: 'Select Outlet Branch', lblCrewName: 'Staff Name', lblCrewPin: 'Staff PIN / Password',
    phCrewPin: 'Enter PIN from Admin', btnLoginCrew: 'Sign In as Staff',
    lblAdminPass: 'Admin Only Password', phAdminPass: 'Enter Admin password', btnLoginAdmin: 'Sign In Admin Dashboard',
    monitorTitle: 'Management Monitoring — Live Outlets',
    monitorDesc: 'Monitor live attendance, absent detection, breaks, late arrivals, shift schedules, staff calendars, and photo proofs in real time (read-only).',
    btnEnterMonitor: 'Open Management Monitoring', loginNote: 'Forgot PIN or not registered? Contact MOMOYO Admin.',
    btnLogout: 'Sign Out', btnLogin: 'Login',
    clockNote: 'Official time is recorded automatically using server time (WIB)',
    todayProgressTitle: 'Today Attendance Progress', typeMasuk: 'Clock In', typeIstirahat: 'Break', typePulang: 'Clock Out',
    btnRequestLeave: 'Request Leave / Sick', todaySchedLabel: 'Your Schedule Today', onBreakBadge: 'ON BREAK',
    lblAbsenType: 'Attendance Type', breakRuleHint: 'Break Rule: Morning & Afternoon Shift = 1 hour, Full Day = 1h 30m. Live camera selfie required.',
    lblBkoToggle: 'Covering shift (BKO) at another outlet?', lblOutlet: 'Outlet', lblShift: 'Shift', badgeMatchSched: 'Scheduled',
    lblAbsenNote: 'Short Note (Optional)', phAbsenNote: 'e.g. Stock opname overtime, heavy rain...',
    lblSelfieReq: 'Live Camera Selfie (Required)', btnTakeSelfie: 'Take Selfie Photo Now', btnRetake: 'Retake',
    photoEmptyTitle: 'No selfie photo yet', photoEmptySub: 'Tap the button above to capture a live camera photo. Real-time timestamp is automatically embedded.',
    btnRetry: 'Try Sending Again', btnSubmitAbsen: 'Submit Attendance Now',
    todayPhotosTitle: 'Today Attendance Photos', tapPhotoHint: 'Tap photo to zoom',
    storeBreaksTitle: 'Break Status', btnRefresh: 'Refresh',
    myCalTitle: 'My Attendance Calendar & Summary', btnReload: 'Reload',
    statTotalIn: 'Days In', shiftPagi: 'Morning', shiftSiang: 'Afternoon', shiftFullDay: 'Full Day',
    statWorkHours: 'Work Hours', statLateMins: 'Total Late', statLeaveSick: 'Leave/Sick', statNoOut: 'Missed Out',
    legComplete: 'Complete', legNoOut: 'No Clock Out', legLate: 'Late', legSched: 'Schedule / Leave',
    pickCalDate: 'Select a date on calendar', pickCalDateSub: 'Tap any date to inspect schedule, clock in/out times, breaks, and photo proofs.',
    historyTitle: 'History & Photo Proofs', btnAddManual: '+ Manual Entry', phSearchCrew: 'Search staff name...',
    btnApply: 'Apply', btnReset: 'Reset', modeList: 'List', modeGallery: 'Photo Gallery',
    swLiveToday: 'Live Today', swInsightRecap: 'Insight & Recap', btnDailyReportWa: 'WA Report',
    kpiAbsent: 'Absent', kpiNoOut: 'No Clock Out', kpiLate: 'Late',
    accLeaveTitle: 'Pending Leave / Sick Requests', accAbsentTitle: 'Absent / Leave / Sick',
    accBreakTitle: 'Active / Recent Breaks', accNoOutTitle: 'Not Clocked Out Yet', accLateTitle: 'Late Arrivals Today',
    storeSummaryTitle: 'Outlet Branch Summary', storeSummaryHint: 'Tap branch for staff details & calendar',
    thStore: 'Outlet', thAbsent: 'Absent', thNoOut: 'No Out', thLate: 'Late', thPresent: 'Present', thName: 'Name',
    chartStoreTitle: 'Today Attendance by Outlet', chartStoreHint: 'Tap outlet bar', chart7dTitle: 'Last 7 Days Trend', chart7dHint: 'In & Out',
    todayDetailCta: 'Today Attendance & Photo Details', seeDetail: 'View Details ›',
    jadwalTitle: 'Outlet Shift Schedule', btnThisWeek: 'This Week', btnExportPng: 'Download PNG', btnShareWa: 'Share WA',
    btnCopyPrevWeek: 'Copy Last Week', btnSaveJadwal: 'Save Schedule',
    insightTitle: 'Insights & Payroll Recap', insWeek: 'This Week vs Last', insMonth: 'This Month vs Last',
    insTotalHours: 'Total Work Hours', insTotalPresent: 'Total Present Days', insTotalLate: 'Total Late Count',
    topDisciplineTitle: 'Top Discipline', needAttentionTitle: 'Needs Attention',
    compPerStore: 'Comparison by Outlet', compPerCrew: 'Comparison by Staff',
    recapExportTitle: 'Monthly Payroll Recap Export', btnShow: 'Show', btnExportCsv: 'Download CSV (Excel)',
    recapEmptyTitle: 'Select a month and click Show.', recapEmptySub: 'Payroll recap will appear here.',
    manageTitle: 'Manage MOMOYO', annAdminTitle: 'Outlet Announcement Board',
    annAdminSub: 'Send announcements to all or specific outlets & track who has read them.',
    lblAnnTarget: 'Target Outlet', lblAnnTitle: 'Title', lblAnnBody: 'Message', btnSendAnn: 'Publish Announcement',
    outletCrewTitle: 'Outlets & Staff Directory', outletCrewSub: 'Tap branch to manage staff, custom ID, profile, PIN, and shift/GPS settings.',
    btnAddStore: '+ Add Outlet', btnAddCrew: '+ Add Staff', phSearchAllCrew: 'Search staff name or ID across outlets...',
    greetTitle: 'Attendance Greeting Text', greetSub: 'Displayed automatically under the live clock for Clock In, Break, and Clock Out.',
    btnSaveGreet: 'Save Greetings', changeAdminPassTitle: 'Change Admin Only Password', btnSaveNewPass: 'Save New Password',
    liveCamTitle: 'Live Selfie Camera', btnFlipCam: 'Flip Camera', btnSnapPhoto: 'Capture Photo', btnFallbackCam: 'Camera not showing? Use phone native camera',
    lblLeaveType: 'Request Type', lblStartDate: 'Start Date', lblEndDate: 'End Date',
    lblLeaveReason: 'Reason / Details', lblLeaveProof: 'Proof Photo / Doctor Note (Optional)',
    btnSubmitLeave: 'Submit Request to Admin', myLeaveHistTitle: 'My Requests History',
    manualAbsenTitle: 'Manual Attendance Entry (Admin)', profileTitle: 'Account Profile',
    btnChangePhoto: 'Change Photo', btnDeletePhoto: 'Remove Photo',
    changeMyPinTitle: 'Change Personal PIN', lblOldPin: 'Current PIN', lblNewPin: 'New PIN (min. 4)', btnSaveNewPin: 'Save New PIN',
    btnClose: 'Close', btnView: 'View', absenSuccessTitle: 'Attendance Recorded!', btnDone: 'Done',
    photoProofTitle: 'Attendance Photo Proof', btnOpenDrive: 'Open in Google Drive',
    navDashboard: 'Dashboard', navLive: 'Live', navJadwal: 'Schedule', navAbsen: 'Check In', navRiwayat: 'History',
    navKelola: 'Manage', navInsight: 'Insight', navKalender: 'Calendar', navPantau: 'Monitor', navGaleri: 'Gallery',
    allOutlets: 'All Outlets', notYet: 'Pending', alreadyDonePrefix: 'You have already completed', todayWord: 'today',
    recordedAt: 'Recorded at', jumpNext: 'Proceed to', markRead: '✓ Mark as Read',
    approveBtn: 'Approve', rejectBtn: 'Reject', allDoneMsg: 'All Completed Today', nextStagePrefix: 'Next:'
  },
  zh: {
    appTitle: 'MOMOYO 员工考勤系统', cheer: '加油！',
    pwaTitle: '安装 MOMOYO 应用', pwaSub: '添加到手机桌面，一键快速打开', pwaInstall: '安装',
    loginSub: '门店考勤、排班与实时监控系统',
    roleCrew: '员工登录', roleAdmin: '管理员', roleMonitor: '管理层监控',
    lblSelectStore: '选择门店', lblCrewName: '员工姓名', lblCrewPin: '员工 PIN 密码',
    phCrewPin: '请输入管理员提供的 PIN', btnLoginCrew: '员工登录',
    lblAdminPass: '管理员密码', phAdminPass: '请输入管理员密码', btnLoginAdmin: '进入管理后台',
    monitorTitle: '管理层实时监控 — 各门店动态',
    monitorDesc: '实时查看今日出勤、未打卡提醒、休息状态、迟到记录、门店排班表、员工月历及打卡照片（只读模式）。',
    btnEnterMonitor: '进入管理层监控', loginNote: '忘记密码或尚未注册？请联系 MOMOYO 管理员。',
    btnLogout: '退出', btnLogin: '登录',
    clockNote: '打卡时间自动同步服务器标准时间 (WIB)',
    todayProgressTitle: '今日打卡进度', typeMasuk: '上班打卡', typeIstirahat: '休息打卡', typePulang: '下班打卡',
    btnRequestLeave: '申请请假 / 病假', todaySchedLabel: '今日排班', onBreakBadge: '正在休息',
    lblAbsenType: '打卡类型', breakRuleHint: '休息规则：早班/晚班 = 1小时，全天班 = 1小时30分。必须现场自拍。',
    lblBkoToggle: '正在其他门店支援 (BKO)？', lblOutlet: '门店', lblShift: '班次', badgeMatchSched: '按排班',
    lblAbsenNote: '备注说明（选填）', phAbsenNote: '例如：盘点加班、大雨迟到...',
    lblSelfieReq: '现场自拍照片（必填）', btnTakeSelfie: '立即自拍打卡', btnRetake: '重拍',
    photoEmptyTitle: '尚未拍摄自拍', photoEmptySub: '点击上方按钮使用相机现场拍摄，系统自动添加实时时间戳水印。',
    btnRetry: '重新提交', btnSubmitAbsen: '立即提交打卡',
    todayPhotosTitle: '今日打卡照片凭证', tapPhotoHint: '点击照片查看大图',
    storeBreaksTitle: '门店休息状态', btnRefresh: '刷新',
    myCalTitle: '我的考勤日历与汇总', btnReload: '刷新',
    statTotalIn: '出勤天数', shiftPagi: '早班', shiftSiang: '晚班', shiftFullDay: '全天',
    statWorkHours: '总工时', statLateMins: '累计迟到', statLeaveSick: '请假/病假', statNoOut: '漏打下班',
    legComplete: '出勤完整', legNoOut: '未打下班', legLate: '迟到', legSched: '排班 / 请假',
    pickCalDate: '请选择日历日期', pickCalDateSub: '点击任意日期查看排班、上下班时间、休息记录和照片凭证。',
    historyTitle: '考勤记录与照片', btnAddManual: '+ 补录考勤', phSearchCrew: '搜索员工姓名...',
    btnApply: '筛选', btnReset: '重置', modeList: '列表', modeGallery: '照片墙',
    swLiveToday: '今日实时', swInsightRecap: '数据分析与汇总', btnDailyReportWa: 'WA日报',
    kpiAbsent: '未打卡', kpiNoOut: '未下班', kpiLate: '迟到',
    accLeaveTitle: '待审批请假 / 病假申请', accAbsentTitle: '未打卡 / 请假 / 病假',
    accBreakTitle: '正在休息 / 刚结束休息', accNoOutTitle: '尚未打下班卡', accLateTitle: '今日迟到名单',
    storeSummaryTitle: '各门店今日考勤汇总', storeSummaryHint: '点击门店查看员工详情与月历',
    thStore: '门店', thAbsent: '未打卡', thNoOut: '未下班', thLate: '迟到', thPresent: '出勤', thName: '姓名',
    chartStoreTitle: '各门店今日打卡图表', chartStoreHint: '点击柱状图查看', chart7dTitle: '近7天出勤趋势', chart7dHint: '上班 & 下班',
    todayDetailCta: '今日打卡明细与照片', seeDetail: '查看明细 ›',
    jadwalTitle: '门店排班表', btnThisWeek: '本周', btnExportPng: '下载图片', btnShareWa: '发到WA',
    btnCopyPrevWeek: '复制上周排班', btnSaveJadwal: '保存排班',
    insightTitle: '数据分析与薪资汇总', insWeek: '本周 vs 上周', insMonth: '本月 vs 上月',
    insTotalHours: '总工作时长', insTotalPresent: '总出勤天数', insTotalLate: '总迟到次数',
    topDisciplineTitle: '优秀全勤榜', needAttentionTitle: '需关注名单',
    compPerStore: '各门店对比', compPerCrew: '员工对比',
    recapExportTitle: '月度考勤报表导出（薪资核算）', btnShow: '查询', btnExportCsv: '导出 CSV (Excel)',
    recapEmptyTitle: '请选择月份后点击查询。', recapEmptySub: '月度考勤统计将显示在此处。',
    manageTitle: '门店与员工管理', annAdminTitle: '门店公告栏',
    annAdminSub: '向全部或指定门店发布通知，并查看员工已读/未读状态。',
    lblAnnTarget: '发送门店', lblAnnTitle: '公告标题', lblAnnBody: '公告内容', btnSendAnn: '发布公告',
    outletCrewTitle: '门店与员工列表', outletCrewSub: '点击门店展开员工，可编辑工号、资料、PIN密码及班次/GPS设置。',
    btnAddStore: '+ 新增门店', btnAddCrew: '+ 新增员工', phSearchAllCrew: '搜索所有门店员工姓名或工号...',
    greetTitle: '打卡界面问候语设置', greetSub: '员工选择上班、休息或下班时自动显示在时钟下方。',
    btnSaveGreet: '保存问候语', changeAdminPassTitle: '修改管理员密码', btnSaveNewPass: '保存新密码',
    liveCamTitle: '实时自拍相机', btnFlipCam: '切换镜头', btnSnapPhoto: '拍摄照片', btnFallbackCam: '无法打开相机？使用手机自带相机',
    lblLeaveType: '申请类型', lblStartDate: '开始日期', lblEndDate: '结束日期',
    lblLeaveReason: '请假事由 / 说明', lblLeaveProof: '证明照片 / 病假单（选填）',
    btnSubmitLeave: '提交给管理员审批', myLeaveHistTitle: '我的申请记录',
    manualAbsenTitle: '管理员手动补录考勤', profileTitle: '个人资料',
    btnChangePhoto: '更换头像', btnDeletePhoto: '删除头像',
    changeMyPinTitle: '修改个人 PIN 密码', lblOldPin: '当前 PIN', lblNewPin: '新 PIN（至少4位）', btnSaveNewPin: '保存新 PIN',
    btnClose: '关闭', btnView: '查看', absenSuccessTitle: '打卡成功！', btnDone: '完成',
    photoProofTitle: '考勤照片凭证', btnOpenDrive: '在 Google Drive 中打开',
    navDashboard: '首页', navLive: '监控', navJadwal: '排班', navAbsen: '打卡', navRiwayat: '记录',
    navKelola: '管理', navInsight: '分析', navKalender: '日历', navPantau: '动态', navGaleri: '相册',
    allOutlets: '全部门店', notYet: '未打卡', alreadyDonePrefix: '您今日已完成', todayWord: '',
    recordedAt: '打卡时间', jumpNext: '前往', markRead: '✓ 我已知晓',
    approveBtn: '批准', rejectBtn: '拒绝', allDoneMsg: '今日打卡已全部完成', nextStagePrefix: '下一步：'
  }
};

const MASCOT_FALLBACK_SVG = 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><circle cx="60" cy="60" r="58" fill="#FFF0F2" stroke="#C81E2B" stroke-width="4"/><circle cx="34" cy="34" r="14" fill="#D97742"/><circle cx="86" cy="34" r="14" fill="#D97742"/><circle cx="60" cy="64" r="36" fill="#E89D6C"/><ellipse cx="60" cy="72" rx="18" ry="13" fill="#FFF7F0"/><circle cx="46" cy="58" r="4.5" fill="#2B1B17"/><circle cx="74" cy="58" r="4.5" fill="#2B1B17"/><path d="M35 30 Q60 12 85 30 Q80 42 60 39 Q40 42 35 30 Z" fill="#C81E2B"/></svg>'
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
  lang: localStorage.getItem('momoyo_lang') || 'id',
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
  photoRawBase64: '',
  photoCapturedAt: null,
  leavePhotoBase64: '',
  pendingDelete: null,
  lastRecap: null,
  charts: { store: null, days: null },
  deferredInstallPrompt: null,
  serverOffsetMs: 0,
  myBreak: null,
  storeBreaks: [],
  dashData: null,
  dashOutletFilter: 'SEMUA',
  dashAutoRefreshTimer: null,
  dashLastUpdatedAt: null,
  cache: { insight: {}, jadwal: {}, masterLoaded: false },
  bgSyncCount: 0,
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
  jadwalStore: '',
  jadwalCrews: [],
  jadwalMap: {},
  jadwalDirty: {},
  jadwalBkoPending: null,
  jadwalVisibleDates: [],
  openManageOutlets: {},
  crewPhotoDraft: '',
  crewClearPhoto: false,
  announcements: []
};

const liveCam = { stream: null, facingMode: 'user', active: false };
const cropper = { img: null, baseScale: 1, zoom: 1, offsetX: 0, offsetY: 0, dragging: false, startX: 0, startY: 0, onDone: null };

function t(key) {
  const dict = I18N[state.lang] || I18N.id;
  return dict[key] !== undefined ? dict[key] : (I18N.id[key] || key);
}

function getHariList() { return HARI_MAP[state.lang] || HARI_MAP.id; }
function getHariShortList() { return HARI_SHORT_MAP[state.lang] || HARI_SHORT_MAP.id; }
function getBulanList() { return BULAN_MAP[state.lang] || BULAN_MAP.id; }

function applyLanguage(lang, rerender = true) {
  state.lang = ['id', 'en', 'zh'].includes(lang) ? lang : 'id';
  localStorage.setItem('momoyo_lang', state.lang);
  document.documentElement.lang = state.lang === 'zh' ? 'zh-CN' : state.lang;

  document.querySelectorAll('.lang-btn, .lang-mini-btn').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.lang === state.lang);
  });

  document.querySelectorAll('[data-i18n]').forEach((el) => {
    el.textContent = t(el.dataset.i18n);
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
    el.placeholder = t(el.dataset.i18nPlaceholder);
  });

  if (rerender && state.user) {
    buildBottomNav(state.user.role);
    document.getElementById('btnLogout').textContent = state.user.role === 'MONITORING' ? t('btnLogin') : t('btnLogout');
    const navHighlight = state.activeView === 'viewInsight' && state.user.role !== 'MONITORING' ? 'viewDashboard' : state.activeView;
    document.querySelectorAll('#bottomNav .nav-item').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.view === navHighlight);
    });
    if (state.activeView === 'viewDashboard' && state.dashData) renderDashboardFromData();
    if (state.activeView === 'viewAbsen') {
      renderTodayProgress(false);
      updateAbsenFormVisibility();
      renderTodayThreePhotos();
    }
    if (state.activeView === 'viewJadwal' && state.jadwalVisibleDates.length) renderJadwalMatrix();
    if (state.activeView === 'viewRiwayat') renderHistoryCurrentMode();
  }
}

/* ======================== INISIALISASI ======================== */

document.addEventListener('DOMContentLoaded', () => {
  applyMascotAssets(document);
  applyLanguage(state.lang, false);
  initServiceWorker();
  initPwaInstall();
  initOfflineIndicator();
  initPullToRefresh();
  initClock();
  bindEvents();
  initCropperEvents();
  initMonthYearSelectors();
  initJadwalRangeDefaults();

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stopLiveCamera();
    else if (state.activeView === 'viewDashboard' && state.user) loadDashboard(true);
  });

  const params = new URLSearchParams(window.location.search);
  const wantMonitor = params.has('monitoring') || window.location.hash === '#monitoring';

  if (state.token && state.user && state.user.role !== 'MONITORING') enterApp();
  else if (wantMonitor) enterMonitoringMode();
  else loadPublicInit();
});

function applyMascotAssets(root = document) {
  root.querySelectorAll('img[data-mascot-img]').forEach((img) => {
    if (img.dataset.mascotBound) return;
    img.dataset.mascotBound = '1';
    img.onerror = () => { if (img.src !== MASCOT_FALLBACK_SVG) img.src = MASCOT_FALLBACK_SVG; };
    img.src = './mascot.png';
  });
}

function initServiceWorker() {
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('./service-worker.js').catch(() => {});
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
    const hari = getHariList()[now.getDay()];
    const tgl = now.getDate();
    const bln = getBulanList()[now.getMonth()];
    const thn = now.getFullYear();
    const jam = `${pad2(now.getHours())}:${pad2(now.getMinutes())}:${pad2(now.getSeconds())}`;

    const dateEl = document.getElementById('liveDate');
    const clockEl = document.getElementById('liveClock');
    if (dateEl) dateEl.textContent = state.lang === 'zh' ? `${thn}年${bln}${tgl}日 ${hari}` : `${hari}, ${tgl} ${bln} ${thn}`;
    if (clockEl) clockEl.textContent = jam;

    if (liveCam.active) {
      const camTime = document.getElementById('liveCamTimeOverlay');
      if (camTime) camTime.textContent = `${HARI_MAP.id[now.getDay()]}, ${pad2(tgl)} ${BULAN_MAP.id[now.getMonth()]} ${thn} • ${jam} WIB`;
    }
    tickAllBreakCountdowns();
  };
  render();
  setInterval(render, 1000);
}

function setBgSync(active) {
  state.bgSyncCount = Math.max(0, state.bgSyncCount + (active ? 1 : -1));
  const bar = document.getElementById('bgSyncBar');
  if (bar) bar.classList.toggle('hidden', state.bgSyncCount === 0);
}

/* ======================== PULL-TO-REFRESH ======================== */

function initPullToRefresh() {
  const indicator = document.getElementById('ptrIndicator');
  const ptrText = document.getElementById('ptrText');
  const ptrSpinner = indicator ? indicator.querySelector('.ptr-spinner') : null;
  if (!indicator) return;
  let startY = 0, startX = 0, pulling = false, refreshing = false, pullDist = 0, rafId = 0;

  const isBlocked = (target) => !target || Boolean(document.querySelector('.modal-backdrop:not(.hidden)')) ||
    Boolean(target.closest('.jadwal-matrix-wrap, .table-wrap, .outlet-filter-bar, .crop-stage, input, select, textarea'));

  const renderFrame = () => {
    rafId = 0;
    const clamped = Math.max(0, Math.min(96, pullDist));
    indicator.style.transform = `translate3d(0, ${-48 + clamped * 0.72}px, 0)`;
    if (ptrSpinner) ptrSpinner.style.transform = `rotate(${clamped * 4}deg)`;
    ptrText.textContent = clamped >= 56 ? t('btnReload') : '↓';
  };

  window.addEventListener('touchstart', (e) => {
    if (refreshing || e.touches.length !== 1 || window.scrollY > 2) return;
    if (document.getElementById('appShell').classList.contains('hidden') || isBlocked(e.target)) return;
    startY = e.touches[0].clientY; startX = e.touches[0].clientX; pulling = true; pullDist = 0;
  }, { passive: true });

  window.addEventListener('touchmove', (e) => {
    if (!pulling || refreshing || e.touches.length !== 1) return;
    const dy = e.touches[0].clientY - startY, dx = e.touches[0].clientX - startX;
    if (dy <= 6 || window.scrollY > 2 || Math.abs(dx) > Math.abs(dy) * 0.85) {
      if (pullDist > 0) { pullDist = 0; indicator.classList.remove('is-visible', 'is-dragging'); indicator.style.transform = 'translate3d(0, -48px, 0)'; }
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
    if (rafId) { cancelAnimationFrame(rafId); rafId = 0; }
    indicator.classList.remove('is-dragging');
    if (pullDist >= 56 && !refreshing) {
      refreshing = true;
      indicator.classList.add('is-visible', 'is-refreshing');
      indicator.style.transform = 'translate3d(0, 10px, 0)';
      ptrText.textContent = '...';
      try { await refreshActiveView(true); } finally {
        setTimeout(() => {
          indicator.classList.remove('is-visible', 'is-refreshing');
          indicator.style.transform = 'translate3d(0, -48px, 0)';
          if (ptrSpinner) ptrSpinner.style.transform = '';
          refreshing = false; pullDist = 0;
        }, 250);
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
    loadCrewAnnouncements();
    return loadActiveBreaksForAbsen();
  }
}

/* ======================== UCAPAN, API & WHATSAPP ======================== */

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
  const j = (document.getElementById('absenJenis')?.value || 'MASUK').toUpperCase();
  if (j === 'ISTIRAHAT') el.textContent = state.greetings.istirahat || DEFAULT_GREETINGS.istirahat;
  else if (j === 'PULANG') el.textContent = state.greetings.pulang || DEFAULT_GREETINGS.pulang;
  else el.textContent = state.greetings.masuk || DEFAULT_GREETINGS.masuk;
}

function syncGreetingInputs() {
  const m = document.getElementById('greetMasukInput'), i = document.getElementById('greetIstirahatInput'), p = document.getElementById('greetPulangInput');
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
    showToast(res.message || 'Tersimpan!', 'success');
  } catch (err) { showToast(err.message, 'error'); } finally { setLoading(false); }
}

async function apiCall(payload, timeoutMs = 35000) {
  if (!navigator.onLine) throw new Error('Tidak ada koneksi internet.');
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
    try { data = JSON.parse(text); } catch { throw new Error('Respon server tidak valid.'); }
    if (data.greetings) applyGreetings(data.greetings);
    if (data.serverNowMs) state.serverOffsetMs = data.serverNowMs - Date.now();
    if (data.code === 'SESSION_EXPIRED') { handleForceLogout(data.message); throw new Error(data.message); }
    if (!data.ok) throw new Error(data.message || 'Permintaan gagal.');
    return data;
  } catch (err) {
    if (err.name === 'AbortError') throw new Error('Koneksi lambat (timeout). Coba lagi.');
    throw err;
  } finally { clearTimeout(timer); }
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

/* ======================== AUTH, LOGIN & MONITORING ======================== */

async function loadPublicInit() {
  try {
    const res = await apiCall({ action: 'getPublicInit' });
    state.publicStores = res.stores || [];
    state.publicCrews = res.crews || [];
    if (res.stores) state.stores = res.stores;
    document.getElementById('loginStore').innerHTML = `<option value="">-- ${esc(t('lblSelectStore'))} --</option>` +
      state.publicStores.map((s) => `<option value="${esc(s.nama)}">${esc(s.nama)}</option>`).join('');
  } catch (err) { showToast(err.message, 'error'); }
}

function onLoginStoreChange() {
  const toko = document.getElementById('loginStore').value;
  const crewSelect = document.getElementById('loginCrew');
  if (!toko) { crewSelect.disabled = true; crewSelect.innerHTML = `<option value="">${esc(t('lblSelectStore'))}</option>`; return; }
  const filtered = state.publicCrews.filter((c) => c.toko.toUpperCase() === toko.toUpperCase());
  crewSelect.disabled = false;
  crewSelect.innerHTML = filtered.length
    ? `<option value="">-- ${esc(t('lblCrewName'))} --</option>` + filtered.map((c) => `<option value="${esc(c.id)}">${esc(c.nama)}</option>`).join('')
    : '<option value="">-</option>';
}

async function handleLoginCrew(e) {
  e.preventDefault();
  const crewId = document.getElementById('loginCrew').value, pin = document.getElementById('loginPin').value.trim();
  if (!crewId || !pin) return showToast('Pilih nama dan masukkan PIN.', 'error');
  setLoading(true, 'Verifikasi...');
  try {
    const res = await apiCall({ action: 'login', role: 'CREW', crewId, pin });
    state.todaySchedule = res.todaySchedule || null;
    state.todayProgress = res.todayProgress || null;
    state.userManualJenisPick = false;
    saveSession(res.token, res.user, res.stores);
    document.getElementById('loginPin').value = '';
    enterApp();
  } catch (err) { showToast(err.message, 'error'); } finally { setLoading(false); }
}

async function handleLoginAdmin(e) {
  e.preventDefault();
  const password = document.getElementById('loginAdminPass').value;
  if (!password) return showToast('Masukkan password Admin.', 'error');
  setLoading(true, 'Verifikasi...');
  try {
    const res = await apiCall({ action: 'login', role: 'ADMIN', password });
    state.todaySchedule = null; state.todayProgress = null; state.userManualJenisPick = false;
    saveSession(res.token, res.user, res.stores);
    document.getElementById('loginAdminPass').value = '';
    enterApp();
  } catch (err) { showToast(err.message, 'error'); } finally { setLoading(false); }
}

function enterMonitoringMode() {
  state.token = '';
  state.user = { role: 'MONITORING', crewId: 'MONITOR', nama: 'Management Monitoring', toko: 'SEMUA', posisi: 'Read-Only', fotoProfil: '' };
  state.todaySchedule = null; state.todayProgress = null;
  enterApp();
}

function saveSession(token, user, stores) {
  state.token = token; state.user = user;
  if (stores) state.stores = stores;
  localStorage.setItem('momoyo_token', token);
  localStorage.setItem('momoyo_user', JSON.stringify(user));
  if (stores) localStorage.setItem('momoyo_stores', JSON.stringify(state.stores));
}

async function handleLogout() {
  stopDashboardAutoRefresh(); stopLiveCamera();
  if (state.user && state.user.role === 'MONITORING') { handleForceLogout(''); return; }
  try { await apiCall({ action: 'logout' }); } catch {}
  handleForceLogout('');
}

function handleForceLogout(msg) {
  stopDashboardAutoRefresh(); stopLiveCamera();
  state.token = ''; state.user = null; state.todaySchedule = null; state.todayProgress = null;
  state.myBreak = null; state.dashData = null; state.dashOutletFilter = 'SEMUA';
  state.cache = { insight: {}, jadwal: {}, masterLoaded: false };
  localStorage.removeItem('momoyo_token'); localStorage.removeItem('momoyo_user');
  document.getElementById('appShell').classList.add('hidden');
  document.getElementById('loginView').classList.remove('hidden');
  if (msg) showToast(msg);
  loadPublicInit();
}

/* ======================== ENTER APP, PROFIL & GANTI PIN MANDIRI ======================== */

function enterApp() {
  state.stores = state.stores.length ? state.stores : JSON.parse(localStorage.getItem('momoyo_stores') || '[]');
  const role = state.user.role, isAdmin = role === 'ADMIN', isMonitor = role === 'MONITORING';

  document.getElementById('loginView').classList.add('hidden');
  document.getElementById('appShell').classList.remove('hidden');

  renderHeaderUser();
  document.getElementById('btnLogout').textContent = isMonitor ? t('btnLogin') : t('btnLogout');
  document.querySelectorAll('.admin-only').forEach((el) => el.classList.toggle('hidden', !isAdmin));

  populateFilterStores();
  buildBottomNav(role);
  applyLanguage(state.lang, false);

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
  if (role === 'ADMIN') document.getElementById('headerRoleStore').textContent = `${state.user.posisi || 'Administrasi'} • Admin`;
  else if (role === 'MONITORING') document.getElementById('headerRoleStore').textContent = 'Live • Read-Only';
  else document.getElementById('headerRoleStore').textContent = `${state.user.posisi || 'Crew'} • ${state.user.toko}`;
}

function getInitials(name) {
  const p = String(name || 'M').trim().replace(/\s+/g, ' ').split(' ');
  return p.length >= 2 ? (p[0][0] + p[1][0]).toUpperCase() : p[0].slice(0, 2).toUpperCase();
}

function renderAvatar(el, fotoUrl, nama) {
  if (!el) return;
  const initials = getInitials(nama);
  if (fotoUrl) el.innerHTML = `<img src="${esc(toDisplayImageUrl(fotoUrl))}" alt="${esc(nama)}" onerror="this.remove();this.parentNode.textContent='${esc(initials)}';" />`;
  else el.textContent = initials;
}

async function refreshMyProfileSilently() {
  if (!state.user || state.user.role === 'MONITORING') return;
  try {
    const res = await apiCall({ action: 'getMyProfile' });
    if (res.user) { state.user = res.user; localStorage.setItem('momoyo_user', JSON.stringify(res.user)); renderHeaderUser(); }
    if (res.todaySchedule !== undefined) { state.todaySchedule = res.todaySchedule; applyTodayScheduleToForm(); }
    if (res.todayProgress !== undefined) {
      state.todayProgress = res.todayProgress;
      renderTodayProgress(true);
      updateAbsenFormVisibility();
      renderTodayThreePhotos();
    }
  } catch {}
}

async function openProfileModal() {
  if (!state.user || state.user.role === 'MONITORING') return;
  await refreshMyProfileSilently();
  const u = state.user, isAdmin = u.role === 'ADMIN';
  renderAvatar(document.getElementById('profileAvatarLg'), u.fotoProfil, u.nama);
  document.getElementById('profileNameLg').textContent = u.nama;
  document.getElementById('profileSubLg').textContent = isAdmin ? `${u.posisi || 'Administrasi'} • Admin Only` : `${u.posisi || 'Crew'} • ${u.toko}`;

  document.getElementById('profileDetails').classList.toggle('hidden', isAdmin);
  document.getElementById('formAdminProfile').classList.toggle('hidden', !isAdmin);
  document.getElementById('formChangeMyPin').classList.toggle('hidden', isAdmin);
  document.getElementById('crewProfileReadOnlyNote').classList.toggle('hidden', isAdmin);

  if (isAdmin) {
    document.getElementById('adminProfNama').value = u.nama || 'Admin MOMOYO';
    document.getElementById('adminProfPosisi').value = u.posisi || 'Administrasi';
    document.getElementById('adminProfTelp').value = u.noTelp || '';
  } else {
    document.getElementById('profileDetails').innerHTML = `
      <div class="detail-row"><span>ID</span><strong>${esc(u.crewId || '-')}</strong></div>
      <div class="detail-row"><span>${esc(t('lblOutlet'))}</span><strong>${esc(u.toko || '-')}</strong></div>
      <div class="detail-row"><span>Area</span><strong>${esc(u.area || '-')}</strong></div>
      <div class="detail-row"><span>Posisi</span><strong>${esc(u.posisi || '-')}</strong></div>
      <div class="detail-row"><span>No. Telp</span><strong>${esc(u.noTelp || '-')}</strong></div>
    `;
    document.getElementById('myOldPinInput').value = '';
    document.getElementById('myNewPinInput').value = '';
  }
  openModal('modalProfile');
}

async function submitChangeMyPin(e) {
  e.preventDefault();
  const oldPin = document.getElementById('myOldPinInput').value.trim();
  const newPin = document.getElementById('myNewPinInput').value.trim();
  setLoading(true, 'Menyimpan PIN...');
  try {
    const res = await apiCall({ action: 'changeMyPin', oldPin, newPin });
    document.getElementById('myOldPinInput').value = '';
    document.getElementById('myNewPinInput').value = '';
    showToast(res.message || 'PIN diperbarui!', 'success');
  } catch (err) { showToast(err.message, 'error'); } finally { setLoading(false); }
}

async function submitAdminProfileForm(e) {
  e.preventDefault();
  setLoading(true, 'Menyimpan...');
  try {
    const res = await apiCall({
      action: 'updateAdminProfile',
      nama: document.getElementById('adminProfNama').value.trim(),
      posisi: document.getElementById('adminProfPosisi').value.trim(),
      noTelp: document.getElementById('adminProfTelp').value.trim()
    });
    if (res.user) { state.user = res.user; localStorage.setItem('momoyo_user', JSON.stringify(res.user)); renderHeaderUser(); }
    showToast(res.message || 'Profil diperbarui!', 'success');
  } catch (err) { showToast(err.message, 'error'); } finally { setLoading(false); }
}

function handleMyPhotoPick(e) {
  const file = e.target.files && e.target.files[0];
  e.target.value = '';
  if (!file || !file.type.startsWith('image/')) return;
  openCropModalForFile(file, async (croppedBase64) => {
    setLoading(true, 'Mengunggah...');
    try {
      const res = await apiCall({ action: 'updateMyPhoto', photoBase64: croppedBase64 }, 45000);
      if (res.user) state.user = res.user; else state.user.fotoProfil = res.fotoProfil || '';
      localStorage.setItem('momoyo_user', JSON.stringify(state.user));
      renderHeaderUser(); renderAvatar(document.getElementById('profileAvatarLg'), state.user.fotoProfil, state.user.nama);
      showToast(res.message || 'Foto diperbarui!', 'success');
    } catch (err) { showToast(err.message, 'error'); } finally { setLoading(false); }
  });
}

async function clearMyPhoto() {
  setLoading(true, 'Menghapus...');
  try {
    const res = await apiCall({ action: 'updateMyPhoto', clearPhoto: true });
    state.user.fotoProfil = ''; if (res.user) state.user = res.user;
    localStorage.setItem('momoyo_user', JSON.stringify(state.user));
    renderHeaderUser(); renderAvatar(document.getElementById('profileAvatarLg'), '', state.user.nama);
    showToast('Foto profil dihapus.', 'success');
  } catch (err) { showToast(err.message, 'error'); } finally { setLoading(false); }
}

/* ======================== CROPPER FOTO PROFIL ======================== */

function openCropModalForFile(file, onDone) {
  const reader = new FileReader();
  reader.onload = (ev) => {
    const img = new Image();
    img.onload = () => {
      cropper.img = img; cropper.baseScale = Math.max(320 / img.width, 320 / img.height);
      cropper.zoom = 1; cropper.offsetX = 0; cropper.offsetY = 0; cropper.onDone = onDone;
      document.getElementById('cropZoomSlider').value = '1';
      document.getElementById('cropZoomVal').textContent = '1.0x';
      drawCropCanvas(); openModal('modalCropPhoto');
    };
    img.src = ev.target.result;
  };
  reader.readAsDataURL(file);
}

function drawCropCanvas() {
  const canvas = document.getElementById('cropCanvas');
  if (!canvas || !cropper.img) return;
  const dw = cropper.img.width * cropper.baseScale * cropper.zoom, dh = cropper.img.height * cropper.baseScale * cropper.zoom;
  const mx = Math.max(0, (dw - 320) / 2), my = Math.max(0, (dh - 320) / 2);
  cropper.offsetX = Math.max(-mx, Math.min(mx, cropper.offsetX));
  cropper.offsetY = Math.max(-my, Math.min(my, cropper.offsetY));
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#141824'; ctx.fillRect(0, 0, 320, 320);
  ctx.drawImage(cropper.img, (320 - dw) / 2 + cropper.offsetX, (320 - dh) / 2 + cropper.offsetY, dw, dh);
}

function initCropperEvents() {
  const stage = document.getElementById('cropStage'), slider = document.getElementById('cropZoomSlider');
  stage.addEventListener('pointerdown', (e) => { if (!cropper.img) return; cropper.dragging = true; cropper.startX = e.clientX; cropper.startY = e.clientY; stage.setPointerCapture(e.pointerId); });
  stage.addEventListener('pointermove', (e) => {
    if (!cropper.dragging) return;
    const sf = 320 / stage.getBoundingClientRect().width;
    cropper.offsetX += (e.clientX - cropper.startX) * sf; cropper.offsetY += (e.clientY - cropper.startY) * sf;
    cropper.startX = e.clientX; cropper.startY = e.clientY; drawCropCanvas();
  });
  stage.addEventListener('pointerup', () => { cropper.dragging = false; });
  stage.addEventListener('pointercancel', () => { cropper.dragging = false; });
  slider.addEventListener('input', () => { cropper.zoom = parseFloat(slider.value) || 1; document.getElementById('cropZoomVal').textContent = `${cropper.zoom.toFixed(1)}x`; drawCropCanvas(); });
  const cancel = () => { closeModal('modalCropPhoto'); cropper.img = null; cropper.onDone = null; };
  document.getElementById('btnCancelCrop').addEventListener('click', cancel);
  document.getElementById('btnCropCancelBtn').addEventListener('click', cancel);
  document.getElementById('btnCropApply').addEventListener('click', () => {
    if (!cropper.img) return;
    const out = document.createElement('canvas'); out.width = 400; out.height = 400;
    const ctx = out.getContext('2d'), r = 400 / 320;
    const dw = cropper.img.width * cropper.baseScale * cropper.zoom * r, dh = cropper.img.height * cropper.baseScale * cropper.zoom * r;
    ctx.fillStyle = '#FFFFFF'; ctx.fillRect(0, 0, 400, 400);
    ctx.drawImage(cropper.img, (400 - dw) / 2 + cropper.offsetX * r, (400 - dh) / 2 + cropper.offsetY * r, dw, dh);
    const cb = cropper.onDone; closeModal('modalCropPhoto'); cropper.img = null; cropper.onDone = null;
    if (cb) cb(out.toDataURL('image/jpeg', 0.85));
  });
}

/* ======================== NAVIGASI BAWAH ======================== */

function buildBottomNav(role) {
  const nav = document.getElementById('bottomNav');
  let items;
  if (role === 'ADMIN') {
    items = [
      { view: 'viewDashboard', icon: NAV_ICONS.dashboard, label: t('navDashboard') },
      { view: 'viewJadwal', icon: NAV_ICONS.jadwal, label: t('navJadwal') },
      { view: 'viewAbsen', label: t('navAbsen'), center: true },
      { view: 'viewRiwayat', icon: NAV_ICONS.riwayat, label: t('navRiwayat') },
      { view: 'viewKelola', icon: NAV_ICONS.kelola, label: t('navKelola') }
    ];
  } else if (role === 'MONITORING') {
    items = [
      { view: 'viewDashboard', icon: NAV_ICONS.dashboard, label: t('navLive') },
      { view: 'viewJadwal', icon: NAV_ICONS.jadwal, label: t('navJadwal') },
      { view: 'viewRiwayat', icon: NAV_ICONS.galeri, label: t('navRiwayat') },
      { view: 'viewInsight', icon: NAV_ICONS.insight, label: t('navInsight') }
    ];
  } else {
    items = [
      { view: 'viewKalenderSaya', icon: NAV_ICONS.kalender, label: t('navKalender') },
      { view: 'viewJadwal', icon: NAV_ICONS.jadwal, label: t('navJadwal') },
      { view: 'viewAbsen', label: t('navAbsen'), center: true },
      { view: 'viewDashboard', icon: NAV_ICONS.pantau, label: t('navPantau') },
      { view: 'viewRiwayat', icon: NAV_ICONS.galeri, label: t('navGaleri') }
    ];
  }
  nav.innerHTML = items.map((it) => it.center
    ? `<button type="button" class="nav-item nav-center" data-view="${it.view}"><span class="nav-center-btn"><span class="nav-center-mascot"><img data-mascot-img alt="" /></span><span class="nav-center-label">${esc(it.label)}</span></span></button>`
    : `<button type="button" class="nav-item" data-view="${it.view}">${it.icon}<span>${esc(it.label)}</span></button>`
  ).join('');
  applyMascotAssets(nav);
  nav.querySelectorAll('.nav-item').forEach((btn) => btn.addEventListener('click', () => switchView(btn.dataset.view)));
}

function switchView(viewId, opts = {}) {
  state.activeView = viewId;
  document.querySelectorAll('.page-view').forEach((v) => v.classList.add('hidden'));
  const target = document.getElementById(viewId);
  if (target) target.classList.remove('hidden');

  const navHighlight = viewId === 'viewInsight' && state.user.role !== 'MONITORING' ? 'viewDashboard' : viewId;
  document.querySelectorAll('#bottomNav .nav-item').forEach((btn) => btn.classList.toggle('active', btn.dataset.view === navHighlight));

  if (viewId === 'viewDashboard') startDashboardAutoRefresh();
  else stopDashboardAutoRefresh();

  window.scrollTo({ top: 0, behavior: 'instant' });

  if (viewId === 'viewAbsen') {
    updateAbsenGreetingDisplay();
    applyTodayScheduleToForm();
    renderTodayProgress(false);
    updateAbsenFormVisibility();
    renderTodayThreePhotos();
    loadActiveBreaksForAbsen();
    if (state.user.role === 'CREW') loadCrewAnnouncements();
  }
  if (viewId === 'viewKalenderSaya') loadCrewCalendar();
  if (viewId === 'viewRiwayat' && !opts.skipLoad) loadHistory();
  if (viewId === 'viewDashboard') loadDashboard(true);
  if (viewId === 'viewJadwal') loadJadwalView();
  if (viewId === 'viewInsight') loadInsights();
  if (viewId === 'viewKelola') loadMasterData();
}

/* ======================== PENGUMUMAN & PENGAJUAN IZIN/SAKIT ======================== */

async function loadCrewAnnouncements() {
  const wrap = document.getElementById('crewAnnouncementsWrap');
  if (!wrap || !state.user || state.user.role !== 'CREW') return;
  try {
    const res = await apiCall({ action: 'getAnnouncements' });
    const unread = (res.announcements || []).filter((a) => !a.isRead);
    if (!unread.length) { wrap.classList.add('hidden'); wrap.innerHTML = ''; return; }
    wrap.classList.remove('hidden');
    wrap.innerHTML = unread.map((a) => `
      <div class="ann-banner-card" id="annCard_${esc(a.id)}">
        <div class="ann-banner-head">
          <div class="ann-banner-title">📢 ${esc(a.judul)}</div>
          <span class="badge badge-neutral">${esc(a.targetToko === 'SEMUA' ? t('allOutlets') : a.targetToko)}</span>
        </div>
        <div class="ann-banner-body">${esc(a.isi)}</div>
        <div class="ann-banner-actions">
          <span class="record-sub">${esc(a.createdAt)}</span>
          <button type="button" class="btn btn-primary btn-sm" onclick="markAnnRead('${esc(a.id)}')">${esc(t('markRead'))}</button>
        </div>
      </div>
    `).join('');
  } catch {}
}

window.markAnnRead = async function (id) {
  const card = document.getElementById(`annCard_${id}`);
  if (card) card.remove();
  const wrap = document.getElementById('crewAnnouncementsWrap');
  if (wrap && !wrap.children.length) wrap.classList.add('hidden');
  try { await apiCall({ action: 'markAnnouncementRead', id }); } catch {}
};

async function openLeaveRequestModal() {
  const now = new Date(Date.now() + state.serverOffsetMs);
  const dk = `${now.getFullYear()}-${pad2(now.getMonth() + 1)}-${pad2(now.getDate())}`;
  document.getElementById('leaveStartInput').value = dk;
  document.getElementById('leaveEndInput').value = dk;
  document.getElementById('leaveAlasanInput').value = '';
  clearLeavePhoto();
  openModal('modalLeaveRequest');
  loadMyLeaveHistory();
}

async function loadMyLeaveHistory() {
  const el = document.getElementById('myLeaveHistoryList');
  el.innerHTML = '<div class="subtitle">...</div>';
  try {
    const res = await apiCall({ action: 'getMyLeaveRequests' });
    const list = res.requests || [];
    if (!list.length) { el.innerHTML = '<div class="subtitle">-</div>'; return; }
    el.innerHTML = list.map((r) => {
      const bCls = r.status === 'APPROVED' ? 'badge-masuk' : (r.status === 'REJECTED' ? 'badge-danger' : 'badge-warning');
      const range = r.startDate === r.endDate ? r.startDate : `${r.startDate} s/d ${r.endDate}`;
      return `
        <div class="mini-item">
          <div>
            <strong>${esc(r.jenis)}</strong> <span class="record-sub">(${esc(range)})</span>
            <div class="record-sub">${esc(r.alasan)}</div>
          </div>
          <span class="badge ${bCls}">${esc(r.status)}</span>
        </div>
      `;
    }).join('');
  } catch { el.innerHTML = ''; }
}

function handleLeavePhotoPick(e) {
  const file = e.target.files && e.target.files[0];
  e.target.value = '';
  if (!file || !file.type.startsWith('image/')) return;
  compressImage(file, 1000, 0.78).then(({ base64 }) => {
    state.leavePhotoBase64 = base64;
    document.getElementById('leavePhotoPreviewImg').src = base64;
    document.getElementById('leavePhotoPreviewWrap').classList.remove('hidden');
  }).catch(() => showToast('Gagal memproses foto.', 'error'));
}

function clearLeavePhoto() {
  state.leavePhotoBase64 = '';
  document.getElementById('leavePhotoPreviewImg').src = '';
  document.getElementById('leavePhotoPreviewWrap').classList.add('hidden');
}

async function submitLeaveRequestForm(e) {
  e.preventDefault();
  setLoading(true, 'Mengirim pengajuan...');
  try {
    const res = await apiCall({
      action: 'submitLeaveRequest',
      jenis: document.getElementById('leaveJenisInput').value,
      startDate: document.getElementById('leaveStartInput').value,
      endDate: document.getElementById('leaveEndInput').value,
      alasan: document.getElementById('leaveAlasanInput').value.trim(),
      photoBase64: state.leavePhotoBase64
    }, 45000);
    showToast(res.message || 'Pengajuan terkirim!', 'success');
    document.getElementById('leaveAlasanInput').value = '';
    clearLeavePhoto();
    loadMyLeaveHistory();
  } catch (err) { showToast(err.message, 'error'); } finally { setLoading(false); }
}

/* ======================== ABSENSI ANTI-DOUBLE, 3 FOTO SEJAJAR, BKO & KAMERA LIVE ======================== */

function getStageLabel(jenis) {
  if (jenis === 'MASUK') return t('typeMasuk');
  if (jenis === 'ISTIRAHAT') return t('typeIstirahat');
  return t('typePulang');
}

function setSelectedAbsenJenis(jenis, isManual = false) {
  const clean = ['MASUK', 'ISTIRAHAT', 'PULANG'].includes(jenis) ? jenis : 'MASUK';
  if (isManual) state.userManualJenisPick = true;
  document.getElementById('absenJenis').value = clean;
  document.querySelectorAll('#formAbsen .seg-btn').forEach((b) => b.classList.toggle('active', b.dataset.jenis === clean));
  document.getElementById('breakRuleHint').classList.toggle('hidden', clean !== 'ISTIRAHAT');
  updateAbsenGreetingDisplay();
  updateAbsenFormVisibility();
}

function updateAbsenFormVisibility() {
  const doneBox = document.getElementById('absenAlreadyDoneBox');
  const inputWrap = document.getElementById('absenFormInputWrap');
  if (!doneBox || !inputWrap || !state.user) return;

  const jenis = (document.getElementById('absenJenis')?.value || 'MASUK').toUpperCase();
  const p = state.todayProgress;
  const doneRec = (state.user.role === 'CREW' && p)
    ? (jenis === 'MASUK' ? p.masuk : (jenis === 'ISTIRAHAT' ? p.istirahat : p.pulang))
    : null;

  if (doneRec) {
    inputWrap.classList.add('hidden');
    doneBox.classList.remove('hidden');
    const stageLbl = getStageLabel(jenis);
    document.getElementById('absenAlreadyDoneTitle').textContent = `${t('alreadyDonePrefix')} ${stageLbl} ${t('todayWord')}`.trim();
    document.getElementById('absenAlreadyDoneSub').textContent = `${t('recordedAt')} ${doneRec.jam} WIB • ${doneRec.status || '-'}`;

    const jumpBtn = document.getElementById('btnJumpNextStage');
    const nextStage = !p.masuk ? 'MASUK' : (!p.istirahat ? 'ISTIRAHAT' : (!p.pulang ? 'PULANG' : ''));
    if (nextStage && nextStage !== jenis) {
      jumpBtn.classList.remove('hidden');
      jumpBtn.dataset.nextStage = nextStage;
      jumpBtn.textContent = `${t('jumpNext')} ${getStageLabel(nextStage)} ›`;
    } else {
      jumpBtn.classList.add('hidden');
    }
  } else {
    doneBox.classList.add('hidden');
    inputWrap.classList.remove('hidden');
  }
}

function renderTodayThreePhotos() {
  const card = document.getElementById('todayThreePhotosCard');
  const grid = document.getElementById('todayThreePhotosGrid');
  if (!card || !grid) return;

  const p = state.todayProgress;
  if (!p || (!p.masuk && !p.istirahat && !p.pulang)) {
    card.classList.add('hidden');
    return;
  }
  card.classList.remove('hidden');

  const slots = [
    { key: 'MASUK', label: t('typeMasuk'), rec: p.masuk },
    { key: 'ISTIRAHAT', label: t('typeIstirahat'), rec: p.istirahat },
    { key: 'PULANG', label: t('typePulang'), rec: p.pulang }
  ];

  grid.innerHTML = slots.map((s) => {
    if (s.rec && s.rec.foto) {
      const meta = encodePhotoMeta({
        nama: state.user ? state.user.nama : '',
        toko: s.rec.toko || (state.user ? state.user.toko : ''),
        jenis: s.key, shift: s.rec.shift, hari: s.rec.hari || '',
        tanggalDisplay: s.rec.tanggalDisplay || '', jam: s.rec.jam, status: s.rec.status
      });
      return `
        <div class="three-photo-slot has-photo" onclick="previewPhoto('${esc(s.rec.foto)}','${meta}')">
          <img class="three-photo-thumb" loading="lazy" src="${esc(toDisplayImageUrl(s.rec.foto, 500))}" alt="${esc(s.label)}" />
          <div class="three-photo-foot">
            <strong>${esc(s.label)}</strong>
            <span class="text-success">${esc(s.rec.jam.slice(0, 5))} WIB</span>
          </div>
        </div>
      `;
    }
    return `
      <div class="three-photo-slot">
        <div class="three-photo-empty">
          <span>${s.rec ? '✓' : '—'}</span>
          <span>${esc(s.rec ? 'Manual' : t('notYet'))}</span>
        </div>
        <div class="three-photo-foot">
          <strong>${esc(s.label)}</strong>
          <span>${s.rec ? esc(s.rec.jam.slice(0, 5)) : '--:--'}</span>
        </div>
      </div>
    `;
  }).join('');
}

function renderTodayProgress(autoSelectNext = false) {
  const card = document.getElementById('todayProgressCard');
  if (!card || !state.user || state.user.role === 'MONITORING' || !state.todayProgress) {
    if (card) card.classList.add('hidden');
    return;
  }
  const p = state.todayProgress;
  card.classList.remove('hidden');

  const sM = document.getElementById('progStepMasuk'), sI = document.getElementById('progStepIstirahat'), sP = document.getElementById('progStepPulang');
  const lines = card.querySelectorAll('.progress-line'), nextHint = document.getElementById('progressNextHint');
  const fmt = (r) => (r && r.jam ? r.jam.slice(0, 5) : t('notYet'));

  document.getElementById('progTimeMasuk').textContent = fmt(p.masuk);
  document.getElementById('progTimeIstirahat').textContent = fmt(p.istirahat);
  document.getElementById('progTimePulang').textContent = fmt(p.pulang);

  sM.classList.toggle('is-done', Boolean(p.masuk)); sI.classList.toggle('is-done', Boolean(p.istirahat)); sP.classList.toggle('is-done', Boolean(p.pulang));
  sM.querySelector('.prog-dot').textContent = p.masuk ? '✓' : '1';
  sI.querySelector('.prog-dot').textContent = p.istirahat ? '✓' : '2';
  sP.querySelector('.prog-dot').textContent = p.pulang ? '✓' : '3';
  sM.classList.toggle('is-current', p.nextSuggestedJenis === 'MASUK');
  sI.classList.toggle('is-current', p.nextSuggestedJenis === 'ISTIRAHAT');
  sP.classList.toggle('is-current', p.nextSuggestedJenis === 'PULANG');
  if (lines[0]) lines[0].classList.toggle('is-done', Boolean(p.masuk));
  if (lines[1]) lines[1].classList.toggle('is-done', Boolean(p.istirahat || p.pulang));

  if (p.nextSuggestedJenis === 'DONE') { nextHint.className = 'badge badge-masuk'; nextHint.textContent = t('allDoneMsg'); }
  else {
    nextHint.className = p.nextSuggestedJenis === 'PULANG' ? 'badge badge-pulang' : (p.nextSuggestedJenis === 'ISTIRAHAT' ? 'badge badge-istirahat' : 'badge badge-warning');
    nextHint.textContent = `${t('nextStagePrefix')} ${getStageLabel(p.nextSuggestedJenis)}`;
  }

  if (autoSelectNext && !state.userManualJenisPick && p.nextSuggestedJenis && p.nextSuggestedJenis !== 'DONE') {
    setSelectedAbsenJenis(p.nextSuggestedJenis, false);
  }
}

function setupAbsenForm() {
  const isAdmin = state.user.role === 'ADMIN';
  const tokoSel = document.getElementById('absenToko'), namaInp = document.getElementById('absenNama'), shiftSel = document.getElementById('absenShift');
  const bkoWrap = document.getElementById('absenBkoWrap'), bkoChk = document.getElementById('absenBkoCheck');

  document.getElementById('crewQuickLeaveBar').classList.toggle('hidden', isAdmin);
  bkoWrap.classList.toggle('hidden', isAdmin);
  bkoChk.checked = false;

  const storeOpts = state.stores.map((s) => `<option value="${esc(s.nama)}">${esc(s.nama)}</option>`).join('');
  if (isAdmin) {
    tokoSel.disabled = false; tokoSel.innerHTML = storeOpts;
    namaInp.readOnly = false; namaInp.value = state.user.nama;
  } else {
    tokoSel.innerHTML = storeOpts || `<option value="${esc(state.user.toko)}">${esc(state.user.toko)}</option>`;
    tokoSel.value = state.user.toko;
    tokoSel.disabled = true;
    namaInp.readOnly = true; namaInp.value = state.user.nama;
  }

  updateShiftOptionLabels();
  shiftSel.value = new Date().getHours() < 13 ? 'PAGI' : 'SIANG';
  applyTodayScheduleToForm();
  renderTodayProgress(true);
  updateAbsenFormVisibility();
  renderTodayThreePhotos();
  updateAbsenGreetingDisplay();
  updateGpsHint();
}

function onBkoToggleChange() {
  if (!state.user || state.user.role !== 'CREW') return;
  const isBko = document.getElementById('absenBkoCheck').checked;
  const tokoSel = document.getElementById('absenToko');
  tokoSel.disabled = !isBko;
  if (!isBko) tokoSel.value = state.user.toko;
  updateShiftOptionLabels();
  updateGpsHint();
  loadActiveBreaksForAbsen();
}

function applyTodayScheduleToForm() {
  const banner = document.getElementById('todayScheduleBanner'), valEl = document.getElementById('todayScheduleValue');
  const badgeEl = document.getElementById('todayScheduleBadge'), shiftSel = document.getElementById('absenShift');
  const lockBadge = document.getElementById('shiftLockBadge');

  if (!state.user || state.user.role !== 'CREW' || !state.todaySchedule || !state.todaySchedule.status) {
    banner.classList.add('hidden'); lockBadge.classList.add('hidden'); shiftSel.disabled = false; return;
  }

  const sched = state.todaySchedule, st = normalizeShift(sched.status);
  banner.classList.remove('hidden');
  valEl.textContent = sched.catatan ? `${sched.status} (${sched.catatan})` : sched.status;

  // Auto-aktifkan BKO jika jadwal hari ini mengandung "BKO <NAMA_TOKO>"
  if (st.includes('BKO')) {
    const matchedStore = state.stores.find((s) => st.includes(s.nama.toUpperCase()));
    if (matchedStore && matchedStore.nama.toUpperCase() !== state.user.toko.toUpperCase()) {
      document.getElementById('absenBkoCheck').checked = true;
      const tokoSel = document.getElementById('absenToko');
      tokoSel.disabled = false;
      tokoSel.value = matchedStore.nama;
      updateShiftOptionLabels();
      updateGpsHint();
    }
  }

  if (VALID_WORK_SHIFTS.includes(st)) {
    banner.classList.remove('is-off'); badgeEl.className = 'badge badge-masuk'; badgeEl.textContent = t('badgeMatchSched');
    shiftSel.value = st; shiftSel.disabled = true; lockBadge.classList.remove('hidden');
  } else if (['IZIN', 'SAKIT', 'OFF DAY', 'OUT'].includes(st)) {
    banner.classList.add('is-off'); badgeEl.className = 'badge badge-danger'; badgeEl.textContent = st;
    shiftSel.disabled = false; lockBadge.classList.add('hidden');
  } else {
    banner.classList.remove('is-off'); badgeEl.className = 'badge badge-warning'; badgeEl.textContent = st.slice(0, 12);
    shiftSel.disabled = false; lockBadge.classList.add('hidden');
  }
}

function updateShiftOptionLabels() {
  const toko = document.getElementById('absenToko').value;
  const st = state.stores.find((s) => s.nama.toUpperCase() === toko.toUpperCase()) || {};
  const pagi = `${st.pagiMulai || '08:00'}–${st.pagiSelesai || '16:00'}`;
  const siang = `${st.siangMulai || '14:00'}–${st.siangSelesai || '22:00'}`;
  const fd = `${st.fullDayMulai || st.pagiMulai || '08:00'}–${st.fullDaySelesai || st.siangSelesai || '22:00'}`;
  const shiftSel = document.getElementById('absenShift'), prev = normalizeShift(shiftSel.value || 'PAGI');
  shiftSel.innerHTML = `<option value="PAGI">${esc(t('shiftPagi'))} (${pagi})</option><option value="SIANG">${esc(t('shiftSiang'))} (${siang})</option><option value="FULL DAY">${esc(t('shiftFullDay'))} (${fd})</option>`;
  shiftSel.value = VALID_WORK_SHIFTS.includes(prev) ? prev : 'PAGI';
}

function updateGpsHint() {
  const toko = document.getElementById('absenToko').value;
  const st = state.stores.find((s) => s.nama.toUpperCase() === toko.toUpperCase());
  const box = document.getElementById('gpsStatusBox');
  if (st && st.wajibGps && state.user.role !== 'ADMIN') {
    box.classList.remove('hidden');
    document.getElementById('gpsStatusText').textContent = `GPS ${st.nama} (maks. ${st.radius}m)`;
  } else box.classList.add('hidden');
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
      updateAbsenFormVisibility();
      renderTodayThreePhotos();
    }
    renderStoreBreaksCard(res.toko || toko);
    tickAllBreakCountdowns();
  } catch {} finally { setBgSync(false); }
}

function renderStoreBreaksCard(tokoName) {
  const card = document.getElementById('storeBreaksCard'), listEl = document.getElementById('storeBreaksList');
  document.getElementById('storeBreaksTitle').textContent = tokoName || 'Outlet';
  if (!state.storeBreaks.length) { card.classList.add('hidden'); return; }
  card.classList.remove('hidden');
  listEl.innerHTML = state.storeBreaks.map((b) => `
    <div class="mini-item">
      <div><strong>${esc(b.nama)}</strong> <span class="record-sub">(${esc(b.shift)})</span><div class="record-sub">${esc(b.startJam)} – ${esc(b.endJam)} WIB</div></div>
      <span class="badge ${b.isOngoing ? 'badge-warning' : 'badge-masuk'} live-break-badge" data-end-ms="${b.endMs}">${b.isOngoing ? formatRemainingMs(b.endMs - (Date.now() + state.serverOffsetMs)) : t('btnDone')}</span>
    </div>
  `).join('');
}

function tickAllBreakCountdowns() {
  const nowMs = Date.now() + state.serverOffsetMs;
  const myCard = document.getElementById('myBreakCountdownCard');
  if (myCard) {
    if (state.myBreak && state.user && state.user.role !== 'MONITORING') {
      const rem = state.myBreak.endMs - nowMs;
      if (rem < -60 * 60000) myCard.classList.add('hidden');
      else {
        myCard.classList.remove('hidden');
        document.getElementById('myBreakEndLabel').textContent = `${state.myBreak.endJam} WIB`;
        myCard.classList.toggle('is-done', rem <= 0);
        document.getElementById('myBreakTimer').textContent = rem > 0 ? formatRemainingMs(rem) : '00:00:00';
      }
    } else myCard.classList.add('hidden');
  }
  document.querySelectorAll('.live-break-badge[data-end-ms]').forEach((badge) => {
    const rem = Number(badge.dataset.endMs) - nowMs;
    badge.textContent = rem > 0 ? formatRemainingMs(rem) : t('btnDone');
    badge.classList.toggle('badge-warning', rem > 0);
    badge.classList.toggle('badge-masuk', rem <= 0);
  });
}

function formatRemainingMs(ms) {
  const s = Math.max(0, Math.floor(ms / 1000));
  return `${pad2(Math.floor(s / 3600))}:${pad2(Math.floor((s % 3600) / 60))}:${pad2(s % 60)}`;
}

function formatFullIndoDateTime(dt) {
  const d = dt instanceof Date ? dt : new Date();
  return `${HARI_MAP.id[d.getDay()]}, ${pad2(d.getDate())} ${BULAN_MAP.id[d.getMonth()]} ${d.getFullYear()} • ${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())} WIB`;
}

async function openLiveCameraModal() {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) { document.getElementById('inputFotoKamera').click(); return; }
  const jenis = document.getElementById('absenJenis').value || 'MASUK', shift = document.getElementById('absenShift').value || 'PAGI';
  const nama = document.getElementById('absenNama').value || (state.user && state.user.nama) || '', toko = document.getElementById('absenToko').value || '';
  document.getElementById('liveCamTitleOverlay').textContent = `MOMOYO • ${jenis} (${shift}) — ${nama} (${toko})`;
  openModal('modalLiveCamera');
  await startLiveCameraStream();
}

async function startLiveCameraStream() {
  stopLiveCameraStreamOnly();
  const video = document.getElementById('liveCamVideo');
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: liveCam.facingMode }, width: { ideal: 1280 }, height: { ideal: 1280 } }, audio: false });
    liveCam.stream = stream; liveCam.active = true; video.srcObject = stream;
    video.classList.toggle('is-mirrored', liveCam.facingMode === 'user');
    await video.play().catch(() => {});
  } catch {
    stopLiveCamera();
    document.getElementById('inputFotoKamera').click();
  }
}

function stopLiveCameraStreamOnly() {
  if (liveCam.stream) { liveCam.stream.getTracks().forEach((tr) => tr.stop()); liveCam.stream = null; }
  const v = document.getElementById('liveCamVideo'); if (v) v.srcObject = null;
  liveCam.active = false;
}
function stopLiveCamera() { stopLiveCameraStreamOnly(); document.getElementById('modalLiveCamera')?.classList.add('hidden'); }

async function captureFromLiveCamera() {
  const v = document.getElementById('liveCamVideo');
  if (!v || !v.videoWidth) return;
  let w = v.videoWidth, h = v.videoHeight;
  if (w > 1200 || h > 1200) { if (w > h) { h = Math.round((h * 1200) / w); w = 1200; } else { w = Math.round((w * 1200) / h); h = 1200; } }
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const ctx = c.getContext('2d');
  if (liveCam.facingMode === 'user') { ctx.translate(w, 0); ctx.scale(-1, 1); }
  ctx.drawImage(v, 0, 0, w, h);
  const raw = c.toDataURL('image/jpeg', 0.8), capNow = new Date(Date.now() + state.serverOffsetMs);
  stopLiveCamera();
  await applyCapturedPhotoPreview(raw, capNow);
}

function handleNativeCameraSelected(e) {
  const file = e.target.files && e.target.files[0]; e.target.value = '';
  if (!file || !file.type.startsWith('image/')) return;
  const capNow = new Date(Date.now() + state.serverOffsetMs);
  setLoading(true, 'Memproses foto...');
  compressImage(file, 1200, 0.78).then(({ base64 }) => applyCapturedPhotoPreview(base64, capNow))
    .catch(() => showToast('Gagal memproses foto.', 'error')).finally(() => setLoading(false));
}

async function applyCapturedPhotoPreview(rawBase64, capturedNow) {
  state.photoRawBase64 = rawBase64; state.photoCapturedAt = capturedNow;
  const preview = await bakeTimestampWatermark(rawBase64, {
    nama: document.getElementById('absenNama').value.trim() || (state.user && state.user.nama) || '',
    toko: document.getElementById('absenToko').value || '',
    jenis: document.getElementById('absenJenis').value || 'MASUK',
    shift: document.getElementById('absenShift').value || 'PAGI',
    capturedAt: capturedNow, submittedAt: null
  });
  const kb = Math.round((preview.length * 3) / 4 / 1024);
  document.getElementById('photoPreviewImg').src = preview;
  document.getElementById('photoSizeInfo').textContent = `${kb} KB • ${pad2(capturedNow.getHours())}:${pad2(capturedNow.getMinutes())}:${pad2(capturedNow.getSeconds())} WIB`;
  document.getElementById('photoPreviewBox').classList.remove('hidden');
  document.getElementById('photoEmptyBox').classList.add('hidden');
  document.getElementById('absenRetryBox').classList.add('hidden');
}

function compressImage(file, maxDim, quality) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader(); reader.onerror = reject;
    reader.onload = (ev) => {
      const img = new Image(); img.onerror = reject;
      img.onload = () => {
        let { width: w, height: h } = img;
        if (w > maxDim || h > maxDim) { if (w > h) { h = Math.round((h * maxDim) / w); w = maxDim; } else { w = Math.round((w * maxDim) / h); h = maxDim; } }
        const c = document.createElement('canvas'); c.width = w; c.height = h;
        c.getContext('2d').drawImage(img, 0, 0, w, h);
        resolve({ base64: c.toDataURL('image/jpeg', quality) });
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  });
}

function bakeTimestampWatermark(rawBase64, meta) {
  return new Promise((resolve, reject) => {
    const img = new Image(); img.onerror = reject;
    img.onload = () => {
      const w = img.width, h = img.height, c = document.createElement('canvas'); c.width = w; c.height = h;
      const ctx = c.getContext('2d'); ctx.drawImage(img, 0, 0, w, h);
      const sc = Math.max(0.65, Math.min(1.35, w / 900)), px = Math.round(22 * sc), py = Math.round(16 * sc);
      const fl = Math.round(24 * sc), fm = Math.round(19 * sc), fs = Math.round(17 * sc), lg = Math.round(8 * sc);
      const lines = meta.submittedAt ? 2 : 1;
      const bh = py * 2 + fl + fm + fs * lines + lg * (lines + 1) + Math.round(10 * sc), by = Math.max(0, h - bh);
      const grad = ctx.createLinearGradient(0, by - Math.round(24 * sc), 0, h);
      grad.addColorStop(0, 'rgba(15,20,32,0)'); grad.addColorStop(0.2, 'rgba(15,20,32,0.72)'); grad.addColorStop(1, 'rgba(15,20,32,0.88)');
      ctx.fillStyle = grad; ctx.fillRect(0, by - Math.round(24 * sc), w, bh + Math.round(24 * sc));
      ctx.fillStyle = '#E52B3B'; ctx.fillRect(px, by + py, Math.round(5 * sc), bh - py * 2);
      const tx = px + Math.round(15 * sc); let cy = by + py + fl;
      ctx.fillStyle = '#FFFFFF'; ctx.font = `800 ${fl}px "Plus Jakarta Sans",sans-serif`; ctx.fillText(`MOMOYO ABSENSI • ${meta.jenis} (${meta.shift})`, tx, cy);
      cy += fm + lg; ctx.fillStyle = '#FFE4E7'; ctx.font = `700 ${fm}px "Plus Jakarta Sans",sans-serif`; ctx.fillText(`${meta.nama}  •  ${meta.toko}`, tx, cy);
      cy += fs + lg + Math.round(2 * sc); ctx.fillStyle = '#F8FAFC'; ctx.font = `600 ${fs}px "Plus Jakarta Sans",sans-serif`; ctx.fillText(`Waktu Foto   : ${formatFullIndoDateTime(meta.capturedAt)}`, tx, cy);
      if (meta.submittedAt) { cy += fs + lg; ctx.fillStyle = '#FDE68A'; ctx.font = `700 ${fs}px "Plus Jakarta Sans",sans-serif`; ctx.fillText(`Waktu Submit : ${formatFullIndoDateTime(meta.submittedAt)}`, tx, cy); }
      resolve(c.toDataURL('image/jpeg', 0.8));
    };
    img.src = rawBase64;
  });
}

function clearPhoto() {
  state.photoRawBase64 = ''; state.photoCapturedAt = null;
  document.getElementById('photoPreviewImg').src = '';
  document.getElementById('photoPreviewBox').classList.add('hidden');
  document.getElementById('photoEmptyBox').classList.remove('hidden');
}

function getCurrentPositionPromise() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) { reject(new Error('GPS tidak didukung.')); return; }
    navigator.geolocation.getCurrentPosition((p) => resolve({ lat: p.coords.latitude, lng: p.coords.longitude }), () => reject(new Error('Izin GPS ditolak. Aktifkan GPS lalu coba lagi.')), { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 });
  });
}

async function submitAttendance(e) {
  if (e) e.preventDefault();
  const jenis = document.getElementById('absenJenis').value, shift = document.getElementById('absenShift').value;
  const toko = document.getElementById('absenToko').value, nama = document.getElementById('absenNama').value.trim();
  const catatan = document.getElementById('absenCatatan').value.trim();
  const isBko = state.user.role === 'CREW' && document.getElementById('absenBkoCheck').checked;

  if (!nama || !toko) return showToast('Nama dan toko wajib terisi.', 'error');
  if (!state.photoRawBase64) return showToast('Wajib ambil foto selfie kamera langsung.', 'error');

  document.getElementById('absenRetryBox').classList.add('hidden');
  let coords = {};
  const st = state.stores.find((s) => s.nama.toUpperCase() === toko.toUpperCase());
  if (st && st.wajibGps && state.user.role !== 'ADMIN') {
    setLoading(true, 'GPS...');
    try { coords = await getCurrentPositionPromise(); } catch (err) { setLoading(false); showToast(err.message, 'error'); return; }
  }

  setLoading(true, 'Mengunggah...');
  try {
    const submittedAt = new Date(Date.now() + state.serverOffsetMs);
    const stampedPhoto = await bakeTimestampWatermark(state.photoRawBase64, {
      nama, toko, jenis, shift, capturedAt: state.photoCapturedAt || submittedAt, submittedAt
    });
    const res = await apiCall({
      action: 'submitAttendance', jenis, shift, toko, nama, isBko, catatan,
      photoBase64: stampedPhoto, lat: coords.lat, lng: coords.lng
    }, 45000);

    const d = res.data;
    document.getElementById('successDetails').innerHTML = `
      <div class="detail-row"><span>${esc(t('thName'))}</span><strong>${esc(d.nama)}</strong></div>
      <div class="detail-row"><span>${esc(t('lblOutlet'))}</span><strong>${esc(d.toko)}${d.isBko ? ' (BKO)' : ''}</strong></div>
      <div class="detail-row"><span>${esc(t('lblAbsenType'))}</span><strong>${esc(d.jenis)} (${esc(d.shift)})</strong></div>
      <div class="detail-row"><span>Waktu</span><strong>${esc(d.jam)} WIB</strong></div>
      <div class="detail-row"><span>Status</span><strong>${esc(d.status)}</strong></div>
      ${d.catatan ? `<div class="detail-row"><span>Catatan</span><strong>${esc(d.catatan)}</strong></div>` : ''}
      ${d.jenis === 'PULANG' ? `<div class="detail-row"><span>${esc(t('statWorkHours'))}</span><strong>${esc(d.totalJamKerja)}</strong></div>` : ''}
    `;
    openModal('modalSuccess');
    clearPhoto();
    document.getElementById('absenCatatan').value = '';
    state.userManualJenisPick = false;
    if (res.todayProgress) {
      state.todayProgress = res.todayProgress;
      renderTodayProgress(false);
      updateAbsenFormVisibility();
      renderTodayThreePhotos();
    }
    if (d.jenis === 'ISTIRAHAT') loadActiveBreaksForAbsen();
  } catch (err) {
    document.getElementById('absenRetryMsg').textContent = err.message;
    document.getElementById('absenRetryBox').classList.remove('hidden');
    showToast(err.message, 'error');
  } finally { setLoading(false); }
}

/* ======================== KALENDER KARYAWAN (+ RINGKASAN GAJIAN MANDIRI) ======================== */

function timeToMinClient(hhmmss) {
  const p = String(hhmmss || '').split(':').map(Number);
  return (p.length >= 2 && !isNaN(p[0]) && !isNaN(p[1])) ? (p[0] * 60 + p[1]) : null;
}

function buildCalendarMaps(records, schedules) {
  const byDate = {}, schedByDate = {};
  (records || []).forEach((r) => { if (r.dateKey) { if (!byDate[r.dateKey]) byDate[r.dateKey] = []; byDate[r.dateKey].push(r); } });
  (schedules || []).forEach((s) => { if (s.dateKey) schedByDate[s.dateKey] = s; });

  const todayKey = `${nowInit.getFullYear()}-${pad2(nowInit.getMonth() + 1)}-${pad2(nowInit.getDate())}`;
  let totalMasuk = 0, pagi = 0, siang = 0, fullDay = 0, totalWorkMin = 0, totalTelatMin = 0, lupaPulang = 0, izinSakit = 0;

  Object.keys(byDate).forEach((dk) => {
    const list = byDate[dk];
    const masuk = list.find((r) => r.jenis === 'MASUK');
    const pulangList = list.filter((r) => r.jenis === 'PULANG');
    const pulang = pulangList[pulangList.length - 1] || null;
    if (masuk) {
      totalMasuk++;
      const sh = normalizeShift(masuk.shift);
      if (sh === 'PAGI') pagi++; else if (sh === 'SIANG') siang++; else if (isFullDayShift(sh)) fullDay++;
      if (masuk.isLate) totalTelatMin += (masuk.lateMinutes || 0);
      if (pulang) {
        const s = timeToMinClient(masuk.jam), e = timeToMinClient(pulang.jam);
        if (s !== null && e !== null && e >= s) totalWorkMin += (e - s);
      } else if (dk < todayKey) lupaPulang++;
    }
  });

  Object.keys(schedByDate).forEach((dk) => {
    const st = String(schedByDate[dk].status || '').toUpperCase();
    if (st === 'IZIN' || st === 'SAKIT') izinSakit++;
  });

  return { byDate, schedByDate, totalMasuk, pagi, siang, fullDay, totalWorkMin, totalTelatMin, lupaPulang, izinSakit };
}

function renderCalendarGridInto(gridEl, year, month, byDate, schedByDate, selectedDate, onPickDate) {
  const daysInMonth = new Date(year, month, 0).getDate(), firstW = new Date(year, month - 1, 1).getDay();
  const todayKey = `${nowInit.getFullYear()}-${pad2(nowInit.getMonth() + 1)}-${pad2(nowInit.getDate())}`;
  let html = '';
  for (let i = 0; i < firstW; i++) html += '<div class="cal-day empty"></div>';
  for (let day = 1; day <= daysInMonth; day++) {
    const dk = `${year}-${pad2(month)}-${pad2(day)}`, list = byDate[dk] || [], sched = schedByDate[dk] || null;
    const masuk = list.find((r) => r.jenis === 'MASUK'), pulang = list.find((r) => r.jenis === 'PULANG');
    let cls = '', dot = '';
    if (masuk) {
      if (masuk.isLate) { cls = 'has-late'; dot = '<span class="cal-dot-row"><i class="dot dot-late"></i></span>'; }
      else if (pulang) { cls = 'has-ok'; dot = '<span class="cal-dot-row"><i class="dot dot-ok"></i></span>'; }
      else { cls = 'has-warn'; dot = '<span class="cal-dot-row"><i class="dot dot-warn"></i></span>'; }
    } else if (pulang) { cls = 'has-warn'; dot = '<span class="cal-dot-row"><i class="dot dot-warn"></i></span>'; }
    else if (sched && ['IZIN', 'SAKIT', 'OFF DAY', 'OUT'].includes(sched.status)) cls = 'has-off';
    else if (sched) dot = '<span class="cal-dot-row"><i class="dot dot-sched"></i></span>';

    const shShort = sched ? shortScheduleLabel(sched.status) : '';
    html += `<button type="button" class="cal-day ${cls} ${dk === todayKey ? 'today' : ''} ${dk === selectedDate ? 'selected' : ''}" data-date="${dk}"><span>${day}</span>${shShort ? `<span class="cal-sched-mini">${esc(shShort)}</span>` : dot}</button>`;
  }
  gridEl.innerHTML = html;
  gridEl.querySelectorAll('.cal-day[data-date]').forEach((btn) => btn.addEventListener('click', () => onPickDate(btn.dataset.date)));
}

function encodePhotoMeta(rec) {
  return rec ? encodeURIComponent(JSON.stringify({ nama: rec.nama || '', toko: rec.toko || '', jenis: rec.jenis || '', shift: rec.shift || '', hari: rec.hari || '', tanggalDisplay: rec.tanggalDisplay || '', jam: rec.jam || '', status: rec.status || '' })) : '';
}

function renderCalendarDayDetailInto(titleEl, bodyEl, dateKey, list, sched, totalBulanIni) {
  const p = dateKey.split('-').map(Number), dt = new Date(p[0], p[1] - 1, p[2]);
  titleEl.textContent = `${getHariList()[dt.getDay()]}, ${p[2]} ${getBulanList()[p[1] - 1]} ${p[0]}`;
  const schedTxt = sched ? (sched.catatan ? `${sched.status} (${sched.catatan})` : sched.status) : '-';
  if (!list || !list.length) {
    bodyEl.innerHTML = `<div class="day-detail-box"><div class="detail-grid" style="margin-top:0;padding:0;background:transparent;border:none"><div class="detail-row"><span>${esc(t('navJadwal'))}</span><strong>${esc(schedTxt)}</strong></div><div class="detail-row"><span>${esc(t('statTotalIn'))}</span><strong>${esc(totalBulanIni)}</strong></div></div></div>`;
    return;
  }
  const masuk = list.find((r) => r.jenis === 'MASUK') || null, ist = list.find((r) => r.jenis === 'ISTIRAHAT') || null;
  const pulangs = list.filter((r) => r.jenis === 'PULANG'), pulang = pulangs[pulangs.length - 1] || null;
  const notes = list.map((r) => r.catatan).filter(Boolean).join(' • ');

  bodyEl.innerHTML = `
    <div class="day-detail-box">
      <div class="detail-grid" style="margin-top:0;padding:0;background:transparent;border:none">
        <div class="detail-row"><span>${esc(t('navJadwal'))}</span><strong>${esc(schedTxt)}</strong></div>
        <div class="detail-row"><span>${esc(t('typeMasuk'))}</span><strong>${masuk ? `${esc(masuk.jam)} (${esc(masuk.status)})` : '-'}</strong></div>
        <div class="detail-row"><span>${esc(t('typeIstirahat'))}</span><strong>${ist ? esc(ist.jam) : '-'}</strong></div>
        <div class="detail-row"><span>${esc(t('typePulang'))}</span><strong>${pulang ? `${esc(pulang.jam)} (${esc(pulang.status)})` : '-'}</strong></div>
        ${notes ? `<div class="detail-row"><span>Catatan</span><strong>${esc(notes)}</strong></div>` : ''}
      </div>
      <div class="photo-btn-row photo-btn-row-3">
        ${masuk && masuk.foto ? `<button type="button" class="btn btn-outline btn-sm" onclick="previewPhoto('${esc(masuk.foto)}','${encodePhotoMeta(masuk)}')">${esc(t('typeMasuk'))}</button>` : `<button type="button" class="btn btn-outline btn-sm" disabled>${esc(t('typeMasuk'))} (-)</button>`}
        ${ist && ist.foto ? `<button type="button" class="btn btn-outline btn-sm" onclick="previewPhoto('${esc(ist.foto)}','${encodePhotoMeta(ist)}')">${esc(t('typeIstirahat'))}</button>` : `<button type="button" class="btn btn-outline btn-sm" disabled>${esc(t('typeIstirahat'))} (-)</button>`}
        ${pulang && pulang.foto ? `<button type="button" class="btn btn-blush btn-sm" onclick="previewPhoto('${esc(pulang.foto)}','${encodePhotoMeta(pulang)}')">${esc(t('typePulang'))}</button>` : `<button type="button" class="btn btn-blush btn-sm" disabled>${esc(t('typePulang'))} (-)</button>`}
      </div>
    </div>
  `;
}

async function loadCrewCalendar() {
  const y = state.calYear, m = state.calMonth, dim = new Date(y, m, 0).getDate();
  document.getElementById('calMonthLabel').textContent = `${getBulanList()[m - 1]} ${y}`;
  setBgSync(true);
  try {
    const res = await apiCall({ action: 'getHistory', filters: { startDate: `${y}-${pad2(m)}-01`, endDate: `${y}-${pad2(m)}-${pad2(dim)}` } });
    const b = buildCalendarMaps(res.records, res.schedules);
    state.calRecordsByDate = b.byDate; state.calSchedulesByDate = b.schedByDate;
    document.getElementById('calTotalMasuk').textContent = `${b.totalMasuk}`;
    document.getElementById('calTotalPagi').textContent = `${b.pagi}x`;
    document.getElementById('calTotalSiang').textContent = `${b.siang}x`;
    document.getElementById('calTotalFullDay').textContent = `${b.fullDay}x`;
    document.getElementById('calTotalJam').textContent = `${Math.floor(b.totalWorkMin / 60)}j ${b.totalWorkMin % 60}m`;
    document.getElementById('calTotalTelat').textContent = `${b.totalTelatMin} mnt`;
    document.getElementById('calTotalIzinSakit').textContent = `${b.izinSakit}`;
    document.getElementById('calTotalLupaPulang').textContent = `${b.lupaPulang}x`;

    const todayKey = `${nowInit.getFullYear()}-${pad2(nowInit.getMonth() + 1)}-${pad2(nowInit.getDate())}`;
    const keys = Object.keys(b.byDate).sort();
    state.calSelectedDate = todayKey.startsWith(`${y}-${pad2(m)}-`) ? todayKey : (keys[keys.length - 1] || `${y}-${pad2(m)}-01`);
    renderCalendarGridInto(document.getElementById('crewCalendarGrid'), y, m, b.byDate, b.schedByDate, state.calSelectedDate, selectCrewCalendarDay);
    selectCrewCalendarDay(state.calSelectedDate);
  } catch (err) {
    document.getElementById('crewCalendarGrid').innerHTML = `<div class="empty-state" style="grid-column:1/-1">${esc(err.message)}</div>`;
  } finally { setBgSync(false); }
}

function selectCrewCalendarDay(dk) {
  state.calSelectedDate = dk;
  document.querySelectorAll('#crewCalendarGrid .cal-day').forEach((btn) => btn.classList.toggle('selected', btn.dataset.date === dk));
  renderCalendarDayDetailInto(document.getElementById('crewDayDetailTitle'), document.getElementById('crewDayDetailBody'), dk, state.calRecordsByDate[dk], state.calSchedulesByDate[dk], document.getElementById('calTotalMasuk').textContent);
}

window.openCrewCalendarModal = function (encodedCrew) {
  const crew = JSON.parse(decodeURIComponent(encodedCrew));
  state.adminCalTarget = crew;
  state.adminCalMonth = Number(document.getElementById('storeDetailMonth').value) || (nowInit.getMonth() + 1);
  state.adminCalYear = Number(document.getElementById('storeDetailYear').value) || nowInit.getFullYear();
  document.getElementById('modalCrewCalTitle').textContent = crew.nama;
  document.getElementById('modalCrewCalSub').textContent = [crew.toko, crew.posisi || 'Crew'].join(' • ');
  openModal('modalCrewCalendar');
  loadAdminCrewCalendar();
};

async function loadAdminCrewCalendar() {
  if (!state.adminCalTarget) return;
  const y = state.adminCalYear, m = state.adminCalMonth, dim = new Date(y, m, 0).getDate();
  document.getElementById('adminCalMonthLabel').textContent = `${getBulanList()[m - 1]} ${y}`;
  setBgSync(true);
  try {
    const res = await apiCall({ action: state.user.role === 'ADMIN' ? 'getHistory' : 'getMonitoringHistory', filters: { crewName: state.adminCalTarget.nama, startDate: `${y}-${pad2(m)}-01`, endDate: `${y}-${pad2(m)}-${pad2(dim)}` } });
    const b = buildCalendarMaps(res.records, res.schedules);
    state.adminCalRecordsByDate = b.byDate; state.adminCalSchedulesByDate = b.schedByDate;
    document.getElementById('adminCalTotalMasuk').textContent = `${b.totalMasuk}`;
    document.getElementById('adminCalTotalPagi').textContent = `${b.pagi}x`;
    document.getElementById('adminCalTotalSiang').textContent = `${b.siang}x`;
    document.getElementById('adminCalTotalFullDay').textContent = `${b.fullDay}x`;
    const todayKey = `${nowInit.getFullYear()}-${pad2(nowInit.getMonth() + 1)}-${pad2(nowInit.getDate())}`;
    const keys = Object.keys(b.byDate).sort();
    state.adminCalSelectedDate = todayKey.startsWith(`${y}-${pad2(m)}-`) ? todayKey : (keys[keys.length - 1] || `${y}-${pad2(m)}-01`);
    renderCalendarGridInto(document.getElementById('adminCrewCalGrid'), y, m, b.byDate, b.schedByDate, state.adminCalSelectedDate, selectAdminCrewCalendarDay);
    selectAdminCrewCalendarDay(state.adminCalSelectedDate);
  } catch (err) { document.getElementById('adminCrewCalGrid').innerHTML = `<div class="empty-state" style="grid-column:1/-1">${esc(err.message)}</div>`; } finally { setBgSync(false); }
}

function selectAdminCrewCalendarDay(dk) {
  state.adminCalSelectedDate = dk;
  document.querySelectorAll('#adminCrewCalGrid .cal-day').forEach((btn) => btn.classList.toggle('selected', btn.dataset.date === dk));
  renderCalendarDayDetailInto(document.getElementById('adminCalDayTitle'), document.getElementById('adminCalDayBody'), dk, state.adminCalRecordsByDate[dk], state.adminCalSchedulesByDate[dk], document.getElementById('adminCalTotalMasuk').textContent);
}

/* ======================== RIWAYAT, GALERI & INPUT ABSEN MANUAL ADMIN ======================== */

function populateFilterStores(storeNames) {
  const names = storeNames && storeNames.length ? storeNames : state.stores.map((s) => (typeof s === 'string' ? s : s.nama));
  const optsAll = `<option value="SEMUA">${esc(t('allOutlets'))}</option>` + names.map((n) => `<option value="${esc(n)}">${esc(n)}</option>`).join('');
  ['filterToko', 'annTargetToko'].forEach((id) => {
    const sel = document.getElementById(id);
    if (!sel) return;
    const prev = sel.value || 'SEMUA';
    sel.innerHTML = optsAll;
    if ([...sel.options].some((o) => o.value === prev)) sel.value = prev;
  });
  const jSel = document.getElementById('jadwalTokoSelect');
  if (jSel && names.length) {
    const prevJ = jSel.value || state.jadwalStore || (state.user && state.user.role === 'CREW' ? state.user.toko : names[0]);
    jSel.innerHTML = names.map((n) => `<option value="${esc(n)}">${esc(n)}</option>`).join('');
    if ([...jSel.options].some((o) => o.value === prevJ)) jSel.value = prevJ;
  }
}

async function openManualAbsenModal() {
  if (!state.crews.length) {
    setLoading(true, 'Memuat data karyawan...');
    try { const res = await apiCall({ action: 'getMasterData' }); state.stores = res.stores || []; state.crews = res.crews || []; } catch {} finally { setLoading(false); }
  }
  const tokoSel = document.getElementById('manualTokoInput');
  tokoSel.innerHTML = state.stores.map((s) => `<option value="${esc(s.nama)}">${esc(s.nama)}</option>`).join('');
  updateManualCrewOptions();

  const now = new Date(Date.now() + state.serverOffsetMs);
  document.getElementById('manualDateInput').value = `${now.getFullYear()}-${pad2(now.getMonth() + 1)}-${pad2(now.getDate())}`;
  document.getElementById('manualTimeInput').value = `${pad2(now.getHours())}:${pad2(now.getMinutes())}`;
  document.getElementById('manualStatusInput').value = '';
  document.getElementById('manualCatatanInput').value = '';
  openModal('modalManualAbsen');
}

function updateManualCrewOptions() {
  const toko = document.getElementById('manualTokoInput').value;
  const crewSel = document.getElementById('manualCrewInput');
  const filtered = state.crews.filter((c) => c.toko.toUpperCase() === toko.toUpperCase());
  crewSel.innerHTML = filtered.length
    ? filtered.map((c) => `<option value="${esc(c.nama)}">${esc(c.nama)}</option>`).join('')
    : '<option value="">-</option>';
}

async function submitManualAbsenForm(e) {
  e.preventDefault();
  setLoading(true, 'Menyimpan absen manual...');
  try {
    const res = await apiCall({
      action: 'addManualAttendance',
      toko: document.getElementById('manualTokoInput').value,
      nama: document.getElementById('manualCrewInput').value,
      jenis: document.getElementById('manualJenisInput').value,
      shift: document.getElementById('manualShiftInput').value,
      dateKey: document.getElementById('manualDateInput').value,
      jam: document.getElementById('manualTimeInput').value,
      status: document.getElementById('manualStatusInput').value.trim(),
      catatan: document.getElementById('manualCatatanInput').value.trim()
    });
    closeModal('modalManualAbsen');
    showToast(res.message || 'Absen manual tersimpan!', 'success');
    loadHistory();
  } catch (err) { showToast(err.message, 'error'); } finally { setLoading(false); }
}

function openTodayHistoryFromDashboard() {
  const now = new Date(Date.now() + state.serverOffsetMs);
  const todayKey = (state.dashData && state.dashData.todayDateKey) || `${now.getFullYear()}-${pad2(now.getMonth() + 1)}-${pad2(now.getDate())}`;
  document.getElementById('filterSearch').value = '';
  document.getElementById('filterJenis').value = 'SEMUA';
  document.getElementById('filterShift').value = 'SEMUA';
  document.getElementById('filterStart').value = todayKey;
  document.getElementById('filterEnd').value = todayKey;
  const sel = document.getElementById('filterToko');
  if (sel) sel.value = [...sel.options].some((o) => o.value === state.dashOutletFilter) ? state.dashOutletFilter : 'SEMUA';
  state.historyMode = 'list';
  switchView('viewRiwayat', { skipLoad: true });
  loadHistory();
}

async function loadHistory() {
  const isAdmin = state.user.role === 'ADMIN';
  document.getElementById('riwayatModeSub').textContent = isAdmin ? 'Admin Only' : 'Read-Only';
  const filters = {
    search: document.getElementById('filterSearch').value.trim(),
    toko: document.getElementById('filterToko').value,
    jenis: document.getElementById('filterJenis').value,
    shift: document.getElementById('filterShift').value,
    startDate: document.getElementById('filterStart').value,
    endDate: document.getElementById('filterEnd').value
  };
  setBgSync(true);
  try {
    const res = await apiCall({ action: isAdmin ? 'getHistory' : 'getMonitoringHistory', filters });
    if (res.stores && res.stores.length) populateFilterStores(res.stores);
    state.historyRecords = res.records || [];
    renderHistoryCurrentMode();
  } catch (err) {
    document.getElementById('historyList').innerHTML = `<div class="empty-state">${esc(err.message)}</div>`;
  } finally { setBgSync(false); }
}

function renderHistoryCurrentMode() {
  const isAdmin = state.user.role === 'ADMIN';
  const listEl = document.getElementById('historyList'), galEl = document.getElementById('historyGallery');
  document.getElementById('btnHistoryListMode').classList.toggle('active', state.historyMode === 'list');
  document.getElementById('btnHistoryGalleryMode').classList.toggle('active', state.historyMode === 'gallery');
  if (state.historyMode === 'gallery') {
    listEl.classList.add('hidden'); galEl.classList.remove('hidden');
    const wp = (state.historyRecords || []).filter((r) => r.foto);
    galEl.innerHTML = wp.length ? wp.map((r) => `
      <div class="gallery-card" onclick="previewPhoto('${esc(r.foto)}','${encodePhotoMeta(r)}')">
        <img class="gallery-thumb" loading="lazy" src="${esc(toDisplayImageUrl(r.foto, 500))}" alt="${esc(r.nama)}" />
        <div class="gallery-meta">
          <div style="display:flex;justify-content:space-between;align-items:center;gap:6px"><strong>${esc(r.nama)}</strong><span class="badge ${jenisBadgeClass(r.jenis)}">${esc(r.jenis)}</span></div>
          <span>${esc(r.toko)} • ${esc(r.shift)}</span><span>${esc(r.tanggalDisplay)} • ${esc(r.jam)} WIB</span>
        </div>
      </div>
    `).join('') : '<div class="empty-state" style="grid-column:1/-1">-</div>';
  } else {
    galEl.classList.add('hidden'); listEl.classList.remove('hidden');
    if (!state.historyRecords.length) {
      listEl.innerHTML = `<div class="mascot-empty-box"><div class="mascot-empty-circle"><img data-mascot-img alt="" /></div><strong>-</strong></div>`;
      applyMascotAssets(listEl); return;
    }
    listEl.innerHTML = state.historyRecords.map((r) => `
      <div class="record-card">
        <div class="record-top">
          <div>
            <div class="record-title">${esc(r.nama)}</div>
            <div class="record-sub">${esc(r.toko)} • ${esc(r.shift)} • ${esc(r.hari)}, ${esc(r.tanggalDisplay)}</div>
            ${r.catatan ? `<div class="record-note-pill">📝 ${esc(r.catatan)}</div>` : ''}
          </div>
          <span class="badge ${jenisBadgeClass(r.jenis)}">${esc(r.jenis)}</span>
        </div>
        <div class="record-bottom">
          <div><strong>${esc(r.jam)}</strong>${r.status && r.status !== '-' ? `<span class="badge ${r.isLate ? 'badge-danger' : 'badge-neutral'}" style="margin-left:6px">${esc(r.status)}</span>` : ''}</div>
          <div class="record-actions">
            ${r.foto ? `<button type="button" class="btn-ghost-sm" onclick="previewPhoto('${esc(r.foto)}','${encodePhotoMeta(r)}')">Foto</button>` : ''}
            ${isAdmin ? `<button type="button" class="btn-ghost-sm" onclick="openEditModal('${encodeURIComponent(JSON.stringify(r))}')">Edit</button><button type="button" class="btn-ghost-sm text-danger" onclick="openDeleteModal(${r.rowNumber}, '${esc(r.id)}', '${esc(r.nama)}')">Hapus</button>` : ''}
          </div>
        </div>
      </div>
    `).join('');
  }
}

/* ======================== DASHBOARD LIVE, MONITORING, APPROVAL IZIN & LAPORAN WA ======================== */

function startDashboardAutoRefresh() {
  stopDashboardAutoRefresh();
  state.dashAutoRefreshTimer = setInterval(() => {
    if (state.activeView !== 'viewDashboard' || document.hidden || document.querySelector('.modal-backdrop:not(.hidden)')) return;
    loadDashboard(true);
  }, 60000);
}
function stopDashboardAutoRefresh() { if (state.dashAutoRefreshTimer) { clearInterval(state.dashAutoRefreshTimer); state.dashAutoRefreshTimer = null; } }

async function loadDashboard(silent = false) {
  const isAdmin = state.user.role === 'ADMIN';
  document.getElementById('dashHeadingTitle').textContent = isAdmin ? t('navDashboard') : t('roleMonitor');
  document.getElementById('dashTopSwitcher').classList.toggle('hidden', state.user.role === 'MONITORING');
  if (state.dashData) renderDashboardFromData();
  if (!silent && !state.dashData) setLoading(true, 'Memuat...');
  else setBgSync(true);
  try {
    const res = await apiCall({ action: isAdmin ? 'getDashboard' : 'getMonitoringDashboard' });
    if (res.stores && res.stores.length) populateFilterStores(res.stores);
    state.dashData = res;
    state.dashLastUpdatedAt = new Date(Date.now() + state.serverOffsetMs);
    renderDashboardFromData();
  } catch (err) { showToast(err.message, 'error'); } finally { setBgSync(false); setLoading(false); }
}

function renderDashboardOutletPills(stores) {
  const bar = document.getElementById('dashOutletFilterBar'); if (!bar) return;
  const list = ['SEMUA', ...(stores || [])];
  if (!list.includes(state.dashOutletFilter)) state.dashOutletFilter = 'SEMUA';
  bar.innerHTML = list.map((n) => `<button type="button" class="outlet-pill ${state.dashOutletFilter === n ? 'active' : ''}" data-outlet="${esc(n)}">${esc(n === 'SEMUA' ? t('allOutlets') : n)}</button>`).join('');
  bar.querySelectorAll('.outlet-pill').forEach((btn) => btn.addEventListener('click', () => { state.dashOutletFilter = btn.dataset.outlet || 'SEMUA'; renderDashboardFromData(); }));
}

function renderDashboardFromData() {
  const res = state.dashData; if (!res) return;
  const fOutlet = state.dashOutletFilter || 'SEMUA';
  const match = (tk) => fOutlet === 'SEMUA' || String(tk || '').toUpperCase() === fOutlet.toUpperCase();
  renderDashboardOutletPills(res.stores || []);

  document.getElementById('dashDateLabel').textContent = res.serverDate || '-';
  const upd = document.getElementById('dashLiveUpdated');
  if (upd && state.dashLastUpdatedAt) upd.innerHTML = `<i class="live-pulse-dot"></i> Live • ${pad2(state.dashLastUpdatedAt.getHours())}:${pad2(state.dashLastUpdatedAt.getMinutes())}`;

  const perStoreF = fOutlet === 'SEMUA' ? (res.perStore || []) : (res.perStore || []).filter((s) => match(s.toko));
  const activeBreaks = (res.activeBreaks || []).filter((b) => match(b.toko));
  const belumPulang = (res.belumPulang || []).filter((b) => match(b.toko));
  const belumHadir = (res.belumHadir || []).filter((b) => match(b.toko));
  const izinSakit = (res.izinSakitHariIni || []).filter((b) => match(b.toko));
  const terlambat = (res.terlambatHariIni || []).filter((b) => match(b.toko));
  const pendingLeaves = (res.pendingLeaves || []).filter((lr) => match(lr.toko));
  const todayRecords = (res.todayRecords || []).filter((r) => match(r.toko));

  document.getElementById('kpiMasuk').textContent = perStoreF.reduce((s, x) => s + (x.masuk || 0), 0);
  document.getElementById('kpiIstirahat').textContent = activeBreaks.filter((b) => b.isOngoing).length;
  document.getElementById('kpiPulang').textContent = perStoreF.reduce((s, x) => s + (x.pulang || 0), 0);
  document.getElementById('kpiBelumHadir').textContent = belumHadir.length;
  document.getElementById('kpiBelumPulang').textContent = belumPulang.filter((b) => b.hariIni).length;
  document.getElementById('kpiTelat').textContent = perStoreF.reduce((s, x) => s + (x.terlambat || 0), 0);

  const isAdmin = state.user.role === 'ADMIN';
  const canWa = isAdmin || state.user.role === 'MONITORING';

  // 0. Pending Leave Approvals (Admin Only)
  const lvCard = document.getElementById('accPendingLeavesCard');
  if (isAdmin && pendingLeaves.length) {
    lvCard.classList.remove('hidden');
    document.getElementById('accPendingLeavesCount').textContent = pendingLeaves.length;
    document.getElementById('dashPendingLeavesList').innerHTML = pendingLeaves.map((lr) => {
      const range = lr.startDate === lr.endDate ? lr.startDate : `${lr.startDate} s/d ${lr.endDate}`;
      return `
        <div class="mini-item">
          <div>
            <strong>${esc(lr.nama)}</strong> <span class="record-sub">(${esc(lr.toko)})</span>
            <div class="record-sub"><b>${esc(lr.jenis)}</b> • ${esc(range)} • ${esc(lr.alasan)}</div>
          </div>
          <div class="mini-item-actions">
            ${lr.foto ? `<button type="button" class="btn-ghost-sm" onclick="previewPhoto('${esc(lr.foto)}')">Bukti</button>` : ''}
            <button type="button" class="btn-approve-xs" onclick="reviewLeaveAction('${esc(lr.id)}','APPROVED')">${esc(t('approveBtn'))}</button>
            <button type="button" class="btn-reject-xs" onclick="reviewLeaveAction('${esc(lr.id)}','REJECTED')">${esc(t('rejectBtn'))}</button>
          </div>
        </div>
      `;
    }).join('');
  } else lvCard.classList.add('hidden');

  // 1. Belum Hadir & Izin/Sakit
  const bhCard = document.getElementById('accBelumHadirCard');
  if (belumHadir.length + izinSakit.length > 0) {
    bhCard.classList.remove('hidden');
    document.getElementById('accBelumHadirCount').textContent = belumHadir.length + izinSakit.length;
    document.getElementById('dashBelumHadirList').innerHTML =
      belumHadir.map((b) => `<div class="mini-item"><div><strong>${esc(b.nama)}</strong> <span class="record-sub">(${esc(b.toko)})</span><div class="record-sub">${esc(b.shift)} • ${esc(b.shiftMulai)} WIB</div></div><div class="mini-item-actions">${canWa ? buildWaButtonHtml(b.noTelp, `Halo ${b.nama}, shift ${b.shift} hari ini di MOMOYO ${b.toko} mulai ${b.shiftMulai} WIB. Mohon konfirmasi kehadiran ya!`) : ''}<span class="badge ${b.sudahLewatJam ? 'badge-danger' : 'badge-berry'}">${b.sudahLewatJam ? `+${b.lewatMenit}m` : t('kpiAbsent')}</span></div></div>`).join('') +
      izinSakit.map((it) => `<div class="mini-item"><div><strong>${esc(it.nama)}</strong> <span class="record-sub">(${esc(it.toko)})</span><div class="record-sub">${esc(it.catatan || '-')}</div></div><span class="badge badge-neutral">${esc(it.status)}</span></div>`).join('');
  } else bhCard.classList.add('hidden');

  // 2. Istirahat
  const brCard = document.getElementById('dashActiveBreaksCard');
  if (activeBreaks.length) {
    brCard.classList.remove('hidden');
    document.getElementById('accActiveBreaksCount').textContent = activeBreaks.length;
    document.getElementById('dashActiveBreaksList').innerHTML = activeBreaks.map((b) => `
      <div class="mini-item">
        <div><strong>${esc(b.nama)}</strong> <span class="record-sub">(${esc(b.toko)})</span><div class="record-sub">${esc(b.startJam)} – ${esc(b.endJam)} WIB</div></div>
        <div class="mini-item-actions">${canWa ? buildWaButtonHtml(b.noTelp, `Halo ${b.nama}, waktu istirahat di MOMOYO ${b.toko} selesai pukul ${b.endJam} WIB.`) : ''}<span class="badge ${b.isOngoing ? 'badge-warning' : 'badge-masuk'} live-break-badge" data-end-ms="${b.endMs}">${b.isOngoing ? formatRemainingMs(b.endMs - (Date.now() + state.serverOffsetMs)) : t('btnDone')}</span></div>
      </div>
    `).join('');
  } else brCard.classList.add('hidden');

  // 3. Belum Pulang
  const bpCard = document.getElementById('belumPulangCard');
  if (belumPulang.length) {
    bpCard.classList.remove('hidden');
    document.getElementById('accBelumPulangCount').textContent = belumPulang.length;
    document.getElementById('belumPulangList').innerHTML = belumPulang.map((b) => `
      <div class="mini-item">
        <div><strong>${esc(b.nama)}</strong> <span class="record-sub">(${esc(b.toko)})</span><div class="record-sub">${esc(b.tanggal)} • ${esc(b.jamMasuk)}</div></div>
        <div class="mini-item-actions">${canWa ? buildWaButtonHtml(b.noTelp, `Halo ${b.nama}, belum tercatat absen PULANG tanggal ${b.tanggal} di MOMOYO ${b.toko}. Mohon konfirmasi ya!`) : ''}<span class="badge ${b.hariIni ? 'badge-warning' : 'badge-danger'}">${b.hariIni ? 'Today' : 'Past'}</span></div>
      </div>
    `).join('');
  } else bpCard.classList.add('hidden');

  // 4. Terlambat
  const tlCard = document.getElementById('accTerlambatCard');
  if (terlambat.length) {
    tlCard.classList.remove('hidden');
    document.getElementById('accTerlambatCount').textContent = terlambat.length;
    document.getElementById('dashTerlambatList').innerHTML = terlambat.map((x) => `
      <div class="mini-item">
        <div><strong>${esc(x.nama)}</strong> <span class="record-sub">(${esc(x.toko)})</span><div class="record-sub">${esc(x.shift)} • ${esc(x.jam)} WIB</div></div>
        <div class="mini-item-actions">${canWa ? buildWaButtonHtml(x.noTelp, `Halo ${x.nama}, tercatat masuk pukul ${x.jam} WIB (${x.status}) di MOMOYO ${x.toko}.`) : ''}<span class="badge badge-danger">${esc(x.status)}</span></div>
      </div>
    `).join('');
  } else tlCard.classList.add('hidden');

  // Tabel Per Toko
  document.getElementById('dashStoreTable').innerHTML = perStoreF.map((s) => `
    <tr class="clickable-row" onclick="openStoreDetail(decodeURIComponent('${encodeURIComponent(s.toko)}'))">
      <td><div class="row-entity-cell"><span class="row-init-badge">${esc(getInitials(s.toko))}</span><span class="row-entity-name">${esc(s.toko)}</span></div></td>
      <td class="text-center"><strong>${s.masuk}</strong></td>
      <td class="text-center">${s.istirahat || 0}</td>
      <td class="text-center">${s.pulang}</td>
      <td class="text-center">${(s.belumHadir || 0) > 0 ? `<span class="num-pill num-pill-berry">${s.belumHadir}</span>` : '0'}</td>
      <td class="text-center">${s.belumPulang > 0 ? `<span class="num-pill num-pill-warn">${s.belumPulang}</span>` : '0'}</td>
      <td class="text-center">${s.terlambat > 0 ? `<span class="num-pill num-pill-danger">${s.terlambat}</span>` : '0'}</td>
    </tr>
  `).join('');

  document.getElementById('dashTodayCountBadge').textContent = todayRecords.length;
  document.getElementById('dashTodaySummaryText').textContent = `${fOutlet === 'SEMUA' ? t('allOutlets') : fOutlet}: ${todayRecords.filter((r) => r.jenis === 'MASUK').length} ${t('typeMasuk')} • ${todayRecords.filter((r) => r.jenis === 'ISTIRAHAT').length} ${t('typeIstirahat')} • ${todayRecords.filter((r) => r.jenis === 'PULANG').length} ${t('typePulang')}`;

  const chartStores = fOutlet === 'SEMUA' ? (res.chartPerStore || []) : (res.chartPerStore || []).filter((c) => match(c.label));
  renderCharts(chartStores, res.chart7Days || []);
  tickAllBreakCountdowns();
}

window.reviewLeaveAction = async function (id, decision) {
  setLoading(true, 'Memproses approval...');
  try {
    const res = await apiCall({ action: 'reviewLeaveRequest', id, decision });
    showToast(res.message || 'Berhasil!', 'success');
    loadDashboard(true);
  } catch (err) { showToast(err.message, 'error'); } finally { setLoading(false); }
};

function shareDailyReportToWa() {
  const res = state.dashData;
  if (!res) return showToast('Data belum dimuat.', 'error');
  const f = state.dashOutletFilter || 'SEMUA';
  const match = (tk) => f === 'SEMUA' || String(tk || '').toUpperCase() === f.toUpperCase();
  const stores = (res.perStore || []).filter((s) => match(s.toko));
  const late = (res.terlambatHariIni || []).filter((x) => match(x.toko));
  const absent = (res.belumHadir || []).filter((x) => match(x.toko));
  const leave = (res.izinSakitHariIni || []).filter((x) => match(x.toko));

  const lines = [];
  if (state.lang === 'zh') {
    lines.push(`*📊 MOMOYO 每日考勤日报*`);
    lines.push(`日期: ${res.serverDate}`);
    lines.push(`范围: ${f === 'SEMUA' ? '全部门店' : f}`);
    lines.push('');
    stores.forEach((s) => lines.push(`• *${s.toko}*: 上班 ${s.masuk} | 休息 ${s.istirahat || 0} | 下班 ${s.pulang} | 未打卡 ${s.belumHadir || 0} | 迟到 ${s.terlambat}`));
    if (late.length) { lines.push('', '*⚠️ 迟到名单:*'); late.forEach((x) => lines.push(`- ${x.nama} (${x.toko}) ${x.jam}`)); }
    if (absent.length) { lines.push('', '*❗ 尚未打卡:*'); absent.forEach((x) => lines.push(`- ${x.nama} (${x.toko}) ${x.shift}`)); }
    if (leave.length) { lines.push('', '*📝 请假/病假:*'); leave.forEach((x) => lines.push(`- ${x.nama} (${x.toko}) ${x.status}`)); }
  } else if (state.lang === 'en') {
    lines.push(`*📊 MOMOYO DAILY ATTENDANCE REPORT*`);
    lines.push(`Date: ${res.serverDate}`);
    lines.push(`Scope: ${f === 'SEMUA' ? 'All Outlets' : f}`);
    lines.push('');
    stores.forEach((s) => lines.push(`• *${s.toko}*: In ${s.masuk} | Break ${s.istirahat || 0} | Out ${s.pulang} | Absent ${s.belumHadir || 0} | Late ${s.terlambat}`));
    if (late.length) { lines.push('', '*⚠️ Late Arrivals:*'); late.forEach((x) => lines.push(`- ${x.nama} (${x.toko}) ${x.jam} (${x.status})`)); }
    if (absent.length) { lines.push('', '*❗ Not Clocked In:*'); absent.forEach((x) => lines.push(`- ${x.nama} (${x.toko}) ${x.shift}`)); }
    if (leave.length) { lines.push('', '*📝 Leave / Sick:*'); leave.forEach((x) => lines.push(`- ${x.nama} (${x.toko}) ${x.status}`)); }
  } else {
    lines.push(`*📊 LAPORAN ABSENSI HARIAN MOMOYO*`);
    lines.push(`Tanggal: ${res.serverDate}`);
    lines.push(`Cakupan: ${f === 'SEMUA' ? 'Semua Outlet' : f}`);
    lines.push('');
    stores.forEach((s) => lines.push(`• *${s.toko}*: Masuk ${s.masuk} | Istirahat ${s.istirahat || 0} | Pulang ${s.pulang} | Blm Hadir ${s.belumHadir || 0} | Telat ${s.terlambat}`));
    if (late.length) { lines.push('', '*⚠️ Terlambat Hari Ini:*'); late.forEach((x) => lines.push(`- ${x.nama} (${x.toko}) ${x.jam} • ${x.status}`)); }
    if (absent.length) { lines.push('', '*❗ Belum Hadir (Terjadwal):*'); absent.forEach((x) => lines.push(`- ${x.nama} (${x.toko}) Shift ${x.shift}`)); }
    if (leave.length) { lines.push('', '*📝 Izin / Sakit / Off:*'); leave.forEach((x) => lines.push(`- ${x.nama} (${x.toko}) ${x.status}`)); }
  }

  const msg = lines.join('\n');
  window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank', 'noopener');
}

/* ======================== GRAFIK BATANG 3D NYATA & LABEL 2 BARIS RAPI DI HP ======================== */

const bar3DRealPlugin = {
  id: 'bar3DReal',
  afterDatasetsDraw(chart) {
    const { ctx } = chart;
    const depth = window.innerWidth < 520 ? 5 : 7;

    chart.data.datasets.forEach((ds, dsIdx) => {
      const meta = chart.getDatasetMeta(dsIdx);
      if (meta.hidden) return;
      const isMasuk = dsIdx === 0;
      const sideDark = isMasuk ? '#8C101E' : '#183DA8';
      const topLight = isMasuk ? '#FF6B78' : '#7CB8FF';

      meta.data.forEach((bar) => {
        const p = bar.getProps(['x', 'y', 'base', 'width'], true);
        const h = p.base - p.y;
        if (h < 3 || p.width < 5) return;

        const left = p.x - p.width / 2;
        const right = p.x + p.width / 2;
        const top = p.y;
        const bottom = p.base;

        ctx.save();

        // Bayangan lembut di garis dasar
        ctx.fillStyle = 'rgba(27, 33, 48, 0.10)';
        ctx.beginPath();
        ctx.ellipse(p.x + depth * 0.4, bottom + 1, p.width * 0.56, 3.2, 0, 0, Math.PI * 2);
        ctx.fill();

        // Sisi 3D kanan (lebih gelap)
        ctx.fillStyle = sideDark;
        ctx.beginPath();
        ctx.moveTo(right, top + 3);
        ctx.lineTo(right + depth, top - depth + 3);
        ctx.lineTo(right + depth, bottom - depth);
        ctx.lineTo(right, bottom);
        ctx.closePath();
        ctx.fill();

        // Tutup atas 3D (lebih terang)
        ctx.fillStyle = topLight;
        ctx.beginPath();
        ctx.moveTo(left + 2, top);
        ctx.lineTo(left + depth + 2, top - depth);
        ctx.lineTo(right + depth, top - depth);
        ctx.lineTo(right, top);
        ctx.closePath();
        ctx.fill();

        // Kilau glossy vertikal di sisi depan
        const glossW = Math.max(2.5, p.width * 0.24);
        const sheen = ctx.createLinearGradient(left, top, left + glossW, bottom);
        sheen.addColorStop(0, 'rgba(255, 255, 255, 0.46)');
        sheen.addColorStop(1, 'rgba(255, 255, 255, 0.04)');
        ctx.fillStyle = sheen;
        ctx.fillRect(left + 2, top + 3, glossW, Math.max(2, h - 5));

        ctx.restore();
      });
    });
  }
};

const line3DGlowPlugin = {
  id: 'line3DGlow',
  beforeDatasetDraw(chart, args) {
    const { ctx } = chart; ctx.save();
    ctx.shadowColor = args.index === 0 ? 'rgba(220,38,54,0.34)' : 'rgba(13,150,104,0.28)';
    ctx.shadowBlur = 10; ctx.shadowOffsetX = 0; ctx.shadowOffsetY = 5;
  },
  afterDatasetDraw(chart) { chart.ctx.restore(); }
};

function wrapLabelTwoLines(text) {
  const words = String(text || '').trim().split(/\s+/);
  if (words.length <= 1) return text;
  const mid = Math.ceil(words.length / 2);
  return [words.slice(0, mid).join(' '), words.slice(mid).join(' ')];
}

function renderCharts(perStore, days7) {
  if (typeof Chart === 'undefined') return;
  if (state.charts.store) state.charts.store.destroy();
  if (state.charts.days) state.charts.days.destroy();

  const isMobile = window.innerWidth < 540;
  const ctxStore = document.getElementById('chartPerStore').getContext('2d');
  const redG = ctxStore.createLinearGradient(0, 0, 0, 220);
  redG.addColorStop(0, '#F03D4D'); redG.addColorStop(1, '#B31524');
  const blueG = ctxStore.createLinearGradient(0, 0, 0, 220);
  blueG.addColorStop(0, '#4F9AF7'); blueG.addColorStop(1, '#1D4ED8');

  state.charts.store = new Chart(ctxStore, {
    type: 'bar',
    data: {
      labels: perStore.map((s) => wrapLabelTwoLines(s.label)),
      datasets: [
        { label: t('typeMasuk'), data: perStore.map((s) => s.masuk), backgroundColor: redG, borderRadius: { topLeft: 4, topRight: 4 }, maxBarThickness: isMobile ? 16 : 26, categoryPercentage: 0.68, barPercentage: 0.72 },
        { label: t('typePulang'), data: perStore.map((s) => s.pulang), backgroundColor: blueG, borderRadius: { topLeft: 4, topRight: 4 }, maxBarThickness: isMobile ? 16 : 26, categoryPercentage: 0.68, barPercentage: 0.72 }
      ]
    },
    plugins: [bar3DRealPlugin],
    options: {
      responsive: true,
      maintainAspectRatio: false,
      layout: { padding: { top: 10, right: 10, bottom: 2, left: 0 } },
      plugins: {
        legend: { position: 'top', labels: { usePointStyle: true, pointStyle: 'circle', boxWidth: 8, padding: 14, font: { family: 'Plus Jakarta Sans', weight: '700', size: 11 } } }
      },
      scales: {
        x: {
          grid: { display: false }, border: { display: false },
          ticks: { autoSkip: false, maxRotation: 0, minRotation: 0, color: '#525A6D', font: { family: 'Plus Jakarta Sans', size: isMobile ? 9.5 : 10.5, weight: '700' } }
        },
        y: {
          beginAtZero: true, border: { display: false }, grid: { color: '#F5E8EB' },
          ticks: { stepSize: 1, precision: 0, color: '#8A92A4', font: { family: 'Plus Jakarta Sans', size: 10 } }
        }
      },
      onHover: (evt, els) => { if (evt.native?.target) evt.native.target.style.cursor = els.length ? 'pointer' : 'default'; },
      onClick: (evt, els) => { if (els.length) { const sn = perStore[els[0].index]?.label; if (sn) openStoreDetail(sn); } }
    }
  });

  const ctxDays = document.getElementById('chart7Days').getContext('2d');
  const rArea = ctxDays.createLinearGradient(0, 0, 0, 210); rArea.addColorStop(0, 'rgba(220,38,54,0.28)'); rArea.addColorStop(1, 'rgba(220,38,54,0.01)');
  const gArea = ctxDays.createLinearGradient(0, 0, 0, 210); gArea.addColorStop(0, 'rgba(13,150,104,0.22)'); gArea.addColorStop(1, 'rgba(13,150,104,0.01)');

  state.charts.days = new Chart(ctxDays, {
    type: 'line',
    data: {
      labels: days7.map((d) => d.label),
      datasets: [
        { label: t('typeMasuk'), data: days7.map((d) => d.masuk), borderColor: '#DC2636', backgroundColor: rArea, borderWidth: 3, pointBackgroundColor: '#FFFFFF', pointBorderColor: '#DC2636', pointBorderWidth: 2.5, pointRadius: 4, tension: 0.42, fill: true },
        { label: t('typePulang'), data: days7.map((d) => d.pulang), borderColor: '#0D9668', backgroundColor: gArea, borderWidth: 3, pointBackgroundColor: '#FFFFFF', pointBorderColor: '#0D9668', pointBorderWidth: 2.5, pointRadius: 4, tension: 0.42, fill: true }
      ]
    },
    plugins: [line3DGlowPlugin],
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { position: 'top', labels: { usePointStyle: true, pointStyle: 'circle', boxWidth: 8, padding: 14, font: { family: 'Plus Jakarta Sans', weight: '700', size: 11 } } } },
      scales: {
        x: { grid: { display: false }, border: { display: false }, ticks: { maxRotation: 0, color: '#6C7486', font: { family: 'Plus Jakarta Sans', size: 10, weight: '600' } } },
        y: { beginAtZero: true, border: { display: false }, grid: { color: '#F5E8EB' }, ticks: { stepSize: 1, precision: 0, color: '#8A92A4', font: { family: 'Plus Jakarta Sans', size: 10 } } }
      }
    }
  });
}

window.openStoreDetail = function (toko) {
  state.activeStoreDetail = toko;
  document.getElementById('storeDetailTitle').textContent = `${toko}`;
  openModal('modalStoreDetail');
  loadStoreDetailData();
};

async function loadStoreDetailData() {
  if (!state.activeStoreDetail) return;
  const month = Number(document.getElementById('storeDetailMonth').value), year = Number(document.getElementById('storeDetailYear').value);
  const listEl = document.getElementById('storeDetailList');
  listEl.innerHTML = '<div class="empty-state">...</div>';
  const canWa = state.user && (state.user.role === 'ADMIN' || state.user.role === 'MONITORING');
  setBgSync(true);
  try {
    const res = await apiCall({ action: state.user.role === 'ADMIN' ? 'getStoreDetail' : 'getMonitoringStoreDetail', toko: state.activeStoreDetail, month, year });
    document.getElementById('storeDetailPeriod').textContent = `${res.monthName} ${res.year}`;
    const crews = res.crews || [];
    if (!crews.length) { listEl.innerHTML = '<div class="empty-state">-</div>'; return; }
    listEl.innerHTML = crews.map((c) => {
      const av = c.fotoProfil ? `<img src="${esc(toDisplayImageUrl(c.fotoProfil))}" alt="${esc(c.nama)}" />` : esc(getInitials(c.nama));
      const enc = encodeURIComponent(JSON.stringify({ nama: c.nama, toko: c.toko, posisi: c.posisi, area: c.area }));
      return `
        <div class="crew-stat-card">
          <div class="crew-stat-header">
            <div class="crew-stat-header-left"><div class="crew-mini-avatar">${av}</div><div><div class="record-title">${esc(c.nama)}</div><div class="record-sub">${esc(c.posisi || 'Crew')}${c.id ? ` • ID: ${esc(c.id)}` : ''}</div></div></div>
            ${canWa ? buildWaButtonHtml(c.noTelp, `Halo ${c.nama} (MOMOYO ${c.toko}), `) : ''}
          </div>
          <div class="crew-stat-grid">
            <div class="crew-stat-pill"><span>${esc(t('statTotalIn'))}</span><strong class="text-primary">${c.totalMasuk}x</strong></div>
            <div class="crew-stat-pill"><span>${esc(t('shiftPagi'))}</span><strong>${c.masukPagi}x</strong></div>
            <div class="crew-stat-pill"><span>${esc(t('shiftSiang'))}</span><strong>${c.masukSiang}x</strong></div>
            <div class="crew-stat-pill"><span>${esc(t('shiftFullDay'))}</span><strong>${c.masukFullDay}x</strong></div>
            <div class="crew-stat-pill"><span>${esc(t('thLate'))}</span><strong class="${c.totalTelatMenit > 0 ? 'text-danger' : 'text-success'}">${c.totalTelatMenit}m</strong></div>
          </div>
          <button type="button" class="crew-details-bar" onclick="openCrewCalendarModal('${enc}')">DETAILS ›</button>
        </div>
      `;
    }).join('');
  } catch (err) { listEl.innerHTML = `<div class="empty-state">${esc(err.message)}</div>`; } finally { setBgSync(false); }
}

/* ======================== JADWAL SHIFT (RENTANG TANGGAL LINTAS BULAN + PNG + WA) ======================== */

function initJadwalRangeDefaults() {
  const now = new Date();
  const diffMon = now.getDay() === 0 ? 6 : now.getDay() - 1;
  const mon = new Date(now.getFullYear(), now.getMonth(), now.getDate() - diffMon);
  const sun = new Date(mon.getFullYear(), mon.getMonth(), mon.getDate() + 6);
  document.getElementById('jadwalStartDate').value = toDateKeyClient(mon);
  document.getElementById('jadwalEndDate').value = toDateKeyClient(sun);
  document.getElementById('jadwalWeekSelect').value = 'RANGE';
  syncJadwalModeControls();
}

function syncJadwalModeControls() {
  const isRange = document.getElementById('jadwalWeekSelect').value === 'RANGE';
  document.getElementById('jadwalRangeBar').classList.toggle('hidden', !isRange);
  document.getElementById('jadwalMonthSelect').classList.toggle('hidden', isRange);
  document.getElementById('jadwalYearSelect').classList.toggle('hidden', isRange);
}

function shiftJadwalRangeDays(deltaDays) {
  const sEl = document.getElementById('jadwalStartDate'), eEl = document.getElementById('jadwalEndDate');
  const s = parseDateKeyClient(sEl.value) || new Date();
  const e = parseDateKeyClient(eEl.value) || new Date();
  s.setDate(s.getDate() + deltaDays);
  e.setDate(e.getDate() + deltaDays);
  sEl.value = toDateKeyClient(s);
  eEl.value = toDateKeyClient(e);
  loadJadwalView(true);
}

function getJadwalActiveDates() {
  const mode = document.getElementById('jadwalWeekSelect').value;
  const out = [];
  if (mode === 'RANGE') {
    const s = parseDateKeyClient(document.getElementById('jadwalStartDate').value);
    const e = parseDateKeyClient(document.getElementById('jadwalEndDate').value);
    if (!s || !e || e < s) return [];
    const cur = new Date(s.getTime());
    let guard = 0;
    while (cur <= e && guard < 35) {
      out.push(new Date(cur.getTime()));
      cur.setDate(cur.getDate() + 1);
      guard++;
    }
    return out;
  }
  const y = Number(document.getElementById('jadwalYearSelect').value) || nowInit.getFullYear();
  const m = Number(document.getElementById('jadwalMonthSelect').value) || (nowInit.getMonth() + 1);
  const dim = new Date(y, m, 0).getDate();
  let sd = 1, ed = dim;
  if (mode !== 'ALL') { const w = Number(mode); sd = (w - 1) * 7 + 1; ed = Math.min(dim, w * 7); }
  for (let d = sd; d <= ed; d++) out.push(new Date(y, m - 1, d));
  return out;
}

async function loadJadwalView(forceRefresh = false) {
  syncJadwalModeControls();
  const tokoSel = document.getElementById('jadwalTokoSelect');
  let toko = tokoSel.value || state.jadwalStore || (state.user.role === 'CREW' ? state.user.toko : '');
  const dates = getJadwalActiveDates();
  if (!dates.length) return showToast('Rentang tanggal tidak valid.', 'error');

  const startDate = toDateKeyClient(dates[0]), endDate = toDateKeyClient(dates[dates.length - 1]);
  const cacheKey = `${toko}|${startDate}|${endDate}`;
  const cached = !forceRefresh && toko ? state.cache.jadwal[cacheKey] : null;
  const wrap = document.getElementById('jadwalMatrixWrap');

  state.jadwalVisibleDates = dates;
  if (cached) {
    state.jadwalStore = toko; state.jadwalCrews = cached.crews; state.jadwalMap = Object.assign({}, cached.map);
    state.jadwalDirty = {}; updateJadwalDirtyInfo(); renderJadwalMatrix();
  } else wrap.innerHTML = '<div class="empty-state">...</div>';

  setBgSync(true);
  try {
    const res = await apiCall({ action: 'getSchedules', toko, startDate, endDate });
    if (res.stores && res.stores.length) {
      populateFilterStores(res.stores);
      if (!toko) {
        toko = (state.user.role === 'CREW' && res.stores.includes(state.user.toko)) ? state.user.toko : res.stores[0];
        tokoSel.value = toko; state.jadwalStore = toko; setBgSync(false);
        return loadJadwalView(forceRefresh);
      }
    }
    const newMap = {};
    (res.schedules || []).forEach((s) => { newMap[`${s.dateKey}|${s.crewId || s.nama.toUpperCase()}`] = s.status; });
    state.cache.jadwal[`${toko}|${startDate}|${endDate}`] = { crews: res.crews || [], map: newMap };
    state.jadwalStore = toko; state.jadwalCrews = res.crews || []; state.jadwalMap = newMap;
    state.jadwalDirty = {}; updateJadwalDirtyInfo(); renderJadwalMatrix();
  } catch (err) {
    if (!cached) wrap.innerHTML = `<div class="empty-state">${esc(err.message)}</div>`;
    else showToast(err.message, 'error');
  } finally { setBgSync(false); }
}

function renderJadwalMatrix() {
  const wrap = document.getElementById('jadwalMatrixWrap'), crews = state.jadwalCrews || [], dates = state.jadwalVisibleDates || [];
  if (!crews.length) { wrap.innerHTML = '<div class="empty-state">-</div>'; return; }
  const isAdmin = state.user.role === 'ADMIN';
  const todayKey = toDateKeyClient(new Date(Date.now() + state.serverOffsetMs));
  const shortDays = getHariShortList();

  const thead = `<thead><tr><th class="sticky-date">${esc(t('navJadwal'))}</th>${crews.map((c) => {
    const p = (c.posisi || '').toUpperCase();
    const cls = p.includes('SUPERVISOR') ? 'col-supervisor' : (p.includes('KEPALA') ? 'col-captain' : (c.area === 'BAKERY' || p.includes('BAKERY') ? 'col-bakery' : 'col-drink'));
    return `<th class="${cls}">${esc(c.nama)}<br><small style="opacity:0.85;font-weight:600">${esc(c.posisi || c.area || 'Crew')}</small></th>`;
  }).join('')}</tr></thead>`;

  const rowsHtml = dates.map((dt) => {
    const dk = toDateKeyClient(dt), dayIdx = dt.getDay();
    const rCls = [dk === todayKey ? 'is-today-row' : '', dayIdx === 0 ? 'is-weekend-row' : ''].filter(Boolean).join(' ');
    const cells = crews.map((c) => {
      const key = `${dk}|${c.id || c.nama.toUpperCase()}`;
      const val = state.jadwalDirty[key] !== undefined ? state.jadwalDirty[key].status : (state.jadwalMap[key] || '');
      const cCls = getScheduleStyleClass(val);
      if (!isAdmin) return `<td><span class="sched-tag ${cCls}">${esc(val || '-')}</span></td>`;
      const pVals = JADWAL_PRESET_OPTIONS.map((o) => o.val);
      const opts = JADWAL_PRESET_OPTIONS.map((o) => `<option value="${esc(o.val)}" ${val === o.val ? 'selected' : ''}>${esc(o.label)}</option>`).join('') +
        (val && !pVals.includes(val) ? `<option value="${esc(val)}" selected>${esc(val)}</option>` : '');
      return `<td><select class="jadwal-cell-select ${cCls}" data-dk="${dk}" data-cid="${esc(c.id)}" data-nama="${esc(c.nama)}" data-prev="${esc(val)}">${opts}</select></td>`;
    }).join('');
    return `<tr class="${rCls}"><td class="sticky-date">${pad2(dt.getDate())}/${pad2(dt.getMonth() + 1)} <small>${esc(shortDays[dayIdx])}</small></td>${cells}</tr>`;
  }).join('');

  wrap.innerHTML = `<table class="jadwal-table">${thead}<tbody>${rowsHtml}</tbody></table>`;
  if (isAdmin) wrap.querySelectorAll('.jadwal-cell-select').forEach((sel) => sel.addEventListener('change', onJadwalCellChange));
}

async function copyPreviousWeekSchedules() {
  if (!state.jadwalStore || !state.jadwalCrews.length || !state.jadwalVisibleDates.length) return;
  const dates = state.jadwalVisibleDates;
  const srcStart = new Date(dates[0].getTime()); srcStart.setDate(srcStart.getDate() - 7);
  const srcEnd = new Date(dates[dates.length - 1].getTime()); srcEnd.setDate(srcEnd.getDate() - 7);

  setLoading(true, 'Menyalin minggu lalu...');
  try {
    const resPrev = await apiCall({ action: 'getSchedules', toko: state.jadwalStore, startDate: toDateKeyClient(srcStart), endDate: toDateKeyClient(srcEnd) });
    const prevMap = Object.assign({}, state.jadwalMap);
    Object.keys(state.jadwalDirty).forEach((k) => { prevMap[k] = state.jadwalDirty[k].status; });
    (resPrev.schedules || []).forEach((s) => { prevMap[`${s.dateKey}|${s.crewId || s.nama.toUpperCase()}`] = s.status; });

    let copied = 0;
    dates.forEach((dt) => {
      const srcDt = new Date(dt.getTime()); srcDt.setDate(srcDt.getDate() - 7);
      const tDk = toDateKeyClient(dt), sDk = toDateKeyClient(srcDt);
      state.jadwalCrews.forEach((c) => {
        const ck = c.id || c.nama.toUpperCase(), sVal = prevMap[`${sDk}|${ck}`] || '';
        if (sVal) {
          state.jadwalDirty[`${tDk}|${ck}`] = { dateKey: tDk, crewId: c.id, nama: c.nama, status: sVal, catatan: '' };
          copied++;
        }
      });
    });
    if (!copied) showToast('Tidak ada jadwal 7 hari sebelumnya untuk disalin.', 'error');
    else { renderJadwalMatrix(); updateJadwalDirtyInfo(); showToast(`${copied} kotak jadwal disalin! Klik Simpan.`, 'success'); }
  } catch (err) { showToast(err.message, 'error'); } finally { setLoading(false); }
}

function exportJadwalAsPng() {
  const crews = state.jadwalCrews || [], dates = state.jadwalVisibleDates || [];
  if (!crews.length || !dates.length) return showToast('Jadwal kosong.', 'error');

  const dpr = 2, pad = 26, dateColW = 110, colW = 112, headerH = 74, theadH = 46, rowH = 38;
  const totalW = pad * 2 + dateColW + crews.length * colW;
  const totalH = pad * 2 + headerH + theadH + dates.length * rowH + 26;

  const canvas = document.createElement('canvas');
  canvas.width = totalW * dpr; canvas.height = totalH * dpr;
  const ctx = canvas.getContext('2d'); ctx.scale(dpr, dpr);

  ctx.fillStyle = '#FFF5F6'; ctx.fillRect(0, 0, totalW, totalH);
  // Header Merah MOMOYO
  ctx.fillStyle = '#C81E2B'; ctx.fillRect(0, 0, totalW, headerH);
  ctx.fillStyle = '#FFFFFF'; ctx.font = '800 20px "Plus Jakarta Sans",sans-serif';
  ctx.fillText(`JADWAL SHIFT MOMOYO — ${state.jadwalStore}`, pad, 34);
  ctx.font = '600 13px "Plus Jakarta Sans",sans-serif'; ctx.fillStyle = '#FFE4E7';
  const rLabel = `${toDateKeyClient(dates[0])} s/d ${toDateKeyClient(dates[dates.length - 1])}`;
  ctx.fillText(`Periode: ${rLabel}`, pad, 56);

  const tableY = headerH + 16;
  // Table Header
  ctx.fillStyle = '#1E2433'; ctx.fillRect(pad, tableY, dateColW + crews.length * colW, theadH);
  ctx.fillStyle = '#FFFFFF'; ctx.font = '700 12px "Plus Jakarta Sans",sans-serif'; ctx.textAlign = 'left';
  ctx.fillText('TANGGAL', pad + 12, tableY + 28);
  ctx.textAlign = 'center';
  crews.forEach((c, idx) => {
    const cx = pad + dateColW + idx * colW + colW / 2;
    ctx.fillStyle = '#FFFFFF'; ctx.font = '800 12px "Plus Jakarta Sans",sans-serif';
    ctx.fillText(c.nama.slice(0, 12), cx, tableY + 21);
    ctx.fillStyle = '#CBD5E1'; ctx.font = '600 10px "Plus Jakarta Sans",sans-serif';
    ctx.fillText((c.posisi || 'Crew').slice(0, 13), cx, tableY + 36);
  });

  const pillColors = {
    'st-pagi': ['#FFE4EC', '#9D174D'], 'st-siang': ['#FFEDD8', '#9A3412'],
    'st-fullday': ['#FFD6DC', '#B91C2B'], 'st-izin': ['#F5EBE0', '#7C4A2D'],
    'st-sakit': ['#FECDD3', '#881337'], 'st-lainnya': ['#F3E2EE', '#701A5C'], 'st-empty': ['#F6F1F3', '#949BAA']
  };

  dates.forEach((dt, rIdx) => {
    const ry = tableY + theadH + rIdx * rowH;
    ctx.fillStyle = rIdx % 2 === 0 ? '#FFFFFF' : '#FFF9FA';
    ctx.fillRect(pad, ry, dateColW + crews.length * colW, rowH);
    ctx.strokeStyle = '#F3E2E5'; ctx.lineWidth = 1;
    ctx.strokeRect(pad, ry, dateColW + crews.length * colW, rowH);

    ctx.textAlign = 'left'; ctx.fillStyle = dt.getDay() === 0 ? '#C81E2B' : '#1B2130';
    ctx.font = '700 12px "Plus Jakarta Sans",sans-serif';
    ctx.fillText(`${pad2(dt.getDate())}/${pad2(dt.getMonth() + 1)} (${HARI_SHORT_MAP.id[dt.getDay()]})`, pad + 10, ry + 23);

    const dk = toDateKeyClient(dt);
    ctx.textAlign = 'center';
    crews.forEach((c, cIdx) => {
      const key = `${dk}|${c.id || c.nama.toUpperCase()}`;
      const val = state.jadwalDirty[key] !== undefined ? state.jadwalDirty[key].status : (state.jadwalMap[key] || '');
      const [bg, fg] = pillColors[getScheduleStyleClass(val)] || pillColors['st-empty'];
      const bx = pad + dateColW + cIdx * colW + 8, by = ry + 6, bw = colW - 16, bh = rowH - 12;
      ctx.fillStyle = bg; ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(bx, by, bw, bh, 8); else ctx.rect(bx, by, bw, bh);
      ctx.fill();
      ctx.fillStyle = fg; ctx.font = '800 11px "Plus Jakarta Sans",sans-serif';
      ctx.fillText((val || '-').slice(0, 11), bx + bw / 2, ry + 23);
    });
  });

  const a = document.createElement('a');
  a.href = canvas.toDataURL('image/png');
  a.download = `Jadwal_MOMOYO_${state.jadwalStore}_${toDateKeyClient(dates[0])}.png`;
  a.click();
  showToast('Gambar jadwal PNG berhasil diunduh!', 'success');
}

function shareJadwalToWa() {
  const crews = state.jadwalCrews || [], dates = state.jadwalVisibleDates || [];
  if (!crews.length || !dates.length) return;
  const lines = [`*📅 JADWAL SHIFT MOMOYO — ${state.jadwalStore}*`, `Periode: ${toDateKeyClient(dates[0])} s/d ${toDateKeyClient(dates[dates.length - 1])}`, ''];
  dates.forEach((dt) => {
    const dk = toDateKeyClient(dt);
    lines.push(`*${pad2(dt.getDate())}/${pad2(dt.getMonth() + 1)} (${HARI_SHORT_MAP.id[dt.getDay()]})*`);
    crews.forEach((c) => {
      const key = `${dk}|${c.id || c.nama.toUpperCase()}`;
      const val = state.jadwalDirty[key] !== undefined ? state.jadwalDirty[key].status : (state.jadwalMap[key] || '-');
      if (val && val !== '-') lines.push(`• ${c.nama}: ${val}`);
    });
  });
  window.open(`https://wa.me/?text=${encodeURIComponent(lines.join('\n'))}`, '_blank', 'noopener');
}

function onJadwalCellChange(e) {
  const sel = e.target, { dk, cid, nama } = sel.dataset;
  if (sel.value === '__CUSTOM__') {
    state.jadwalBkoPending = { sel, dk, cid, nama, prev: sel.dataset.prev || '' };
    document.getElementById('jadwalBkoDesc').textContent = `${nama} (${dk})`;
    document.getElementById('jadwalBkoInput').value = '';
    openModal('modalJadwalBko'); sel.value = sel.dataset.prev || ''; return;
  }
  applyJadwalCellValue(sel, dk, cid, nama, sel.value);
}

function applyJadwalCellValue(sel, dk, cid, nama, val) {
  const clean = String(val || '').toUpperCase().trim();
  state.jadwalDirty[`${dk}|${cid || nama.toUpperCase()}`] = { dateKey: dk, crewId: cid, nama, status: clean, catatan: '' };
  sel.dataset.prev = clean; sel.className = `jadwal-cell-select ${getScheduleStyleClass(clean)}`;
  updateJadwalDirtyInfo();
}

function updateJadwalDirtyInfo() {
  const cnt = Object.keys(state.jadwalDirty).length, info = document.getElementById('jadwalDirtyInfo'), btn = document.getElementById('btnSaveJadwal');
  if (!info || !btn) return;
  info.textContent = cnt > 0 ? `${cnt} perubahan belum disimpan.` : '';
  info.style.color = cnt > 0 ? 'var(--primary)' : '';
  btn.textContent = cnt > 0 ? `${t('btnSaveJadwal')} (${cnt})` : t('btnSaveJadwal');
}

async function saveJadwalChanges() {
  const entries = Object.values(state.jadwalDirty);
  if (!entries.length) return showToast('Belum ada perubahan.');
  setLoading(true, 'Menyimpan jadwal...');
  try {
    const res = await apiCall({ action: 'saveSchedules', toko: state.jadwalStore, entries }, 45000);
    entries.forEach((ent) => { const k = `${ent.dateKey}|${ent.crewId || ent.nama.toUpperCase()}`; if (ent.status) state.jadwalMap[k] = ent.status; else delete state.jadwalMap[k]; });
    state.jadwalDirty = {}; updateJadwalDirtyInfo(); state.cache.jadwal = {};
    showToast(res.message || 'Jadwal tersimpan!', 'success');
  } catch (err) { showToast(err.message, 'error'); } finally { setLoading(false); }
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
  if (isFullDayShift(s)) return 'FULL';
  return s.slice(0, 6);
}

/* ======================== INSIGHT (+ TOP DISIPLIN & PERLU PERHATIAN) & REKAP ======================== */

function renderInsightData(res) {
  document.getElementById('insightPeriodDesc').textContent = `${res.periodLabel} vs ${res.prevLabel}`;
  const o = res.overall;
  document.getElementById('insJam').textContent = `${o.curJam} j`; setDiffPill(document.getElementById('insJamDiff'), o.curJam, o.prevJam, 'j', false);
  document.getElementById('insHadir').textContent = `${o.curHadir}`; setDiffPill(document.getElementById('insHadirDiff'), o.curHadir, o.prevHadir, '', false);
  document.getElementById('insTelat').textContent = `${o.curTelat}x`; setDiffPill(document.getElementById('insTelatDiff'), o.curTelat, o.prevTelat, 'x', true);

  const crews = res.perCrew || [];
  // Top Disiplin (0 telat & kehadiran tertinggi)
  const topList = [...crews].filter((c) => c.curHadir > 0 && c.curTelat === 0 && (c.curLupaPulang || 0) === 0)
    .sort((a, b) => b.curHadir - a.curHadir || b.curJam - a.curJam).slice(0, 3);
  document.getElementById('insTopDisiplinList').innerHTML = topList.length
    ? topList.map((c, i) => `<div class="mini-item"><div><strong>#${i + 1} ${esc(c.nama)}</strong> <span class="record-sub">(${esc(c.toko)})</span></div><span class="badge badge-masuk">${c.curHadir}d • ${c.curJam}j</span></div>`).join('')
    : '<div class="subtitle">-</div>';

  // Perlu Perhatian (terlambat / lupa pulang)
  const warnList = [...crews].filter((c) => c.curTelat > 0 || (c.curLupaPulang || 0) > 0)
    .sort((a, b) => (b.curTelat + (b.curLupaPulang || 0)) - (a.curTelat + (a.curLupaPulang || 0))).slice(0, 5);
  document.getElementById('insPerluPerhatianList').innerHTML = warnList.length
    ? warnList.map((c) => `<div class="mini-item"><div><strong>${esc(c.nama)}</strong> <span class="record-sub">(${esc(c.toko)})</span></div><span class="badge badge-danger">${c.curTelat}x ${t('thLate')}${c.curLupaPulang ? ` • ${c.curLupaPulang}x No Out` : ''}</span></div>`).join('')
    : '<div class="subtitle">✓ 0</div>';

  document.getElementById('insStoreTable').innerHTML = (res.perStore || []).map((s) => `
    <tr class="clickable-row" onclick="openStoreDetail(decodeURIComponent('${encodeURIComponent(s.toko)}'))">
      <td><div class="row-entity-cell"><span class="row-init-badge">${esc(getInitials(s.toko))}</span><span class="row-entity-name">${esc(s.toko)}</span></div></td>
      <td><strong>${s.curJam}j</strong> <small class="subtitle">(${s.prevJam}j)</small></td>
      <td><span class="num-pill num-pill-ok">${s.curHadir}</span></td>
      <td>${s.curTelat > 0 ? `<span class="num-pill num-pill-danger">${s.curTelat}</span>` : '0'}</td>
    </tr>
  `).join('') || '<tr><td colspan="4" class="text-center">-</td></tr>';

  document.getElementById('insCrewTable').innerHTML = crews.map((c) => `
    <tr>
      <td><div class="row-entity-cell"><span class="row-init-badge">${esc(getInitials(c.nama))}</span><span class="row-entity-name">${esc(c.nama)}</span></div></td>
      <td>${esc(c.toko)}</td><td><strong>${c.curJam}j</strong></td>
      <td><span class="num-pill num-pill-ok">${c.curHadir}</span></td>
      <td>${c.curTelat > 0 ? `<span class="num-pill num-pill-danger">${c.curTelat}</span>` : '0'}</td>
    </tr>
  `).join('') || '<tr><td colspan="5" class="text-center">-</td></tr>';
}

async function loadInsights(period, forceRefresh = false) {
  const isAdmin = state.user.role === 'ADMIN';
  document.getElementById('insightTopSwitcher').classList.toggle('hidden', state.user.role === 'MONITORING');
  const activeBtn = document.querySelector('#insightPeriodToggle .seg-btn.active');
  const p = period || (activeBtn ? activeBtn.dataset.period : 'week');
  if (!forceRefresh && state.cache.insight[p]) renderInsightData(state.cache.insight[p]);
  setBgSync(true);
  try {
    const res = await apiCall({ action: isAdmin ? 'getInsights' : 'getMonitoringInsights', period: p });
    state.cache.insight[p] = res; renderInsightData(res);
  } catch (err) { showToast(err.message, 'error'); } finally { setBgSync(false); }
}

function setDiffPill(el, cur, prev, unit, invert) {
  if (!el) return;
  const d = Math.round((cur - prev) * 10) / 10;
  el.textContent = `${d > 0 ? '↑ +' : (d < 0 ? '↓ ' : '')}${d}${unit} (${prev}${unit})`;
  el.classList.remove('diff-pos', 'diff-neg');
  if (d > 0) el.classList.add(invert ? 'diff-neg' : 'diff-pos');
  else if (d < 0) el.classList.add(invert ? 'diff-pos' : 'diff-neg');
}

function initMonthYearSelectors() {
  const curM = nowInit.getMonth(), curY = nowInit.getFullYear();
  const mOpts = BULAN_MAP.id.map((b, i) => `<option value="${i + 1}" ${i === curM ? 'selected' : ''}>${b}</option>`).join('');
  const yOpts = [curY - 1, curY, curY + 1].map((y) => `<option value="${y}" ${y === curY ? 'selected' : ''}>${y}</option>`).join('');
  ['recapMonth', 'storeDetailMonth', 'jadwalMonthSelect'].forEach((id) => { const el = document.getElementById(id); if (el) el.innerHTML = mOpts; });
  ['recapYear', 'storeDetailYear', 'jadwalYearSelect'].forEach((id) => { const el = document.getElementById(id); if (el) el.innerHTML = yOpts; });
}

async function loadMonthlyRecap() {
  setLoading(true, 'Menyiapkan rekap...');
  try {
    const res = await apiCall({ action: 'getMonthlyRecap', month: Number(document.getElementById('recapMonth').value), year: Number(document.getElementById('recapYear').value) });
    state.lastRecap = res;
    const tbody = document.getElementById('recapTableBody');
    if (!res.recap.length) { tbody.innerHTML = '<tr><td colspan="7" class="text-center">-</td></tr>'; return; }
    tbody.innerHTML = res.recap.map((r) => `<tr><td><strong>${esc(r.nama)}</strong></td><td>${esc(r.toko)}</td><td>${r.hariHadir}</td><td>${r.masukPagi || 0}/${r.masukSiang || 0}/${r.masukFullDay || 0}</td><td>${esc(r.totalJamFormatted)}</td><td>${r.jumlahTerlambat} (${r.totalTelatMenit || 0}m)</td><td>${r.lupaAbsenPulang}</td></tr>`).join('');
  } catch (err) { showToast(err.message, 'error'); } finally { setLoading(false); }
}

function exportRecapCsv() {
  if (!state.lastRecap || !state.lastRecap.recap.length) return showToast('Klik Tampilkan dulu.', 'error');
  const lines = ['Nama,Toko,Hadir,Pagi,Siang,FullDay,TotalJam,JamDesimal,Telat,MenitTelat,LupaPulang'];
  state.lastRecap.recap.forEach((r) => lines.push([`"${r.nama}"`, `"${r.toko}"`, r.hariHadir, r.masukPagi || 0, r.masukSiang || 0, r.masukFullDay || 0, `"${r.totalJamFormatted}"`, r.totalJamDesimal, r.jumlahTerlambat, r.totalTelatMenit || 0, r.lupaAbsenPulang].join(',')));
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob(['\uFEFF' + lines.join('\n')], { type: 'text/csv;charset=utf-8;' }));
  a.download = `Rekap_Gaji_MOMOYO_${state.lastRecap.monthName}_${state.lastRecap.year}.csv`;
  a.click();
}

/* ======================== FOTO PREVIEW, EDIT, HAPUS & KELOLA (OUTLET + PENGUMUMAN) ======================== */

window.previewPhoto = function (url, encodedMeta = '') {
  document.getElementById('modalPhotoImg').src = toDisplayImageUrl(url, 1200);
  document.getElementById('modalPhotoLink').href = url;
  const metaEl = document.getElementById('modalPhotoMeta');
  if (encodedMeta) {
    try {
      const m = JSON.parse(decodeURIComponent(encodedMeta));
      metaEl.innerHTML = `<strong>${esc(m.nama || '-')} • ${esc(m.toko || '-')} • ${esc(m.jenis || '-')} (${esc(m.shift || '-')})</strong><span>${esc([m.hari, m.tanggalDisplay].filter(Boolean).join(', '))} • ${esc(m.jam || '-')} WIB</span>`;
      metaEl.classList.remove('hidden');
    } catch { metaEl.classList.add('hidden'); }
  } else metaEl.classList.add('hidden');
  openModal('modalPhoto');
};

window.openEditModal = function (encoded) {
  const r = JSON.parse(decodeURIComponent(encoded));
  document.getElementById('editRowNumber').value = r.rowNumber; document.getElementById('editRecordId').value = r.id || '';
  document.getElementById('editJenis').value = ['MASUK', 'ISTIRAHAT', 'PULANG'].includes(r.jenis) ? r.jenis : 'MASUK';
  const ns = normalizeShift(r.shift); document.getElementById('editShift').value = VALID_WORK_SHIFTS.includes(ns) ? ns : 'PAGI';
  document.getElementById('editNama').value = r.nama; document.getElementById('editToko').value = r.toko;
  document.getElementById('editJam').value = r.jam === '-' ? '' : r.jam; document.getElementById('editStatus').value = r.status === '-' ? '' : r.status;
  document.getElementById('editCatatan').value = r.catatan || '';
  openModal('modalEditRecord');
};

async function submitEditRecord(e) {
  e.preventDefault(); setLoading(true, 'Menyimpan...');
  try {
    await apiCall({
      action: 'editAttendance', rowNumber: Number(document.getElementById('editRowNumber').value), id: document.getElementById('editRecordId').value,
      updates: { jenis: document.getElementById('editJenis').value, shift: document.getElementById('editShift').value, nama: document.getElementById('editNama').value.trim(), toko: document.getElementById('editToko').value.trim(), jam: document.getElementById('editJam').value.trim(), status: document.getElementById('editStatus').value.trim(), catatan: document.getElementById('editCatatan').value.trim() }
    });
    closeModal('modalEditRecord'); showToast('Diperbarui!', 'success'); loadHistory();
  } catch (err) { showToast(err.message, 'error'); } finally { setLoading(false); }
}

window.openDeleteModal = function (rowNumber, id, label) {
  state.pendingDelete = { type: 'attendance', rowNumber, id };
  document.getElementById('deleteConfirmText').textContent = `Hapus absensi "${label}"?`;
  openModal('modalConfirmDelete');
};

async function confirmDeleteAction() {
  const it = state.pendingDelete; if (!it) return;
  closeModal('modalConfirmDelete'); setLoading(true, 'Menghapus...');
  try {
    if (it.type === 'attendance') { await apiCall({ action: 'deleteAttendance', rowNumber: it.rowNumber, id: it.id }); loadHistory(); }
    else if (it.type === 'crew') { await apiCall({ action: 'deleteCrew', id: it.id }); loadMasterData(true); }
    else if (it.type === 'store') { await apiCall({ action: 'deleteStore', nama: it.nama }); loadMasterData(true); }
    else if (it.type === 'announcement') { await apiCall({ action: 'deleteAnnouncement', id: it.id }); loadAdminAnnouncements(); }
    showToast('Dihapus.', 'success');
  } catch (err) { showToast(err.message, 'error'); } finally { state.pendingDelete = null; setLoading(false); }
}

async function loadMasterData(forceRefresh = false) {
  if (!forceRefresh && state.cache.masterLoaded) renderManagedOutletsAndCrews();
  setBgSync(true);
  try {
    const res = await apiCall({ action: 'getMasterData' });
    state.stores = res.stores || []; state.crews = res.crews || []; state.cache.masterLoaded = true;
    localStorage.setItem('momoyo_stores', JSON.stringify(state.stores));
    populateFilterStores(); syncGreetingInputs(); renderManagedOutletsAndCrews();
    loadAdminAnnouncements();
  } catch (err) { showToast(err.message, 'error'); } finally { setBgSync(false); }
}

async function loadAdminAnnouncements() {
  const el = document.getElementById('adminAnnouncementList'); if (!el) return;
  try {
    const res = await apiCall({ action: 'getAnnouncements' });
    const list = res.announcements || [];
    el.innerHTML = list.length ? list.map((a) => `
      <div class="ann-admin-item">
        <div class="record-top">
          <div>
            <div class="record-title">📢 ${esc(a.judul)}</div>
            <div class="record-sub">${esc(a.targetToko === 'SEMUA' ? t('allOutlets') : a.targetToko)} • ${esc(a.createdAt)}</div>
          </div>
          <span class="badge badge-masuk">Dibaca ${a.readCount}/${a.totalTarget}</span>
        </div>
        <div class="record-sub mt-8" style="color:var(--text)">${esc(a.isi)}</div>
        ${a.unread && a.unread.length ? `<div class="ann-read-list"><strong>Belum baca:</strong> ${esc(a.unread.map((u) => u.nama).join(', '))}</div>` : '<div class="ann-read-list text-success">✓ Semua karyawan target sudah membaca</div>'}
        <div class="record-actions mt-8"><button type="button" class="btn-ghost-sm text-danger" onclick="askDeleteAnnouncement('${esc(a.id)}','${esc(a.judul)}')">Hapus</button></div>
      </div>
    `).join('') : '<div class="subtitle">Belum ada pengumuman aktif.</div>';
  } catch {}
}

async function submitCreateAnnouncement(e) {
  e.preventDefault();
  setLoading(true, 'Mengirim pengumuman...');
  try {
    const res = await apiCall({
      action: 'createAnnouncement',
      targetToko: document.getElementById('annTargetToko').value,
      judul: document.getElementById('annJudulInput').value.trim(),
      isi: document.getElementById('annIsiInput').value.trim()
    });
    document.getElementById('annJudulInput').value = '';
    document.getElementById('annIsiInput').value = '';
    showToast(res.message || 'Pengumuman terkirim!', 'success');
    loadAdminAnnouncements();
  } catch (err) { showToast(err.message, 'error'); } finally { setLoading(false); }
}

window.askDeleteAnnouncement = function (id, judul) {
  state.pendingDelete = { type: 'announcement', id };
  document.getElementById('deleteConfirmText').textContent = `Hapus pengumuman "${judul}"?`;
  openModal('modalConfirmDelete');
};

function renderManagedOutletsAndCrews() {
  const container = document.getElementById('manageOutletCrewList'); if (!container) return;
  const q = (document.getElementById('manageCrewSearch')?.value || '').trim().toLowerCase();
  const stores = state.stores || [], crews = state.crews || [];
  const known = new Set(stores.map((s) => s.nama.toUpperCase()));
  const groups = stores.map((st) => ({ store: st, name: st.nama, crews: crews.filter((c) => c.toko.toUpperCase() === st.nama.toUpperCase()) }));
  const orphans = crews.filter((c) => !known.has(c.toko.toUpperCase()));
  if (orphans.length) groups.push({ store: null, name: 'LAINNYA', crews: orphans });

  const html = groups.map((g) => {
    const filtered = q ? g.crews.filter((c) => c.nama.toLowerCase().includes(q) || c.id.toLowerCase().includes(q) || g.name.toLowerCase().includes(q)) : g.crews;
    if (q && !filtered.length && !g.name.toLowerCase().includes(q)) return '';
    const isOpen = q ? true : Boolean(state.openManageOutlets[g.name]);
    const st = g.store, encName = encodeURIComponent(g.name), encStore = st ? encodeURIComponent(JSON.stringify(st)) : '';
    const items = filtered.map((c) => `
      <div class="outlet-crew-item">
        <div class="record-top">
          <div style="display:flex;align-items:center;gap:10px;min-width:0">
            <div class="crew-mini-avatar">${c.fotoProfil ? `<img src="${esc(toDisplayImageUrl(c.fotoProfil))}" alt="" />` : esc(getInitials(c.nama))}</div>
            <div><div class="record-title">${esc(c.nama)}</div><div class="record-sub">${esc(c.posisi || 'Crew')}${c.area ? ` • ${esc(c.area)}` : ''}${c.noTelp ? ` • ${esc(c.noTelp)}` : ''}</div></div>
          </div>
          <span class="badge ${c.aktif ? 'badge-masuk' : 'badge-neutral'}">${c.aktif ? 'Aktif' : 'Off'}</span>
        </div>
        <div class="record-bottom">
          <span class="record-sub"><strong>ID: ${esc(c.id)}</strong></span>
          <div class="record-actions">
            ${buildWaButtonHtml(c.noTelp, `Halo ${c.nama} (MOMOYO ${c.toko}), `)}
            <button type="button" class="btn-ghost-sm" onclick="openCrewModal('${encodeURIComponent(JSON.stringify(c))}')">Edit / ID &amp; PIN</button>
            <button type="button" class="btn-ghost-sm text-danger" onclick="askDeleteCrew('${esc(c.id)}','${esc(c.nama)}')">Hapus</button>
          </div>
        </div>
      </div>
    `).join('') || '<div class="empty-state" style="padding:14px">-</div>';

    return `
      <div class="outlet-manage-card">
        <div class="outlet-manage-head">
          <div class="outlet-manage-top" onclick="toggleManageOutlet(decodeURIComponent('${encName}'))">
            <div class="outlet-manage-title-wrap"><span class="row-init-badge">${esc(getInitials(g.name))}</span><div><div class="record-title">${esc(g.name)}</div>${st ? `<div class="record-sub">Pagi ${st.pagiMulai}–${st.pagiSelesai} | Siang ${st.siangMulai}–${st.siangSelesai}</div>` : ''}</div></div>
            <div class="outlet-manage-badges"><span class="outlet-count-pill">${g.crews.length} Crew</span>${st ? `<span class="badge ${st.wajibGps ? 'badge-masuk' : 'badge-neutral'}">${st.wajibGps ? 'GPS On' : 'GPS Off'}</span>` : ''}</div>
          </div>
          <div class="outlet-manage-actions">
            <button type="button" class="btn-pill-soft" onclick="toggleManageOutlet(decodeURIComponent('${encName}'))">${isOpen ? 'Tutup ▲' : `Lihat Karyawan (${filtered.length}) ▼`}</button>
            <div class="record-actions">
              ${st ? `<button type="button" class="btn-ghost-sm text-primary" onclick="openCrewModal('', decodeURIComponent('${encName}'))">+ Crew</button><button type="button" class="btn-ghost-sm" onclick="openStoreModal('${encStore}')">Setting</button><button type="button" class="btn-ghost-sm text-danger" onclick="askDeleteStore(decodeURIComponent('${encName}'))">Hapus</button>` : ''}
            </div>
          </div>
        </div>
        <div class="outlet-crew-panel ${isOpen ? '' : 'hidden'}">${items}</div>
      </div>
    `;
  }).filter(Boolean).join('');
  container.innerHTML = html || '<div class="empty-state">-</div>';
}

window.toggleManageOutlet = function (name) { state.openManageOutlets[name] = !state.openManageOutlets[name]; renderManagedOutletsAndCrews(); };

function setPosisiFieldValue(raw) {
  const sel = document.getElementById('crewPosisiInput'), cg = document.getElementById('crewPosisiCustomGroup'), ci = document.getElementById('crewPosisiCustomInput');
  const m = PRESET_POSISI.find((p) => p.toLowerCase() === String(raw || '').trim().toLowerCase());
  if (m) { sel.value = m; cg.classList.add('hidden'); ci.value = ''; }
  else if (raw) { sel.value = '__CUSTOM__'; cg.classList.remove('hidden'); ci.value = raw; }
  else { sel.value = 'Crew Minuman'; cg.classList.add('hidden'); ci.value = ''; }
}

window.openCrewModal = function (encoded, presetStore = '') {
  const tokoSel = document.getElementById('crewTokoInput');
  tokoSel.innerHTML = state.stores.map((s) => `<option value="${esc(s.nama)}">${esc(s.nama)}</option>`).join('');
  state.crewPhotoDraft = ''; state.crewClearPhoto = false;
  const pinGrp = document.getElementById('crewCurrentPinGroup'), pinDisp = document.getElementById('crewCurrentPinDisplay'), tog = document.getElementById('btnToggleCurrentPin');
  if (encoded) {
    const c = JSON.parse(decodeURIComponent(encoded));
    document.getElementById('modalCrewTitle').textContent = 'Edit Karyawan / ID & PIN';
    document.getElementById('crewOriginalIdInput').value = c.id; document.getElementById('crewIdInput').value = c.id;
    document.getElementById('crewNamaInput').value = c.nama; tokoSel.value = c.toko;
    document.getElementById('crewAreaInput').value = c.area || ''; setPosisiFieldValue(c.posisi || '');
    document.getElementById('crewTelpInput').value = c.noTelp || ''; document.getElementById('crewPinInput').value = '';
    document.getElementById('crewAktifInput').checked = c.aktif;
    renderAvatar(document.getElementById('crewPhotoPreview'), c.fotoProfil, c.nama);
    document.getElementById('btnClearCrewPhoto').classList.toggle('hidden', !c.fotoProfil);
    pinGrp.classList.remove('hidden');
    if (c.currentPin) { pinDisp.type = 'password'; pinDisp.value = c.currentPin; tog.textContent = 'Lihat'; tog.classList.remove('hidden'); }
    else { pinDisp.type = 'text'; pinDisp.value = ''; tog.classList.add('hidden'); }
  } else {
    document.getElementById('modalCrewTitle').textContent = 'Tambah Karyawan';
    document.getElementById('crewOriginalIdInput').value = ''; document.getElementById('crewIdInput').value = '';
    document.getElementById('crewNamaInput').value = ''; if (presetStore) tokoSel.value = presetStore;
    document.getElementById('crewAreaInput').value = ''; setPosisiFieldValue('Crew Minuman');
    document.getElementById('crewTelpInput').value = ''; document.getElementById('crewPinInput').value = '';
    document.getElementById('crewAktifInput').checked = true;
    renderAvatar(document.getElementById('crewPhotoPreview'), '', 'KR');
    document.getElementById('btnClearCrewPhoto').classList.add('hidden'); pinGrp.classList.add('hidden');
  }
  openModal('modalCrew');
};

function handleCrewPhotoPick(e) {
  const file = e.target.files && e.target.files[0]; e.target.value = '';
  if (!file || !file.type.startsWith('image/')) return;
  openCropModalForFile(file, (b64) => {
    state.crewPhotoDraft = b64; state.crewClearPhoto = false;
    document.getElementById('crewPhotoPreview').innerHTML = `<img src="${b64}" alt="" />`;
    document.getElementById('btnClearCrewPhoto').classList.remove('hidden');
  });
}

async function submitCrewForm(e) {
  e.preventDefault();
  const pv = document.getElementById('crewPosisiInput').value;
  const finalPosisi = pv === '__CUSTOM__' ? document.getElementById('crewPosisiCustomInput').value.trim() : pv;
  if (!finalPosisi) return showToast('Isi posisi tambahan.', 'error');
  const toko = document.getElementById('crewTokoInput').value;
  setLoading(true, 'Menyimpan...');
  try {
    const res = await apiCall({
      action: 'saveCrew',
      crew: {
        originalId: document.getElementById('crewOriginalIdInput').value.trim(), id: document.getElementById('crewIdInput').value.trim(),
        nama: document.getElementById('crewNamaInput').value.trim(), toko, area: document.getElementById('crewAreaInput').value,
        posisi: finalPosisi, noTelp: document.getElementById('crewTelpInput').value.trim(), pin: document.getElementById('crewPinInput').value.trim(),
        aktif: document.getElementById('crewAktifInput').checked, photoBase64: state.crewPhotoDraft, clearPhoto: state.crewClearPhoto
      }
    }, 45000);
    closeModal('modalCrew'); state.openManageOutlets[toko] = true;
    showToast(res.message || 'Tersimpan!', 'success'); loadMasterData(true);
  } catch (err) { showToast(err.message, 'error'); } finally { setLoading(false); }
}

window.askDeleteCrew = function (id, nama) { state.pendingDelete = { type: 'crew', id }; document.getElementById('deleteConfirmText').textContent = `Hapus karyawan "${nama}"?`; openModal('modalConfirmDelete'); };

window.openStoreModal = function (encoded) {
  const gt = document.getElementById('storeWajibGps'), gf = document.getElementById('storeGpsFields');
  if (encoded) {
    const s = JSON.parse(decodeURIComponent(encoded));
    document.getElementById('modalStoreTitle').textContent = 'Setting Outlet';
    document.getElementById('storeOriginalName').value = s.nama; document.getElementById('storeNamaInput').value = s.nama;
    document.getElementById('storePagiMulai').value = s.pagiMulai; document.getElementById('storePagiSelesai').value = s.pagiSelesai;
    document.getElementById('storeSiangMulai').value = s.siangMulai; document.getElementById('storeSiangSelesai').value = s.siangSelesai;
    document.getElementById('storeFullDayMulai').value = s.fullDayMulai || '08:00'; document.getElementById('storeFullDaySelesai').value = s.fullDaySelesai || '22:00';
    document.getElementById('storeToleransi').value = s.toleransi; gt.checked = s.wajibGps;
    document.getElementById('storeLat').value = s.lat || ''; document.getElementById('storeLng').value = s.lng || ''; document.getElementById('storeRadius').value = s.radius || 100;
  } else {
    document.getElementById('modalStoreTitle').textContent = 'Tambah Outlet';
    document.getElementById('storeOriginalName').value = ''; document.getElementById('storeNamaInput').value = '';
    document.getElementById('storePagiMulai').value = '08:00'; document.getElementById('storePagiSelesai').value = '16:00';
    document.getElementById('storeSiangMulai').value = '14:00'; document.getElementById('storeSiangSelesai').value = '22:00';
    document.getElementById('storeFullDayMulai').value = '08:00'; document.getElementById('storeFullDaySelesai').value = '22:00';
    document.getElementById('storeToleransi').value = 10; gt.checked = false;
    document.getElementById('storeLat').value = ''; document.getElementById('storeLng').value = ''; document.getElementById('storeRadius').value = 100;
  }
  gf.classList.toggle('hidden', !gt.checked); openModal('modalStore');
};

async function submitStoreForm(e) {
  e.preventDefault(); setLoading(true, 'Menyimpan...');
  try {
    await apiCall({
      action: 'saveStore', originalName: document.getElementById('storeOriginalName').value,
      store: {
        nama: document.getElementById('storeNamaInput').value.trim(), pagiMulai: document.getElementById('storePagiMulai').value,
        pagiSelesai: document.getElementById('storePagiSelesai').value, siangMulai: document.getElementById('storeSiangMulai').value,
        siangSelesai: document.getElementById('storeSiangSelesai').value, fullDayMulai: document.getElementById('storeFullDayMulai').value,
        fullDaySelesai: document.getElementById('storeFullDaySelesai').value, toleransi: Number(document.getElementById('storeToleransi').value),
        wajibGps: document.getElementById('storeWajibGps').checked, lat: document.getElementById('storeLat').value.trim(),
        lng: document.getElementById('storeLng').value.trim(), radius: Number(document.getElementById('storeRadius').value) || 100
      }
    });
    closeModal('modalStore'); showToast('Outlet tersimpan!', 'success'); loadMasterData(true);
  } catch (err) { showToast(err.message, 'error'); } finally { setLoading(false); }
}

window.askDeleteStore = function (nama) { state.pendingDelete = { type: 'store', nama }; document.getElementById('deleteConfirmText').textContent = `Hapus outlet "${nama}"?`; openModal('modalConfirmDelete'); };

async function submitChangeAdminPass(e) {
  e.preventDefault(); setLoading(true, 'Menyimpan...');
  try {
    await apiCall({ action: 'changeAdminPassword', oldPassword: document.getElementById('oldAdminPass').value, newPassword: document.getElementById('newAdminPass').value });
    document.getElementById('oldAdminPass').value = ''; document.getElementById('newAdminPass').value = '';
    showToast('Password Admin diganti!', 'success');
  } catch (err) { showToast(err.message, 'error'); } finally { setLoading(false); }
}

/* ======================== EVENT BINDING & UTILITAS ======================== */

function bindEvents() {
  document.querySelectorAll('.lang-btn, .lang-mini-btn').forEach((btn) => {
    btn.addEventListener('click', () => applyLanguage(btn.dataset.lang, true));
  });

  const swTab = (tab) => {
    document.getElementById('tabRoleCrew').classList.toggle('active', tab === 'crew');
    document.getElementById('tabRoleAdmin').classList.toggle('active', tab === 'admin');
    document.getElementById('tabRoleMonitor').classList.toggle('active', tab === 'monitor');
    document.getElementById('formLoginCrew').classList.toggle('hidden', tab !== 'crew');
    document.getElementById('formLoginAdmin').classList.toggle('hidden', tab !== 'admin');
    document.getElementById('panelLoginMonitor').classList.toggle('hidden', tab !== 'monitor');
  };
  document.getElementById('tabRoleCrew').addEventListener('click', () => swTab('crew'));
  document.getElementById('tabRoleAdmin').addEventListener('click', () => swTab('admin'));
  document.getElementById('tabRoleMonitor').addEventListener('click', () => swTab('monitor'));
  document.getElementById('btnEnterMonitoring').addEventListener('click', enterMonitoringMode);

  document.getElementById('loginStore').addEventListener('change', onLoginStoreChange);
  document.getElementById('formLoginCrew').addEventListener('submit', handleLoginCrew);
  document.getElementById('formLoginAdmin').addEventListener('submit', handleLoginAdmin);
  document.getElementById('btnLogout').addEventListener('click', handleLogout);

  document.querySelectorAll('[data-switch-view]').forEach((btn) => btn.addEventListener('click', () => switchView(btn.dataset.switchView)));
  document.querySelectorAll('.acc-head[data-acc-target]').forEach((h) => h.addEventListener('click', () => {
    const b = document.getElementById(h.dataset.accTarget); if (!b) return;
    const op = b.classList.contains('hidden'); b.classList.toggle('hidden', !op); h.classList.toggle('is-open', op);
  }));

  document.getElementById('btnOpenTodayHistoryCard').addEventListener('click', openTodayHistoryFromDashboard);
  document.getElementById('btnShareDailyReportWa').addEventListener('click', shareDailyReportToWa);
  document.getElementById('btnOpenProfile').addEventListener('click', openProfileModal);
  document.getElementById('btnPickMyPhoto').addEventListener('click', () => document.getElementById('inputMyPhoto').click());
  document.getElementById('inputMyPhoto').addEventListener('change', handleMyPhotoPick);
  document.getElementById('btnClearMyPhoto').addEventListener('click', clearMyPhoto);
  document.getElementById('formAdminProfile').addEventListener('submit', submitAdminProfileForm);
  document.getElementById('formChangeMyPin').addEventListener('submit', submitChangeMyPin);

  // Absensi, Anti-Double Jump, BKO, Kamera & Izin/Sakit
  document.querySelectorAll('#formAbsen .seg-btn').forEach((btn) => btn.addEventListener('click', () => setSelectedAbsenJenis(btn.dataset.jenis, true)));
  document.getElementById('btnJumpNextStage').addEventListener('click', (e) => {
    const nxt = e.currentTarget.dataset.nextStage; if (nxt) setSelectedAbsenJenis(nxt, true);
  });
  document.getElementById('absenBkoCheck').addEventListener('change', onBkoToggleChange);
  document.getElementById('absenToko').addEventListener('change', () => { updateShiftOptionLabels(); updateGpsHint(); loadActiveBreaksForAbsen(); });
  document.getElementById('btnRefreshStoreBreaks').addEventListener('click', loadActiveBreaksForAbsen);
  document.getElementById('btnOpenCamera').addEventListener('click', openLiveCameraModal);
  document.getElementById('inputFotoKamera').addEventListener('change', handleNativeCameraSelected);
  document.getElementById('btnCloseLiveCamera').addEventListener('click', stopLiveCamera);
  document.getElementById('btnFlipCamera').addEventListener('click', () => { liveCam.facingMode = liveCam.facingMode === 'user' ? 'environment' : 'user'; startLiveCameraStream(); });
  document.getElementById('btnCaptureLivePhoto').addEventListener('click', captureFromLiveCamera);
  document.getElementById('btnFallbackNativeCam').addEventListener('click', () => { stopLiveCamera(); document.getElementById('inputFotoKamera').click(); });
  document.getElementById('btnRemovePhoto').addEventListener('click', clearPhoto);
  document.getElementById('formAbsen').addEventListener('submit', submitAttendance);
  document.getElementById('btnRetryAbsen').addEventListener('click', () => submitAttendance());

  document.getElementById('btnOpenLeaveModal').addEventListener('click', openLeaveRequestModal);
  document.getElementById('btnPickLeavePhoto').addEventListener('click', () => document.getElementById('inputLeavePhoto').click());
  document.getElementById('inputLeavePhoto').addEventListener('change', handleLeavePhotoPick);
  document.getElementById('btnClearLeavePhoto').addEventListener('click', clearLeavePhoto);
  document.getElementById('formLeaveRequest').addEventListener('submit', submitLeaveRequestForm);

  // Kalender
  document.getElementById('btnRefreshMyCalendar').addEventListener('click', loadCrewCalendar);
  document.getElementById('btnCalPrev').addEventListener('click', () => { if (--state.calMonth < 1) { state.calMonth = 12; state.calYear--; } loadCrewCalendar(); });
  document.getElementById('btnCalNext').addEventListener('click', () => { if (++state.calMonth > 12) { state.calMonth = 1; state.calYear++; } loadCrewCalendar(); });
  document.getElementById('btnAdminCalPrev').addEventListener('click', () => { if (--state.adminCalMonth < 1) { state.adminCalMonth = 12; state.adminCalYear--; } loadAdminCrewCalendar(); });
  document.getElementById('btnAdminCalNext').addEventListener('click', () => { if (++state.adminCalMonth > 12) { state.adminCalMonth = 1; state.adminCalYear++; } loadAdminCrewCalendar(); });

  // Riwayat & Absen Manual
  document.getElementById('btnOpenManualAbsen').addEventListener('click', openManualAbsenModal);
  document.getElementById('manualTokoInput').addEventListener('change', updateManualCrewOptions);
  document.getElementById('formManualAbsen').addEventListener('submit', submitManualAbsenForm);
  document.getElementById('btnApplyFilter').addEventListener('click', loadHistory);
  document.getElementById('btnRefreshHistory').addEventListener('click', loadHistory);
  document.getElementById('btnResetFilter').addEventListener('click', () => {
    ['filterSearch', 'filterStart', 'filterEnd'].forEach((id) => { document.getElementById(id).value = ''; });
    ['filterToko', 'filterJenis', 'filterShift'].forEach((id) => { document.getElementById(id).value = 'SEMUA'; });
    loadHistory();
  });
  document.getElementById('btnHistoryListMode').addEventListener('click', () => { state.historyMode = 'list'; renderHistoryCurrentMode(); });
  document.getElementById('btnHistoryGalleryMode').addEventListener('click', () => { state.historyMode = 'gallery'; renderHistoryCurrentMode(); });

  // Dashboard & Detail Toko
  document.getElementById('btnRefreshDash').addEventListener('click', () => loadDashboard(true));
  document.getElementById('btnReloadStoreDetail').addEventListener('click', loadStoreDetailData);

  // Jadwal + Rentang Tanggal + Ekspor PNG & WA
  document.getElementById('jadwalTokoSelect').addEventListener('change', () => loadJadwalView());
  document.getElementById('jadwalMonthSelect').addEventListener('change', () => loadJadwalView());
  document.getElementById('jadwalYearSelect').addEventListener('change', () => loadJadwalView());
  document.getElementById('jadwalWeekSelect').addEventListener('change', () => loadJadwalView());
  document.getElementById('jadwalStartDate').addEventListener('change', () => loadJadwalView(true));
  document.getElementById('jadwalEndDate').addEventListener('change', () => loadJadwalView(true));
  document.getElementById('btnJadwalPrev7').addEventListener('click', () => shiftJadwalRangeDays(-7));
  document.getElementById('btnJadwalNext7').addEventListener('click', () => shiftJadwalRangeDays(7));
  document.getElementById('btnJadwalThisWeek').addEventListener('click', () => { initJadwalRangeDefaults(); loadJadwalView(true); });
  document.getElementById('btnReloadJadwal').addEventListener('click', () => loadJadwalView(true));
  document.getElementById('btnCopyPrevWeek').addEventListener('click', copyPreviousWeekSchedules);
  document.getElementById('btnSaveJadwal').addEventListener('click', saveJadwalChanges);
  document.getElementById('btnExportJadwalPng').addEventListener('click', exportJadwalAsPng);
  document.getElementById('btnShareJadwalWa').addEventListener('click', shareJadwalToWa);

  document.getElementById('btnConfirmJadwalBko').addEventListener('click', () => {
    const p = state.jadwalBkoPending, lbl = document.getElementById('jadwalBkoInput').value.trim().toUpperCase();
    closeModal('modalJadwalBko'); if (!p || !lbl) return;
    if (![...p.sel.options].some((o) => o.value === lbl)) { const opt = document.createElement('option'); opt.value = lbl; opt.textContent = lbl; p.sel.appendChild(opt); }
    p.sel.value = lbl; applyJadwalCellValue(p.sel, p.dk, p.cid, p.nama, lbl); state.jadwalBkoPending = null;
  });

  // Insight & Rekap
  document.querySelectorAll('#insightPeriodToggle .seg-btn').forEach((btn) => btn.addEventListener('click', () => {
    document.querySelectorAll('#insightPeriodToggle .seg-btn').forEach((b) => b.classList.remove('active'));
    btn.classList.add('active'); loadInsights(btn.dataset.period);
  }));
  document.getElementById('btnLoadRecap').addEventListener('click', loadMonthlyRecap);
  document.getElementById('btnExportCsv').addEventListener('click', exportRecapCsv);

  // Kelola
  document.getElementById('formCreateAnnouncement').addEventListener('submit', submitCreateAnnouncement);
  document.getElementById('manageCrewSearch').addEventListener('input', renderManagedOutletsAndCrews);
  document.getElementById('formAbsenGreetings').addEventListener('submit', saveAbsenGreetings);
  document.getElementById('formEditRecord').addEventListener('submit', submitEditRecord);
  document.getElementById('btnConfirmDelete').addEventListener('click', confirmDeleteAction);
  document.getElementById('btnAddCrew').addEventListener('click', () => openCrewModal());
  document.getElementById('crewPosisiInput').addEventListener('change', (e) => {
    document.getElementById('crewPosisiCustomGroup').classList.toggle('hidden', e.target.value !== '__CUSTOM__');
  });
  document.getElementById('btnPickCrewPhoto').addEventListener('click', () => document.getElementById('inputCrewPhoto').click());
  document.getElementById('inputCrewPhoto').addEventListener('change', handleCrewPhotoPick);
  document.getElementById('btnClearCrewPhoto').addEventListener('click', () => {
    state.crewPhotoDraft = ''; state.crewClearPhoto = true;
    renderAvatar(document.getElementById('crewPhotoPreview'), '', document.getElementById('crewNamaInput').value || 'KR');
    document.getElementById('btnClearCrewPhoto').classList.add('hidden');
  });
  document.getElementById('btnToggleCurrentPin').addEventListener('click', () => {
    const i = document.getElementById('crewCurrentPinDisplay'), b = document.getElementById('btnToggleCurrentPin');
    i.type = i.type === 'password' ? 'text' : 'password'; b.textContent = i.type === 'password' ? 'Lihat' : 'Tutup';
  });
  document.getElementById('formCrew').addEventListener('submit', submitCrewForm);
  document.getElementById('btnAddStore').addEventListener('click', () => openStoreModal());
  document.getElementById('formStore').addEventListener('submit', submitStoreForm);
  document.getElementById('storeWajibGps').addEventListener('change', (e) => document.getElementById('storeGpsFields').classList.toggle('hidden', !e.target.checked));
  document.getElementById('btnGetCurrentGps').addEventListener('click', async () => {
    setLoading(true, 'GPS...');
    try { const p = await getCurrentPositionPromise(); document.getElementById('storeLat').value = p.lat.toFixed(6); document.getElementById('storeLng').value = p.lng.toFixed(6); showToast('GPS OK!', 'success'); }
    catch (err) { showToast(err.message, 'error'); } finally { setLoading(false); }
  });
  document.getElementById('formChangeAdminPass').addEventListener('submit', submitChangeAdminPass);
}

function openModal(id) { document.getElementById(id).classList.remove('hidden'); }
window.closeModal = function (id) { document.getElementById(id).classList.add('hidden'); };
function setLoading(show, text = 'Memproses...') { document.getElementById('loadingText').textContent = text; document.getElementById('loadingOverlay').classList.toggle('hidden', !show); }
let toastTimer;
function showToast(msg, type = '') { const el = document.getElementById('toast'); el.textContent = msg; el.className = 'toast' + (type ? ` toast-${type}` : ''); clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.add('hidden'), 3500); }
function normalizeShift(v) { const s = String(v || '').toUpperCase().trim().replace(/\s+/g, ' '); return ['FULLDAY', 'FULL DAY', 'FULL', 'FULL PAGI', 'FULL SIANG'].includes(s) ? 'FULL DAY' : s; }
function isFullDayShift(s) { return normalizeShift(s) === 'FULL DAY'; }
function jenisBadgeClass(j) { const u = String(j || '').toUpperCase(); return u === 'MASUK' ? 'badge-masuk' : (u === 'ISTIRAHAT' ? 'badge-istirahat' : 'badge-pulang'); }
function toDisplayImageUrl(url, size = 1200) { const m = String(url || '').match(/[?&]id=([a-zA-Z0-9_-]+)/); return (m && String(url).includes('drive.google.com')) ? `https://drive.google.com/thumbnail?id=${m[1]}&sz=w${size}` : String(url || '').trim(); }
function toDateKeyClient(dt) { return `${dt.getFullYear()}-${pad2(dt.getMonth() + 1)}-${pad2(dt.getDate())}`; }
function parseDateKeyClient(dk) { const p = String(dk || '').split('-').map(Number); return (p.length === 3 && !isNaN(p[0])) ? new Date(p[0], p[1] - 1, p[2]) : null; }
function pad2(n) { return n < 10 ? '0' + n : String(n); }
function esc(s) { return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;'); }

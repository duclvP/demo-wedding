/**
 * Nhận lời chúc từ MỌI thiệp cưới → mỗi cặp đôi một Google Sheet riêng (tự tạo) + email thông báo.
 * Triển khai Web app một lần duy nhất, dùng chung một URL /exec cho tất cả thiệp.
 * Dán toàn bộ file này vào Extensions → Apps Script của bất kỳ bảng tính nào (hoặc script độc lập).
 */

/** Email nhận thông báo — để '' nếu không muốn nhận email */
const NOTIFY_EMAIL = 'leducuet@gmail.com';

/** Tên thư mục Drive chứa các Sheet được tạo (tự tạo nếu chưa có) */
const FOLDER_NAME = 'Thiệp cưới - Lời chúc';

const HEADERS = ['Thời gian', 'Tên khách', 'Lời chúc', 'Tham dự', 'Số người'];

function doPost(e) {
  const p = (e && e.parameter) || {};
  const coupleId = clean(p.couple, 80).replace(/[^\w\-]/g, '');
  const row = [
    new Date(),
    clean(p.name, 100),
    clean(p.message, 1000),
    clean(p.attend, 100),
    Number(p.guestCount) || 0,
  ];

  if (!row[1] || !coupleId) return json({ ok: false, error: 'missing name or couple' });

  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  let ss;
  try {
    ss = getCoupleSpreadsheet(coupleId, clean(p.coupleName, 100) || coupleId);
    const sheet = ss.getSheets()[0];
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(HEADERS);
      sheet.setFrozenRows(1);
    }
    sheet.appendRow(row);
  } finally {
    lock.releaseLock();
  }

  if (NOTIFY_EMAIL) {
    MailApp.sendEmail({
      to: NOTIFY_EMAIL,
      subject: `💌 [${coupleId}] ${row[1]} vừa gửi lời chúc — ${row[3]}`,
      body: [
        `Tên: ${row[1]}`,
        `Tham dự: ${row[3]}`,
        `Số người: ${row[4]}`,
        '',
        `Lời chúc: ${row[2] || '(không có)'}`,
        '',
        `Xem tất cả: ${ss.getUrl()}`,
      ].join('\n'),
    });
  }

  return json({ ok: true });
}

/**
 * Mỗi cặp đôi một Sheet. ID Sheet lưu trong Script Properties theo mã cặp đôi.
 * Sheet mới tạo mặc định riêng tư: chỉ chủ script xem được.
 */
function getCoupleSpreadsheet(coupleId, coupleName) {
  const props = PropertiesService.getScriptProperties();
  const key = 'sheet:' + coupleId;
  const existing = props.getProperty(key);
  if (existing) {
    try {
      return SpreadsheetApp.openById(existing);
    } catch (err) {
      // Sheet bị xoá → tạo lại bên dưới
    }
  }
  const ss = SpreadsheetApp.create('Lời chúc - ' + coupleName);
  const folder = getFolder();
  DriveApp.getFileById(ss.getId()).moveTo(folder);
  props.setProperty(key, ss.getId());
  return ss;
}

function getFolder() {
  const it = DriveApp.getFoldersByName(FOLDER_NAME);
  return it.hasNext() ? it.next() : DriveApp.createFolder(FOLDER_NAME);
}

/**
 * Chạy tay trong Apps Script (chọn hàm này → Chạy) để cấp link xem cho khách.
 * Điền mã cặp đôi và email khách, hoặc để EMAIL = '' để bật "ai có link cũng xem được" (chỉ xem).
 */
function shareWithClient() {
  const COUPLE_ID = 'ten-cap-doi'; // trùng rsvp.coupleId trong content.js
  const EMAIL = ''; // vd 'khach@gmail.com'; để '' = bất kỳ ai có link đều xem được
  const id = PropertiesService.getScriptProperties().getProperty('sheet:' + COUPLE_ID);
  if (!id) throw new Error('Chưa có Sheet cho ' + COUPLE_ID + ' (cần có ít nhất một lời chúc).');
  const file = DriveApp.getFileById(id);
  if (EMAIL) file.addViewer(EMAIL);
  else file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  Logger.log(file.getUrl());
}

/** Liệt kê tất cả cặp đôi và link Sheet (xem ở Nhật ký thực thi) */
function listCouples() {
  const all = PropertiesService.getScriptProperties().getProperties();
  Object.keys(all)
    .filter((k) => k.indexOf('sheet:') === 0)
    .forEach((k) => Logger.log(k.slice(6) + ' → https://docs.google.com/spreadsheets/d/' + all[k]));
}

/** Chặn công thức Sheets (=, +, -, @) trong dữ liệu khách nhập và giới hạn độ dài */
function clean(value, max) {
  const s = String(value || '').trim().slice(0, max);
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON,
  );
}

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

  const recipients = [NOTIFY_EMAIL].concat(getClientEmails(coupleId)).filter(Boolean);
  if (recipients.length) {
    MailApp.sendEmail({
      to: recipients.join(','),
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
  getClientEmails(coupleId).forEach((email) => shareSheet(ss.getId(), email));
  return ss;
}

function getFolder() {
  const it = DriveApp.getFoldersByName(FOLDER_NAME);
  return it.hasNext() ? it.next() : DriveApp.createFolder(FOLDER_NAME);
}

/**
 * Thêm / bỏ email khách nhận thông báo bằng link, không cần sửa code:
 *   <URL /exec>?key=<KEY>&couple=<mã cặp đôi>&email=khach@gmail.com              → thêm (kèm quyền xem Sheet)
 *   <URL /exec>?key=<KEY>&couple=<mã cặp đôi>&email=khach@gmail.com&action=remove → bỏ khỏi thông báo
 *   <URL /exec>?key=<KEY>&couple=<mã cặp đôi>                                     → xem danh sách + link Sheet
 * KEY lấy bằng cách chạy hàm adminLink một lần (repo công khai nên KEY không nằm trong code).
 */
function doGet(e) {
  const p = (e && e.parameter) || {};
  const adminKey = PropertiesService.getScriptProperties().getProperty('adminKey');
  if (!adminKey || p.key !== adminKey) return text('Sai hoặc thiếu key.');
  const coupleId = clean(p.couple, 80).replace(/[^\w\-]/g, '');
  if (!coupleId) return text('Thiếu couple (mã cặp đôi, trùng rsvp.coupleId).');
  const email = String(p.email || '').trim().toLowerCase();
  if (email && !/^[^\s@,]+@[^\s@,]+\.[^\s@,]+$/.test(email)) return text('Email không hợp lệ: ' + email);

  let emails = getClientEmails(coupleId);
  if (email && p.action === 'remove') emails = emails.filter((x) => x !== email);
  else if (email && emails.indexOf(email) === -1) emails.push(email);
  PropertiesService.getScriptProperties().setProperty('notify:' + coupleId, emails.join(','));

  const sheetId = PropertiesService.getScriptProperties().getProperty('sheet:' + coupleId);
  if (sheetId && email && p.action !== 'remove') shareSheet(sheetId, email);
  return text([
    'Mã cặp đôi: ' + coupleId,
    'Email nhận thông báo: ' + (emails.join(', ') || '(không có)'),
    sheetId
      ? 'Sheet: https://docs.google.com/spreadsheets/d/' + sheetId
      : 'Chưa có Sheet — sẽ tự tạo ở lời chúc đầu tiên và tự cấp quyền xem cho các email trên.',
  ].join('\n'));
}

/** Chạy tay một lần: tạo KEY (nếu chưa có) và in link mẫu ở Nhật ký thực thi */
function adminLink() {
  const props = PropertiesService.getScriptProperties();
  let key = props.getProperty('adminKey');
  if (!key) {
    key = Utilities.getUuid().replace(/-/g, '');
    props.setProperty('adminKey', key);
  }
  Logger.log(ScriptApp.getService().getUrl() + '?key=' + key + '&couple=ma-cap-doi&email=khach@gmail.com');
}

/**
 * Chạy tay: bật "ai có link cũng xem được" (chỉ xem) cho Sheet của một cặp.
 * Cấp quyền theo email thì dùng link doGet ở trên.
 */
function shareWithClient() {
  const COUPLE_ID = 'ten-cap-doi'; // trùng rsvp.coupleId trong content.js
  const id = PropertiesService.getScriptProperties().getProperty('sheet:' + COUPLE_ID);
  if (!id) throw new Error('Chưa có Sheet cho ' + COUPLE_ID + ' (cần có ít nhất một lời chúc).');
  const file = DriveApp.getFileById(id);
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  Logger.log(file.getUrl());
}

/** Cấp quyền xem Sheet cho email (bỏ qua nếu email không phải tài khoản Google) */
function shareSheet(sheetId, email) {
  try {
    DriveApp.getFileById(sheetId).addViewer(email);
  } catch (err) {
    Logger.log('Không cấp được quyền xem cho ' + email + ': ' + err);
  }
}

/** Email khách nhận thông báo, lưu trong Script Properties 'notify:<mã cặp đôi>' */
function getClientEmails(coupleId) {
  const v = PropertiesService.getScriptProperties().getProperty('notify:' + coupleId);
  return v ? v.split(',').filter(Boolean) : [];
}

/** Liệt kê tất cả cặp đôi và link Sheet (xem ở Nhật ký thực thi) */
function listCouples() {
  const all = PropertiesService.getScriptProperties().getProperties();
  Object.keys(all)
    .filter((k) => k.indexOf('sheet:') === 0)
    .forEach((k) => {
      const notify = all['notify:' + k.slice(6)];
      Logger.log(k.slice(6) + ' → https://docs.google.com/spreadsheets/d/' + all[k] + (notify ? ' · thông báo: ' + notify : ''));
    });
}

/** Chặn công thức Sheets (=, +, -, @) trong dữ liệu khách nhập và giới hạn độ dài */
function clean(value, max) {
  const s = String(value || '').trim().slice(0, max);
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}

function text(s) {
  return ContentService.createTextOutput(s).setMimeType(ContentService.MimeType.TEXT);
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON,
  );
}

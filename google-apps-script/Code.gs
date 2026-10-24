/**
 * Nhận lời chúc từ thiệp cưới → ghi vào Google Sheets + gửi email thông báo.
 * Dán toàn bộ file này vào Extensions → Apps Script của bảng tính.
 */

/** Bảng tính nhận lời chúc (phần giữa /d/ và /edit trong link Google Sheets) */
const SPREADSHEET_ID = '1XwhRDn7PfDaBaISLrrIx1xXh2dMezu_cBYwuMfKqlDU';

/** Email nhận thông báo — để '' nếu không muốn nhận email */
const NOTIFY_EMAIL = 'leducuet@gmail.com';

const HEADERS = ['Thời gian', 'Tên khách', 'Lời chúc', 'Tham dự', 'Số người', 'Khách mời của'];

function doPost(e) {
  const p = (e && e.parameter) || {};
  const row = [
    new Date(),
    clean(p.name, 100),
    clean(p.message, 1000),
    clean(p.attend, 100),
    Number(p.guestCount) || 0,
    /** Mẫu Hime gửi guestOf (Cô Dâu / Chú Rể) thay cho số người */
    clean(p.guestOf, 50),
  ];

  if (!row[1]) return json({ ok: false, error: 'missing name' });

  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheets()[0];
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(HEADERS);
      sheet.setFrozenRows(1);
    } else {
      /** Bảng tính tạo từ bản script cũ thiếu cột (vd "Khách mời của") → ghi lại dòng tiêu đề */
      const head = sheet.getRange(1, 1, 1, HEADERS.length);
      if (head.getValues()[0].join('|') !== HEADERS.join('|')) head.setValues([HEADERS]);
    }
    sheet.appendRow(row);
  } finally {
    lock.releaseLock();
  }

  if (NOTIFY_EMAIL) {
    MailApp.sendEmail({
      to: NOTIFY_EMAIL,
      subject: `💌 ${row[1]} vừa gửi lời chúc — ${row[3]}`,
      body: [
        `Tên: ${row[1]}`,
        `Tham dự: ${row[3]}`,
        `Số người: ${row[4]}`,
        `Khách mời của: ${row[5] || '(không ghi)'}`,
        '',
        `Lời chúc: ${row[2] || '(không có)'}`,
        '',
        `Xem tất cả: https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/edit`,
      ].join('\n'),
    });
  }

  return json({ ok: true });
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

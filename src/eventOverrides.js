/**
 * Đổi giờ / ngày của sự kiện có `editable: true` ngay trên link: ?gio=10:30&ngay=2026-11-07
 * (trang /tao-link tự ghép vào link từng khách). Không có tham số thì giữ nguyên nội dung trong content.js.
 * Ngày khác mặc định thì bỏ dòng ngày âm (không biết chắc).
 */
const WEEKDAYS = ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];

export function applyEventOverrides(items, search = window.location.search) {
  let q;
  try {
    q = new URLSearchParams(search);
  } catch {
    return items;
  }
  const gio = /^([01]?\d|2[0-3]):([0-5]\d)$/.exec((q.get("gio") || "").trim());
  const ngay = /^(\d{4})-(\d{2})-(\d{2})$/.exec((q.get("ngay") || "").trim());
  if (!gio && !ngay) return items;
  const d = ngay ? new Date(+ngay[1], +ngay[2] - 1, +ngay[3]) : null;
  const validDate = d && d.getMonth() === +ngay[2] - 1;
  return items.map((item) => {
    if (!item.editable) return item;
    const [oldTime, oldWeekday] = item.time.split("|").map((s) => s.trim());
    const out = { ...item };
    if (gio) out.time = `${gio[1].padStart(2, "0")}:${gio[2]} | ${oldWeekday}`;
    if (validDate) {
      out.time = `${(gio ? `${gio[1].padStart(2, "0")}:${gio[2]}` : oldTime)} | ${WEEKDAYS[d.getDay()]}`;
      out.date = `${ngay[3]}. ${ngay[2]}. ${ngay[1]}`;
      if (out.date !== item.date) out.lunar = "";
    }
    return out;
  });
}

export function hasEditableEvents(items) {
  return items.some((item) => item.editable);
}

/**
 * Đổi giờ / ngày của sự kiện có `editable: true` ngay trên link (trang /tao-link tự ghép vào link từng khách):
 * sự kiện editable thứ nhất dùng ?gio=10:30&ngay=2026-11-07, thứ hai dùng gio2 / ngay2, thứ ba gio3 / ngay3…
 * Không có tham số thì giữ nguyên nội dung trong content.js.
 * Ngày khác mặc định thì bỏ dòng ngày âm (không biết chắc).
 */
const WEEKDAYS = ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];

/** Hậu tố tham số của sự kiện editable thứ k (0 → "", 1 → "2", …) */
export function overrideSuffix(k) {
  return k === 0 ? "" : String(k + 1);
}

export function applyEventOverrides(items, search = window.location.search) {
  let q;
  try {
    q = new URLSearchParams(search);
  } catch {
    return items;
  }
  let k = -1;
  return items.map((item) => {
    if (!item.editable) return item;
    const suffix = overrideSuffix(++k);
    const gio = /^([01]?\d|2[0-3]):([0-5]\d)$/.exec((q.get(`gio${suffix}`) || "").trim());
    const ngay = /^(\d{4})-(\d{2})-(\d{2})$/.exec((q.get(`ngay${suffix}`) || "").trim());
    if (!gio && !ngay) return item;
    const d = ngay ? new Date(+ngay[1], +ngay[2] - 1, +ngay[3]) : null;
    const validDate = d && d.getMonth() === +ngay[2] - 1;
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

/**
 * Danh sách khách mời — mỗi khách có link riêng: https://<domain>/<slug>
 * Chữ "Quý khách" trên thiệp sẽ đổi thành `name`.
 *
 * - Chỉ cần ghi tên: slug tự tạo từ tên ("Cô Lan & Gia Đình" → co-lan-gia-dinh)
 * - Muốn link ngắn hơn / trùng tên: ghi { name, slug }
 *
 * Xuất danh sách link để gửi: npm run links -- https://<domain>
 */
export const guests = [
  'Cô Lan & Gia Đình',
  'Anh Tuấn',
  { name: 'Bạn Hoa', slug: 'hoa' },
];

/** "Cô Lan & Gia Đình" → "co-lan-gia-dinh" */
export function slugify(text) {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function guestEntries() {
  return guests.map((g) =>
    typeof g === 'string' ? { name: g, slug: slugify(g) } : { name: g.name, slug: g.slug || slugify(g.name) },
  );
}

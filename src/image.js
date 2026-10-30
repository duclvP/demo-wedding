/**
 * Đường dẫn ảnh — file trong public/images/ (họa tiết của mẫu thiepso05 nằm trong public/images/mau05/)
 * Thêm ảnh mới: bỏ file vào public/images/ rồi thêm đường dẫn vào đây.
 * *Position = object-position khi ảnh dọc bị cắt vừa khung (vd 'center 10%' = lấy phần trên).
 */
export const images = {
  /** Ảnh trồi lên khỏi phong bì khi mở thiệp (khung 305×380, bo góc) */
  hero: '/images/vay-2441.jpg',
  heroPosition: 'center top',
  /** Ảnh ngang dưới tên đỏ "Trân trọng báo tin…" (khung 387×240) */
  couple: '/images/ao-dai-1843.jpg',
  couplePosition: 'center 12%',
  /** 3 ảnh dọc dưới tên khách: cô dâu, ảnh đôi, chú rể (bản nhà gái) */
  dateStrip: ['/images/vay-2323.jpg', '/images/ao-dai-1787.jpg', '/images/vay-2581.jpg'],
  /** Ảnh tròn trong khung hoa, trên nút "Gửi mừng cưới" */
  circle: '/images/vay-2307.jpg',
  circlePosition: 'center 8%',
  /** Our memories — lưới 2 cột, áo dài đỏ xen kẽ váy cưới (số chẵn) */
  album: [
    '/images/ao-dai-1695.jpg',
    '/images/vay-2147.jpg',
    '/images/vay-2240.jpg',
    '/images/ao-dai-1750.jpg',
    '/images/ao-dai-1772.jpg',
    '/images/vay-2390.jpg',
    '/images/vay-2427.jpg',
    '/images/ao-dai-1808.jpg',
    '/images/ao-dai-1925.jpg',
    '/images/vay-2456.jpg',
    '/images/vay-2501.jpg',
    '/images/ao-dai-1929.jpg',
    '/images/ao-dai-1843.jpg',
    '/images/vay-2527.jpg',
  ],
  /** Ảnh trong hộp quà mừng cưới */
  gift: '/images/ao-dai-1808.jpg',
  /** Ảnh mục Thank You (chữ phủ nửa dưới — chọn ảnh mặt ở 1/3 trên) */
  thankYou: '/images/vay-2554.jpg',
};

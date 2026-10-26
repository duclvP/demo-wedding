/**
 * Đường dẫn ảnh — file trong public/images/
 * Thêm ảnh mới: bỏ file vào public/images/ rồi thêm đường dẫn vào đây.
 */
export const images = {
  /** Ảnh bìa 2:3 — "SAVE the DATE" + tên đè lên phần dưới */
  hero: '/images/hon-1.jpg',
  /** 3 ảnh dọc khung hồng (chữ ngày / tháng / năm đè lên) */
  dateStrip: ['/images/dung-1.jpg', '/images/nam-tay.jpg', '/images/vuon-1.jpg'],
  /** Ảnh lớn "Two hearts, one love…" (chữ đè 1/4 dưới) */
  quote: '/images/ngoi-1.jpg',
  /** Ảnh nền đếm ngược (chữ đè 1/3 dưới) */
  countdown: '/images/hon-2.jpg',
  /** Our Moments: ảnh dọc trên, ảnh nhỏ phải, ảnh lớn dưới */
  moments: ['/images/dung-1.jpg', '/images/biet-thu.jpg', '/images/nam-tay.jpg'],
  /** Ảnh lớn + dải ảnh nhỏ — số chẵn ảnh */
  album: [
    '/images/voan-1.jpg',
    '/images/hon-1.jpg',
    '/images/ngoi-1.jpg',
    '/images/dung-1.jpg',
    '/images/nam-tay.jpg',
    '/images/hon-2.jpg',
    '/images/biet-thu.jpg',
    '/images/vuon-1.jpg',
  ],
  /** Ảnh tròn cạnh nút mừng cưới */
  circle: '/images/ngoi-1.jpg',
  /** Ảnh trong hộp quà mừng cưới */
  gift: '/images/ngoi-1.jpg',
  /** Ảnh mục Thank You — mặt ở 1/3 trên */
  thankYou: '/images/voan-1.jpg',

  /** Họa tiết lấy từ trang mẫu lovecard.click/mau-49 */
  deco: {
    heart: '/images/deco-heart.png',
    calla: '/images/deco-calla.png',
    callaCorner: '/images/deco-calla-corner.png',
    timeline: '/images/deco-timeline.png',
    wreath: '/images/deco-wreath.png',
    bouquet: '/images/deco-bouquet.png',
    fork: '/images/deco-fork.png',
    rings: '/images/deco-rings.png',
  },
};

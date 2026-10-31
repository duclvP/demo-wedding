/**
 * Đường dẫn ảnh — file trong public/images/
 * Thêm ảnh mới: bỏ file vào public/images/ rồi thêm đường dẫn vào đây.
 */
export const images = {
  /** Ảnh bìa 2:3 — "SAVE the DATE" + tên đè lên phần dưới */
  hero: '/images/ao-dai-1.jpg',
  /** 3 ảnh dọc khung hồng (chữ ngày / tháng / năm đè lên) — bản nhà gái: cô dâu, ảnh đôi, chú rể */
  dateStrip: ['/images/co-dau-cuoi.jpg', '/images/ao-dai-2.jpg', '/images/chu-re-chao.jpg'],
  /** Ảnh lớn "Two hearts, one love…" (chữ đè 1/4 dưới) */
  quote: '/images/nam-tay.jpg',
  /** Ảnh nền đếm ngược (chữ đè 1/3 dưới) */
  countdown: '/images/hoa-1.jpg',
  /** Our Moments: ảnh dọc trên, ảnh nhỏ phải (ảnh ngang), ảnh lớn dưới */
  moments: ['/images/co-dau-hoa.jpg', '/images/chao-doi.jpg', '/images/chu-re.jpg'],
  /** Ảnh lớn + dải ảnh nhỏ — số chẵn ảnh, chỉ ảnh dọc, không lặp ảnh đã dùng ở các mục khác (khách yêu cầu) */
  album: [
    '/images/hoa-2.jpg',
    '/images/voan-2.jpg',
    '/images/co-dau-ngoi.jpg',
    '/images/quan-phuc.jpg',
    '/images/studio-3.jpg',
    '/images/co-dau-dung.jpg',
    '/images/hoa-3.jpg',
    '/images/studio-2.jpg',
    '/images/studio-4.jpg',
    '/images/studio-1.jpg',
  ],
  /** Ảnh tròn cạnh nút mừng cưới */
  circle: '/images/voan.jpg',
  /** Ảnh trong hộp quà mừng cưới */
  gift: '/images/co-dau-hoa.jpg',
  /** Ảnh mục Thank You — mặt ở 1/3 trên */
  thankYou: '/images/ao-dai-3.jpg',

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

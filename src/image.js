/**
 * Đường dẫn ảnh — file trong public/images/
 * Thêm ảnh mới: bỏ file vào public/images/ rồi thêm đường dẫn vào đây.
 * Ảnh gốc lấy từ thư mục Google Drive của khách (issue #36): trang-* váy trắng vest trắng,
 * den-* vest đen, co-dau-* cô dâu, ao-dai-* áo dài.
 */
export const images = {
  /** Ảnh dọc lớn đầu thiệp (khung vàng) */
  hero: '/images/trang-4.jpg',
  /** Ảnh dưới phần gia đình (khung vàng) */
  couple: '/images/ao-dai-2.jpg',
  /** 3 ảnh dải ngày cưới: chú rể (không có ảnh chú rể riêng → ảnh chú rể nổi bật), ảnh đôi, cô dâu */
  dateStrip: ['/images/den-5.jpg', '/images/trang-3.jpg', '/images/co-dau-1.jpg'],
  /** Lưới ảnh 2 cột — số chẵn */
  album: [
    '/images/trang-1.jpg',
    '/images/den-1.jpg',
    '/images/den-8.jpg',
    '/images/trang-2.jpg',
    '/images/ao-dai-1.jpg',
    '/images/den-6.jpg',
    '/images/den-3.jpg',
    '/images/trang-6.jpg',
    '/images/co-dau-2.jpg',
    '/images/den-9.jpg',
    '/images/den-7.jpg',
    '/images/den-4.jpg',
  ],
  /** Ảnh trong hộp quà mừng cưới */
  gift: '/images/den-2.jpg',
  /** Ảnh mục Thank You */
  thankYou: '/images/trang-5.jpg',
};

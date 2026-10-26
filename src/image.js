/**
 * Đường dẫn ảnh — file trong public/images/
 * Thêm ảnh mới: bỏ file vào public/images/ rồi thêm đường dẫn vào đây.
 */
export const images = {
  /** Ảnh bìa tràn màn hình, mờ dần xuống nền giấy (tên đè lên nửa dưới) */
  hero: '/images/studio-1.jpg',
  /** 2 ảnh polaroid nghiêng dưới "Save the Date" (trái, phải) */
  polaroids: ['/images/no-1.jpg', '/images/no-4.jpg'],
  /** 3 ảnh dải ngày cưới (chữ ngày / tháng / năm đè lên) */
  dateStrip: ['/images/studio-2.jpg', '/images/aodai-1.jpg', '/images/no-3.jpg'],
  /** Ảnh tròn viền lá cạnh nút mừng cưới */
  circle: '/images/aodai-3.jpg',
  /** Album of Love — lưới 2 cột, số chẵn ảnh */
  album: [
    '/images/aodai-2.jpg',
    '/images/no-2.jpg',
    '/images/no-5.jpg',
    '/images/aodai-4.jpg',
    '/images/studio-4.jpg',
    '/images/studio-3.jpg',
    '/images/aodai-1.jpg',
    '/images/no-1.jpg',
  ],
  /** Ảnh trong hộp quà mừng cưới */
  gift: '/images/no-4.jpg',
  /** Ảnh mục Thank You (mặt ở 1/3 trên — chữ phủ nửa dưới) */
  thankYou: '/images/studio-3.jpg',
  /** Ảnh trang trí lấy từ trang mẫu lovecard.click/mau37 */
  deco: {
    saveTheDate: '/images/deco-save-the-date.png',
    weekdays: '/images/deco-weekdays.png',
    album: '/images/deco-album.png',
    leafRing: '/images/deco-leaf-ring.png',
  },
};

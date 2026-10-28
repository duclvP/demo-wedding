/**
 * Đường dẫn ảnh — file trong public/images/
 * Thêm ảnh mới: bỏ file vào public/images/ rồi thêm đường dẫn vào đây.
 */
// TODO: ticket #30 chưa có ảnh cưới ("gửi sau") — đang dùng ảnh của trang mẫu nawngs.com/thanglinh (mau-*.jpg)
export const images = {
  /** Ảnh bìa đầu thiệp, dọc 385×613 bo góc dưới phải — tên phủ góc trên phải */
  hero: '/images/mau-hero.jpg',
  /** Ảnh ngang 420×210 dưới "Love Story" */
  wide: '/images/mau-ngang.jpg',
  /** Ảnh dọc 420×630 bo góc trên trái, chữ "Destiny" ở đáy */
  destiny: '/images/mau-destiny.jpg',
  /** Ảnh dọc 305×458 mục "The Album" */
  albumCover: '/images/mau-album.jpg',
  /** Album trình chiếu (ảnh lớn 420×490 + dải ảnh nhỏ) */
  album: [
    '/images/mau-album-0.jpg',
    '/images/mau-album-1.jpg',
    '/images/mau-album-2.jpg',
    '/images/mau-album-3.jpg',
    '/images/mau-album-4.jpg',
    '/images/mau-album-5.jpg',
    '/images/mau-album-6.jpg',
    '/images/mau-album-7.jpg',
    '/images/mau-album-8.jpg',
    '/images/mau-album-9.jpg',
  ],
  /** Ảnh trong hộp quà mừng cưới */
  gift: '/images/mau-album-1.jpg',
  /** Ảnh ngang 420×203 cuối thiệp — chữ "Thank you!" bên trái, chọn ảnh mặt nằm bên phải / giữa */
  thankYou: '/images/mau-thankyou.jpg',

  /** Ảnh trang trí của mẫu nawngs.com/thanglinh — dùng chung mọi cặp đôi */
  deco: {
    /** Lá phong */
    leaf: '/images/deco-la-phong.png',
  },
};

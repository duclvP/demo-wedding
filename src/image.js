/**
 * Đường dẫn ảnh — file trong public/images/
 * Thêm ảnh mới: bỏ file vào public/images/ rồi thêm đường dẫn vào đây.
 */
// TODO: ticket #30 chưa có ảnh cưới ("gửi sau") — đang dùng ảnh mẫu demo-*.jpg
export const images = {
  /** Ảnh bìa đầu thiệp, dọc 385×613 bo góc dưới phải — tên phủ góc trên phải */
  hero: '/images/demo-15.jpg',
  /** Ảnh ngang 420×210 dưới "Love Story" */
  wide: '/images/demo-02.jpg',
  /** Ảnh dọc 420×630 bo góc trên trái, chữ "Destiny" ở đáy */
  destiny: '/images/demo-10.jpg',
  /** Ảnh dọc 305×458 mục "The Album" */
  albumCover: '/images/demo-05.jpg',
  /** Album trình chiếu (ảnh lớn 420×490 + dải ảnh nhỏ) */
  album: [
    '/images/demo-01.jpg',
    '/images/demo-03.jpg',
    '/images/demo-04.jpg',
    '/images/demo-06.jpg',
    '/images/demo-07.jpg',
    '/images/demo-09.jpg',
    '/images/demo-11.jpg',
    '/images/demo-13.jpg',
    '/images/demo-14.jpg',
    '/images/demo-16.jpg',
  ],
  /** Ảnh trong hộp quà mừng cưới */
  gift: '/images/demo-03.jpg',
  /** Ảnh ngang 420×203 cuối thiệp — chữ "Thank you!" bên trái, chọn ảnh mặt nằm bên phải / giữa */
  thankYou: '/images/demo-12.jpg',

  /** Ảnh trang trí của mẫu nawngs.com/thanglinh — dùng chung mọi cặp đôi */
  deco: {
    /** Lá phong (đã đổi sang tông đỏ rượu) */
    leaf: '/images/deco-la-phong.png',
  },
};

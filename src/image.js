/**
 * Đường dẫn ảnh — file trong public/images/
 * Thêm ảnh mới: bỏ file vào public/images/ rồi thêm đường dẫn vào đây.
 */
/** Ảnh cưới khách gửi qua Drive (issue #30): cuoi-<số>.jpg — số = thứ tự ảnh trên thiệp từ trên xuống; có hai ảnh số 06 nên album 11 ảnh */
export const images = {
  /** Ảnh bìa đầu thiệp, dọc 385×613 bo góc dưới phải — tên phủ góc trên phải */
  hero: '/images/cuoi-01.jpg',
  /** Ảnh ngang 420×210 dưới "Love Story" (đã cắt sẵn 2:1 quanh đôi tay) */
  wide: '/images/cuoi-02.jpg',
  /** Ảnh dọc 420×630 bo góc trên trái, chữ "Destiny" ở đáy */
  destiny: '/images/cuoi-03.jpg',
  /** Ảnh dọc 305×458 mục "The Album" */
  albumCover: '/images/cuoi-04.jpg',
  /** Album trình chiếu (ảnh lớn 420×490 + dải ảnh nhỏ) */
  album: [
    '/images/cuoi-05.jpg',
    '/images/cuoi-06a.jpg',
    '/images/cuoi-06b.jpg',
    '/images/cuoi-07.jpg',
    '/images/cuoi-08.jpg',
    '/images/cuoi-09.jpg',
    '/images/cuoi-10.jpg',
    '/images/cuoi-11.jpg',
    '/images/cuoi-12.jpg',
    '/images/cuoi-13.jpg',
    '/images/cuoi-14.jpg',
  ],
  /** Ảnh trong hộp quà mừng cưới */
  gift: '/images/cuoi-06b.jpg',
  /** Ảnh ngang 420×203 cuối thiệp (đã cắt sẵn quanh cặp đôi) — chữ "Thank you!" bên trái */
  thankYou: '/images/cuoi-15.jpg',

  /** Ảnh trang trí của mẫu nawngs.com/thanglinh — dùng chung mọi cặp đôi */
  deco: {
    /** Lá phong */
    leaf: '/images/deco-la-phong.png',
    /** Nét chữ "and" bay dài giữa hai tên: trắng (ảnh bìa), xanh (lời mời) */
    andTrang: '/images/deco-and-trang.png',
    andXanh: '/images/deco-and-xanh.png',
    /** Chữ "Trân trọng cảm ơn !" viết tay (ảnh của mẫu) */
    tranTrong: '/images/deco-tran-trong.png',
  },
};

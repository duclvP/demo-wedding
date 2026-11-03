/**
 * Đường dẫn ảnh — file trong public/images/
 * Thêm ảnh mới: bỏ file vào public/images/ rồi thêm đường dẫn vào đây.
 */
export const images = {
  /** Ảnh trong hộ chiếu đầu thiệp — NGANG 3:2 (292×199) */
  hero: '/images/passport.jpg',
  /** Nền khối Countdown — ngang (418×317), chữ đè nửa dưới */
  countdown: '/images/vom-ngang.jpg',
  /** Ảnh polaroid "Love is a journey" — gần vuông (336×351) */
  journey: '/images/vuon-vuong.jpg',
  /** Thẻ treo kẹp giấy — vuông 1:1 (cắt từ hai nửa một ảnh đôi) */
  groom: '/images/chu-re.jpg',
  bride: '/images/co-dau.jpg',
  /**
   * Album of Love: 8 ô đầu xếp so le 2 cột theo khung mẫu
   * (trái 2:3, 2:3, NGANG 7:5, 3:5 — phải 3:4, 3:5, 1:1, 5:6 — xếp xen kẽ trái/phải),
   * ảnh thứ 9 trở đi xếp từng cặp 2:3 (nên để số chẵn). Chỉ ảnh chưa dùng ở các mục trên.
   */
  album: [
    '/images/studio-1.jpg',
    '/images/hy-1.jpg',
    '/images/sofa-1.jpg',
    '/images/tuong-1.jpg',
    /** ô ngang 7:5 */
    '/images/vom-2-ngang.jpg',
    '/images/hy-3.jpg',
    '/images/studio-3.jpg',
    '/images/nha-kinh.jpg',
    '/images/tuong-3.jpg',
    '/images/studio-2.jpg',
  ],
  /** Ảnh tròn trong vòng địa cầu + máy bay (cạnh nút mừng cưới) */
  circle: '/images/sofa-tron.jpg',
  /** Ảnh trong hộp quà mừng cưới */
  gift: '/images/sofa-3.jpg',
  /** Ảnh Thank You (402×438, mặt ở nửa trên — chữ phủ nửa dưới). og.jpg cũng cắt từ ảnh này */
  thankYou: '/images/studio-chao.jpg',
};

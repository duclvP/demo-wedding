/**
 * Đường dẫn ảnh — file trong public/images/
 * Bản demo: ảnh chibi tự vẽ bằng SVG (nguồn: public/images/src-chibi/*.svg).
 */
export const images = {
  /** Ảnh trong hộ chiếu đầu thiệp — NGANG 3:2 (292×199) */
  hero: '/images/chibi-passport.jpg',
  /** Nền khối Countdown — ngang 4:3 (418×317), chữ đè nửa dưới */
  countdown: '/images/chibi-countdown.jpg',
  /** Ảnh polaroid "Love is a journey" — gần vuông (336×351) */
  journey: '/images/chibi-journey.jpg',
  /** Thẻ treo kẹp giấy — vuông 1:1 */
  groom: '/images/chibi-groom.jpg',
  bride: '/images/chibi-bride.jpg',
  /**
   * Album of Love: 8 ô đầu xếp so le 2 cột theo khung mẫu
   * (trái 2:3, 2:3, NGANG 7:5, 3:5 — phải 3:4, 3:5, 1:1, 5:6 — xếp xen kẽ trái/phải),
   * ảnh thứ 9 trở đi xếp từng cặp 2:3 (nên để số chẵn).
   */
  album: [
    '/images/chibi-hug.jpg',
    '/images/chibi-tickets.jpg',
    '/images/chibi-clouds.jpg',
    '/images/chibi-bride.jpg',
    '/images/chibi-globe.jpg',
    '/images/chibi-groom.jpg',
    '/images/chibi-closeup.jpg',
    '/images/chibi-journey.jpg',
    '/images/chibi-countdown.jpg',
    '/images/chibi-passport.jpg',
  ],
  /** Ảnh tròn trong vòng địa cầu + máy bay (cạnh nút mừng cưới) */
  circle: '/images/chibi-circle.jpg',
  /** Ảnh trong hộp quà mừng cưới */
  gift: '/images/chibi-hug.jpg',
  /** Ảnh Thank You (402×438, mặt ở nửa trên — chữ phủ nửa dưới) */
  thankYou: '/images/chibi-closeup.jpg',
};

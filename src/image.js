/**
 * Đường dẫn ảnh — file trong public/images/
 * Thêm ảnh mới: bỏ file vào public/images/ rồi thêm đường dẫn vào đây.
 */
export const images = {
  /** Ảnh bìa 2:3 — tên + ngày đè lên phần dưới */
  hero: '/images/vuon-hon.jpg',
  /** Ảnh dọc cạnh chữ DARLING (2:3, câu thơ trắng đè đáy ảnh) */
  darling: '/images/vuon-nam-tay.jpg',
  /** Ảnh ngang 3:2 dưới lịch */
  wide: '/images/vuon-ngang.jpg',
  /** "Romantic LOVE": ảnh lớn làm mờ phía sau, ảnh khung phải, ảnh khung trái */
  romantic: {
    blur: '/images/vuon-voan.jpg',
    right: '/images/studio-1.jpg',
    left: '/images/studio-2.jpg',
  },
  /** Ảnh lớn 420×619 trước đếm ngược */
  big: '/images/save-the-date.jpg',
  /** Ghép ảnh Love Story: ngang lớn (đen trắng), ngang nhỏ, dọc lớn, dọc nhỏ */
  story: ['/images/save-the-date-ngang.jpg', '/images/vuon-ngang.jpg', '/images/vuon-voan.jpg', '/images/vuon-hon.jpg'],
  /** Ảnh lớn + dải ảnh nhỏ — chỉ ảnh dọc */
  album: [
    '/images/vuon-hon.jpg',
    '/images/studio-1.jpg',
    '/images/vuon-nam-tay.jpg',
    '/images/studio-2.jpg',
    '/images/vuon-voan.jpg',
    '/images/save-the-date.jpg',
  ],
  /** Ảnh trong hộp quà mừng cưới */
  gift: '/images/studio-2.jpg',
  /** Ảnh mục Thank You — mặt ở 1/3 trên */
  thankYou: '/images/studio-1.jpg',

  /** Họa tiết lấy từ trang mẫu lovecard.click/thiepso53 */
  deco: {
    amp: '/images/deco-amp.png',
    leafDarling: '/images/deco-leaf-darling.png',
    heart: '/images/deco-heart.png',
    corner: '/images/deco-corner.png',
    pearl: '/images/deco-pearl.png',
    mapPin: '/images/deco-map-pin.png',
    leafTall: '/images/deco-leaf-tall.png',
    cornerBottom: '/images/deco-corner-bottom.png',
    timeline: '/images/deco-timeline.png',
    bouquet: '/images/deco-bouquet.png',
    rings: '/images/deco-rings.png',
    toast: '/images/deco-toast.png',
    disco: '/images/deco-disco.png',
    leafBottom: '/images/deco-leaf-bottom.png',
    branch: '/images/deco-branch.png',
    leafRight: '/images/deco-leaf-right.png',
    floral: '/images/deco-floral.png',
    borderBottom: '/images/deco-border-bottom.png',
  },
};

/**
 * Đường dẫn ảnh — file trong public/images/
 * Thêm ảnh mới: bỏ file vào public/images/ rồi thêm đường dẫn vào đây.
 */
export const images = {
  /** Ảnh trong phong bì lúc mở thiệp (khung 278×347, object-top) */
  hero: '/images/studio-1.jpg',
  /** Ảnh ngang bo góc viền xanh dưới "Trân trọng báo tin" (387×285) */
  wide: '/images/man-do-4.jpg',
  /** 3 ảnh dọc dưới "Trân trọng kính mời": trái, giữa (to hơn), phải */
  trio: ['/images/studio-2.jpg', '/images/vuon-3.jpg', '/images/ao-dai-1.jpg'],
  /** Ảnh polaroid cạnh lịch */
  polaroid: '/images/ao-dai-2.jpg',
  /** Album 2 cột so le — ảnh chẵn cột trái, ảnh lẻ cột phải (ô thứ 5 là khung ngang) */
  album: [
    '/images/studio-3.jpg',
    '/images/vuon-1.jpg',
    '/images/vuon-4.jpg',
    '/images/man-do-2.jpg',
    '/images/man-do-1.jpg',
    '/images/man-do-3.jpg',
    '/images/man-do-5.jpg',
    '/images/man-do-6.jpg',
  ],
  /** Ảnh trong hộp quà mừng cưới */
  gift: '/images/vuon-3.jpg',
  /** Ảnh mục Thank You (420×647) — chữ phủ phần trên ảnh, chọn ảnh mặt nằm ở nửa dưới */
  thankYou: '/images/vuon-2.jpg',

  /** Ảnh trang trí của mẫu 13 (lovecard thiepso13) — dùng chung cho mọi cặp đôi, không cần đổi */
  deco: {
    pbDong: '/images/deco-pb-dong.png',
    pbMoSau: '/images/deco-pb-mo-sau.png',
    pbMoTruoc: '/images/deco-pb-mo-truoc.png',
    hyXanh: '/images/deco-hy-xanh.png',
    hyTrang: '/images/deco-hy-trang.png',
    thiepMoiCuoi: '/images/deco-thiep-moi-cuoi.png',
    laMauNuoc: '/images/deco-la-mau-nuoc.png',
    laGoc: '/images/deco-la-goc.png',
    laCanh: '/images/deco-la-canh.png',
    nhan: '/images/deco-nhan.png',
    nhanDoi: '/images/deco-nhan-doi.png',
    hoaSen: '/images/deco-hoa-sen.png',
    timVanTay: '/images/deco-tim-van-tay.png',
    chibi: '/images/deco-chibi.png',
    phongThu: '/images/deco-phong-thu.png',
  },
};

/**
 * Đường dẫn ảnh — file trong public/images/
 * Thêm ảnh mới: bỏ file vào public/images/ rồi thêm đường dẫn vào đây.
 */
// TODO: ticket #14 — đang tạm dùng ảnh mẫu demo-*.jpg, thay bằng ảnh cưới của khách
export const images = {
  /** Ảnh trong phong bì lúc mở thiệp (khung 278×347, object-top) */
  hero: '/images/demo-01.jpg',
  /** Ảnh ngang bo góc viền xanh dưới "Trân trọng báo tin" (387×285) */
  wide: '/images/demo-02.jpg',
  /** 3 ảnh dọc dưới "Trân trọng kính mời": trái, giữa (to hơn), phải */
  trio: ['/images/demo-03.jpg', '/images/demo-04.jpg', '/images/demo-05.jpg'],
  /** Ảnh polaroid cạnh lịch */
  polaroid: '/images/demo-06.jpg',
  /** Album 2 cột so le — ảnh chẵn cột trái, ảnh lẻ cột phải */
  album: [
    '/images/demo-07.jpg',
    '/images/demo-09.jpg',
    '/images/demo-10.jpg',
    '/images/demo-11.jpg',
    '/images/demo-12.jpg',
    '/images/demo-13.jpg',
    '/images/demo-14.jpg',
    '/images/demo-15.jpg',
  ],
  /** Ảnh trong hộp quà mừng cưới */
  gift: '/images/demo-04.jpg',
  /** Ảnh mục Thank You (420×647) — chữ phủ phần trên ảnh, chọn ảnh mặt nằm ở nửa dưới */
  thankYou: '/images/demo-16.jpg',

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

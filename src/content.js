/** Nội dung chữ — chỉnh sửa tại đây, không cần đụng layout */

/** Địa chỉ sau sáp nhập; mapQuery = địa chỉ cũ để Google Maps tìm đúng chỗ */
const ADDRESS_GROOM = 'Thôn Phương Ngạc, Xã Hải Lựu, Tỉnh Phú Thọ';
const MAP_GROOM = 'Thôn Ngạc Thị, Xã Phương Khoan, Huyện Sông Lô, Tỉnh Vĩnh Phúc';
const ADDRESS_BRIDE = 'Ngõ 103 Đường Đinh Tiên Hoàng, Phường Yên Bái, Tỉnh Lào Cai';
const MAP_BRIDE = 'Ngõ 103 Đường Đinh Tiên Hoàng, Phường Đồng Tâm, TP. Yên Bái';

/** father / mother / address: để null nếu không muốn hiển thị — TODO: chưa có tên bố mẹ */
const GROOM_SIDE = {
  label: 'Nhà Trai',
  father: null,
  mother: null,
  address: ADDRESS_GROOM,
};
const BRIDE_SIDE = {
  label: 'Nhà Gái',
  father: null,
  mother: null,
  address: ADDRESS_BRIDE,
};

export const content = {
  hero: {
    subtitle: 'Save The Date',
    /** Hiển thị theo đúng thứ tự này */
    names: ['Văn Long', 'Minh Ngọc'],
    dateLine: '17 . 11 . 2026',
  },

  families: {
    /** Hai cột gia đình, hiển thị trái → phải theo thứ tự này */
    sides: [GROOM_SIDE, BRIDE_SIDE],
    /** Tên cô dâu & chú rể, hiện dưới phần gia đình */
    fullNames: ['Văn Long', 'Minh Ngọc'],
  },

  invitation: {
    kicker: 'Trân Trọng Kính Mời',
    /** Tên khách mặc định — thay bằng link /hoa (→ Bạn Hoa), /co-lan (→ Cô Lan) hoặc ?khach=Tên%20Khách */
    defaultGuest: 'Quý khách',
    title: 'Tham Dự Lễ Thành Hôn',
    /** Chữ đè lên 3 ảnh */
    dateParts: ['17', '11', '2026'],
  },

  events: {
    mapLabel: 'Xem chỉ đường',
    items: [
      {
        id: 'tiec-cuoi',
        title: 'Tiệc Mừng Lễ Thành Hôn',
        time: '15:00 - Thứ Ba',
        date: '17. 11. 2026',
        lunar: '( Tức Ngày 09 Tháng 10 Năm Bính Ngọ )',
        places: [{ label: 'Tư Gia Nhà Trai', address: ADDRESS_GROOM, mapQuery: MAP_GROOM }],
      },
      {
        id: 'don-dau',
        title: 'Lễ Thành Hôn',
        time: '05:05 - Thứ Tư',
        date: '18. 11. 2026',
        lunar: '( Tức Ngày 10 Tháng 10 Năm Bính Ngọ )',
        places: [
          { label: 'Xuất Phát Từ Nhà Trai', address: ADDRESS_GROOM, mapQuery: MAP_GROOM },
          { label: 'Đón Dâu Tại Nhà Gái', address: ADDRESS_BRIDE, mapQuery: MAP_BRIDE },
        ],
      },
    ],
  },

  calendar: {
    title: 'Save The Date',
    /** Ngày được đánh dấu trên lịch — để null thì ẩn lịch */
    dateIso: '2026-11-17',
  },

  rsvp: {
    /**
     * Link Web App của Google Apps Script — lời chúc sẽ lưu vào Google Sheets
     * và gửi email thông báo. Cách lấy link: xem google-apps-script/README.md
     * Để '' thì form chỉ hiện lời cảm ơn, không lưu gì.
     */
    endpoint: 'https://script.google.com/macros/s/AKfycbwSC1CBCHacEHD58RJ7XGaCZ5z5_xyCOfx3HUPlCrEEfp4_iDwKGgI3rwe_kFA5krbn/exec',
    /** false = tạm ẩn toàn bộ form gửi lời chúc & xác nhận */
    show: false,
    /** false = tạm ẩn ô xác nhận tham dự & số người, chỉ nhận lời chúc */
    askAttend: false,
    title: 'Gửi Lời Chúc',
    placeholders: {
      name: 'Tên của bạn là gì ?',
      message: 'Gửi lời chúc cho cô dâu & chú rể',
      attend: 'Xác nhận tham dự ?',
      guestCount: 'Bạn đi bao nhiêu người ?',
    },
    attendYes: 'Có, mình sẽ đến',
    attendNo: 'Xin lỗi, hôm đấy mình không tới được :(',
    submit: 'Gửi Lời Chúc',
    sending: 'Đang gửi...',
    error: 'Gửi chưa được, bạn kiểm tra mạng rồi thử lại nhé!',
    thanks: 'Cảm ơn bạn! Lời chúc của bạn đã được ghi nhận.',
  },

  /** Hộp mừng cưới — để accounts: [] để ẩn nút "Gửi mừng cưới" */
  gift: {
    button: 'Gửi Mừng Cưới',
    title: 'Hộp Quà Mừng Cưới',
    copyLabel: 'Copy STK',
    copiedLabel: 'Đã copy',
    saveQrLabel: 'Lưu ảnh QR',
    accounts: [
      {
        holder: 'TA VAN LONG',
        number: '0868343248',
        bank: 'MB Bank',
        /** Ảnh mã QR trong public/images/ — để null nếu không có */
        qr: '/images/qr-mb.png',
      },
      {
        holder: 'HOANG MINH NGOC',
        number: '8873944665',
        bank: 'BIDV',
        qr: '/images/qr-bidv.png',
      },
    ],
  },

  thanks: {
    title: 'Thank You',
    text: 'Từ tận đáy lòng, chúng mình cảm ơn bạn đã dành tình cảm và sự hiện diện cho ngày vui này. Chính bạn đã góp phần làm nên một kỷ niệm hạnh phúc mà chúng mình sẽ luôn trân trọng.',
  },

  /** Nhạc nền — file đặt trong public/ (vd: public/music/music.mp3 → /music/music.mp3) */
  music: {
    src: '/music/ngoc-long.mp3',
    /** 0–1 */
    volume: 0.45,
  },
};

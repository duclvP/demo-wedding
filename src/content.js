/** Nội dung chữ — chỉnh sửa tại đây, không cần đụng layout */

const ADDRESS_GROOM = 'Thôn Xuân Me, Xã Liên Hòa, Tỉnh Phú Thọ';
/** Ghim Google Maps tư gia nhà trai — nút "Xem chỉ đường" mở đúng vị trí này */
const MAP_GROOM = '21.39711951615813,105.4964274124075';
const ADDRESS_BRIDE = 'Thôn Bì La, Xã Tiên Lữ, Tỉnh Phú Thọ';

/** father / mother / address: để null nếu không muốn hiển thị */
const GROOM_SIDE = {
  label: 'Nhà Trai',
  father: 'Nguyễn Văn Hải',
  mother: 'Phan Thị Lệ Thuỷ',
  address: ADDRESS_GROOM,
};
const BRIDE_SIDE = {
  label: 'Nhà Gái',
  father: 'Bùi Quang Nam',
  mother: 'Trần Thị Nguyệt',
  address: ADDRESS_BRIDE,
};

export const content = {
  hero: {
    subtitle: 'Save The Date',
    /** Hiển thị theo đúng thứ tự này */
    names: ['Ngọc Hưng', 'Thu Uyên'],
    dateLine: '02 . 11 . 2026',
  },

  families: {
    /** Hai cột gia đình, hiển thị trái → phải theo thứ tự này */
    sides: [GROOM_SIDE, BRIDE_SIDE],
    /** Tên cô dâu & chú rể, hiện dưới phần gia đình */
    fullNames: ['Ngọc Hưng', 'Thu Uyên'],
  },

  invitation: {
    kicker: 'Trân Trọng Kính Mời',
    /** Tên khách mặc định — thay bằng link /hoa (→ Bạn Hoa), /co-lan (→ Cô Lan) hoặc ?khach=Tên%20Khách */
    defaultGuest: 'Quý khách',
    title: 'Tham Dự Lễ Thành Hôn',
    /** Chữ đè lên 3 ảnh */
    dateParts: ['02', '11', '2026'],
  },

  events: {
    mapLabel: 'Xem chỉ đường',
    items: [
      {
        id: 'mung-cuoi',
        title: 'Lễ Mừng Cưới',
        time: '17:00 - Chủ Nhật',
        date: '01. 11. 2026',
        lunar: '( Tức Ngày 23 Tháng 09 Năm Bính Ngọ )',
        places: [{ label: 'Tư Gia Nhà Trai', address: ADDRESS_GROOM, mapQuery: MAP_GROOM }],
      },
      {
        id: 'thanh-hon',
        title: 'Lễ Thành Hôn',
        time: '09:00 - Thứ Hai',
        date: '02. 11. 2026',
        lunar: '( Tức Ngày 24 Tháng 09 Năm Bính Ngọ )',
        places: [{ label: 'Tư Gia Nhà Trai', address: ADDRESS_GROOM, mapQuery: MAP_GROOM }],
      },
    ],
  },

  /** Bộ đếm ngược — để null thì ẩn */
  countdown: {
    title: 'Đếm Ngược Ngày Vui',
    /** Giờ Việt Nam (+07:00) — Lễ Thành Hôn 09:00 02/11/2026 */
    target: '2026-11-02T09:00:00+07:00',
    labels: ['Ngày', 'Giờ', 'Phút', 'Giây'],
  },

  calendar: {
    title: 'Save The Date',
    /** Ngày được đánh dấu trên lịch — để null thì ẩn lịch */
    dateIso: null,
  },

  rsvp: {
    /**
     * Link Web App của Google Apps Script — lời chúc sẽ lưu vào Google Sheets
     * và gửi email thông báo. Cách lấy link: xem google-apps-script/README.md
     * Để '' thì form chỉ hiện lời cảm ơn, không lưu gì.
     */
    endpoint: 'https://script.google.com/macros/s/AKfycby0QrOLn3cawueiLHHhWu814VRFSdkh475WRePAVvYSTvrN3CkWH5s0-iBG5g28w0o/exec',
    /** false = tạm ẩn toàn bộ form gửi lời chúc & xác nhận */
    show: true,
    /** false = tạm ẩn ô xác nhận tham dự & số người, chỉ nhận lời chúc */
    askAttend: true,
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
        holder: 'NGUYEN NGOC HUNG',
        number: '6309072003',
        bank: 'MB Bank',
        /** Ảnh mã QR trong public/images/ — để null nếu không có */
        qr: '/images/qr-hung.png',
      },
    ],
  },

  thanks: {
    title: 'Thank You',
    text: 'Từ tận đáy lòng, chúng mình cảm ơn bạn đã dành tình cảm và sự hiện diện cho ngày vui này. Chính bạn đã góp phần làm nên một kỷ niệm hạnh phúc mà chúng mình sẽ luôn trân trọng.',
  },

  /** Nhạc nền — file đặt trong public/ (vd: public/music/music.mp3 → /music/music.mp3) */
  music: {
    src: '/music/beautiful-in-white.mp3',
    /** 0–1 */
    volume: 0.45,
  },
};

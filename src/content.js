/** Nội dung chữ — chỉnh sửa tại đây, không cần đụng layout */

const ADDRESS_GROOM = 'Số Nhà 333, Thôn Quýt, Xã Yên Bài, TP. Hà Nội';
/** Địa chỉ cũ trước sáp nhập — để Google Maps tìm dễ hơn */
const MAP_GROOM = 'Thôn Quýt, Yên Bài, Ba Vì, Hà Nội';
const ADDRESS_BRIDE = 'Số Nhà 10, Thôn Hoắc Châu, Xã Cổ Đô, TP. Hà Nội';
const MAP_BRIDE = 'Hoắc Châu, Cổ Đô, Ba Vì, Hà Nội';

/** father / mother / address: để null nếu không muốn hiển thị */
const GROOM_SIDE = {
  label: 'Nhà Trai',
  father: 'Nguyễn Chiến Công',
  mother: 'Phùng Thị Nguyệt',
  address: ADDRESS_GROOM,
};
const BRIDE_SIDE = {
  label: 'Nhà Gái',
  father: 'Nguyễn Văn Thành',
  mother: 'Phùng Thị Dũng',
  address: ADDRESS_BRIDE,
};

export const content = {
  hero: {
    subtitle: 'Save The Date',
    /** Hiển thị theo đúng thứ tự này */
    names: ['Hồng Ngọc', 'Trường An'],
    dateLine: '27 . 11 . 2026',
  },

  families: {
    /** Hai cột gia đình, hiển thị trái → phải theo thứ tự này */
    sides: [BRIDE_SIDE, GROOM_SIDE],
    /** Tên cô dâu & chú rể, hiện dưới phần gia đình */
    fullNames: ['Hồng Ngọc', 'Trường An'],
  },

  invitation: {
    kicker: 'Trân Trọng Kính Mời',
    /** Tên khách mặc định — thay bằng link /hoa (→ Bạn Hoa), /co-lan (→ Cô Lan) hoặc ?khach=Tên%20Khách */
    defaultGuest: 'Quý khách',
    title: 'Tham Dự Lễ Vu Quy',
    /** Chữ đè lên 3 ảnh */
    dateParts: ['27', '11', '2026'],
  },

  events: {
    mapLabel: 'Xem chỉ đường',
    items: [
      {
        id: 'tiec-vu-quy',
        title: 'Tiệc Mừng Lễ Vu Quy',
        time: '16:00 - Thứ Sáu',
        date: '27. 11. 2026',
        lunar: '( Tức Ngày 19 Tháng 10 Năm Bính Ngọ )',
        places: [{ label: 'Tư Gia Nhà Gái', address: ADDRESS_BRIDE, mapQuery: MAP_BRIDE }],
      },
      {
        id: 'vu-quy',
        title: 'Lễ Vu Quy',
        time: '11:30 - Thứ Bảy',
        date: '28. 11. 2026',
        lunar: '( Tức Ngày 20 Tháng 10 Năm Bính Ngọ )',
        places: [{ label: 'Tư Gia Nhà Gái', address: ADDRESS_BRIDE, mapQuery: MAP_BRIDE }],
      },
      {
        id: 'thanh-hon',
        title: 'Lễ Thành Hôn',
        time: '13:00 - Thứ Bảy',
        date: '28. 11. 2026',
        lunar: '( Tức Ngày 20 Tháng 10 Năm Bính Ngọ )',
        places: [{ label: 'Tư Gia Nhà Trai', address: ADDRESS_GROOM, mapQuery: MAP_GROOM }],
      },
    ],
  },

  /** Bộ đếm ngược — để null thì ẩn */
  countdown: {
    title: 'Đếm Ngược Ngày Vui',
    /** Giờ Việt Nam (+07:00) — Tiệc Mừng Lễ Vu Quy 16:00 27/11/2026 */
    target: '2026-11-27T16:00:00+07:00',
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
    endpoint: '',
    /** false = tạm ẩn toàn bộ form gửi lời chúc & xác nhận */
    show: false,
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
        holder: 'NGUYEN THI HONG NGOC',
        number: '233087939',
        bank: 'VPBank',
        /** Ảnh mã QR trong public/images/ — để null nếu không có */
        qr: '/images/qr-ngoc.png',
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

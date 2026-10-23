/** Nội dung chữ — chỉnh sửa tại đây, không cần đụng layout */

const ADDRESS = 'Thôn Hà Úc, Xã Phú Vinh, TP Huế';

/** lines: các dòng tên bố mẹ (để [] nếu không hiển thị); address: null = ẩn */
const GROOM_SIDE = {
  label: 'Nhà Trai',
  lines: ['Cố phụ: Giuse Nguyễn Bé', 'Cố mẫu: Trương Thị Hảo'],
  address: ADDRESS,
};
const BRIDE_SIDE = {
  label: 'Nhà Gái',
  lines: ['Ông: Giuse Lê Thành Tâm', 'Bà: Madalena Hồ Thị Bi'],
  address: ADDRESS,
};

export const content = {
  hero: {
    kicker: 'Save The Date',
    dateLine: '01 . 01 . 2027',
    /** Dòng chữ viết tay trên tranh cô dâu chú rể */
    names: ['Michael Bằng', 'Kim Nhung'],
  },

  families: {
    title: 'Engagement Invitation',
    /** Hai cột gia đình, trái → phải */
    sides: [GROOM_SIDE, BRIDE_SIDE],
    announce: 'Trân Trọng Báo Tin Lễ Đính Hôn Của',
    /** Tên đầy đủ + vai vế (dòng nhỏ dưới tên) */
    couple: [
      { name: 'Michael Bằng Nguyễn', role: 'Thứ Nam' },
      { name: 'Maria Lê Thị Kim Nhung', role: 'Thứ Nữ' },
    ],
  },

  invitation: {
    kicker: 'Trân Trọng Kính Mời',
    /** Tên khách mặc định — thay bằng link /hoa (→ Bạn Hoa), /co-lan (→ Cô Lan) hoặc ?khach=Tên%20Khách */
    defaultGuest: 'Quý khách',
    title: 'Đến Dự Buổi Tiệc Chung Vui',
    timeLabel: 'Vào Lúc',
  },

  /** Khối ngày giờ chính */
  event: {
    weekday: 'Thứ Sáu',
    hour: '10 Giờ 30',
    day: '01',
    month: 'Tháng 01',
    year: 'Năm 2027',
    lunar: '( Tức Ngày 24 Tháng 11 Năm Bính Ngọ )',
  },

  calendar: {
    /** Ngày đánh dấu trái tim trên lịch — để null thì ẩn lịch */
    dateIso: '2027-01-01',
  },

  venue: {
    title: 'Địa Điểm Tổ Chức',
    label: 'Tư Gia',
    address: ADDRESS,
    /** Từ khóa tìm trên Google Maps cho nút chỉ đường + bản đồ nhúng */
    mapQuery: 'Hà Úc, Phú Vinh, Huế',
    mapLabel: 'Xem chỉ đường',
  },

  closing: {
    note: 'Sự hiện diện của quý khách là niềm vinh dự của gia đình chúng tôi.',
    title: 'Rất Hân Hạnh Được Đón Tiếp!',
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
    title: 'Gửi Lời Chúc & Xác Nhận',
    placeholders: {
      name: 'Tên của bạn là gì ?',
      message: 'Gửi lời chúc cho cô dâu & chú rể',
      attend: 'Xác nhận tham dự ?',
      guestCount: 'Bạn đi bao nhiêu người ?',
    },
    attendYes: 'Có, mình sẽ đến',
    attendNo: 'Xin lỗi, hôm đấy mình không tới được :(',
    submit: 'Gửi Xác Nhận',
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
    accounts: [],
  },

  /** Nhạc nền — file đặt trong public/ (vd: public/music/music.mp3 → /music/music.mp3) */
  music: {
    src: '/music/mai-mai-ben-nhau.mp3',
    /** 0–1 */
    volume: 0.45,
  },
};

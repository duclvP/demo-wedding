/** Nội dung chữ — chỉnh sửa tại đây, không cần đụng layout */

const ADDRESS_BRIDE = 'Thôn Hải Phú, Xã Quỳnh Phú, Tỉnh Nghệ An';
const ADDRESS_GROOM = 'TDP Khánh Trung - Ninh Khang 2, Phường Hoa Lư, Tỉnh Ninh Bình';

/** father / mother / address: để null nếu không muốn hiển thị */
// TODO: ticket chưa có tên bố mẹ hai bên — hỏi khách
const BRIDE_SIDE = {
  label: 'Nhà Gái',
  father: null,
  mother: null,
  address: ADDRESS_BRIDE,
};
const GROOM_SIDE = {
  label: 'Nhà Trai',
  father: null,
  mother: null,
  address: ADDRESS_GROOM,
};

export const content = {
  hero: {
    subtitle: 'Save The Date',
    /** Hiển thị theo đúng thứ tự này */
    names: ['Phương Thuý', 'Tuấn Anh'],
    dateLine: '27 . 10 . 2026',
  },

  /** Thẻ ảnh chú rể / cô dâu */
  couple: {
    groom: { role: 'Chú rể', name: 'Tuấn Anh' },
    bride: { role: 'Cô dâu', name: 'Phương Thuý' },
  },

  families: {
    /** Hai cột gia đình, hiển thị trái → phải theo thứ tự này */
    sides: [BRIDE_SIDE, GROOM_SIDE],
    /** Tên cô dâu & chú rể — dòng ký tên cuối mục Thank You */
    fullNames: ['Phương Thuý', 'Tuấn Anh'],
  },

  invitation: {
    kicker: 'Trân Trọng Kính Mời',
    /** Tên khách mặc định — thay bằng link /hoa (→ Bạn Hoa), /co-lan (→ Cô Lan) hoặc ?khach=Tên%20Khách */
    defaultGuest: 'Quý khách',
    title: 'Đến Dự Và Chia Sẻ Niềm Vui',
    /** Chữ đè lên 3 ảnh */
    dateParts: ['27', '10', '2026'],
  },

  events: {
    mapLabel: 'Xem vị trí',
    items: [
      {
        id: 'vu-quy',
        title: 'Tiệc Mừng Lễ Vu Quy',
        time: '10:00 | Thứ Ba',
        date: '27. 10. 2026',
        lunar: '( Tức Ngày 18 Tháng 09 Năm Bính Ngọ )',
        places: [{ label: 'Tư Gia Nhà Gái', address: ADDRESS_BRIDE, mapQuery: 'Hải Phú, Quỳnh Phú, Nghệ An' }],
      },
      {
        id: 'ruoc-dau',
        title: 'Lễ Rước Dâu',
        time: '07:30 | Thứ Tư',
        date: '28. 10. 2026',
        lunar: '( Tức Ngày 19 Tháng 09 Năm Bính Ngọ )',
        places: [{ label: 'Tư Gia Nhà Gái', address: ADDRESS_BRIDE, mapQuery: 'Hải Phú, Quỳnh Phú, Nghệ An' }],
      },
    ],
  },

  /** Bộ đếm ngược — để null thì ẩn */
  countdown: {
    title: 'Đếm Ngược Ngày Vui',
    /** Giờ Việt Nam (+07:00) — Tiệc Vu Quy 10:00 27/10/2026 */
    target: '2026-10-27T10:00:00+07:00',
    labels: ['Ngày', 'Giờ', 'Phút', 'Giây'],
  },

  calendar: {
    title: 'Save The Date',
    /** Ngày khoanh tim trên lịch tháng ở đầu thiệp — để null thì ẩn lịch */
    dateIso: '2026-10-27',
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
    title: 'Xác Nhận Tham Dự',
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
    // TODO: chưa có QR / số tài khoản — hỏi khách
    accounts: [],
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

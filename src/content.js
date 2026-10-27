/** Nội dung chữ — chỉnh sửa tại đây, không cần đụng layout */

const ADDRESS_BRIDE = 'Thôn Giao Thiện, Xã Giao Minh, Tỉnh Ninh Bình';
const ADDRESS_GROOM = 'Thôn Tiến Thắng, Xã Yên Đồng, Tỉnh Ninh Bình';

/** father / mother / address: để null nếu không muốn hiển thị */
const BRIDE_SIDE = {
  label: 'Nhà Gái',
  father: 'Đinh Văn Thiều',
  mother: 'Phạm Thị Quýt',
  address: ADDRESS_BRIDE,
};
const GROOM_SIDE = {
  label: 'Nhà Trai',
  father: 'Nguyễn Đình Hy',
  mother: 'Nguyễn Thị Vừng',
  address: ADDRESS_GROOM,
};

export const content = {
  hero: {
    subtitle: 'Save The Date',
    /** Hiển thị theo đúng thứ tự này */
    names: ['Đinh Sen', 'Đình Thắng'],
    dateLine: '08 . 11 . 2026',
  },

  /** Thẻ ảnh chú rể / cô dâu */
  couple: {
    groom: { role: 'Chú rể', name: 'Đình Thắng' },
    bride: { role: 'Cô dâu', name: 'Đinh Sen' },
  },

  families: {
    /** Hai cột gia đình, hiển thị trái → phải theo thứ tự này */
    sides: [BRIDE_SIDE, GROOM_SIDE],
    /** Tên cô dâu & chú rể — dòng ký tên cuối mục Thank You */
    fullNames: ['Đinh Sen', 'Đình Thắng'],
  },

  invitation: {
    kicker: 'Trân Trọng Kính Mời',
    /** Tên khách mặc định — thay bằng link /hoa (→ Bạn Hoa), /co-lan (→ Cô Lan) hoặc ?khach=Tên%20Khách */
    defaultGuest: 'Quý khách',
    title: 'Tham Dự Lễ Vu Quy',
    /** Chữ đè lên 3 ảnh */
    dateParts: ['08', '11', '2026'],
  },

  events: {
    mapLabel: 'Xem vị trí',
    items: [
      {
        id: 'tiec-cuoi',
        title: 'Tiệc Mừng Lễ Vu Quy',
        // TODO: khách chưa gửi giờ + ngày tiệc nhà gái (đang tạm để cùng ngày 08/11) — hỏi lại khách
        time: '..:.. | Chủ Nhật',
        /** Đổi giờ / ngày bằng link: ?gio=10:30&ngay=2026-11-07 (xem trang /tao-link) */
        editable: true,
        date: '08. 11. 2026',
        lunar: '( Tức Ngày 30 Tháng 09 Năm Bính Ngọ )',
        places: [{ label: 'Tại Tư Gia Nhà Gái', address: ADDRESS_BRIDE, mapQuery: 'Xuân Bảo, ĐT489, Giao Minh, Ninh Bình', mapLink: 'https://maps.app.goo.gl/bdaKBqRxxDMSH7yq8' }],
      },
      {
        id: 'thanh-hon',
        title: 'Lễ Thành Hôn',
        time: '13:00 | Chủ Nhật',
        date: '08. 11. 2026',
        lunar: '( Tức Ngày 30 Tháng 09 Năm Bính Ngọ )',
        places: [{ label: 'Tại Tư Gia Nhà Trai', address: ADDRESS_GROOM, mapQuery: 'Phố Nấp, Yên Đồng, Ý Yên, Nam Định' }],
      },
    ],
  },

  /** Bộ đếm ngược — để null thì ẩn */
  countdown: {
    title: 'Đếm Ngược Ngày Vui',
    /** Giờ Việt Nam (+07:00) — Lễ Thành Hôn 13:00 08/11/2026 */
    target: '2026-11-08T13:00:00+07:00',
    labels: ['Ngày', 'Giờ', 'Phút', 'Giây'],
  },

  calendar: {
    title: 'Save The Date',
    /** Ngày khoanh tim trên lịch tháng ở đầu thiệp — để null thì ẩn lịch */
    dateIso: '2026-11-08',
  },

  rsvp: {
    /**
     * Link Web App của Google Apps Script — lời chúc sẽ lưu vào Google Sheets
     * và gửi email thông báo. Cách lấy link: xem google-apps-script/README.md
     * Để '' thì form chỉ hiện lời cảm ơn, không lưu gì.
     */
    endpoint: '',
    /**
     * Mã cặp đôi (chữ thường, số, dấu gạch ngang) — script dùng chung tự tạo Google Sheet riêng
     * cho từng mã. Khác cặp thì khác mã; để '' thì không lưu.
     */
    coupleId: '',
    /** Tên hiển thị đặt cho Sheet, vd 'Minh Hiền & Đức Thành' */
    coupleName: '',
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
    accounts: [
      {
        holder: 'DINH THI SEN',
        number: '0031000233954',
        bank: 'Vietcombank',
        /** Ảnh mã QR trong public/images/ — để null nếu không có */
        qr: '/images/qr-vietcombank-sen.png',
      },
    ],
  },

  thanks: {
    title: 'Thank You',
    text: 'Từ tận đáy lòng, chúng mình cảm ơn bạn đã dành tình cảm và sự hiện diện cho ngày vui này. Chính bạn đã góp phần làm nên một kỷ niệm hạnh phúc mà chúng mình sẽ luôn trân trọng.',
  },

  /** Nhạc nền — file đặt trong public/ (vd: public/music/music.mp3 → /music/music.mp3) */
  music: {
    src: '/music/vay-cuoi.mp3',
    /** 0–1 */
    volume: 0.45,
  },
};

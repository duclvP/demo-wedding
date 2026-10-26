/** Nội dung chữ — chỉnh sửa tại đây, không cần đụng layout */

const ADDRESS_BRIDE = 'Số nhà 35, Đường Tân Lập, Thôn Thống Nhất, Xã Nông Cống, Tỉnh Thanh Hoá';
const ADDRESS_GROOM = 'Số nhà 274, Đường 520, Thôn Văn Phú, Xã Tượng Lĩnh, Tỉnh Thanh Hoá';

/** father / mother / address: để null nếu không muốn hiển thị */
const BRIDE_SIDE = {
  label: 'Nhà Gái',
  // TODO: chưa có tên bố mẹ cô dâu
  father: null,
  mother: null,
  address: ADDRESS_BRIDE,
};
const GROOM_SIDE = {
  label: 'Nhà Trai',
  // TODO: chưa có tên bố mẹ chú rể
  father: null,
  mother: null,
  address: ADDRESS_GROOM,
};

export const content = {
  hero: {
    subtitle: 'Save The Date',
    /** Hiển thị theo đúng thứ tự này */
    names: ['Minh Hiền', 'Đức Thành'],
    dateLine: '20 . 12 . 2026',
  },

  /** Thẻ ảnh chú rể / cô dâu */
  couple: {
    groom: { role: 'Chú rể', name: 'Đức Thành' },
    bride: { role: 'Cô dâu', name: 'Minh Hiền' },
  },

  families: {
    /** Hai cột gia đình, hiển thị trái → phải theo thứ tự này */
    sides: [BRIDE_SIDE, GROOM_SIDE],
    /** Tên cô dâu & chú rể — dòng ký tên cuối mục Thank You */
    fullNames: ['Minh Hiền', 'Đức Thành'],
  },

  invitation: {
    kicker: 'Trân Trọng Kính Mời',
    /** Tên khách mặc định — thay bằng link /hoa (→ Bạn Hoa), /co-lan (→ Cô Lan) hoặc ?khach=Tên%20Khách */
    defaultGuest: 'Quý khách',
    title: 'Đến Dự Và Chia Sẻ Niềm Vui',
    /** Chữ đè lên 3 ảnh */
    dateParts: ['20', '12', '2026'],
  },

  events: {
    mapLabel: 'Xem vị trí',
    items: [
      {
        id: 'tiec-cuoi',
        title: 'Tiệc Mừng Cưới',
        time: '17:00 | Thứ Bảy',
        date: '19. 12. 2026',
        lunar: '( Tức Ngày 11 Tháng 11 Năm Bính Ngọ )',
        places: [
          { label: 'Tại Tư Gia Nhà Gái', address: ADDRESS_BRIDE, mapQuery: 'Thống Nhất, Nông Cống, Thanh Hoá' },
          { label: 'Tại Tư Gia Nhà Trai', address: ADDRESS_GROOM, mapQuery: 'Văn Phú, Tượng Lĩnh, Nông Cống, Thanh Hoá' },
        ],
      },
      {
        id: 'thanh-hon',
        title: 'Lễ Thành Hôn',
        time: '09:00 | Chủ Nhật',
        date: '20. 12. 2026',
        lunar: '( Tức Ngày 12 Tháng 11 Năm Bính Ngọ )',
        places: [{ label: 'Tại Tư Gia Nhà Trai', address: ADDRESS_GROOM, mapQuery: 'Văn Phú, Tượng Lĩnh, Nông Cống, Thanh Hoá' }],
      },
    ],
  },

  /** Bộ đếm ngược — để null thì ẩn */
  countdown: {
    title: 'Đếm Ngược Ngày Vui',
    /** Giờ Việt Nam (+07:00) — Lễ Thành Hôn 09:00 20/12/2026 */
    target: '2026-12-20T09:00:00+07:00',
    labels: ['Ngày', 'Giờ', 'Phút', 'Giây'],
  },

  calendar: {
    title: 'Save The Date',
    /** Ngày khoanh tim trên lịch tháng ở đầu thiệp — để null thì ẩn lịch */
    dateIso: '2026-12-20',
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
    accounts: [
      {
        holder: 'LUONG THI HIEN',
        number: '0001277112789',
        bank: 'MB Bank',
        /** Ảnh mã QR trong public/images/ — để null nếu không có */
        qr: '/images/qr-mbbank.png',
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

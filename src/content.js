/** Nội dung chữ — chỉnh sửa tại đây, không cần đụng layout */

const ADDRESS_BRIDE = 'Số nhà 8, ngõ Mã Lẽ 2, thôn Thống Nhất, xã Phùng Nguyên, tỉnh Phú Thọ';
const ADDRESS_GROOM = 'Số nhà 50, ngõ Sa Lộc 4, thôn Tứ Xã, xã Phùng Nguyên, tỉnh Phú Thọ';
/** Ô tìm trên Google Maps (địa chỉ sau sáp nhập khó tìm) — TODO: nhờ khách gửi ghim vị trí chính xác */
const MAP_BRIDE = ADDRESS_BRIDE;
const MAP_GROOM = 'Tứ Xã, Lâm Thao, Phú Thọ';

/** father / mother / address: để null nếu không muốn hiển thị */
const BRIDE_SIDE = {
  label: 'Nhà Gái',
  father: 'Khổng Văn Xuân',
  mother: 'Khổng Thị Sơn',
  address: ADDRESS_BRIDE,
};
const GROOM_SIDE = {
  label: 'Nhà Trai',
  father: 'Chử Đức Thụy',
  mother: 'Khổng Thị Phương',
  address: ADDRESS_GROOM,
};

export const content = {
  hero: {
    subtitle: 'Save The Date',
    /** Hiển thị theo đúng thứ tự này (tên trên, "&", tên dưới) */
    names: ['Đức Duy', 'Khổng Thủy'],
    dateLine: '07 . 11 . 2026',
  },

  /** Hai cột "Chú rể | Cô dâu" dưới Save The Date */
  couple: {
    groom: { role: 'Chú rể', name: 'Đức Duy' },
    bride: { role: 'Cô dâu', name: 'Khổng Thủy' },
  },

  families: {
    /** Hai cột gia đình, hiển thị trái → phải theo thứ tự này */
    sides: [GROOM_SIDE, BRIDE_SIDE],
    /** Tên cô dâu & chú rể — dòng ký tên cuối mục Thank You */
    fullNames: ['Đức Duy', 'Khổng Thủy'],
  },

  invitation: {
    kicker: 'Trân Trọng Kính Mời',
    /** Tên khách mặc định — thay bằng link /hoa (→ Bạn Hoa), /co-lan (→ Cô Lan) hoặc ?khach=Tên%20Khách */
    defaultGuest: 'Quý khách',
    title: 'Đến Dự Và Chia Sẻ Niềm Vui',
    /** Chữ đè lên 3 ảnh */
    dateParts: ['07', '11', '2026'],
  },

  events: {
    mapLabel: 'Xem vị trí',
    items: [
      {
        id: 'tiec-mung-cuoi',
        title: 'Tiệc Mừng Cưới',
        time: '16:00 | Thứ Sáu',
        date: '06. 11. 2026',
        lunar: '( Tức Ngày 28 Tháng 09 Năm Bính Ngọ )',
        places: [
          { label: 'Tại Tư Gia Nhà Trai', address: ADDRESS_GROOM, mapQuery: MAP_GROOM },
          { label: 'Tại Tư Gia Nhà Gái', address: ADDRESS_BRIDE, mapQuery: MAP_BRIDE },
        ],
      },
      {
        id: 'vu-quy',
        title: 'Lễ Vu Quy',
        time: '08:30 | Thứ Bảy',
        date: '07. 11. 2026',
        lunar: '( Tức Ngày 29 Tháng 09 Năm Bính Ngọ )',
        /** Dòng phụ dưới ngày âm — để null thì ẩn */
        note: 'Nhà trai xuất phát đón dâu lúc 08:05',
        places: [{ label: 'Tại Tư Gia Nhà Gái', address: ADDRESS_BRIDE, mapQuery: MAP_BRIDE }],
      },
      {
        id: 'thanh-hon',
        title: 'Lễ Thành Hôn',
        time: '10:00 | Thứ Bảy',
        date: '07. 11. 2026',
        lunar: '( Tức Ngày 29 Tháng 09 Năm Bính Ngọ )',
        places: [{ label: 'Tại Tư Gia Nhà Trai', address: ADDRESS_GROOM, mapQuery: MAP_GROOM }],
      },
    ],
  },

  /** Bộ đếm ngược — để null thì ẩn */
  countdown: {
    title: 'Đếm Ngược Ngày Vui',
    /** Giờ Việt Nam (+07:00) — Lễ Thành Hôn 10:00 07/11/2026 */
    target: '2026-11-07T10:00:00+07:00',
    labels: ['Ngày', 'Giờ', 'Phút', 'Giây'],
  },

  calendar: {
    title: 'Save The Date',
    /** Ngày khoanh tim trên lịch tháng ở đầu thiệp — để null thì ẩn lịch */
    dateIso: '2026-11-07',
  },

  rsvp: {
    /**
     * Link Web App của Google Apps Script — lời chúc sẽ lưu vào Google Sheets
     * và gửi email thông báo. Cách lấy link: xem google-apps-script/README.md
     * Để '' thì form chỉ hiện lời cảm ơn, không lưu gì.
     */
    endpoint: 'https://script.google.com/macros/s/AKfycbxGFb49383QZuzEF1D_sx_JSNSCecscN3j2aZShNuCGpbDiKK9bwoPawGo5Y_pKbacu/exec',
    /** Mã cặp đôi (duy nhất) — script dùng chung tự tạo Google Sheet riêng cho mỗi mã */
    coupleId: 'khong-thuy-duc-duy',
    /** Tên đặt cho Sheet */
    coupleName: 'Khổng Thủy & Đức Duy',
    /** false = tạm ẩn toàn bộ form gửi lời chúc & xác nhận */
    show: true,
    /** false = tạm ẩn ô xác nhận tham dự & số người, chỉ nhận lời chúc */
    askAttend: true,
    title: 'Xác Nhận Tham Dự',
    placeholders: {
      name: 'Họ và Tên',
      message: 'Gửi lời chúc cho dâu, rể',
      attend: 'Xác nhận tham dự ?',
      guestCount: 'Bạn đi bao nhiêu người',
    },
    attendYes: 'Có, mình sẽ đến',
    attendNo: 'Tiếc quá, hôm đấy mình không đến được :((',
    submit: 'Gửi Xác Nhận',
    subtitle: 'Hãy xác nhận tham dự để chúng mình chuẩn bị đón tiếp thật chu đáo. Trân Trọng!',
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
        /** Chú rể — QR đã giải mã: BIN 970422 (MB Bank) */
        holder: 'CHU DUC DUY',
        number: '81996199688888',
        bank: 'MB Bank',
        /** Ảnh mã QR trong public/images/ — để null nếu không có */
        qr: '/images/qr-mbbank.png',
      },
      {
        /** Cô dâu — QR đã giải mã: BIN 970436 (Vietcombank) */
        holder: 'KHONG THI THUY',
        number: '1032473835',
        bank: 'Vietcombank',
        qr: '/images/qr-vietcombank.png',
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

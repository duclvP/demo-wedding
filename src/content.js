/** Nội dung chữ — chỉnh sửa tại đây, không cần đụng layout */

const ADDRESS_GROOM = 'Thôn Bản Sái, xã Bản Hồ, tỉnh Lào Cai';
const ADDRESS_BRIDE = 'Km19, thôn Ky Công Hồ, đường Sa Pa - Lào Cai';

/** father / mother / address: để null nếu không muốn hiển thị */
const GROOM_SIDE = {
  label: 'Nhà Trai',
  father: 'Phùng Vần Siểu',
  mother: 'Phùng Cờ Mẩy',
  address: ADDRESS_GROOM,
};
const BRIDE_SIDE = {
  label: 'Nhà Gái',
  father: 'Chảo Diếu Nhàn',
  mother: 'Lý Tả Mẩy',
  address: ADDRESS_BRIDE,
};

export const content = {
  hero: {
    subtitle: 'Save The Date',
    /** Hiển thị theo đúng thứ tự này */
    names: ['Mẩy Líu', 'Phùng Yết'],
    dateLine: '24 . 11 . 2026',
  },

  families: {
    /** Hai cột gia đình, hiển thị trái → phải theo thứ tự này */
    sides: [GROOM_SIDE, BRIDE_SIDE],
    /** Tên cô dâu & chú rể, hiện dưới phần gia đình */
    fullNames: ['Mẩy Líu', 'Phùng Yết'],
  },

  invitation: {
    kicker: 'Trân Trọng Kính Mời',
    /** Tên khách mặc định — thay bằng link /hoa (→ Bạn Hoa), /co-lan (→ Cô Lan) hoặc ?khach=Tên%20Khách */
    defaultGuest: 'Quý khách',
    title: 'Tham Dự Lễ Cưới',
    /** Chữ đè lên 3 ảnh */
    dateParts: ['24', '11', '2026'],
  },

  events: {
    mapLabel: 'Xem chỉ đường',
    items: [
      {
        id: 'nha-trai',
        title: 'Lễ Cưới Nhà Trai',
        time: '09:00 - Thứ Hai',
        date: '23. 11. 2026',
        lunar: '( Tức Ngày 15 Tháng 10 Năm Bính Ngọ )',
        places: [
          {
            label: 'Tư Gia Nhà Trai',
            address: ADDRESS_GROOM,
            /** Pin trong ticket: gần Đảng ủy xã Bản Hồ */
            mapQuery: '8X3P+322 Bản Hồ, Lào Cai',
          },
        ],
      },
      {
        id: 'nha-gai',
        title: 'Lễ Cưới Nhà Gái',
        time: '09:00 - Thứ Ba',
        date: '24. 11. 2026',
        lunar: '( Tức Ngày 16 Tháng 10 Năm Bính Ngọ )',
        places: [
          {
            label: 'Tư Gia Nhà Gái',
            address: ADDRESS_BRIDE,
            /** Toạ độ trong link maps.app.goo.gl của ticket */
            mapQuery: '22.398639,103.8905',
          },
        ],
      },
    ],
  },

  calendar: {
    title: 'Save The Date',
    /** Ngày được đánh dấu trên lịch (một ngày hoặc mảng nhiều ngày cùng tháng) — để null thì ẩn lịch */
    dateIso: ['2026-11-23', '2026-11-24'],
  },

  rsvp: {
    /**
     * Link Web App của Google Apps Script — lời chúc sẽ lưu vào Google Sheets
     * và gửi email thông báo. Cách lấy link: xem google-apps-script/README.md
     * Để '' thì form chỉ hiện lời cảm ơn, không lưu gì.
     */
    endpoint: 'https://script.google.com/macros/s/AKfycbxGFb49383QZuzEF1D_sx_JSNSCecscN3j2aZShNuCGpbDiKK9bwoPawGo5Y_pKbacu/exec',
    /** Slug riêng của thiệp trong script dùng chung — không đổi sau khi đã có lời chúc */
    coupleId: 'mayliu-phungyet',
    coupleName: 'Mẩy Líu & Phùng Yết',
    /** false = tạm ẩn toàn bộ form gửi lời chúc & xác nhận */
    show: true,
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
    // TODO: web cũ chưa có tài khoản mừng cưới — hỏi khách nếu cần
    accounts: [],
  },

  thanks: {
    title: 'Thank You',
    text: 'Từ tận đáy lòng, chúng mình cảm ơn bạn đã dành tình cảm và sự hiện diện cho ngày vui này. Chính bạn đã góp phần làm nên một kỷ niệm hạnh phúc mà chúng mình sẽ luôn trân trọng.',
  },

  /** Nhạc nền — file đặt trong public/ (vd: public/music/music.mp3 → /music/music.mp3) */
  music: {
    src: '/music/music.mp3',
    /** 0–1 */
    volume: 0.45,
  },
};

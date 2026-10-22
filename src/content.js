/** Nội dung chữ — chỉnh sửa tại đây, không cần đụng layout */

/** father / mother / address: để null nếu không muốn hiển thị */
const GROOM_SIDE = {
  label: 'Nhà Trai',
  father: null, // TODO: ticket chưa có tên bố mẹ nhà trai
  mother: null,
  address: 'Khu 11, Xã Phú Mỹ, Tỉnh Phú Thọ',
};
const BRIDE_SIDE = {
  label: 'Nhà Gái',
  father: null, // TODO: ticket chưa có tên bố mẹ nhà gái
  mother: null,
  address: 'Tổ dân phố Cảnh Thụy, Phường Cảnh Thụy, Thành phố Bắc Ninh',
};

export const content = {
  /** Giao diện: '01' (lovecard thiepso01, mặc định) hoặc '06' (thiepso06 — xanh rêu, mép giấy xé) */
  template: '07',

  hero: {
    subtitle: 'Save The Date',
    /** Hiển thị theo đúng thứ tự này */
    names: ['Hà Anh', 'Ngọc Tiến'],
    dateLine: '14 . 11 . 2026',
  },

  families: {
    /** Hai cột gia đình, hiển thị trái → phải theo thứ tự này */
    sides: [BRIDE_SIDE, GROOM_SIDE],
    /** Tên cô dâu & chú rể, hiện dưới phần gia đình */
    fullNames: ['Hà Anh', 'Ngọc Tiến'],
  },

  invitation: {
    kicker: 'Trân Trọng Kính Mời',
    /** Tên khách mặc định — thay bằng link /hoa (→ Bạn Hoa), /co-lan (→ Cô Lan) hoặc ?khach=Tên%20Khách */
    defaultGuest: 'Quý khách',
    title: 'Tham Dự Lễ Vu Quy',
    /** Chữ đè lên 3 ảnh (chỉ mẫu 01) */
    dateParts: ['14', '11', '26'],
  },

  events: {
    mapLabel: 'Chỉ đường',
    items: [
      {
        id: 'tiec-mung',
        title: 'Tiệc Mừng Lễ Vu Quy',
        time: '15:00 - Thứ Bảy',
        date: '14. 11. 2026',
        lunar: '( Tức Ngày 6 Tháng 10 Năm Bính Ngọ )',
        // TODO: ticket chưa ghi địa điểm tiệc — tạm để tư gia nhà gái
        places: [{ label: 'Tư Gia Nhà Gái', address: BRIDE_SIDE.address }],
      },
      {
        id: 'le-ruoc-dau',
        title: 'Lễ Rước Dâu',
        // TODO: ticket chưa ghi giờ rước dâu
        time: 'Chủ Nhật',
        date: '15. 11. 2026',
        lunar: '( Tức Ngày 7 Tháng 10 Năm Bính Ngọ )',
        places: [{ label: 'Tư Gia Nhà Gái', address: BRIDE_SIDE.address }],
      },
    ],
  },

  /** Mục "Our Story" (chỉ mẫu 06) — để null thì ẩn */
  story: {
    title: 'Our Story',
    paragraphs: [
      'Chúng mình gặp nhau giữa những ngày rất đỗi bình thường, rồi thương nhau qua từng bữa cơm, từng chuyến đi và cả những lần giận hờn rất nhỏ. Qua bao thăng trầm, điều giữ chúng mình ở lại bên nhau là sự thấu hiểu và niềm tin dành cho nhau.',
      'Và hôm nay, chúng mình quyết định nắm tay nhau bước sang một chương mới — cùng xây một mái nhà, cùng gọi nhau là gia đình.',
    ],
  },

  calendar: {
    title: 'Save The Date',
    /** Ngày được đánh dấu trên lịch — để null thì ẩn lịch */
    dateIso: '2026-11-14',
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
    accounts: [],
  },

  thanks: {
    title: 'Thank You',
    text: 'Từ tận đáy lòng, chúng mình cảm ơn bạn đã dành tình cảm và sự hiện diện cho ngày vui này. Chính bạn đã góp phần làm nên một kỷ niệm hạnh phúc mà chúng mình sẽ luôn trân trọng.',
  },

  /** Nhạc nền — file đặt trong public/ (vd: public/music/music.mp3 → /music/music.mp3) */
  music: {
    src: '/music/i-do-cut.mp3',
    /** 0–1 */
    volume: 0.45,
  },
};

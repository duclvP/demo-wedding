/** Nội dung chữ — chỉnh sửa tại đây, không cần đụng layout */

const ADDRESS_GROOM = 'Số nhà 63, Đường Tiền Lệ 1, Xã Sơn Đồng, TP. Hà Nội';
const ADDRESS_RESTAURANT = 'Nhà hàng Việt Anh, Đường 417, Xã Liên Minh, TP. Hà Nội';

/** father / mother / address: để null nếu không muốn hiển thị */
const GROOM_SIDE = {
  label: 'Nhà Trai',
  father: 'Nguyễn Văn Mạnh',
  mother: 'Nguyễn Thị Hoa',
  address: ADDRESS_GROOM,
};
const BRIDE_SIDE = {
  label: 'Nhà Gái',
  father: 'Trần Việt Hùng',
  mother: 'Bùi Thị Hồng Tươi',
  address: ADDRESS_RESTAURANT,
};

export const content = {
  hero: {
    subtitle: 'Save The Date',
    /** Hiển thị theo đúng thứ tự này */
    names: ['Minh Nguyệt', 'Văn Trúc'],
    dateLine: '01 . 11 . 2026',
  },

  families: {
    /** Hai cột gia đình, hiển thị trái → phải theo thứ tự này */
    sides: [BRIDE_SIDE, GROOM_SIDE],
    /** Tên cô dâu & chú rể, hiện dưới phần gia đình */
    fullNames: ['Minh Nguyệt', 'Văn Trúc'],
  },

  invitation: {
    kicker: 'Trân Trọng Kính Mời',
    /** Tên khách mặc định — thay bằng link /hoa (→ Bạn Hoa), /co-lan (→ Cô Lan) hoặc ?khach=Tên%20Khách */
    defaultGuest: 'Quý khách',
    title: 'Tham Dự Lễ Vu Quy',
    /** Chữ đè lên 3 ảnh */
    dateParts: ['01', '11', '2026'],
  },

  events: {
    mapLabel: 'Xem chỉ đường',
    items: [
      {
        id: 'vu-quy',
        title: 'Tiệc Mừng Lễ Vu Quy',
        time: '15:00 - Chủ Nhật',
        date: '01. 11. 2026',
        lunar: '( Tức Ngày 23 Tháng 09 Năm Bính Ngọ )',
        places: [{ label: 'Nhà Hàng Việt Anh', address: ADDRESS_RESTAURANT }],
      },
      {
        id: 'thanh-hon',
        title: 'Lễ Thành Hôn',
        time: '11:00 - Thứ Hai',
        date: '02. 11. 2026',
        lunar: '( Tức Ngày 24 Tháng 09 Năm Bính Ngọ )',
        places: [{ label: 'Tư Gia Nhà Trai', address: ADDRESS_GROOM }],
      },
    ],
  },

  calendar: {
    title: 'Save The Date',
    /** Ngày được đánh dấu trên lịch — một ngày hoặc mảng nhiều ngày cùng tháng */
    dateIso: ['2026-11-01', '2026-11-02'],
  },

  rsvp: {
    /**
     * Link Web App của Google Apps Script — lời chúc sẽ lưu vào Google Sheets
     * và gửi email thông báo. Cách lấy link: xem google-apps-script/README.md
     * Để '' thì form chỉ hiện lời cảm ơn, không lưu gì.
     */
    endpoint: 'https://script.google.com/macros/s/AKfycbxX--VN9RujWyRYWhfhRygkIwCshmO3XsOS76jAY8Av0d0TLF6wLzbsyZRzuTfP5fOr/exec',
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
    accounts: [
      {
        holder: 'TRAN THI MINH NGUYET',
        number: '0985327617',
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
    src: '/music/nguyet-truc.mp3',
    /** 0–1 */
    volume: 0.45,
  },
};

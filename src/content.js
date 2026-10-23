/** Nội dung chữ — chỉnh sửa tại đây, không cần đụng layout */

const ADDRESS_GROOM = 'Xã Ngân Sơn, Tỉnh Thái Nguyên';
const ADDRESS_BRIDE = 'Xóm Khuổi Sá, Xã Cốc Pàng, Tỉnh Cao Bằng';

/** father / mother / address: để null nếu không muốn hiển thị */
// TODO: ticket #18 chưa có tên bố mẹ hai bên — hỏi lại khách
const GROOM_SIDE = {
  label: 'Nhà Trai',
  father: null,
  mother: null,
  address: ADDRESS_GROOM,
};
const BRIDE_SIDE = {
  label: 'Nhà Gái',
  father: null,
  mother: null,
  address: ADDRESS_BRIDE,
};

export const content = {
  hero: {
    /** Hiển thị theo đúng thứ tự này */
    names: ['Thu Hồng', 'Trọng Hoàng'],
    /** Hai dòng dưới tên: ngày.tháng / năm */
    dateLines: ['26.11', '2026'],
    hint: 'NHẤP VÀO THIỆP ĐỂ MỞ',
  },

  families: {
    /** Hai khối gia đình, từ trên xuống theo thứ tự này */
    sides: [BRIDE_SIDE, GROOM_SIDE],
    /** Tên cô dâu & chú rể (dòng "Trân trọng báo tin" và ký tên cuối trang) */
    fullNames: ['Thu Hồng', 'Trọng Hoàng'],
  },

  invitation: {
    announce: ['Trân Trọng Báo Tin', 'Lễ Thành Hôn', 'Của'],
    kicker: 'Trân Trọng Kính Mời',
    /** Tên khách mặc định — thay bằng link /hoa (→ Bạn Hoa), /co-lan (→ Cô Lan) hoặc ?khach=Tên%20Khách */
    defaultGuest: 'Quý khách',
    title: 'Tham Dự Lễ Cưới',
    /** Chữ đè lên 3 ảnh */
    dateParts: ['26', '11', '2026'],
  },

  events: {
    mapLabel: 'Chỉ đường',
    items: [
      {
        id: 'ruoc-dau',
        title: 'Tiệc Mừng Cưới - Nhà Gái',
        hour: '08 giờ 00',
        weekday: 'Thứ Năm',
        day: '26',
        monthYear: '11 - 2026',
        lunar: '( Tức ngày 18 tháng 10 năm Bính Ngọ )',
        places: [{ label: 'Tư Gia Nhà Gái', address: ADDRESS_BRIDE }],
      },
      {
        id: 'thanh-hon-nha-trai',
        title: 'Lễ Thành Hôn - Nhà Trai',
        hour: '15 giờ 00',
        weekday: 'Chủ Nhật',
        day: '29',
        monthYear: '11 - 2026',
        lunar: '( Tức ngày 21 tháng 10 năm Bính Ngọ )',
        places: [{ label: 'Tư Gia Nhà Trai', address: ADDRESS_GROOM }],
      },
    ],
  },

  calendar: {
    /** Các ngày được đánh dấu trên lịch (cùng một tháng) — để [] thì ẩn lịch */
    dateIso: ['2026-11-26', '2026-11-29'],
    photoCaption: 'My Love',
  },

  story: {
    title: 'Our memories',
    text: '"Từ những lần gặp gỡ đầu tiên đến hôm nay, chúng tôi đã tìm thấy một nửa của mình. Đây là câu chuyện tình yêu được viết nên bằng những khoảnh khắc đẹp nhất."',
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
    accounts: [
      {
        holder: 'NONG THI SEO',
        number: '42744768888',
        bank: 'TPBank',
        /** Ảnh mã QR trong public/images/ — để null nếu không có */
        qr: '/images/qr-tpbank.png',
      },
    ],
  },

  thanks: {
    title: 'Thank You',
    text: 'Từ tận đáy lòng, chúng mình cảm ơn bạn đã dành tình cảm và sự hiện diện cho ngày vui này. Chính bạn đã góp phần làm nên một kỷ niệm hạnh phúc mà chúng mình sẽ luôn trân trọng.',
  },

  /** Nhạc nền — file đặt trong public/ (vd: public/music/music.mp3 → /music/music.mp3) */
  music: {
    src: '/music/i-do.mp3',
    /** 0–1 */
    volume: 0.45,
  },
};

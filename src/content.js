/** Nội dung chữ — chỉnh sửa tại đây, không cần đụng layout */

const ADDRESS_GROOM = 'Thôn Trung Hoà, xã Quỳnh Phụ, tỉnh Hưng Yên';
// TODO: ticket #25 chưa có địa chỉ nhà gái — hỏi lại khách
const ADDRESS_BRIDE = null;

/** father / mother / address: để null nếu không muốn hiển thị */
// Khách không ghi thông tin cha mẹ hai bên (issue #25)
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
    /** Hiển thị theo đúng thứ tự này (cũng là dòng tên dưới lời mời và ký tên mục Thank You) */
    names: ['Hoài An', 'Hữu Ân'],
    /** Hai dòng dưới tên: ngày.tháng / năm */
    dateLines: ['27.11', '2026'],
    hint: 'NHẤP VÀO THIỆP ĐỂ MỞ',
  },

  families: {
    /** Hai khối gia đình, từ trên xuống theo thứ tự này */
    sides: [BRIDE_SIDE, GROOM_SIDE],
    /** Họ tên đầy đủ — dòng "Trân trọng báo tin lễ thành hôn của" */
    fullNames: ['Nguyễn Hoài An', 'Phạm Hữu Ân'],
  },

  invitation: {
    announce: ['Trân Trọng Báo Tin', 'Lễ Thành Hôn', 'Của'],
    kicker: 'Trân Trọng Kính Mời',
    /** Tên khách mặc định — thay bằng link /hoa (→ Bạn Hoa), /co-lan (→ Cô Lan) hoặc ?khach=Tên%20Khách */
    defaultGuest: 'Quý khách',
    title: 'Tham Dự Tiệc Mừng Lễ Thành Hôn',
  },

  events: {
    venueTitle: 'Địa điểm tổ chức',
    mapLabel: 'Xem trên Google Map',
    items: [
      {
        // Khách chỉ gửi một sự kiện (tư gia nhà trai) — bản nhà gái mời khách dự cùng tiệc này.
        // TODO: nếu nhà gái có tiệc Vu Quy riêng thì hỏi giờ / ngày / địa chỉ rồi thay vào đây (issue #25)
        id: 'thanh-hon',
        title: null,
        /** Giờ đón khách dự tiệc — Lễ Thành Hôn cử hành lúc 18h00 cùng ngày (issue #25) */
        hour: '17 giờ 00',
        weekday: 'Thứ 6',
        day: '27',
        monthYear: '11 - 2026',
        lunar: '( Tức ngày 19 tháng 10 năm Bính Ngọ )',
        place: 'Tư Gia Nhà Trai',
        address: ADDRESS_GROOM,
        /** Toạ độ ghim khách gửi (issue #25) */
        mapQuery: '20.64821434020996,106.31898498535156',
      },
    ],
  },

  calendar: {
    /** Ngày khoanh tim trên lịch — để null thì ẩn lịch */
    dateIso: '2026-11-27',
    photoCaption: 'My Love',
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
    /** false = tạm ẩn toàn bộ mục "Xác nhận tham dự & Gửi lời chúc" (nút mừng cưới vẫn hiện) */
    show: false,
    /** false = tạm ẩn ô xác nhận tham dự, chỉ nhận lời chúc */
    askAttend: true,
    title: 'Xác nhận tham dự',
    wishTitle: 'Gửi Lời Chúc',
    boxTitle: 'Gửi Lời Chúc Mừng',
    intro: 'Cảm ơn tất cả tình cảm mà mọi người đã dành cho chúng mình',
    guestOfOptions: ['Khách nhà trai', 'Khách nhà gái'],
    placeholders: {
      name: 'Họ và Tên',
      guestOf: 'Bạn là khách mời của ai ?',
      message: 'Nhập lời chúc của bạn:',
      attend: 'Xác nhận tham dự',
    },
    attendYes: 'Có, tôi sẽ đến',
    attendNo: 'Tiếc quá, hôm đấy mình không đến được',
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
        holder: 'NGUYEN HOAI AN',
        number: '0325101587',
        bank: 'MB Bank',
        /** Ảnh mã QR trong public/images/ — để null nếu không có */
        qr: '/images/qr-mb.png',
      },
    ],
  },

  album: {
    title: 'Album Hình Cưới',
  },

  thanks: {
    title: 'Thank you',
    text: 'Sự hiện diện của quý vị là niềm vinh hạnh cho gia đình chúng tôi!',
  },

  /** Nhạc nền — file đặt trong public/ (vd: public/music/music.mp3 → /music/music.mp3) */
  music: {
    src: '/music/vay-cuoi.mp3',
    /** 0–1 */
    volume: 0.45,
  },
};

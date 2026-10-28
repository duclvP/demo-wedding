/** Nội dung chữ — chỉnh sửa tại đây, không cần đụng layout */

const ADDRESS_GROOM = 'Quang Sơn, Thái Nguyên';
const ADDRESS_BRIDE = 'Đại Phúc, Thái Nguyên';

/** father / mother / address: để null nếu không muốn hiển thị */
// TODO: ticket #14 chưa có tên bố mẹ hai bên — hỏi lại khách
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
    names: ['Huyền Chi', 'Huy Hoàng'],
    /** Hai dòng dưới tên: ngày.tháng / năm */
    dateLines: ['17.11', '2026'],
    hint: 'NHẤP VÀO THIỆP ĐỂ MỞ',
  },

  families: {
    /** Hai khối gia đình, từ trên xuống theo thứ tự này */
    sides: [BRIDE_SIDE, GROOM_SIDE],
    /** Họ tên đầy đủ — dòng "Trân trọng báo tin lễ thành hôn của" */
    fullNames: ['Phan Huyền Chi', 'Vũ Huy Hoàng'],
  },

  invitation: {
    announce: ['Trân Trọng Báo Tin', 'Lễ Vu Quy', 'Của'],
    kicker: 'Trân Trọng Kính Mời',
    /** Tên khách mặc định — thay bằng link /hoa (→ Bạn Hoa), /co-lan (→ Cô Lan) hoặc ?khach=Tên%20Khách */
    defaultGuest: 'Quý khách',
    title: 'Tham Dự Lễ Vu Quy',
  },

  events: {
    venueTitle: 'Địa điểm tổ chức',
    mapLabel: 'Xem trên Google Map',
    items: [
      {
        id: 'vu-quy',
        title: null,
        // TODO: khách chỉ ghi "rước dâu 16h00 ngày 17/11" (không có địa chỉ, không có giờ tiệc nhà gái) — đang tạm dùng giờ này, hỏi lại khách
        hour: '16 giờ 00',
        weekday: 'Thứ 3',
        day: '17',
        monthYear: '11 - 2026',
        lunar: '( Tức ngày 09 tháng 10 năm Bính Ngọ )',
        place: 'Tư Gia Nhà Gái',
        // TODO: khách chỉ ghi "Đại Phúc, Thái Nguyên" — hỏi địa chỉ cụ thể (xóm / thôn)
        address: ADDRESS_BRIDE,
      },
    ],
  },

  calendar: {
    /** Ngày khoanh tim trên lịch — để null thì ẩn lịch */
    dateIso: '2026-11-17',
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
    // TODO: khách chưa gửi tài khoản / QR nhà gái — bản này tạm ẩn nút mừng cưới
    accounts: [],
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

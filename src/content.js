/** Nội dung chữ — chỉnh sửa tại đây, không cần đụng layout */

const ADDRESS_GROOM = 'Lô 80 Khu BĐ.4 Trường Sơn 2, Phường Nha Trang, Tỉnh Khánh Hòa';
const ADDRESS_BRIDE = 'Buôn Ea Pốc, Xã Quảng Phú, Tỉnh Đắk Lắk';

/** father / mother / address: để null nếu không muốn hiển thị */
const GROOM_SIDE = {
  label: 'Nhà Trai',
  father: 'Đào Văn Quảng',
  mother: 'Hồ Thị Kim Liên',
  address: ADDRESS_GROOM,
};
const BRIDE_SIDE = {
  label: 'Nhà Gái',
  father: 'Phan Long Lạc',
  mother: 'Nguyễn Thị Nở',
  address: ADDRESS_BRIDE,
};

export const content = {
  hero: {
    subtitle: 'Save The Date',
    /** Hiển thị theo đúng thứ tự này */
    names: ['Quang Hưng', 'Thị Long'],
    dateLine: '19 . 12 . 2026',
  },

  families: {
    /** Hai cột gia đình, hiển thị trái → phải theo thứ tự này */
    sides: [GROOM_SIDE, BRIDE_SIDE],
    /** Tên cô dâu & chú rể, hiện dưới phần gia đình */
    fullNames: ['Quang Hưng', 'Thị Long'],
  },

  invitation: {
    kicker: 'Trân Trọng Kính Mời',
    /** Tên khách mặc định — thay bằng link /hoa (→ Bạn Hoa), /co-lan (→ Cô Lan) hoặc ?khach=Tên%20Khách */
    defaultGuest: 'Quý khách',
    title: 'Tham Dự Lễ Thành Hôn',
    /** Chữ đè lên 3 ảnh */
    dateParts: ['19', '12', '2026'],
  },

  events: {
    mapLabel: 'Xem chỉ đường',
    items: [
      {
        id: 'le-thanh-hon',
        title: 'Lễ Thành Hôn',
        time: '09:00 - Thứ Bảy',
        date: '19. 12. 2026',
        lunar: '( Tức Ngày 11 Tháng 11 Năm Bính Ngọ )',
        places: [{ label: 'Tư Gia Nhà Trai', address: ADDRESS_GROOM }],
      },
      {
        id: 'tiec-cuoi',
        title: 'Tiệc Mừng Lễ Thành Hôn',
        time: '17:30 - Thứ Bảy',
        date: '19. 12. 2026',
        lunar: '( Tức Ngày 11 Tháng 11 Năm Bính Ngọ )',
        places: [
          {
            label: 'Sảnh Như Ý - Emerald Center',
            address: '03 Phong Châu, Nam Nha Trang, Tỉnh Khánh Hòa',
            mapQuery: 'Emerald Center, 03 Phong Châu, Nha Trang',
          },
        ],
      },
    ],
  },

  calendar: {
    title: 'Save The Date',
    /** Ngày được đánh dấu trên lịch — để null thì ẩn lịch */
    dateIso: null,
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
        holder: 'DAO QUANG HUNG',
        number: '88803091987',
        bank: 'TPBank',
        /** Ảnh mã QR trong public/images/ — để null nếu không có */
        qr: '/images/qr-tpbank.png',
      },
      {
        holder: 'PHAN THI LONG',
        number: '1015788082',
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
    src: '/music/ngoc-long.mp3',
    /** 0–1 */
    volume: 0.45,
  },
};

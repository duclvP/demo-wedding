/** Nội dung chữ — chỉnh sửa tại đây, không cần đụng layout */

const ADDRESS_GROOM = 'Nhà Văn Hoá Thôn Phong Hoà, Xã Đại Đồng, Tỉnh Nghệ An';
const ADDRESS_BRIDE = 'Thôn 4, Xã Kbang, Tỉnh Gia Lai';

/** father / mother / address: để null nếu không muốn hiển thị */
const GROOM_SIDE = {
  label: 'Nhà Trai',
  father: 'Nguyễn Duy Điền',
  mother: 'Nguyễn Thị Mai',
  address: ADDRESS_GROOM,
};
const BRIDE_SIDE = {
  label: 'Nhà Gái',
  father: 'Phan Duy Hiền',
  mother: 'Nguyễn Thị Tám',
  address: ADDRESS_BRIDE,
};

export const content = {
  hero: {
    subtitle: 'Save The Date',
    /** Hiển thị theo đúng thứ tự này */
    names: ['Duy Cường', 'Phan Nguyệt'],
    dateLine: '02 . 01 . 2027',
  },

  families: {
    /** Hai cột gia đình, hiển thị trái → phải theo thứ tự này */
    sides: [GROOM_SIDE, BRIDE_SIDE],
    /** Tên cô dâu & chú rể, hiện dưới phần gia đình */
    fullNames: ['Duy Cường', 'Phan Nguyệt'],
  },

  invitation: {
    kicker: 'Trân Trọng Kính Mời',
    /** Tên khách mặc định — thay bằng link /hoa (→ Bạn Hoa), /co-lan (→ Cô Lan) hoặc ?khach=Tên%20Khách */
    defaultGuest: 'Quý khách',
    title: 'Tham Dự Lễ Thành Hôn',
    /** Chữ đè lên 3 ảnh */
    dateParts: ['02', '01', '2027'],
  },

  events: {
    mapLabel: 'Xem chỉ đường',
    items: [
      {
        id: 'tiec-cuoi',
        title: 'Tiệc Mừng Lễ Thành Hôn',
        time: '10:30 - Thứ Bảy',
        date: '02. 01. 2027',
        lunar: '( Tức Ngày 25 Tháng 11 Năm Bính Ngọ )',
        places: [{ label: 'Nhà Văn Hoá Thôn Phong Hoà', address: 'Xã Đại Đồng, Tỉnh Nghệ An' }],
      },
    ],
  },

  calendar: {
    title: 'Save The Date',
    /** Ngày được đánh dấu trên lịch — để null thì ẩn lịch */
    dateIso: '2027-01-02',
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
        holder: 'NGUYEN DUY CUONG',
        number: '333322699999',
        bank: 'MB Bank',
        /** Ảnh mã QR trong public/images/ — để null nếu không có */
        qr: '/images/qr-mb.png',
      },
    ],
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

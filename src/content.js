/** Nội dung chữ — chỉnh sửa tại đây, không cần đụng layout (mẫu Hime: phong bì + thiệp chung hai họ) */

const ADDRESS_GROOM = 'Số Nhà 333, Thôn Quýt, Xã Yên Bài, TP. Hà Nội';
/** Địa chỉ cũ trước sáp nhập — để Google Maps tìm dễ hơn */
const MAP_GROOM = 'Thôn Quýt, Yên Bài, Ba Vì, Hà Nội';
const ADDRESS_BRIDE = 'Số Nhà 10, Thôn Hoắc Châu, Xã Cổ Đô, TP. Hà Nội';
/** Ghim Google Maps tư gia nhà gái (khách gửi) — nút chỉ đường mở đúng vị trí này */
const MAP_BRIDE = '21.267030,105.429795';

/** father / mother / address: để null nếu không muốn hiển thị */
const GROOM_SIDE = {
  label: 'Nhà Trai',
  father: 'Nguyễn Chiến Công',
  mother: 'Phùng Thị Nguyệt',
  address: ADDRESS_GROOM,
};
const BRIDE_SIDE = {
  label: 'Nhà Gái',
  father: 'Nguyễn Văn Thành',
  mother: 'Phùng Thị Dũng',
  address: ADDRESS_BRIDE,
};

export const content = {
  /** Màn phong bì đầu tiên — chạm dấu sáp để mở thiệp */
  envelope: {
    kicker: 'Trân Trọng Kính Mời !',
    dateLine: '28.11.2026',
    hint: 'Chạm để mở thiệp',
  },

  hero: {
    /** Tên ngắn trên ảnh bìa */
    shortNames: ['An', 'Ngọc'],
    subtitle: 'Save Our Date',
    dateLine: '28.11.2026',
  },

  families: {
    /** Hai cột gia đình, hiển thị trái → phải theo thứ tự này */
    sides: [GROOM_SIDE, BRIDE_SIDE],
    fatherLabel: 'Ông',
    motherLabel: 'Bà',
    /** Tên cô dâu & chú rể (chữ viết tay lớn) — cũng là dòng ký tên cuối thiệp */
    fullNames: ['Trường An', 'Hồng Ngọc'],
  },

  invitation: {
    kicker: 'Trân Trọng Kính Mời',
    /** Tên khách mặc định — thay bằng link /hoa (→ Bạn Hoa), /co-lan (→ Cô Lan) hoặc ?khach=Tên%20Khách */
    defaultGuest: 'Quý khách',
    title: 'Tham Dự Lễ Cưới Của Chúng Mình',
    /** Chữ viết tay đè lên ảnh ngang */
    photoText: 'Nhà Có Hỷ',
  },

  events: {
    mapLabel: 'Xem chỉ đường',
    items: [
      {
        id: 'tiec-nha-gai',
        title: 'Tiệc Cưới Nhà Gái',
        time: '16:00 - Thứ Sáu',
        date: '27.11.2026',
        lunar: '(Tức ngày 19 tháng 10 năm Bính Ngọ)',
        place: 'Tại Tư Gia Nhà Gái',
        address: ADDRESS_BRIDE,
        mapQuery: MAP_BRIDE,
      },
      {
        id: 'vu-quy',
        title: 'Lễ Vu Quy',
        time: '11:30 - Thứ Bảy',
        date: '28.11.2026',
        lunar: '(Tức ngày 20 tháng 10 năm Bính Ngọ)',
        place: 'Tại Tư Gia Nhà Gái',
        address: ADDRESS_BRIDE,
        mapQuery: MAP_BRIDE,
      },
      {
        id: 'thanh-hon',
        title: 'Lễ Thành Hôn',
        time: '13:00 - Thứ Bảy',
        date: '28.11.2026',
        lunar: '(Tức ngày 20 tháng 10 năm Bính Ngọ)',
        place: 'Tại Tư Gia Nhà Trai',
        address: ADDRESS_GROOM,
        mapQuery: MAP_GROOM,
      },
      {
        id: 'tiec-nha-trai',
        title: 'Tiệc Cưới Nhà Trai',
        time: '16:00 - Thứ Bảy',
        date: '28.11.2026',
        lunar: '(Tức ngày 20 tháng 10 năm Bính Ngọ)',
        place: 'Tại Tư Gia Nhà Trai',
        address: ADDRESS_GROOM,
        mapQuery: MAP_GROOM,
      },
    ],
  },

  /** Khối "Happy Wedding" + đếm ngược — để countdown: null thì ẩn bộ đếm */
  happy: {
    top: 'Happy',
    script: 'Wedding',
    quote:
      '"It\'s been said that you only truly fall in love once, but don\'t believe it. Every time I see you, I fall in love all over again!"',
  },
  countdown: {
    title: 'Countdown',
    /** Giờ Việt Nam (+07:00) — Lễ Thành Hôn 13:00 28/11/2026 */
    target: '2026-11-28T13:00:00+07:00',
    labels: ['Ngày', 'Giờ', 'Phút', 'Giây'],
  },

  rsvp: {
    /**
     * Link Web App của Google Apps Script — lời chúc sẽ lưu vào Google Sheets
     * và gửi email thông báo. Cách lấy link: xem google-apps-script/README.md
     * Để '' thì form chỉ hiện lời cảm ơn, không lưu gì.
     */
    endpoint: 'https://script.google.com/macros/s/AKfycbyVgetdZEbZ2Dyoj2wyLfoFgLCtf8ZWygbCTyG8fkShgGgKoNR9OFBqAk9XACnFCGwv/exec',
    /** false = tạm ẩn toàn bộ form gửi lời nhắn & xác nhận */
    show: true,
    /** false = tạm ẩn ô xác nhận tham dự & khách mời của ai, chỉ nhận lời nhắn */
    askAttend: true,
    intro:
      'Hãy xác nhận sự có mặt của bạn để chúng mình chuẩn bị đón tiếp một cách chu đáo nhất. Trân trọng!',
    placeholders: {
      name: 'Tên của bạn',
      message: 'Lời nhắn của bạn đến cô dâu, chú rể',
      guestOf: 'Bạn là khách mời của ai',
    },
    attendYes: 'Mình sẽ tham dự',
    attendNo: 'Thật tiếc mình bận mất rồi',
    guestOfOptions: ['Cô Dâu', 'Chú Rể'],
    submit: 'Gửi Lời Nhắn Và Xác Nhận',
    sending: 'Đang gửi...',
    error: 'Gửi chưa được, bạn kiểm tra mạng rồi thử lại nhé!',
    thanks: 'Cảm ơn bạn! Lời nhắn của bạn đã được ghi nhận.',
  },

  /** Mỗi tài khoản là một nút "Mừng cưới …" — để accounts: [] để ẩn */
  gift: {
    title: 'Hộp Quà Mừng Cưới',
    copyLabel: 'Copy STK',
    copiedLabel: 'Đã copy',
    saveQrLabel: 'Lưu ảnh QR',
    accounts: [
      {
        button: 'Mừng Cưới Nhà Trai',
        holder: 'NGUYEN TRUONG AN',
        number: '1252575141',
        bank: 'BIDV',
        /** Ảnh mã QR trong public/images/ — để null nếu không có */
        qr: '/images/qr-an.png',
      },
      {
        button: 'Mừng Cưới Nhà Gái',
        holder: 'NGUYEN THI HONG NGOC',
        number: '233087939',
        bank: 'VPBank',
        qr: '/images/qr-ngoc.png',
      },
    ],
  },

  album: {
    title: 'Our Album',
    subtitle: 'Captured With Love',
  },

  thanks: {
    text: 'Sự hiện diện của Quý khách là niềm vinh hạnh đối với gia đình chúng tôi. Xin chân thành cảm ơn!',
    title: 'Thank you!',
  },

  /** Nhạc nền — file đặt trong public/ (vd: public/music/music.mp3 → /music/music.mp3) */
  music: {
    /** "Em Đồng Ý (I Do)" — Đức Phúc x 911 */
    src: '/music/i-do.mp3',
    /** 0–1 */
    volume: 0.45,
  },
};

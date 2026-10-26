/** Nội dung chữ — chỉnh sửa tại đây, không cần đụng layout */

/** TODO: ticket chưa có địa chỉ nhà gái — hỏi lại khách */
const ADDRESS_BRIDE = null;
/** Địa chỉ duy nhất trong ticket (người đặt là mẹ chú rể) → coi là tư gia nhà trai */
const ADDRESS_GROOM = null; /* khách yêu cầu bỏ địa chỉ nhà trai */
const VENUE = 'Phân hiệu 1 (Trường Tiểu học Đình Bảng 2 cũ), Từ Sơn, Bắc Ninh';

/** father / mother / address: để null nếu không muốn hiển thị */
const BRIDE_SIDE = {
  label: 'Nhà Gái',
  father: 'Nguyễn Văn Cường',
  mother: 'Lê Ngọc Thi',
  address: ADDRESS_BRIDE,
};
const GROOM_SIDE = {
  label: 'Nhà Trai',
  father: 'Dương Quang Sơn',
  mother: 'Nguyễn Thị Tuyết Nhài',
  address: ADDRESS_GROOM,
};

export const content = {
  hero: {
    subtitle: 'Save The Date',
    /** Hiển thị theo đúng thứ tự này (bản nhà trai: chú rể trước) */
    names: ['Hùng Mạnh', 'Quỳnh Nhi'],
    dateLine: '28 . 11 . 2026',
    /** Câu tiếng Anh dưới chữ lồng */
    quote: 'With joy, our families warmly invite you to celebrate the wedding of our children.',
  },

  families: {
    /** Hai cột gia đình, hiển thị trái → phải theo thứ tự này */
    sides: [GROOM_SIDE, BRIDE_SIDE],
    /** Tên chú rể & cô dâu — dòng tên lớn giữa thiệp + ký tên cuối mục Thank You */
    fullNames: ['Hùng Mạnh', 'Quỳnh Nhi'],
  },

  invitation: {
    kicker: 'Trân Trọng Kính Mời',
    /** Tên khách mặc định — thay bằng link /hoa (→ Bạn Hoa), /co-lan (→ Cô Lan) hoặc ?khach=Tên%20Khách */
    defaultGuest: 'Quý khách',
    title: 'Tham Dự Tiệc Mừng Lễ Thành Hôn\nCủa Hai Con Chúng Tôi',
    /** Chữ đè lên 3 ảnh */
    dateParts: ['28', '11', '2026'],
  },

  events: {
    mapLabel: 'Xem chỉ đường',
    items: [
      {
        id: 'tiec-cuoi',
        /** Ngày chính khách được mời — làm nổi bật */
        highlight: true,
        badge: 'Ngày Dự Tiệc Cưới',
        title: 'Tiệc Cưới',
        time: '10:00, Thứ Bảy',
        date: '28. 11. 2026',
        lunar: '( Tức Ngày 20 Tháng 10 Năm Bính Ngọ )',
        places: [{ label: 'Trường Tiểu Học Từ Sơn 2', address: VENUE, mapQuery: 'Trường Tiểu học Đình Bảng 2, Từ Sơn, Bắc Ninh' }],
      },
      {
        id: 'ruoc-dau',
        /** Phụ: thu nhỏ để khách không nhầm với ngày tiệc 28/11 */
        compact: true,
        title: 'Lễ Rước Dâu',
        time: '09:10, Thứ Sáu',
        /** dd. mm. yyyy */
        date: '27. 11. 2026',
        lunar: '( Tức Ngày 19 Tháng 10 Năm Bính Ngọ )',
        /** Khách yêu cầu bỏ địa chỉ nhà trai → không hiện nơi rước dâu */
        places: [],
      },
    ],
  },

  /** Ảnh lớn có câu chữ viết tay */
  quoteImage: 'Two hearts, one love,\none beautiful journey',

  /** Lịch trình — tối đa 4 mốc trên đường cong; icon: bouquet | toast | rings | fork */
  timeline: {
    title: 'Timeline',
    /** Ngày nổi bật dưới tiêu đề — các mốc bên dưới chỉ ghi giờ */
    dateBadge: 'Thứ Bảy · 28.11.2026',
    items: [
      /** Chỉ các mốc ngày 28/11 (ngày khách dự tiệc) — bỏ rước dâu 27/11 để khỏi nhầm ngày */
      { time: '10:00', label: 'Đón khách', icon: 'toast' },
      { time: '10:30', label: 'Lễ thành hôn', icon: 'rings' },
      { time: '11:00', label: 'Khai tiệc', icon: 'fork' },
    ],
  },

  /** Bộ đếm ngược — để null thì ẩn */
  countdown: {
    title: 'Countdown',
    /** Giờ Việt Nam (+07:00) — Tiệc cưới đón khách 10:00 28/11/2026 */
    target: '2026-11-28T10:00:00+07:00',
    labels: ['Ngày', 'Giờ', 'Phút', 'Giây'],
  },

  calendar: {
    title: 'Save The Date',
    /** Ngày khoanh tim trên lịch tháng — để null thì ẩn lịch */
    dateIso: '2026-11-28',
  },

  moments: {
    title: ['Our', 'Moments'],
    captions: ['Forever', 'Love you'],
    text: "A collection of memories we've shared together",
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
    askAttend: true,
    title: 'Xác Nhận Tham Dự',
    intro: 'Hãy xác nhận tham dự để chúng mình chuẩn bị đón tiếp thật chu đáo. Trân Trọng!',
    placeholders: {
      name: 'Họ và Tên',
      message: 'Gửi lời chúc cho Dâu Rể',
      attend: 'Bạn có tham dự không ?',
      guestCount: 'Bạn đi bao nhiêu người ?',
    },
    attendYes: 'Có, mình sẽ đến',
    attendNo: 'Tiếc quá, hôm đấy mình bận mất rồi :(',
    submit: 'Xác Nhận',
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
    /** TODO: ticket chưa có QR / số tài khoản — hỏi lại khách */
    accounts: [],
  },

  thanks: {
    title: 'Thank You',
    /** Lời cảm ơn của bố mẹ hai bên (thiệp do bố mẹ mời) */
    text: 'Thay mặt gia đình hai họ, xin gửi lời cảm ơn sâu sắc nhất tới Quý khách đã đến chung vui và chúc phúc trong ngày trọng đại của hai con chúng tôi. Vợ chồng tôi xin chân thành cảm ơn.',
    sign: 'Dương Quang Sơn - Nguyễn Thị Tuyết Nhài',
  },

  /** Nhạc nền — file đặt trong public/ (vd: public/music/music.mp3 → /music/music.mp3) */
  music: {
    src: '/music/beautiful-in-white.mp3',
    /** 0–1 */
    volume: 0.45,
  },
};

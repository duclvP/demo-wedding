/** Nội dung chữ — chỉnh sửa tại đây, không cần đụng layout */

const ADDRESS_BRIDE = '382 Ngô Quyền, Phường Lào Cai, Thành phố Lào Cai';
const ADDRESS_GROOM = 'Xã Chất Bình, Tỉnh Ninh Bình';

/** father / mother / address: để null nếu không muốn hiển thị */
const BRIDE_SIDE = {
  label: 'Nhà Gái',
  father: 'Vũ Văn Đông',
  mother: 'Nguyễn Thị Vang',
  address: ADDRESS_BRIDE,
};
const GROOM_SIDE = {
  label: 'Nhà Trai',
  father: 'Trần Văn Phong',
  mother: 'Đỗ Thị Bích',
  address: ADDRESS_GROOM,
};

export const content = {
  hero: {
    subtitle: 'Save The Date',
    /** Hiển thị theo đúng thứ tự này (bản nhà trai: chú rể trước) */
    names: ['Xuân Bình', 'Huyền Trang'],
    dateLine: '14 . 11 . 2026',
    /** Câu tiếng Anh dưới chữ lồng */
    quote: 'We step into a new chapter together, hand in hand, ready to build our home and embrace a lifetime of love.',
  },

  families: {
    /** Hai cột gia đình, hiển thị trái → phải theo thứ tự này */
    sides: [GROOM_SIDE, BRIDE_SIDE],
    /** Tên chú rể & cô dâu — dòng tên lớn giữa thiệp */
    fullNames: ['Xuân Bình', 'Huyền Trang'],
  },

  invitation: {
    kicker: 'Trân Trọng Kính Mời',
    /** Tên khách mặc định — thay bằng link /hoa (→ Bạn Hoa), /co-lan (→ Cô Lan) hoặc ?khach=Tên%20Khách */
    defaultGuest: 'Quý khách',
    title: 'Tham Dự Tiệc Mừng Lễ Thành Hôn\nCủa Hai Con Chúng Tôi',
    /** Chữ đè lên 3 ảnh */
    dateParts: ['14', '11', '2026'],
  },

  events: {
    mapLabel: 'Xem chỉ đường',
    items: [
      {
        id: 'tiec-thanh-hon',
        title: 'Tiệc Mừng Lễ Thành Hôn',
        time: '10:00, Thứ Bảy',
        /** dd. mm. yyyy */
        date: '14. 11. 2026',
        lunar: '( Tức Ngày 06 Tháng 10 Năm Bính Ngọ )',
        /** Toạ độ ghim khách gửi (issue #32) */
        places: [{ label: 'Tư Gia Nhà Trai', address: ADDRESS_GROOM, mapQuery: '20.128537,106.125285' }],
      },
      {
        id: 'thanh-hon',
        /** Cùng ngày, cùng nơi với tiệc → thu nhỏ, không lặp ô ngày lớn */
        compact: true,
        title: 'Lễ Thành Hôn',
        time: '09:00, Thứ Bảy',
        date: '14. 11. 2026',
        lunar: '( Tức Ngày 06 Tháng 10 Năm Bính Ngọ )',
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
    dateBadge: 'Thứ Bảy · 14.11.2026',
    items: [
      { time: '09:00', label: 'Lễ Thành Hôn', icon: 'rings' },
      { time: '10:00', label: 'Khai Tiệc', icon: 'fork' },
    ],
  },

  /** Bộ đếm ngược — để null thì ẩn */
  countdown: {
    title: 'Countdown',
    /** Giờ Việt Nam (+07:00) — Tiệc Mừng Lễ Thành Hôn 10:00 14/11/2026 */
    target: '2026-11-14T10:00:00+07:00',
    labels: ['Ngày', 'Giờ', 'Phút', 'Giây'],
  },

  calendar: {
    title: 'Save The Date',
    /** Ngày khoanh tim trên lịch tháng — để null thì ẩn lịch */
    dateIso: '2026-11-14',
  },

  moments: {
    title: ['Our', 'Moments'],
    captions: ['Forever', 'Love you'],
    text: "A collection of memories we've shared together",
  },

  rsvp: {
    /**
     * Link Web App của Google Apps Script dùng chung — lời chúc lưu vào Sheet riêng của thiệp
     * (theo coupleId) và gửi email thông báo. Xem google-apps-script/README.md
     * Để '' thì form chỉ hiện lời cảm ơn, không lưu gì.
     */
    endpoint: 'https://script.google.com/macros/s/AKfycbxGFb49383QZuzEF1D_sx_JSNSCecscN3j2aZShNuCGpbDiKK9bwoPawGo5Y_pKbacu/exec',
    /** Slug riêng của thiệp trong script dùng chung — không đổi sau khi đã có lời chúc */
    coupleId: 'xuan-binh-huyen-trang-nha-trai',
    coupleName: 'Xuân Bình & Huyền Trang (nhà trai)',
    /** false = tạm ẩn toàn bộ form gửi lời chúc & xác nhận */
    show: true,
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
    /** QR chú rể gửi — đã giải mã: BIN 970422 (MB Bank), STK khớp chữ trên ảnh */
    accounts: [
      {
        holder: 'TRAN XUAN BINH',
        number: '0560126105008',
        bank: 'MB Bank',
        qr: '/images/qr-mb.png',
      },
    ],
  },

  thanks: {
    title: 'Thank You',
    text: 'Từ tận đáy lòng, chúng mình cảm ơn bạn đã dành tình cảm và sự hiện diện cho ngày vui này. Chính bạn đã góp phần làm nên một kỷ niệm hạnh phúc mà chúng mình sẽ luôn trân trọng.',
    sign: 'Xuân Bình & Huyền Trang',
  },

  /** Nhạc nền — file đặt trong public/ (vd: public/music/music.mp3 → /music/music.mp3) */
  music: {
    src: '/music/beautiful-in-white.mp3',
    /** 0–1 */
    volume: 0.45,
  },
};

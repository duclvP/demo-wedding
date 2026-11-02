/** Nội dung chữ — chỉnh sửa tại đây, không cần đụng layout */

/** Địa chỉ nhà gái theo ticket (issue #34): "52 ấp Bắc xã Tân Thạnh đồng tháp" */
const ADDRESS_BRIDE = '52 Ấp Bắc, Xã Tân Thạnh, Tỉnh Đồng Tháp';

/** father / mother: để null nếu không muốn hiển thị — cả hai bên đều null thì ẩn mục Nhà Gái / Nhà Trai */
/** TODO: ticket chưa có tên bố mẹ hai bên */
const BRIDE_SIDE = {
  label: 'Nhà Gái',
  father: null,
  mother: null,
};
const GROOM_SIDE = {
  label: 'Nhà Trai',
  father: null,
  mother: null,
};

export const content = {
  hero: {
    /** Hiển thị theo đúng thứ tự này (bản nhà gái: cô dâu trước) */
    names: ['Diễm My', 'Thanh Toản'],
    dateLine: '28. 11. 2026',
  },

  /** Ảnh dọc + chữ DARLING; mỗi dòng: [chữ ngoài ảnh, chữ trắng trên ảnh] */
  darling: {
    title: 'Darling',
    lines: [
      ['Could you be', 'my light in the dark?'],
      ['So I can be', 'your Morning star'],
      ['Wake up you, Fight next to you. In my arms.'],
    ],
  },

  families: {
    /** Hai cột gia đình, hiển thị trái → phải theo thứ tự này */
    sides: [BRIDE_SIDE, GROOM_SIDE],
    /** Họ tên cô dâu & chú rể — dòng tên viết tay giữa thiệp */
    fullNames: ['Lê Thị Diễm My', 'Vũ Thanh Toản'],
  },

  invitation: {
    kicker: 'Trân Trọng Kính Mời',
    /** Tên khách mặc định — thay bằng link /hoa (→ Bạn Hoa), /co-lan (→ Cô Lan) hoặc ?khach=Tên%20Khách */
    defaultGuest: 'Quý khách',
    title: 'Tham Dự Buổi Tiệc Cưới Cùng\nGia Đình Chúng Tôi',
  },

  events: {
    mapLabel: 'Xem chỉ đường',
    items: [
      {
        id: 'tiec-cuoi',
        /** Một sự kiện thì để null như mẫu (tiêu đề đã nằm trong lời mời) */
        title: null,
        time: '10:00, Thứ Bảy',
        /** dd. mm. yyyy */
        date: '28. 11. 2026',
        lunar: '( Nhằm Ngày 20 Tháng 10 Năm Bính Ngọ )',
        /** TODO: chưa có ghim bản đồ — chỉ đường đang tìm theo chữ địa chỉ */
        places: [{ label: 'Tư Gia Nhà Gái', address: ADDRESS_BRIDE }],
      },
    ],
  },

  romantic: { title: 'Romantic', word: 'Love' },

  /**
   * Lịch trình — tối đa 4 mốc trên đường cong; icon: bouquet | rings | toast | disco.
   * TODO: ticket chỉ có giờ tiệc 10:00, không đón dâu → để null (ẩn) tới khi khách gửi lịch trình
   */
  timeline: null,

  /** Bộ đếm ngược — để null thì ẩn */
  countdown: {
    title: 'Countdown',
    /** Giờ Việt Nam (+07:00) — tiệc cưới 10:00 28/11/2026 */
    target: '2026-11-28T10:00:00+07:00',
    labels: ['Ngày', 'Giờ', 'Phút', 'Giây'],
  },

  calendar: {
    /** Ngày in trên tim vân tay ở lịch tháng — để null thì ẩn lịch */
    dateIso: '2026-11-28',
  },

  story: {
    title: 'Romantic',
    subtitle: 'Love Story',
    tagline: 'never have endings',
    caption: 'only my love',
    word: 'Love',
    quote: ['"Being deeply loved by someone\ngives you strength,', 'while loving someone deeply gives\nyou courage."'],
  },

  rsvp: {
    /**
     * Link Web App của Google Apps Script dùng chung — lời chúc lưu vào Sheet riêng của thiệp
     * (theo coupleId) và gửi email thông báo. Xem google-apps-script/README.md
     * Để '' thì form chỉ hiện lời cảm ơn, không lưu gì.
     */
    endpoint: 'https://script.google.com/macros/s/AKfycbxGFb49383QZuzEF1D_sx_JSNSCecscN3j2aZShNuCGpbDiKK9bwoPawGo5Y_pKbacu/exec',
    /** Slug riêng của thiệp trong script dùng chung — không đổi sau khi đã có lời chúc */
    coupleId: 'diem-my-thanh-toan-nha-gai',
    coupleName: 'Diễm My & Thanh Toản (nhà gái)',
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
    attendNo: 'Tiếc quá, hôm đấy mình không đến được :((',
    submit: 'Xác Nhận & Gửi Lời Chúc',
    sending: 'Đang gửi...',
    error: 'Gửi chưa được, bạn kiểm tra mạng rồi thử lại nhé!',
    thanks: 'Cảm ơn bạn! Lời chúc của bạn đã được ghi nhận.',
  },

  /** Hộp mừng cưới — để accounts: [] để ẩn nút "Gửi quà mừng cưới" */
  gift: {
    button: 'Gửi Quà Mừng Cưới',
    title: 'Hộp Quà Mừng Cưới',
    copyLabel: 'Copy STK',
    copiedLabel: 'Đã copy',
    saveQrLabel: 'Lưu ảnh QR',
    /** Ticket ghi "Kh QR" — chưa có tài khoản */
    accounts: [],
  },

  thanks: {
    title: 'Thank You',
    text: 'Từ tận đáy lòng, chúng mình cảm ơn bạn đã dành tình cảm và sự hiện diện cho ngày vui này. Chính bạn đã góp phần làm nên một kỷ niệm hạnh phúc mà chúng mình sẽ luôn trân trọng.',
    sign: 'Diễm My & Thanh Toản',
  },

  /** Nhạc nền — file đặt trong public/ (vd: public/music/music.mp3 → /music/music.mp3) */
  music: {
    src: '/music/beautiful-in-white.mp3',
    /** 0–1 */
    volume: 0.45,
  },
};

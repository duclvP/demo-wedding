/** Nội dung chữ — chỉnh sửa tại đây, không cần đụng layout */

const ADDRESS_BRIDE = '382 Ngô Quyền, Phường Lào Cai, Thành phố Lào Cai';
const ADDRESS_GROOM = 'Xã Chất Bình, Tỉnh Ninh Bình';
/** Nơi tổ chức Lễ Vu Quy — ghi theo thiệp giấy của khách */
const VENUE_BRIDE = 'Đường Ngô Quyền, Kim Tân, Phường Lào Cai, Tỉnh Lào Cai';

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
    /** Hiển thị theo đúng thứ tự này (bản nhà gái: cô dâu trước) */
    names: ['Huyền Trang', 'Xuân Bình'],
    dateLine: '13 . 11 . 2026',
    /** Câu tiếng Anh dưới chữ lồng */
    quote: 'We step into a new chapter together, hand in hand, ready to build our home and embrace a lifetime of love.',
  },

  families: {
    /** Hai cột gia đình, hiển thị trái → phải theo thứ tự này */
    sides: [BRIDE_SIDE, GROOM_SIDE],
    /** Tên cô dâu & chú rể — dòng tên lớn giữa thiệp */
    fullNames: ['Huyền Trang', 'Xuân Bình'],
  },

  invitation: {
    kicker: 'Trân Trọng Kính Mời',
    /** Tên khách mặc định — thay bằng link /hoa (→ Bạn Hoa), /co-lan (→ Cô Lan) hoặc ?khach=Tên%20Khách */
    defaultGuest: 'Quý khách',
    title: 'Tham Dự Lễ Vu Quy\nCủa Hai Con Chúng Tôi',
    /** Chữ đè lên 3 ảnh */
    dateParts: ['13', '11', '2026'],
  },

  events: {
    mapLabel: 'Xem chỉ đường',
    items: [
      {
        id: 'vu-quy',
        title: 'Tiệc Mừng Lễ Vu Quy',
        /** Giờ theo thiệp giấy ("Vào hồi 10 giờ 30") — chữ gõ trong ticket ghi lễ 9h00, tiệc 10h00 */
        time: '10:30, Thứ Sáu',
        /** dd. mm. yyyy */
        date: '13. 11. 2026',
        lunar: '( Tức Ngày 05 Tháng 10 Năm Bính Ngọ )',
        places: [{ label: 'Quảng Trường Tráng A Pao', address: VENUE_BRIDE, mapQuery: 'Quảng trường Tráng A Pao, Lào Cai' }],
      },
      {
        id: 'thanh-hon',
        title: 'Lễ Thành Hôn',
        time: '09:00, Thứ Bảy',
        date: '14. 11. 2026',
        lunar: '( Tức Ngày 06 Tháng 10 Năm Bính Ngọ )',
        /** mapQuery theo địa giới cũ (xã Chất Bình, huyện Kim Sơn) cho bản đồ dễ tìm */
        places: [{ label: 'Tư Gia Nhà Trai', address: ADDRESS_GROOM, mapQuery: 'Chất Bình, Kim Sơn, Ninh Bình' }],
      },
    ],
  },

  /** Ảnh lớn có câu chữ viết tay */
  quoteImage: 'Two hearts, one love,\none beautiful journey',

  /** Lịch trình — tối đa 4 mốc trên đường cong; icon: bouquet | toast | rings | fork */
  timeline: {
    title: 'Timeline',
    items: [
      { time: '10:30 - 13/11', label: 'Lễ Vu Quy', icon: 'bouquet' },
      { time: '09:00 - 14/11', label: 'Lễ Thành Hôn', icon: 'rings' },
    ],
  },

  /** Bộ đếm ngược — để null thì ẩn */
  countdown: {
    title: 'Countdown',
    /** Giờ Việt Nam (+07:00) — Tiệc Mừng Lễ Vu Quy 10:30 13/11/2026 */
    target: '2026-11-13T10:30:00+07:00',
    labels: ['Ngày', 'Giờ', 'Phút', 'Giây'],
  },

  calendar: {
    title: 'Save The Date',
    /** Ngày khoanh tim trên lịch tháng — để null thì ẩn lịch */
    dateIso: '2026-11-13',
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
    coupleId: 'huyen-trang-xuan-binh-nha-gai',
    coupleName: 'Huyền Trang & Xuân Bình (nhà gái)',
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
    /** TODO: ticket chưa có QR / số tài khoản — hỏi lại khách */
    accounts: [],
  },

  thanks: {
    title: 'Thank You',
    text: 'Từ tận đáy lòng, chúng mình cảm ơn bạn đã dành tình cảm và sự hiện diện cho ngày vui này. Chính bạn đã góp phần làm nên một kỷ niệm hạnh phúc mà chúng mình sẽ luôn trân trọng.',
    sign: 'Huyền Trang & Xuân Bình',
  },

  /** Nhạc nền — file đặt trong public/ (vd: public/music/music.mp3 → /music/music.mp3) */
  music: {
    src: '/music/beautiful-in-white.mp3',
    /** 0–1 */
    volume: 0.45,
  },
};

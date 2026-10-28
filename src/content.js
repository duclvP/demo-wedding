/** Nội dung chữ — chỉnh sửa tại đây, không cần đụng layout */

const ADDRESS_GROOM = 'Lô 30 Cụm Công Nghiệp Phú Túc, Phượng Dực, Hà Nội';
const ADDRESS_BRIDE = 'Xóm 3, Thôn Lưu Thượng, Phượng Dực, Hà Nội';
/** Link Google Maps khách gửi: nhà trai → Công ty TNHH Phú Ưng (CCN Phú Túc), nhà gái → gần Đình Lưu Thượng */
const MAP_GROOM = 'https://maps.app.goo.gl/wX8XudTSRfDiRnim7';
const MAP_BRIDE = 'https://maps.app.goo.gl/CXUS2s1doVrYYmNbA';

/** father / mother / address: để null nếu không muốn hiển thị */
// TODO: ticket #30 chưa có tên bố mẹ hai bên — hỏi lại khách (vd 'Ông Trần Văn A', 'Bà Nguyễn Thị B')
const GROOM_SIDE = {
  label: 'Nhà Trai',
  father: null,
  mother: null,
  address: ADDRESS_GROOM,
  mapLink: MAP_GROOM,
};
const BRIDE_SIDE = {
  label: 'Nhà Gái',
  father: null,
  mother: null,
  address: ADDRESS_BRIDE,
  mapLink: MAP_BRIDE,
};

export const content = {
  hero: {
    /** Hai tên in hoa đầu thiệp, dòng tên ở lời mời và ký tên thư cảm ơn — theo đúng thứ tự này */
    names: ['Tuấn Anh', 'Trần Ly'],
    storyTitle: 'Love Story',
    story:
      'From a chance meeting to a lifetime promise, our love story is written with laughter, trust, and the joy of finding each other.',
  },

  families: {
    /** Cột trái → phải */
    sides: [GROOM_SIDE, BRIDE_SIDE],
  },

  invitation: {
    /** Dòng mời: "<before> <tên khách> <after>" */
    before: 'Trân trọng kính mời',
    after: 'tới tham dự buổi tiệc cưới cùng gia đình chúng tôi',
    /** Tên khách mặc định — thay bằng link /hoa (→ Bạn Hoa), /co-lan (→ Cô Lan) hoặc ?khach=Tên%20Khách */
    defaultGuest: 'Bạn',
  },

  events: {
    mapLabel: 'Xem chỉ đường',
    /** Sự kiện đầu tiên là ngày chính: ngày xếp dọc đầu thiệp, lịch */
    items: [
      {
        id: 'thanh-hon',
        title: 'Tiệc Mừng Lễ Thành Hôn',
        time: '09:00 | Chủ Nhật',
        date: '29. 11. 2026',
        lunar: '(21 tháng 10 năm Bính Ngọ)',
        placeLabel: 'Tại địa điểm',
        place: 'Nhà Trai',
        address: ADDRESS_GROOM,
        mapLink: MAP_GROOM,
      },
    ],
  },

  /** Các mốc trong ngày — followsEvent: khách đổi giờ sự kiện đó qua link thì các mốc dời theo */
  timeline: {
    title: 'Timeline',
    followsEvent: 'thanh-hon',
    /** icon: guests | dinner | music | car | rings */
    items: [
      { time: '09:00', label: 'Đón khách', icon: 'guests' },
      { time: '10:00', label: 'Nhập tiệc', icon: 'dinner' },
      { time: '13:00', label: 'Lễ thành hôn', icon: 'rings' },
    ],
  },

  /** Màu trang phục gợi ý — để [] thì ẩn mục Dresscode */
  dresscode: {
    title: 'Dresscode',
    colors: [],
  },

  calendar: {
    /** Lịch tháng của ngày chính (sự kiện đầu tiên) — false thì ẩn */
    show: true,
  },

  destiny: 'Destiny',

  album: {
    title: 'Album',
  },

  letter: {
    title: 'Trân trọng cảm ơn !',
    paragraphs: [
      'Chúng tôi rất vui khi được mời bạn đến dự lễ cưới của Tuấn Anh và Ly – một dấu mốc ý nghĩa trong hành trình chung đôi.',
      'Sẽ thật hạnh phúc nếu bạn có thể đến chung vui và cùng lưu giữ những khoảnh khắc đáng nhớ trong ngày đặc biệt này.',
      'Rất mong bạn có thể thu xếp thời gian đến tham dự và cùng chúc phúc cho chúng tôi.',
    ],
    closing: 'Thân,',
  },

  rsvp: {
    /**
     * Link Web App của Google Apps Script dùng chung — lời chúc lưu vào Google Sheet riêng của cặp đôi
     * (theo coupleId) và gửi email thông báo. Xem google-apps-script/README.md
     */
    endpoint: 'https://script.google.com/macros/s/AKfycbxGFb49383QZuzEF1D_sx_JSNSCecscN3j2aZShNuCGpbDiKK9bwoPawGo5Y_pKbacu/exec',
    /** Mã cặp đôi — không đổi sau khi đã có lời chúc (mất liên kết với Sheet cũ) */
    coupleId: 'tran-ly-tuan-anh-nha-trai',
    /** Tên Sheet */
    coupleName: 'Tuấn Anh & Trần Ly (nhà trai)',
    /** false = tạm ẩn form (nút mừng cưới vẫn hiện) */
    show: true,
    /** false = tạm ẩn ô xác nhận tham dự, chỉ nhận lời chúc */
    askAttend: true,
    intro: 'Vui lòng xác nhận sự tham dự của bạn để chúng mình chuẩn bị đón tiếp một cách chu đáo nhất.\nTrân trọng cảm ơn!',
    placeholders: {
      name: 'Tên của bạn',
      message: 'Gửi lời chúc đến cô dâu chú rể',
      attend: 'Xác nhận tham dự?',
      guestCount: 'Bạn đi mấy người?',
    },
    attendYes: 'Tôi sẽ tham dự',
    attendNo: 'Xin lỗi, tôi không thể tham dự',
    submit: 'Xác nhận',
    sending: 'Đang gửi...',
    error: 'Gửi chưa được, bạn kiểm tra mạng rồi thử lại nhé!',
    thanks: 'Cảm ơn bạn! Lời chúc của bạn đã được ghi nhận.',
  },

  /** Hộp mừng cưới — để accounts: [] để ẩn nút */
  gift: {
    button: 'Gửi quà mừng cưới',
    title: 'Hộp Quà Mừng Cưới',
    copyLabel: 'Copy STK',
    copiedLabel: 'Đã copy',
    saveQrLabel: 'Lưu ảnh QR',
    accounts: [
      {
        holder: 'TRAN TUAN ANH',
        number: '32369999999',
        bank: 'Techcombank',
        /** Ảnh mã QR trong public/images/ — để null nếu không có */
        qr: '/images/qr-techcombank.png',
      },
    ],
  },

  thanks: {
    title: 'Thank you!',
  },

  /** Nhạc nền — file đặt trong public/ (vd: public/music/music.mp3 → /music/music.mp3) */
  music: {
    src: '/music/vay-cuoi.mp3',
    /** 0–1 */
    volume: 0.45,
  },
};

/**
 * Nội dung chữ — chỉnh sửa tại đây, không cần đụng layout.
 * BẢN DEMO mẫu "vé máy bay" (lovecard.click/vemaybay): tên, địa chỉ, ngày đều là dữ liệu mẫu.
 */

const ADDRESS_BRIDE = 'Số 12, đường Hoa Sữa, phường Demo, TP. Hà Nội';
const ADDRESS_GROOM = 'Số 88, phố Mẫu Thử, phường Demo, TP. Hà Nội';

/** father / mother / address: để null nếu không muốn hiển thị */
const BRIDE_SIDE = {
  label: 'Nhà Gái',
  father: 'Nguyễn Văn An',
  mother: 'Trần Thị Bình',
  address: 'TP. Hà Nội',
};
const GROOM_SIDE = {
  label: 'Nhà Trai',
  father: 'Lê Văn Cường',
  mother: 'Phạm Thị Dung',
  address: 'TP. Hà Nội',
};

export const content = {
  /** Màn đóng: tấm vé "Boarding pass" — bấm để mở */
  cover: {
    header: 'Boarding pass to our wedding',
    title: ['Passport', 'Wedding Invitation'],
    /** Tên ngắn in hoa trên cuống vé (thứ tự như hero.names) */
    names: ['Minh Anh', 'Gia Bảo'],
    date: '20/12/2026',
    hint: 'Nhấn vào passport để mở',
  },

  hero: {
    /** Tên trên hộ chiếu (trên, dưới) */
    names: ['Minh Anh', 'Gia Bảo'],
    /** Hai dòng chữ máy dưới tên */
    lines: ['Destination: Marriage', 'Boarding date: 20/12/2026'],
  },

  /** Hai thẻ ảnh treo kẹp giấy "Chú rể | Cô dâu" */
  couple: {
    groom: { role: 'Chú rể', name: 'Gia Bảo' },
    bride: { role: 'Cô dâu', name: 'Minh Anh' },
  },

  families: {
    title: 'Boarding Pass',
    /** Hai cột gia đình, hiển thị trái → phải theo thứ tự này */
    sides: [BRIDE_SIDE, GROOM_SIDE],
    /** Tên đầy đủ hai người — hiển thị dưới lời mời (trên, dưới) và ký tên cuối Thank You */
    fullNames: ['Nguyễn Minh Anh', 'Lê Gia Bảo'],
  },

  invitation: {
    kicker: 'Trân Trọng Kính Mời',
    /** Tên khách mặc định — thay bằng link /hoa (→ Bạn Hoa), /co-lan (→ Cô Lan) hoặc ?khach=Tên%20Khách */
    defaultGuest: 'Quý khách',
    title: ['Tham dự tiệc chung vui', 'của gia đình chúng tôi'],
  },

  events: {
    mapLabel: 'Xem chỉ đường',
    items: [
      {
        id: 'tiec-nha-gai',
        title: 'Tiệc Chung Vui',
        time: 'Vào lúc 17 giờ 30 - Thứ Bảy',
        date: '19. 12. 2026',
        lunar: '( Tức Ngày 11 Tháng 11 Năm Bính Ngọ )',
        place: 'Tư Gia Nhà Gái',
        address: ADDRESS_BRIDE,
        mapQuery: 'Hồ Gươm, Hà Nội',
      },
      {
        id: 'thanh-hon',
        title: 'Lễ Thành Hôn',
        time: 'Vào lúc 10 giờ 00 - Chủ Nhật',
        date: '20. 12. 2026',
        lunar: '( Tức Ngày 12 Tháng 11 Năm Bính Ngọ )',
        place: 'Tư Gia Nhà Trai',
        address: ADDRESS_GROOM,
        mapQuery: 'Hồ Tây, Hà Nội',
      },
    ],
  },

  /** Đường bay "Timeline" — icon: camera | cheers | music | rings */
  timeline: {
    title: 'Timeline',
    items: [
      { time: '17:30 - 19/12', label: 'Đón Khách', icon: 'camera' },
      { time: '18:00 - 19/12', label: 'Khai Tiệc', icon: 'cheers' },
      { time: '19:30 - 19/12', label: 'After party', icon: 'music' },
      { time: '09:30 - 20/12', label: 'Đón Khách', icon: 'camera' },
      { time: '10:00 - 20/12', label: 'Làm Lễ', icon: 'rings' },
      { time: '11:00 - 20/12', label: 'Khai Tiệc', icon: 'cheers' },
    ],
  },

  /** Dresscode — để null thì ẩn */
  dresscode: {
    title: 'Dresscode',
    colors: ['#fffdd0', '#c8f0d8', '#ffd1dc', '#ffffff'],
  },

  /** Bộ đếm ngược — để null thì ẩn */
  countdown: {
    title: 'Countdown',
    /** Giờ Việt Nam (+07:00) — Lễ Thành Hôn 10:00 20/12/2026 */
    target: '2026-12-20T10:00:00+07:00',
    labels: ['Ngày', 'Giờ', 'Phút', 'Giây'],
  },

  calendar: {
    /** Ngày đóng dấu "Love Visa" trên lịch tháng — để null thì ẩn lịch */
    dateIso: '2026-12-20',
  },

  journey: 'Love is a journey',
  album: { title: 'Album of Love' },

  rsvp: {
    /**
     * Link Web App của Google Apps Script dùng chung — lời chúc lưu vào Google Sheets
     * riêng theo coupleId. Xem google-apps-script/README.md
     */
    endpoint: 'https://script.google.com/macros/s/AKfycbxGFb49383QZuzEF1D_sx_JSNSCecscN3j2aZShNuCGpbDiKK9bwoPawGo5Y_pKbacu/exec',
    /** Mã cặp đôi (duy nhất) — bản demo */
    coupleId: 'demo-vemaybay',
    coupleName: 'Demo vé máy bay — Minh Anh & Gia Bảo',
    /** false = tạm ẩn toàn bộ form gửi lời chúc & xác nhận */
    show: true,
    /** false = tạm ẩn ô xác nhận tham dự & số người, chỉ nhận lời chúc */
    askAttend: true,
    title: 'Xác Nhận & Gửi Lời Chúc',
    placeholders: {
      name: 'Họ và Tên',
      message: 'Gửi lời chúc cho dâu, rể',
      attend: 'Xác nhận tham dự ?',
      guestCount: 'Bạn đi bao nhiêu người',
    },
    attendYes: 'Có, mình sẽ đến',
    attendNo: 'Tiếc quá, hôm đấy mình không đến được :((',
    submit: 'Gửi Xác Nhận',
    subtitle: 'Hãy xác nhận tham dự để chúng mình chuẩn bị đón tiếp thật chu đáo. Trân Trọng!',
    sending: 'Đang gửi...',
    error: 'Gửi chưa được, bạn kiểm tra mạng rồi thử lại nhé!',
    thanks: 'Cảm ơn bạn! Lời chúc của bạn đã được ghi nhận.',
  },

  /** Hộp mừng cưới — accounts: [] để ẩn nút "Gửi mừng cưới" (bản demo không có tài khoản) */
  gift: {
    button: 'Gửi Mừng Cưới',
    title: 'Hộp Quà Mừng Cưới',
    copyLabel: 'Copy STK',
    copiedLabel: 'Đã copy',
    saveQrLabel: 'Lưu ảnh QR',
    accounts: [],
  },

  thanks: {
    title: 'Thank You',
    text: 'Từ tận đáy lòng, chúng mình cảm ơn bạn đã dành tình cảm và sự hiện diện cho ngày vui này. Chính bạn đã góp phần làm nên một kỷ niệm hạnh phúc mà chúng mình sẽ luôn trân trọng.',
  },

  /** Nhạc nền — file đặt trong public/ (vd: public/music/music.mp3 → /music/music.mp3) */
  music: {
    src: '/music/beautiful-in-white.mp3',
    /** 0–1 */
    volume: 0.45,
  },
};

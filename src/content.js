/**
 * Nội dung chữ — chỉnh sửa tại đây, không cần đụng layout.
 * Mẫu "vé máy bay" (lovecard.click/vemaybay, giao diện lấy từ nhánh demo_vemaybay) — issue #28.
 */

/** Địa chỉ theo ticket: nhà trai "Thôn Đồng Kẻng - xã Quảng Yên (khu 5 Đại An cũ)", nhà gái "thôn Ngọc Am - xã Chí Tiên - Phú Thọ" */
const ADDRESS_GROOM = 'Thôn Đồng Kẻng, Xã Quảng Yên, Tỉnh Phú Thọ';
const ADDRESS_BRIDE = 'Thôn Ngọc Am, Xã Chí Tiên, Tỉnh Phú Thọ';

/**
 * father / mother / address: để null nếu không muốn hiển thị.
 * TODO: ticket chưa có tên bố mẹ hai bên
 */
const GROOM_SIDE = {
  label: 'Nhà Trai',
  father: null,
  mother: null,
  address: 'Xã Quảng Yên, Phú Thọ',
};
const BRIDE_SIDE = {
  label: 'Nhà Gái',
  father: null,
  mother: null,
  address: 'Xã Chí Tiên, Phú Thọ',
};

export const content = {
  /** Màn đóng: tấm vé "Boarding pass" — bấm để mở */
  cover: {
    header: 'Boarding pass to our wedding',
    title: ['Passport', 'Wedding Invitation'],
    /** Tên ngắn in hoa trên cuống vé (thiệp chung hai nhà, thứ tự như ticket: cô dâu trước) — "Hùng" một chữ nên giữ họ Đỗ */
    names: ['Bích Liên', 'Đỗ Hùng'],
    /** Ngày Lễ Thành Hôn */
    date: '29/11/2026',
    hint: 'Nhấn vào passport để mở',
  },

  hero: {
    /** Tên trên hộ chiếu (trên, dưới) */
    names: ['Bích Liên', 'Đỗ Hùng'],
    /** Hai dòng chữ máy dưới tên */
    lines: ['Destination: Marriage', 'Boarding date: 29/11/2026'],
  },

  /** Hai thẻ ảnh treo kẹp giấy "Chú rể | Cô dâu" */
  couple: {
    groom: { role: 'Chú rể', name: 'Đỗ Hùng' },
    bride: { role: 'Cô dâu', name: 'Bích Liên' },
  },

  families: {
    title: 'Boarding Pass',
    /** Hai cột gia đình, hiển thị trái → phải theo thứ tự này */
    sides: [BRIDE_SIDE, GROOM_SIDE],
    /** Tên hai người dưới lời mời (trên, dưới) — TODO: ticket chưa có họ cô dâu / tên đệm chú rể */
    fullNames: ['Bích Liên', 'Đỗ Hùng'],
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
        title: 'Tiệc Mừng Lễ Vu Quy',
        /** Ticket ghi "4h30 + thứ bảy" — hiểu là 16:30 chiều */
        time: 'Vào lúc 16 giờ 30 - Thứ Bảy',
        date: '28. 11. 2026',
        lunar: '( Tức Ngày 20 Tháng 10 Năm Bính Ngọ )',
        place: 'Tư Gia Nhà Gái',
        address: ADDRESS_BRIDE,
        mapQuery: 'Ngọc Am, Chí Tiên, Phú Thọ',
      },
      {
        id: 'tiec-nha-trai',
        title: 'Tiệc Mừng Lễ Thành Hôn',
        time: 'Vào lúc 16 giờ 30 - Thứ Bảy',
        date: '28. 11. 2026',
        lunar: '( Tức Ngày 20 Tháng 10 Năm Bính Ngọ )',
        place: 'Tư Gia Nhà Trai',
        address: ADDRESS_GROOM,
        mapQuery: 'Khu 5, Đại An, Phú Thọ',
      },
      {
        id: 'thanh-hon',
        title: 'Lễ Thành Hôn',
        time: 'Vào lúc 09 giờ 00 - Chủ Nhật',
        date: '29. 11. 2026',
        lunar: '( Tức Ngày 21 Tháng 10 Năm Bính Ngọ )',
        place: 'Tư Gia Nhà Trai',
        address: ADDRESS_GROOM,
        mapQuery: 'Khu 5, Đại An, Phú Thọ',
      },
    ],
  },

  /** Đường bay "Timeline" — icon: camera | cheers | music | rings. Để null thì ẩn */
  timeline: {
    title: 'Timeline',
    items: [
      { time: '16:30 - 28/11', label: 'Tiệc Mừng Cưới', icon: 'cheers' },
      { time: '09:00 - 29/11', label: 'Lễ Thành Hôn', icon: 'rings' },
    ],
  },

  /** Dresscode — TODO: khách chưa gửi màu, để null (ẩn) */
  dresscode: null,

  /** Bộ đếm ngược — để null thì ẩn */
  countdown: {
    title: 'Countdown',
    /** Giờ Việt Nam (+07:00) — Lễ Thành Hôn 09:00 29/11/2026 */
    target: '2026-11-29T09:00:00+07:00',
    labels: ['Ngày', 'Giờ', 'Phút', 'Giây'],
  },

  calendar: {
    /** Ngày đóng dấu "Love Visa" trên lịch tháng — để null thì ẩn lịch */
    dateIso: '2026-11-29',
  },

  journey: 'Love is a journey',
  album: { title: 'Album of Love' },

  rsvp: {
    /**
     * Link Web App của Google Apps Script dùng chung — lời chúc lưu vào Google Sheets
     * riêng theo coupleId. Xem google-apps-script/README.md
     */
    endpoint: 'https://script.google.com/macros/s/AKfycbxGFb49383QZuzEF1D_sx_JSNSCecscN3j2aZShNuCGpbDiKK9bwoPawGo5Y_pKbacu/exec',
    /** Slug riêng của thiệp trong script dùng chung — không đổi sau khi đã có lời chúc */
    coupleId: 'bich-lien-do-hung',
    coupleName: 'Bích Liên & Đỗ Hùng',
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

  /** Hộp mừng cưới — accounts: [] để ẩn nút "Gửi mừng cưới" */
  gift: {
    button: 'Gửi Mừng Cưới',
    title: 'Hộp Quà Mừng Cưới',
    copyLabel: 'Copy STK',
    copiedLabel: 'Đã copy',
    saveQrLabel: 'Lưu ảnh QR',
    /** TODO: khách chưa gửi mã QR nhận quà */
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

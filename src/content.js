/** Nội dung chữ — chỉnh sửa tại đây, không cần đụng layout */

const ADDRESS_BRIDE = 'Nhà riêng Cốc Tào, thôn Bản Cầy, xã Nà Phặc, tỉnh Thái Nguyên';

export const content = {
  hero: {
    /** Hiển thị theo đúng thứ tự này — lễ tổ chức bên nhà gái nên cô dâu đứng trước */
    names: ['Thảo Dinh', 'Xuân Viên'],
    joiner: 'and',
    subtitle: 'Save the date',
    dateLine: '11. 11. 2026',
  },

  calendar: {
    /** Ngày được đánh dấu trên lịch */
    dateIso: '2026-11-11',
    monthLabel: 'November',
  },

  families: {
    /** Chữ lồng trong khung hoa văn: [chữ trên trái, chữ dưới phải] */
    monogram: ['D', 'V'],
    /** father / mother: để null nếu không muốn hiển thị */
    sides: [
      { label: 'Nhà Gái', father: 'Phạm Văn Hưng', mother: 'Nông Thị Điền' },
      { label: 'Nhà Trai', father: 'Nguyễn Văn Công', mother: 'Đặng Thị Vui' },
    ],
  },

  invitation: {
    kicker: 'Trân Trọng Kính Mời',
    /** Tên khách mặc định — có thể thay bằng link ?khach=Tên%20Khách */
    defaultGuest: 'Quý khách',
    lead: 'Tham dự tiệc chung vui của gia đình chúng tôi',
  },

  events: {
    mapLabel: 'Chỉ đường',
    /**
     * title: để null nếu không cần tiêu đề (như khối đầu của mẫu)
     * mapUrl: link Google Maps cho nút "Chỉ đường" — bỏ trống thì tự tìm theo address
     */
    items: [
      {
        id: 'nha-gai',
        title: null,
        timeLine: 'Vào lúc 16 giờ 00 phút – Thứ Tư',
        day: '11',
        month: 'Tháng 11',
        year: 'Năm 2026',
        lunar: '( Nhằm Ngày 03 Tháng 10 Năm Bính Ngọ )',
        place: 'Tư Gia Nhà Gái',
        address: ADDRESS_BRIDE,
        mapUrl: 'https://maps.app.goo.gl/jJmngVtBjMAXz33z7',
      },
    ],
  },

  story: {
    title: 'Our Story',
    /** Ảnh oval: theo thứ tự trong image.js → images.people */
    people: [
      { label: 'Cô Dâu', name: 'Thảo Dinh' },
      { label: 'Chú rể', name: 'Xuân Viên' },
    ],
    paragraphs: [
      'Tình yêu của chúng mình bắt đầu từ những điều rất giản dị, rồi lớn dần qua thời gian, qua những lần thấu hiểu, cảm thông và cả những thử thách không tránh khỏi. Giữa muôn vàn lựa chọn của cuộc đời, anh và em đã chọn ở lại bên nhau, chọn tin tưởng, chọn yêu thương và cùng nhau bước tiếp.',
      'Từ giây phút này, anh và em không chỉ là hai con người yêu nhau, mà là một gia đình – bắt đầu chương mới mang tên hạnh phúc!',
    ],
  },

  rsvp: {
    /**
     * Link Web App của Google Apps Script — lời chúc sẽ lưu vào Google Sheets
     * và gửi email thông báo. Cách lấy link: xem google-apps-script/README.md
     * Để '' thì form chỉ hiện lời cảm ơn, không lưu gì.
     */
    endpoint: 'https://script.google.com/macros/s/AKfycbwSC1CBCHacEHD58RJ7XGaCZ5z5_xyCOfx3HUPlCrEEfp4_iDwKGgI3rwe_kFA5krbn/exec',
    title: 'Xác nhận tham dự',
    intro: 'Hãy xác nhận tham dự để chúng mình chuẩn bị đón tiếp thật chu đáo. Trân Trọng!',
    placeholders: {
      name: 'Họ và Tên',
      guestCount: 'Bạn đi bao nhiêu người',
      message: 'Gửi lời chúc cho dâu, rể',
    },
    attendYes: 'Có, mình sẽ đến',
    attendNo: 'Tiếc quá, hôm đấy mình không đến được :((',
    submit: 'Gửi Xác Nhận',
    sending: 'Đang gửi...',
    error: 'Gửi chưa được, bạn kiểm tra mạng rồi thử lại nhé!',
    thanks: 'Cảm ơn bạn! Lời chúc của bạn đã được ghi nhận.',
  },

  /** Hộp mừng cưới — để accounts: [] để ẩn nút "Gửi mừng cưới" */
  gift: {
    button: 'Gửi Mừng Cưới',
    title: 'Hộp Mừng Cưới',
    copyLabel: 'Copy STK',
    copiedLabel: 'Đã copy',
    saveQrLabel: 'Lưu ảnh QR',
    /** { holder, number, bank, qr } — qr là ảnh trong public/images/, để null nếu không có */
    accounts: [],
  },

  album: {
    title: 'Album of Love',
  },

  thanks: {
    title: 'Thank You',
    text: 'Từ tận đáy lòng, chúng mình cảm ơn bạn đã dành tình cảm và sự hiện diện cho ngày vui này. Chính bạn đã góp phần làm nên một kỷ niệm hạnh phúc mà chúng mình sẽ luôn trân trọng.',
  },

  /** Nhạc nền — file đặt trong public/ (vd: public/music/music.mp3 → /music/music.mp3) */
  music: {
    src: '/music/music.mp3',
    /** 0–1 */
    volume: 0.45,
  },
};

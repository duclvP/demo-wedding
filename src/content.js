/** Nội dung chữ — chỉnh sửa tại đây, không cần đụng layout */

const ADDRESS_GROOM = 'Đình Tây Câu Đông, An Quang, Hải Phòng';
const ADDRESS_BRIDE = 'Xóm 8 Câu Trung, An Quang, Hải Phòng';

export const content = {
  hero: {
    subtitle: 'Save The Date',
    /** Hiển thị theo đúng thứ tự này */
    names: ['Minh Ánh', 'Trung Anh'],
    dateLine: '01 . 11 . 2026',
  },

  families: {
    /** father / mother: để null nếu không muốn hiển thị */
    groomSide: {
      label: 'Nhà Trai',
      father: null,
      mother: null,
      address: ADDRESS_GROOM,
    },
    brideSide: {
      label: 'Nhà Gái',
      father: null,
      mother: null,
      address: ADDRESS_BRIDE,
    },
    /** Họ tên đầy đủ, hiện dưới phần gia đình */
    fullNames: ['Bùi Minh Ánh', 'Đỗ Trung Anh'],
  },

  invitation: {
    kicker: 'Trân Trọng Kính Mời',
    /** Tên khách mặc định — có thể thay bằng link ?khach=Tên%20Khách */
    defaultGuest: 'Quý khách',
    title: 'Tham Dự Lễ Cưới',
    /** Chữ đè lên 3 ảnh */
    dateParts: ['01', '11', '2026'],
  },

  events: {
    mapLabel: 'Xem chỉ đường',
    items: [
      {
        id: 'thanh-hon',
        title: 'Lễ Thành Hôn',
        time: '09:00 - Chủ Nhật',
        date: '01. 11. 2026',
        lunar: '( Tức Ngày 23 Tháng 09 Năm Bính Ngọ )',
        places: [
          { label: 'Tư Gia Nhà Trai', address: 'Đình Câu Đông, An Quang, Hải Phòng' },
          { label: 'Tư Gia Nhà Gái', address: ADDRESS_BRIDE },
        ],
      },
      {
        id: 'tiec-cuoi',
        title: 'Tiệc Mừng Lễ Cưới',
        time: '13:00 - Chủ Nhật',
        date: '01. 11. 2026',
        lunar: '( Tức Ngày 23 Tháng 09 Năm Bính Ngọ )',
        places: [{ label: 'Tư Gia Nhà Gái', address: ADDRESS_BRIDE }],
      },
    ],
  },

  calendar: {
    title: 'Save The Date',
    /** Ngày được đánh dấu trên lịch */
    dateIso: '2026-11-01',
  },

  rsvp: {
    /**
     * Link Web App của Google Apps Script — lời chúc sẽ lưu vào Google Sheets
     * và gửi email thông báo. Cách lấy link: xem google-apps-script/README.md
     * Để '' thì form chỉ hiện lời cảm ơn, không lưu gì.
     */
    endpoint: '',
    title: 'Gửi Lời Chúc & Xác Nhận',
    placeholders: {
      name: 'Tên của bạn là gì ?',
      message: 'Gửi lời chúc cho cô dâu & chú rể',
      attend: 'Xác nhận tham dự ?',
      guestCount: 'Bạn đi bao nhiêu người ?',
    },
    attendYes: 'Có, mình sẽ đến',
    attendNo: 'Xin lỗi, hôm đấy mình không tới được :(',
    submit: 'Gửi Xác Nhận',
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
        holder: 'BUI MINH ANH',
        number: '203704070018671',
        bank: 'HDBank',
        /** Ảnh mã QR trong public/images/ — để null nếu không có */
        qr: '/images/qr-hdbank.png',
      },
    ],
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

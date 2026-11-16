/** Nội dung chữ — chỉnh sửa tại đây, không cần đụng layout */

const ADDRESS_GROOM = 'Xóm Mỹ Quan, xã Hùng Châu, tỉnh Nghệ An';
const ADDRESS_BRIDE = 'Xóm Phúc Mỹ, xã Hải Châu, tỉnh Nghệ An';

/** father / mother / address: để null nếu không muốn hiển thị */
const GROOM_SIDE = {
  label: 'Nhà Trai',
  father: 'Nguyễn Đăng Khoa',
  mother: 'Nguyễn Thị Thu',
  address: ADDRESS_GROOM,
};
const BRIDE_SIDE = {
  label: 'Nhà Gái',
  father: 'Đào Lục',
  mother: 'Phạm Thị Tuyết',
  address: ADDRESS_BRIDE,
};

export const content = {
  hero: {
    subtitle: 'Save The Date',
    /** Hiển thị theo đúng thứ tự này */
    names: ['Đức Trường', 'Phương Uyên'],
    dateLine: '28 . 11 . 2026',
  },

  families: {
    /** Hai cột gia đình, hiển thị trái → phải theo thứ tự này */
    sides: [GROOM_SIDE, BRIDE_SIDE],
    /** Tên cô dâu & chú rể, hiện dưới phần gia đình */
    fullNames: ['Đức Trường', 'Phương Uyên'],
  },

  invitation: {
    kicker: 'Trân Trọng Kính Mời',
    /** Tên khách mặc định — thay bằng link /hoa (→ Bạn Hoa), /co-lan (→ Cô Lan) hoặc ?khach=Tên%20Khách */
    defaultGuest: 'Quý khách',
    title: 'Tham Dự Lễ Thành Hôn',
    /** Chữ đè lên 3 ảnh */
    dateParts: ['28', '11', '2026'],
  },

  events: {
    mapLabel: 'Xem chỉ đường',
    items: [
      {
        id: 'nha-trai',
        title: 'Tiệc Mừng Lễ Thành Hôn',
        time: '11:00 - Thứ Bảy',
        date: '28. 11. 2026',
        lunar: '( Tức Ngày 20 Tháng 10 Năm Bính Ngọ )',
        places: [
          {
            label: 'Tư Gia Nhà Trai',
            address: ADDRESS_GROOM,
            /** Toạ độ ghim "Nguyễn Đăng Khoa" khách gửi trong bình luận (issue #36) */
            mapQuery: '19.0751747,105.6062784',
          },
        ],
      },
    ],
  },

  calendar: {
    title: 'Save The Date',
    /** Ngày được đánh dấu trên lịch (một ngày hoặc mảng nhiều ngày cùng tháng) — để null thì ẩn lịch */
    dateIso: '2026-11-28',
  },

  rsvp: {
    /**
     * Link Web App của Google Apps Script — lời chúc sẽ lưu vào Google Sheets
     * và gửi email thông báo. Cách lấy link: xem google-apps-script/README.md
     * Để '' thì form chỉ hiện lời cảm ơn, không lưu gì.
     */
    endpoint: '',
    /** Slug riêng của thiệp trong script dùng chung — không đổi sau khi đã có lời chúc */
    coupleId: '',
    coupleName: 'Đức Trường & Phương Uyên',
    /** false = tạm ẩn toàn bộ form gửi lời chúc & xác nhận */
    show: false,
    /** false = tạm ẩn ô xác nhận tham dự & số người, chỉ nhận lời chúc */
    askAttend: true,
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
        holder: 'NGUYEN VAN TRUONG',
        number: '5120531802',
        bank: 'BIDV',
        qr: '/images/qr-bidv.png',
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

/** Nội dung chữ — chỉnh sửa tại đây, không cần đụng layout */

export const content = {
  hero: {
    subtitle: "Lễ Thành Hôn",
    groom: "Nguyễn Quang",
    bride: "Bùi Lộc",
    dateLine: "16 . 06 . 2026",
  },

  countdown: {
    title: "Cùng chờ đón khoảnh khắc",
    /** Mốc đếm ngược: Lễ Thành Hôn — Thứ Ba 16/06/2026 11:00 (GMT+7) */
    targetIso: "2026-06-16T11:00:00+07:00",
  },

  families: {
    title: "Gia Đình Hai Bên",
    intro:
      "Trân trọng kính mời quý vị đến chung vui trong ngày trọng đại của chúng tôi.",
    brideSide: {
      label: "Nhà Gái",
      parentsPrefix: "Ông & Bà",
      father: "Bùi Văn An",
      mother: "Bùi Thị Loan",
      address: "Xóm Sim Ngoài, Xã Mường Động, Tỉnh Phú Thọ",
      maps: "https://www.google.com/maps?q=20.689712,105.481342",
    },
    groomSide: {
      label: "Nhà Trai",
      parentsPrefix: "Ông & Bà",
      father: "Nguyễn Văn Quân",
      mother: "Nguyễn Thị Toan",
      address:
        "Số 11 Ngõ 11 Xóm 2 Thôn Thọ Thượng, Xã Thắng Bình, Tỉnh Thanh Hóa",
      maps: "https://www.google.com/maps/place/19%C2%B035'07.0%22N+105%C2%B039'00.7%22E/@19.5827889,105.6499051,14.12z/data=!4m4!3m3!8m2!3d19.585289!4d105.650204?entry=ttu",
    },
  },

  events: {
    title: "Thông tin sự kiện",
    intro:
      "Sự hiện diện của quý vị là niềm vinh hạnh và là món quà ý nghĩa nhất dành cho chúng tôi.",
    items: [
      {
        id: "nap-tai",
        title: "Lễ Nạp Tài",
        highlight: false,
        lines: [
          { type: "time", text: "6 giờ 00'" },
          { type: "date", text: "Thứ Ba, 16/06/2026" },
          { type: "lunar", text: "(Tức ngày 02 tháng 05 năm Bính Ngọ)" },
          { type: "place", text: "Gia Đình Nhà Gái", multiline: false },
        ],
        maps: "https://www.google.com/maps?q=20.689712,105.481342",
      },
      {
        id: "tiec-cuoi",
        title: "Bữa Cơm Thân Mật",
        highlight: true,
        lines: [
          { type: "time", text: "16 giờ 00'" },
          { type: "date", text: "Chủ Nhật, 14/06/2026" },
          { type: "lunar", text: "(Tức ngày 29 tháng 04 năm Bính Ngọ)" },
          {
            type: "place",
            text: "Gia Đình Nhà Trai",
            multiline: false,
          },
        ],
        maps: "https://www.google.com/maps/place/19%C2%B035'07.0%22N+105%C2%B039'00.7%22E/@19.5827889,105.6499051,14.12z/data=!4m4!3m3!8m2!3d19.585289!4d105.650204?entry=ttu",
      },
      {
        id: "thanh-hon",
        title: "Lễ Thành Hôn",
        highlight: false,
        lines: [
          { type: "time", text: "11 giờ 00'" },
          { type: "date", text: "Thứ Ba, 16/06/2026" },
          { type: "lunar", text: "(Tức ngày 02 tháng 05 năm Bính Ngọ)" },
          {
            type: "place",
            text: "Gia Đình Nhà Trai",
            multiline: false,
          },
        ],
        maps: "https://www.google.com/maps/place/19%C2%B035'07.0%22N+105%C2%B039'00.7%22E/@19.5827889,105.6499051,14.12z/data=!4m4!3m3!8m2!3d19.585289!4d105.650204?entry=ttu",
      },
    ],
  },

  gallery: {
    title: "Khoảnh khắc tình yêu",
    subtitle: "Những kỷ niệm đẹp nhất trên chặng đường chúng tôi đi qua.",
    images: [
      { src: "/images/5.jpg", alt: "Quân phục uy nghiêm, tình yêu bền chặt" },
      { src: "/images/1.jpg", alt: "Chân dung đôi ngọt ngào" },
      { src: "/images/2.jpg", alt: "Nét duyên dáng của cô dâu" },
      { src: "/images/6.jpg", alt: "Phút giây tinh nghịch, đáng yêu" },
      { src: "/images/7.jpg", alt: "Cùng nắm tay đi đến tận cùng" },
      { src: "/images/8.jpg", alt: "Ánh mắt trao nhau ngọt ngào" },
      { src: "/images/9.jpg", alt: "Nụ cười rạng rỡ của đôi uyên ương" },
      { src: "/images/3.jpg", alt: "Cổ phục truyền thống tinh nghịch" },
    ],
  },

  rsvp: {
    title: "Gửi Xác Nhận",
    deadline: "Vui lòng phản hồi trước ngày 05/06/2026",
    labels: {
      name: "Tên khách mời",
      email: "Email liên hệ",
      attend: "Bạn sẽ tham dự chứ?",
      guestCount: "Số người tham dự",
      message: "Lời chúc gửi đến cô dâu chú rể",
    },
    placeholders: {
      name: "Vd: Nguyễn Văn A",
      email: "Vd: email@example.com",
      message: "Viết vài dòng yêu thương...",
    },
    attendYes: "Có, tôi sẽ tham dự",
    attendNo: "Rất tiếc không thể",
    submit: "Gửi Xác Nhận",
  },

  footer: {
    names: "Nguyễn Quang & Bùi Lộc",
    quote: '"Gặp gỡ là duyên phận, đồng hành là lựa chọn, và bên nhau trọn đời là lời hứa ngọt ngào nhất."',
  },

  /** Nhạc nền — file đặt trong public/ (vd: public/music/music.mp3 → /music/music.mp3) */
  music: {
    src: "/music/music.mp3",
    /** 0–1 */
    volume: 0.45,
  },
};

/** Nội dung chữ — chỉnh sửa tại đây, không cần đụng layout */

export const content = {
  hero: {
    subtitle: 'Lễ Thành Hôn',
    groom: 'Lê Đại',
    bride: 'Phương Lam',
    dateLine: '06 . 04 . 2026',
  },

  countdown: {
    title: 'Cùng chờ đón khoảnh khắc',
    /** Mốc đếm ngược: Lễ Thành Hôn — Thứ Hai 06/04/2026 10:50 (GMT+7) */
    targetIso: '2026-04-06T10:50:00+07:00',
  },

  families: {
    title: 'Gia Đình Hai Bên',
    intro:
      'Trân trọng kính mời quý vị đến chung vui trong ngày trọng đại của chúng tôi.',
    brideSide: {
      label: 'Nhà Gái',
      parentsPrefix: 'Ông & Bà',
      father: 'Lê Biểu',
      mother: 'Đỗ Thị Dung',
      address: 'SN 134, Vạn Thành, Thăng Bình, Thanh Hóa',
    },
    groomSide: {
      label: 'Nhà Trai',
      parentsPrefix: 'Ông & Bà',
      father: 'Lê Hồng Bình',
      mother: 'Lê Thị Thị',
      address: 'Phố 1, P. Nguyệt Viên, TP. Thanh Hóa',
    },
  },

  events: {
    title: 'Thông tin sự kiện',
    intro:
      'Sự hiện diện của quý vị là niềm vinh hạnh và là món quà ý nghĩa nhất dành cho chúng tôi.',
    items: [
      {
        id: 'nap-tai',
        title: 'Lễ Nạp Tài',
        highlight: false,
        lines: [
          { type: 'time', text: "9 giờ 00'" },
          { type: 'date', text: 'Thứ Bảy, 04/04/2026' },
          { type: 'lunar', text: '(17 tháng 2 năm Bính Ngọ)' },
          { type: 'place', text: 'Gia Đình Nhà Gái', multiline: false },
        ],
      },
      {
        id: 'tiec-cuoi',
        title: 'Tiệc Cưới',
        highlight: true,
        lines: [
          { type: 'time', text: "16 giờ 00'" },
          { type: 'date', text: 'Chủ Nhật, 05/04/2026' },
          { type: 'lunar', text: '(18 tháng 2 năm Bính Ngọ)' },
          {
            type: 'place',
            text: 'Gia Đình Nhà Gái',
            multiline: false,
          },
        ],
      },
      {
        id: 'thanh-hon',
        title: 'Lễ Thành Hôn',
        highlight: false,
        lines: [
          { type: 'time', text: "10 giờ 50'" },
          { type: 'date', text: 'Thứ Hai, 06/04/2026' },
          { type: 'lunar', text: '(19 tháng 2 năm Bính Ngọ)' },
          {
            type: 'place',
            primary: 'Nhà Văn Hóa Phú I',
            secondary: 'P. Nguyệt Viên, TP. Thanh Hóa',
          },
        ],
      },
    ],
  },

  gallery: {
    title: 'Khoảnh khắc tình yêu',
    subtitle: 'Những kỷ niệm đẹp nhất trên chặng đường chúng tôi đi qua.',
    alts: ['Khoảnh khắc 1', 'Khoảnh khắc 2', 'Khoảnh khắc 3'],
  },

  rsvp: {
    title: 'Gửi Xác Nhận',
    deadline: 'Vui lòng phản hồi trước ngày 25/03/2026',
    labels: {
      name: 'Tên khách mời',
      email: 'Email liên hệ',
      attend: 'Bạn sẽ tham dự chứ?',
      guestCount: 'Số người tham dự',
      message: 'Lời chúc gửi đến cô dâu chú rể',
    },
    placeholders: {
      name: 'Vd: Nguyễn Văn A',
      email: 'Vd: email@example.com',
      message: 'Viết vài dòng yêu thương...',
    },
    attendYes: 'Có, tôi sẽ tham dự',
    attendNo: 'Rất tiếc không thể',
    submit: 'Gửi Xác Nhận',
  },

  footer: {
    names: 'Lê Đại & Phương Lam',
    quote:
      '"Yêu không phải là nhìn nhau, mà là cùng nhau nhìn về một hướng."',
  },
};

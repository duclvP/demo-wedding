# Nhận lời chúc qua Google Sheets + email

Làm một lần, khoảng 5 phút.

1. Mở bảng tính [Lời chúc](https://docs.google.com/spreadsheets/d/13Gf4OiaON6khHcU1gUXDsv99iKK4f0r3vfx7d61VA0M/edit)
   (đã gắn sẵn trong `SPREADSHEET_ID` của Code.gs; dùng bảng tính khác thì sửa ID đó).
2. Trên menu chọn **Tiện ích mở rộng → Apps Script** (Extensions → Apps Script).
3. Xoá hết code có sẵn, dán toàn bộ nội dung file [Code.gs](Code.gs) vào.
   Sửa dòng `NOTIFY_EMAIL` thành Gmail của bạn. Bấm biểu tượng 💾 để lưu.
4. Bấm **Triển khai → Tùy chọn triển khai mới** (Deploy → New deployment):
   - Chọn loại (bánh răng ⚙️): **Ứng dụng web** (Web app)
   - Thực thi dưới dạng (Execute as): **Tôi** (Me)
   - Ai có quyền truy cập (Who has access): **Bất kỳ ai** (Anyone)
   - Bấm **Triển khai**, rồi **Cấp quyền truy cập** và chọn tài khoản Google của bạn.
     Nếu thấy "Google chưa xác minh ứng dụng này", bấm **Nâng cao → Đi tới … (không an toàn)**.
     Đây là script của chính bạn nên không sao.
5. Copy **URL ứng dụng web** (dạng `https://script.google.com/macros/s/.../exec`).
6. Dán vào `rsvp.endpoint` trong [src/content.js](../src/content.js), rồi build và deploy lại thiệp.

Gửi thử một lời chúc trên thiệp. Bảng tính sẽ có thêm một dòng và bạn nhận được email.

**Sửa code trong Apps Script sau này:** vào **Triển khai → Quản lý các bản triển khai → ✏️ → Phiên bản: Phiên bản mới**.
Làm như vậy thì URL giữ nguyên, không cần sửa lại thiệp.

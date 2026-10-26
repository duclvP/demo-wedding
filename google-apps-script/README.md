# Nhận lời chúc qua Google Sheets + email (một script dùng chung cho mọi thiệp)

Mọi thiệp gửi về **cùng một URL**. Script tự tạo một Google Sheet **riêng cho từng cặp đôi**
(trong thư mục Drive "Thiệp cưới - Lời chúc") ở lời chúc đầu tiên, nên khách này không thấy được dữ liệu khách khác.

## Làm một lần duy nhất (~5 phút)

1. Vào <https://script.google.com> → **Dự án mới**, xoá code có sẵn, dán toàn bộ [Code.gs](Code.gs). Sửa `NOTIFY_EMAIL`. Lưu 💾.
2. **Triển khai → Tùy chọn triển khai mới** → loại **Ứng dụng web**:
   - Thực thi dưới dạng: **Tôi**
   - Ai có quyền truy cập: **Bất kỳ ai**
   - Triển khai, **Cấp quyền** (Drive + Sheets + Gmail). Nếu thấy "chưa xác minh" → **Nâng cao → Đi tới … (không an toàn)**.
3. Copy **URL ứng dụng web** (`https://script.google.com/macros/s/.../exec`) — dùng cho mọi thiệp.

## Mỗi thiệp mới (không cần đụng Apps Script)

Trong `src/content.js` mục `rsvp`:

```js
endpoint: 'https://script.google.com/macros/s/.../exec', // URL chung
coupleId: 'minh-hien-duc-thanh',                         // duy nhất cho mỗi cặp
coupleName: 'Minh Hiền & Đức Thành',
show: true,
```

Sheet tự được tạo khi có lời chúc đầu tiên; email thông báo kèm link Sheet.

## Chia sẻ cho khách (chỉ thấy Sheet của họ)

Trong Apps Script, mở hàm `shareWithClient`, điền `COUPLE_ID` và `EMAIL` của khách (hoặc để `EMAIL = ''` để ai có link cũng **chỉ xem** được), chọn hàm → **Chạy**, link nằm ở **Nhật ký thực thi**.
`listCouples` liệt kê mọi cặp và link Sheet. Mặc định Sheet riêng tư, chỉ bạn xem được.

## Sửa code sau này

**Triển khai → Quản lý các bản triển khai → ✏️ → Phiên bản: Phiên bản mới.** URL giữ nguyên, thiệp cũ không phải sửa.

> Thiệp cũ đang dùng URL riêng của từng cặp vẫn chạy bình thường (script cũ độc lập), không bị ảnh hưởng.

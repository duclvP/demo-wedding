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

## Khách nhận email thông báo + xem Sheet (không sửa code)

Một lần: chạy hàm `adminLink` → Nhật ký thực thi in link mẫu có `key` (KEY lưu trong Script Properties, không nằm trong repo công khai). Lưu link đó lại.

Mỗi khách: mở link trên trình duyệt, đổi `couple` (= `rsvp.coupleId`) và `email`:

```
<URL /exec>?key=<KEY>&couple=dinh-sen-dinh-thang-nha-gai&email=khach@gmail.com              → thêm
<URL /exec>?key=<KEY>&couple=dinh-sen-dinh-thang-nha-gai&email=khach@gmail.com&action=remove → bỏ
<URL /exec>?key=<KEY>&couple=dinh-sen-dinh-thang-nha-gai                                     → xem danh sách
```

Email được thêm nhận email thông báo mỗi lời chúc mới của cặp đó (cùng `NOTIFY_EMAIL`) và quyền **xem** Sheet — thêm trước khi có Sheet cũng được, Sheet tạo ra sẽ tự chia sẻ.
`shareWithClient` (chạy tay) bật "ai có link cũng xem được". `listCouples` liệt kê mọi cặp, link Sheet và email nhận thông báo. Mặc định Sheet riêng tư, chỉ bạn xem được.

## Sửa code sau này

**Triển khai → Quản lý các bản triển khai → ✏️ → Phiên bản: Phiên bản mới.** URL giữ nguyên, thiệp cũ không phải sửa.

> Thiệp cũ đang dùng URL riêng của từng cặp vẫn chạy bình thường (script cũ độc lập), không bị ảnh hưởng.

---
name: wedding-invite
description: Tạo / cập nhật thiệp cưới online cho một cặp đôi mới trong repo demo-wedding từ ảnh thiệp giấy, ảnh cưới và ảnh QR ngân hàng. Dùng khi người dùng đưa ảnh thiệp, thông tin cô dâu chú rể, yêu cầu làm bản nhà trai / nhà gái, đổi ngày, địa chỉ, tài khoản mừng cưới, hoặc chỉnh link tên khách.
---

# Thiệp cưới online — quy trình chuẩn

Repo: Vite + React + Tailwind. Mọi nội dung chữ nằm ở `src/content.js`, ảnh ở `src/image.js` + `public/images/`. `dist/` **được commit** nên luôn `npm run build` trước khi commit.

## 1. Thu thập thông tin từ ảnh

Ảnh người dùng thả vào thư mục gốc repo (tên dạng `1792…jpg`, **không commit** các file này).

1. Liệt kê kích thước: `sips -g pixelWidth -g pixelHeight <file>`. Ảnh tỉ lệ ~870×1885 thường là **ảnh chụp màn hình điện thoại** (thiệp, hoặc ảnh cưới mở trong trình duyệt); ~853×1280 là **ảnh cưới gốc**.
2. Đọc từng ảnh chụp màn hình thiệp (Read). Tổng hợp thành bảng:
   - Tên cô dâu, chú rể (họ chú rể suy từ tên bố nếu thiệp chỉ ghi tên — nói rõ là suy ra)
   - Bố/mẹ hai bên, địa chỉ hai bên
   - Từng sự kiện: tên tiệc, giờ, thứ, ngày dương, ngày âm, địa điểm
   - Thường có **2 thiệp**: thiệp nhà trai (Lễ Thành Hôn, tư gia nhà trai) và thiệp nhà gái (Lễ Vu Quy, có thể ở nhà hàng) + trang Lễ Thành Hôn chung.
3. Kiểm tra thứ trong tuần khớp ngày dương (`node -e "console.log(new Date('2026-11-02').getDay())"`, 0 = CN).
4. Nếu thiếu thông tin (vd địa chỉ nhà gái), để `null` (FamilySide tự ẩn) và **hỏi lại** trong báo cáo, không bịa.

## 2. Mã QR & ngân hàng

Logo app ngân hàng hay khó nhận → **giải mã QR** để lấy mã BIN:

```bash
S=<scratchpad>
sips -c <H> <W> --cropOffset <Y> <X> <ảnh-qr>.jpg --out $S/qr.png   # crop sát mã QR
swift .claude/skills/wedding-invite/scripts/decode-qr.swift $S/qr.png
```

Chuỗi VietQR chứa `0006<BIN 6 số>01..<STK>`. Ví dụ `…0006970422011009853276170208…` → BIN 970422, STK 0985327617.

| BIN | Ngân hàng | BIN | Ngân hàng |
|---|---|---|---|
| 970422 | MB Bank | 970407 | Techcombank |
| 970436 | Vietcombank | 970432 | VPBank |
| 970415 | VietinBank | 970423 | TPBank |
| 970418 | BIDV | 970416 | ACB |
| 970405 | Agribank | 970437 | HDBank |
| 970403 | Sacombank | 970441 | VIB |
| 970443 | SHB | 970426 | MSB |
| 970448 | OCB | 970449 | LPBank |

Lưu ảnh QR đã crop vào `public/images/qr-<bank>.png`, xóa QR cũ.

## 3. Ảnh cưới

- Đặt tên có nghĩa: `ao-dai-1.jpg`, `co-dau.jpg`, `chu-re.jpg`, `studio-1.jpg`, `sanh-1.jpg`, `hoa-1.jpg`…
- Ảnh chụp màn hình trình duyệt: crop bỏ thanh trên/dưới về ~2:3, vd `sips -c 1300 868 --cropOffset 202 1 in.jpg --out public/images/x.jpg`. Thu nhỏ bản xem thử vào scratchpad (`sips -Z 300`) rồi Read để kiểm tra crop sạch.
- Bỏ ảnh trùng (cùng pose, khác nén).
- `git rm` ảnh của cặp đôi cũ trong `public/images/`.
- Gán trong `src/image.js`:
  - `hero` (2:3, đầu thiệp — ảnh nổi bật nhất), `couple` (4:5, object-top)
  - `dateStrip` 3 ảnh (3:5) — bản nhà trai: chú rể, ảnh đôi, cô dâu; bản nhà gái đảo lại
  - `album` số chẵn ảnh (lưới 2 cột), `gift` (ảnh chủ tài khoản), `thankYou` (3:4)

## 4. Cập nhật nội dung (`src/content.js`, `index.html`)

- Hằng số đầu file: `ADDRESS_*`, `GROOM_SIDE`, `BRIDE_SIDE` (father/mother/address, `null` = ẩn).
- `hero.names`, `families.sides` (thứ tự cột trái → phải), `families.fullNames` (chỉ **tên**, không họ, vd "Minh Nguyệt").
- `invitation.title`, `invitation.dateParts`, `hero.dateLine`, `calendar.dateIso`.
- `events.items`: mỗi sự kiện có `places[]` (mỗi nơi có nút chỉ đường Google Maps theo `address`).
- `gift.accounts`: holder (IN HOA không dấu như app ngân hàng), number, bank, qr.
- `index.html`: `<title>`, description, og:*, twitter:* — tên theo thứ tự của bản đó + thứ, ngày chính.

## 5. Hai bản: nhà trai / nhà gái

Tạo 2 nhánh từ nhánh hiện tại, tên `<tencodau>_<tenchure>_nha_gai` và `…_nha_trai` (vd `nguyet_truc_nha_gai`):

| | Nhà gái | Nhà trai |
|---|---|---|
| `hero.names`, `fullNames`, title trang | Cô dâu trước | Chú rể trước |
| `families.sides` | `[BRIDE_SIDE, GROOM_SIDE]` | `[GROOM_SIDE, BRIDE_SIDE]` |
| `invitation.title` | Tham Dự Lễ Vu Quy | Tham Dự Lễ Thành Hôn |
| Sự kiện 1 | Tiệc Mừng Lễ Vu Quy (địa điểm nhà gái) | Tiệc Mừng Lễ Thành Hôn (tư gia nhà trai) |
| Sự kiện 2 | Lễ Thành Hôn | Lễ Thành Hôn |
| Ngày chính (dateLine, dateParts, calendar, meta) | Ngày tiệc nhà gái | **Ngày Lễ Thành Hôn** |

`src/main.jsx` phải **giống hệt** giữa hai nhánh — chỉ `content.js`, `image.js`, `index.html` khác nhau.

## 6. Sửa chung cho cả hai nhánh

Không cherry-pick (luôn xung đột ở `dist/`). Luôn chạy `git branch --show-current` trước khi sửa — người dùng có thể đã tự đổi nhánh. Sửa + commit ở nhánh A, rồi sang nhánh B và lấy `main.jsx` **từ nhánh A** (nhánh đã có bản sửa, không phải ngược lại); sau đó grep xác nhận bản sửa có mặt ở cả hai nhánh. Với từng nhánh:

```bash
git checkout -q <nhánh>
# main.jsx: git checkout <nhánh-đã-sửa> -- src/main.jsx
# content.js: sửa bằng sed/python (assert chuỗi cũ tồn tại)
npm run build && git add -A src index.html public dist && git commit
```

Nếu lỡ cherry-pick bị xung đột `dist/`: xóa `dist/assets/index-*.js`, build lại, `git add -A dist`, `git cherry-pick --continue`; kiểm tra `dist/index.html` trỏ đúng file js duy nhất trong `dist/assets/`.

## 7. Link tên khách (đã có sẵn trong `useGuestName`)

- `/hoa` → "Bạn Hoa" (không có xưng hô → thêm "Bạn"); `/co-lan` → "Cô Lan"; `/gia-dinh-bac-hung` → "Gia Đình Bác Hung".
- `?khach=Tên` giữ nguyên chữ người dùng gõ, ưu tiên hơn đường dẫn.
- Từ xưng hô không dấu → có dấu: bảng `GUEST_TITLES` trong `src/main.jsx`. Tên riêng không tự thêm dấu được.
- Hosting cần rewrite mọi đường dẫn về `index.html` (Vite dev đã tự làm).

## 8. Kiểm tra & báo cáo

- `npm run build` phải thành công trên mỗi nhánh; grep `dist/index.html` thấy đúng tên/ngày.
- Commit message tiếng Việt, kiểu `feat: …`. Không push trừ khi được yêu cầu.
- Báo cáo bằng tiếng Việt: bảng thông tin đã lấy, thay đổi theo nhánh, **các điểm tự quyết định / suy luận** (thứ tự tên, họ suy ra, tài khoản dùng chung…), thông tin còn thiếu, commit hash từng nhánh, nhánh đang đứng.

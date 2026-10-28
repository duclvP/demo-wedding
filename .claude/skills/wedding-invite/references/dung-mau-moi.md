## 13. Dựng mẫu mới từ trang lovecard (ticket đòi mẫu chưa có trong bảng §5)

Trang lovecard là LadiPage: mọi hoa văn (phong bì, góc vàng, 囍, hoa sen, vòng lá, nhẫn…) là **ảnh PNG/WebP nền**, chữ đặt tuyệt đối trên khung rộng 420px, hiệu ứng là CSS keyframes. Đừng dựng bằng mắt rồi sửa dần — bóc số liệu trước:

```bash
node $K/ladi-dump.cjs $S/pw https://www.lovecard.click/thiepso05 $S/mau05
```

→ `elements.txt` (mọi phần tử theo thứ tự y: tọa độ, cỡ chữ, font, ảnh nền + tỉ lệ cắt, animation), `fonts.txt` (tên font hash → file, nhận ra font trả phí), `keyframes.txt`, `assets/` (ảnh đã tải, WebP đã đổi PNG), ảnh màn hình đóng / mở / từng màn cuộn. Đọc ảnh màn hình trước để hiểu bố cục, rồi tra `elements.txt` theo từng mục khi code.

Chuyển sang code (xem `EnvelopeCover`, `Cropped`, `box()` trong `main.jsx` nhánh mẫu 05):
- Ảnh trang trí chép vào `public/images/deco-<ten>.png`, khai trong `image.js → deco`. Tiền lệ repo: mẫu 07 cũng dùng ảnh 囍 của mẫu gốc; nói một câu trong báo cáo là ảnh lấy từ trang mẫu.
- Mẫu cắt khung từng ảnh nền (`crop w% l% t%` trong elements.txt) → `<Cropped src crop={{ w, l, t }} style={box(x, y, w, h)} />`: img đặt tuyệt đối trong hộp overflow-hidden đúng tỉ lệ cắt. Ảnh vuông bị kéo méo (góc vàng 313×313 → 69×97) thì để img `width/height 100%` không giữ tỉ lệ.
- Màn tọa độ cố định (màn phong bì + tên + ngày): một khung `aspect-ratio: 420 / H`, con đặt bằng `%` qua `box(x, y, w, h)` → co theo điện thoại. Mục chữ chảy (gia đình, sự kiện…) dùng flow layout với px / khoảng cách lấy từ elements.txt, bọc `mx-auto max-w-[420px]`.
- Hiệu ứng của mẫu: fadeInUp/Down/Left/Right dịch 20/20/20/40px, 2–5s `ease` (`Reveal` nhận `duration` giây); pulse 3s; bounceIn; mở phong bì = **đổi ảnh đóng → bộ ảnh mở** (mặt sau + ảnh cưới + mặt trước) và ảnh cưới `moveUp` 300px / 2s — không có nắp xoay.
- Font trả phí của mẫu (1FTV VIP High Spirited, Ed Drayton, UTM Scriptina…) không chép được → font thay trong `tailwind.config.js` (`font-script`, `font-guest`…), ghi rõ trong báo cáo.
- Dựng xong: so từng màn với ảnh của `ladi-dump` (đặt cạnh nhau), chạy §9 cả điện thoại lẫn desktop, rồi thêm mẫu vào bảng §5.

Lỗi đã gặp với màn "bấm để mở" — làm sẵn từ đầu, đừng đợi người dùng báo:
- Khóa cuộn (`body overflow: hidden`) tới khi mở → phải `history.scrollRestoration = 'manual'` + `window.scrollTo(0, 0)` khi chưa mở. Không thì Chrome giữ vị trí cuộn cũ khi reload: phong bì ngoài màn hình, khách không cuộn lên được → "trang trắng".
- Phần sau màn mở chỉ mount khi `opened` (`{opened && …}`, mờ dần 0.5s) và `main` có `min-h-screen` — màn desktop cao hơn khung 870px sẽ ló mục bên dưới.
- Bấm mở không được giật: phần tử giữ nguyên thì **không gắn lại animation** (tiêu đề bị chớp tắt vì fadeInDown chạy lại); đổi ảnh thì lớp cũ mờ dần 300ms rồi mới gỡ; `html { scrollbar-gutter: stable }` để thanh cuộn hiện ra khi bỏ khóa không xê dịch trang.
- Ảnh cưới trượt lên: bọc trong khung cắt từ đỉnh tới đáy phong bì, nếu không phần dưới ảnh ló ra dưới phong bì lúc đang trượt.

### Giao cho subagent Opus (khi phiên chính không phải Opus)

Dựng mẫu mới là phần khó nhất (nhìn hình, bóc bố cục, viết lại `WeddingPage` / CSS, lặp nhiều vòng) nên chạy bằng `Agent` `model: "opus"`:
- Prompt phải **tự chứa**: link mẫu, nhánh gốc, `$S` / `$K`, quy tắc "không lấy ảnh của trang mẫu nếu không có phép — vẽ lại bằng CSS/SVG khi được", logic nhạc / Reveal / tên khách / form / mừng cưới giữ nguyên, không push / deploy.
- Yêu cầu trả về: nhánh, hash commit, các file đã sửa, dòng cần thêm vào bảng mẫu §5, chỗ chưa làm được.
- Phiên chính đọc kết quả, chạy `npm run build`, soát bằng ảnh chụp (§9) rồi mới tiếp tục.

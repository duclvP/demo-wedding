---
name: wedding-invite
description: Tạo / cập nhật thiệp cưới online cho một cặp đôi mới trong repo demo-wedding — từ ticket GitHub (issue / board "Ready") hoặc ảnh thiệp giấy, ảnh cưới, ảnh QR ngân hàng — rồi deploy lên Vercel. Dùng khi người dùng đưa link/số ticket, ảnh thiệp, thông tin cô dâu chú rể, yêu cầu làm bản nhà trai / nhà gái, tách bản chung thành hai bản, đổi ngày, địa chỉ, ảnh chính, nhạc nền, tài khoản mừng cưới, ẩn lịch / form, chỉnh link tên khách, deploy / xóa project Vercel, hoặc dựng một mẫu thiệp mới theo link lovecard.click/thiepsoNN (bóc ảnh, tọa độ, animation của mẫu).
---

# Thiệp cưới online — quy trình chuẩn

Repo: Vite + React + Tailwind. Mọi nội dung chữ nằm ở `src/content.js`, ảnh ở `src/image.js` + `public/images/`. `dist/` **được commit** nên luôn `npm run build` trước khi commit.

Đặt `S=<scratchpad>`, `K=.claude/skills/wedding-invite/scripts`. Mọi file tải về / ảnh tạm để trong `$S`, không để trong repo.

## 0. Đọc ticket

Board: https://github.com/users/duclvP/projects/1 (kanban). Đọc cột **Ready**:

```bash
gh project item-list 1 --owner duclvP --format json   # cần scope: gh auth refresh -s read:project
```

Thiếu scope thì **hỏi người dùng số issue**, đừng đoán. Link board có `issue=duclvP|demo-wedding|9` → issue #9.

```bash
$K/fetch-issue.sh 9 $S/t9      # issue.md (body + MỌI comment) + i10.bin, i11.bin… + p*.jpg xem thử
```

- **Máy Linux** (không có zsh / sips / md5 / swift / pip nên `fetch-issue.sh`, `decode-qr.swift` không chạy): dùng bản Linux trong `$K`:
  - `$K/fetch-issue-linux.sh 9 $S/t9` — thay `fetch-issue.sh` (gh + curl + PIL; file `.zip` đính kèm tải bằng `curl -sL -H "Authorization: token $(gh auth token)" -o $S/a.zip <link>` rồi giải nén vào thư mục riêng).
  - `S=$S $K/decode-qr-linux.sh <ảnh> [x0 y0 x1 y1]` — thay `decode-qr.swift` (cài `npm i --prefix $S/qr jsqr@1.4.0` một lần/phiên).
  - `shot.cjs` / `open-seq.cjs` / `ladi-dump.cjs` tự dùng `/usr/bin/google-chrome`; `og-image.sh` chạy được nguyên bản. playwright-core: `npm i --prefix $S/pw playwright-core@1.49.1`, **truyền đường dẫn tuyệt đối** `$S/pw`.
  - Crop / resize / đổi định dạng ảnh: Python PIL (`python3 -I`) thay cho `sips`. Ngày âm lịch: `npm i --prefix $S/lunar lunar-javascript` → `Solar.fromYmd(y,m,d).getLunar()`.
  - Dev server cổng 5173 phải **khởi động lại sau khi đổi nhánh** (vite giữ `tailwind.config` / `index.html` cũ → màu, font sai); đừng chạy `pkill` trong cùng lệnh với việc khác (kết thúc exit 144).
- **Luôn đọc cả bình luận** — ảnh cưới, QR hay được bổ sung trong comment sau khi tạo ticket. Khi người dùng nói "ảnh đã đẩy lên rồi", chạy lại `fetch-issue.sh` (comment mới).
- `.bin` có thể là PNG hoặc JPEG — Read không đọc được `.bin`, dùng `p*.jpg` hoặc `sips -s format png`.
- md5 trùng = ảnh trùng, bỏ bớt.
- Ticket hay có các mục: "thông tin thiệp" (ảnh chụp văn bản Word hoặc gõ tay), "ảnh cưới và mã qr", "mẫu" (link lovecard.click/thiepsoNN, "Mẫu NN" hay "mã N" trong tiêu đề → mẫu số NN, xem bảng mẫu ở §5), "bỏ phần này" (ảnh chụp phần cần ẩn — xem §6). Tiêu đề có "2 THIỆP" → làm cả bản nhà gái và nhà trai.

## 1. Thu thập thông tin từ ảnh

1. Kích thước in sẵn trong output `fetch-issue.sh`. ~870×1885 = **ảnh chụp màn hình điện thoại** (thiệp, QR, hoặc ảnh cưới mở trong trình duyệt/Zalo); ~853×1280 hoặc ~1000×1600 = **ảnh cưới**.
2. Xem nhiều ảnh một lúc bằng bảng ghép (cài playwright-core một lần mỗi phiên):
   ```bash
   npm i --prefix $S/pw playwright-core@1.49.1
   node $K/shot.cjs $S/pw sheet $S/t9 $S/t9/sheet.png 11 12 14 16 17 18   # số = i<số>
   ```
3. Đọc từng ảnh thiệp / văn bản. Tổng hợp thành bảng:
   - Tên cô dâu, chú rể (họ chú rể suy từ tên bố nếu thiệp chỉ ghi tên — nói rõ là suy ra)
   - Bố/mẹ hai bên, địa chỉ hai bên
   - Từng sự kiện: tên, giờ, thứ, ngày dương, ngày âm, địa điểm
4. Kiểm tra thứ trong tuần khớp ngày dương (`node -e "console.log(new Date('2026-11-02').getDay())"`, 0 = CN). Ticket hay ghi lệch (vd "Thứ 4, 29/11/2026" nhưng 29/11 là Chủ Nhật; âm lịch ghi nhầm tháng) → tìm ngày khớp cả thứ lẫn âm lịch rồi **hỏi bằng AskUserQuestion**, phương án khớp đặt đầu (Recommended); không tự chọn.
5. Thiếu thông tin (giờ để trống "…giờ…", địa chỉ, tài khoản) → để `null` / `[]` / bỏ giờ, ghi `TODO` trong code và **hỏi lại** trong báo cáo, không bịa.

## 2. Mã QR & ngân hàng

Logo app ngân hàng hay khó nhận → **giải mã QR** để lấy mã BIN. Tính toạ độ crop từ bản xem thử (p*.jpg 700px → nhân tỉ lệ về ảnh gốc), crop rộng hơn mã một chút:

```bash
sips -s format png -c <H> <W> --cropOffset <Y> <X> $S/t9/i26.bin --out public/images/qr-<bank>.png
swift $K/decode-qr.swift public/images/qr-<bank>.png
```

Chuỗi VietQR chứa `0006<BIN 6 số>01<2 số độ dài><STK>`. Ví dụ `…0006970422011009853276170208…` → BIN 970422, STK 0985327617. Đối chiếu STK/tên với chữ in trên ảnh.

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

- QR nhỏ (vd ảnh QR trong tin nhắn Zalo, ~180px): crop sát rồi phóng `sips -z 546 546` — giải mã lại sau khi phóng để chắc vẫn đọc được.
- Xem lại bản crop (Read): không cắt mất ô định vị ở góc, không dính logo/chữ.
- Chuỗi có `VQRQ…` thay cho STK (vd `0113VQRQABLSR240`) = mã định danh ảo của MB Bank, **không chứa STK** → lấy STK theo chữ in trên ảnh, báo cáo ghi rõ là chưa đối chiếu được với mã QR.
- Tên chủ tài khoản khác tên cô dâu/chú rể (vd QR đứng tên mẹ) → vẫn dùng đúng tên trên QR, nêu trong báo cáo để người dùng xác nhận.

## 3. Ảnh cưới

- Đặt tên theo bối cảnh: `bien-1.jpg`, `studio-1.jpg`, `hoa-1.jpg`, `sanh-1.jpg`, `ao-dai-1.jpg`, `co-dau.jpg`, `chu-re.jpg`…
- `git rm` toàn bộ ảnh + QR của cặp đôi cũ: `git rm public/images/*.jpg public/images/qr-*.png` — **giữ lại `deco-*.png`** (ảnh trang trí của mẫu 05, dùng chung mọi cặp). `git rm` xóa luôn thư mục rỗng → `mkdir -p public/images public/music` trước khi chép file mới (nhạc cũng vậy, `cp` vào thư mục đã bị xóa sẽ lỗi im lặng).
- Ảnh gốc thường có **viền đen mỏng** ở mép (nhất là mép phải, tới ~20px) → cắt đều mỗi cạnh 32px:
  ```bash
  sips -s format jpeg -s formatOptions 85 -c $((h-64)) $((w-64)) --cropOffset 32 32 in.bin --out public/images/x.jpg
  ```
- Ảnh chụp màn hình trình duyệt/Drive: crop bỏ thanh trên/dưới, chỉ giữ khung ảnh. Thu nhỏ bản xem thử (`sips -Z 300`) rồi Read để kiểm tra crop sạch.
- Ảnh gốc to (>2000px) thì thêm `-Z 1600`.
- Ảnh ngang không hợp khung dọc (album 2:3) → bỏ, ghi vào báo cáo.
- Gán trong `src/image.js`:
  - `hero` (2:3, đầu thiệp — ảnh hai người rõ mặt, nổi bật nhất), `couple` (4:5, object-top)
  - `dateStrip` 3 ảnh (3:5) — bản nhà trai: chú rể, ảnh đôi, cô dâu; bản nhà gái đảo lại
  - `album` **số chẵn** ảnh (lưới 2 cột), `gift` (3:4, được dùng lại ảnh khác), `thankYou` (3:4)
  - `thankYou`: chữ "Thank You" + lời cảm ơn + ký tên phủ **nửa dưới** ảnh → chọn ảnh mặt nằm ở **1/3 trên** (cận cảnh), đừng chọn ảnh toàn thân / ngồi.
- Không có ảnh cưới thì tạm dùng ảnh mẫu `demo-*.jpg` từ nhánh `demo_v2` (`git checkout demo_v2 -- public/images/ src/image.js`) và nói rõ trong báo cáo.
- Nhạc nền theo tên bài khách yêu cầu — tìm trong repo trước (tên file không nói lên bài: `strings -n 6 x.mp3 | grep -A1 TIT2` đọc thẻ ID3):

  | Bài | Có ở nhánh | File |
  |---|---|---|
  | Beautiful In White (Shane Filan) | `gam_ngoc`, `ngoc_long`, `ngan_daeho` (`ngoc-long.mp3`); `thuuyen_ngochung_*`, `thuhong_tronghoang_nha_gai` | `beautiful-in-white.mp3` |
  | I Do | `main`, `haanh_ngoctien`, `thanhnhan_thanhtung_*` (`i-do.mp3`); bản cắt `i-do-cut.mp3` ở `long_hung`, `tuan_hong`, `nguyet_cuong_*` | `i-do.mp3` |
  | Bài riêng Nguyệt & Trúc | `nguyet_truc_nha_gai` / `_nha_trai` | `nguyet-truc.mp3` / `truc-nguyet.mp3` |

  Liệt kê nhạc mọi nhánh: `for b in $(git branch --format='%(refname:short)'); do git ls-tree -r --name-only $b public/music | sed "s|^|$b: |"; done`. Lấy file: `git show <nhánh>:public/music/<file> > public/music/<tên-mới>.mp3`, đổi `music.src` trong `content.js`, `git rm` file nhạc cũ.

### Đổi nhạc nền theo yêu cầu khách ("đổi nhạc", "bài X của Y")

1. **Tìm trong repo trước** (tên file không nói lên bài: `strings -n 6 x.mp3 | grep -A1 TIT2`). Liệt kê nhạc mọi nhánh: `for b in $(git for-each-ref --format='%(refname:short)' refs/heads refs/remotes/origin); do git ls-tree -r --name-only $b public/music | sed "s|^|$b: |"; done`. Có rồi thì `git show <nhánh>:public/music/<file> > public/music/<tên-mới>.mp3`.
2. **Chưa có → tải từ nhaccuatui.com bằng extension Claude in Chrome** (cần extension đã nối: `/chrome` hoặc `claude --chrome`; nạp công cụ `mcp__claude-in-chrome__*` bằng một lệnh ToolSearch, đọc skill `chrome-browser` trước):
   - Mở `https://www.nhaccuatui.com/tim-kiem?q=<tên bài + ca sĩ>`, bấm đúng bài (kiểm tra ca sĩ — nhiều bản cover / remix trùng tên), vào trang bài có nút **Tải về** → menu 3 mức: Tiêu chuẩn ~3,5MB (128kbps) / Cao ~8,7MB (320kbps) / Lossless (VIP, bỏ).
   - **Hỏi người dùng trước khi bấm tải** (AskUserQuestion: tên bài + ca sĩ, nguồn, dung lượng) — tải file là việc cần xác nhận. Mặc định đề xuất **Tiêu chuẩn**: nhạc nền thiệp cần nhẹ để khách mở bằng 4G vẫn tải nhanh.
   - Trước khi bấm: `touch $S/dl-mark`; sau ~6 giây `find ~/Downloads -maxdepth 1 -newer $S/dl-mark` để lấy file (tên dạng `Váy Cưới.mp3`). Kiểm tra `file` ra MPEG audio + ID3.
   - Không tải từ trang lạ / trang chuyển đổi YouTube; nhạc đã mất phí hoặc bị chặn → báo người dùng, đừng vòng qua.
3. **Gắn vào thiệp** (chỉ nhánh của ticket đó): `git rm public/music/<bài-cũ>.mp3` (nhạc là file riêng của nhánh, không đụng nhánh khác) → `mkdir -p public/music` (git rm có thể xóa thư mục rỗng) → `cp` file mới thành tên không dấu, gạch ngang (`vay-cuoi.mp3`) → đổi `music.src` trong `src/content.js` → soát `curl -s -o /dev/null -w "%{http_code} %{size_download}\n" localhost:5173/music/<file>` ra 200 đúng dung lượng.
4. `npm run build` → commit kèm `dist/` ("feat: thiệp … — nhạc nền <Bài> (<Ca sĩ>) theo yêu cầu khách (issue #N)") → deploy một lần cùng các chỉnh sửa khác của khách (§11). Sau deploy `curl https://<domain>/music/<file>` phải ra 200 đúng dung lượng.
5. Báo cáo: bài + ca sĩ + chất lượng đã tải, nơi file gốc còn nằm (`~/Downloads/...`), và nhắc đây là bản thương mại — khách chịu trách nhiệm bản quyền khi dùng công khai.

## 4. Cập nhật nội dung (`src/content.js`, `index.html`)

- Hằng số đầu file: `ADDRESS_*`, `GROOM_SIDE`, `BRIDE_SIDE` (father/mother/address, `null` = ẩn).
- `hero.names`, `families.fullNames` — bỏ họ (vd "Quang Hưng", "Minh Nguyệt"); tên một chữ thì giữ chữ đệm ("Thị Long") hoặc cả họ ("Phạm Ngân"). `families.fullNames` cũng là dòng ký tên cuối mục Thank You.
- `families.sides` (thứ tự cột trái → phải).
- `invitation.title`, `invitation.dateParts`, `hero.dateLine`, `calendar.dateIso`.
- `events.items`: theo thứ tự thời gian; mỗi sự kiện có `places[]` (nút chỉ đường theo `mapQuery ?? address`; `mapQuery` = địa chỉ cũ trước sáp nhập / tên địa danh dễ tìm).
- `gift.accounts`: holder (IN HOA không dấu như app ngân hàng), number (không dấu cách), bank, qr. `[]` = ẩn nút mừng cưới.
- `rsvp.endpoint: ''` cho cặp mới (endpoint cũ là Google Sheet của cặp khác). `rsvp.show: false` đang là mặc định.
- Form lời chúc của **mọi mẫu** phải gửi đúng các trường `name`, `message`, `attend`, `guestCount` (số người; không đi = 0, bỏ trống = 1) — `google-apps-script/Code.gs` chuẩn chỉ đọc 4 trường này (cột Tên / Lời chúc / Tham dự / Số người). Mẫu dựng mới mà thêm ô khác (vd "khách mời của ai" của mẫu Hime — đang ẩn bằng `guestOfOptions: []`) thì script không lưu, khách phải sửa Apps Script → tránh thêm.
- `index.html`: `<title>`, description, og:*, twitter:* — tên theo thứ tự của bản đó + thứ, ngày chính.
- **Ngày ở xem trước link / Save The Date có thể khác ngày Lễ Thành Hôn**: khách được mời dự tiệc (vd Lễ Mừng Cưới tư gia CN 01/11) chứ không phải lễ chính (T2 02/11). Mỗi chỗ ngày là một trường riêng — chỉ sửa đúng chỗ khách khoanh, báo lại các chỗ còn lại:
  | Chỗ | Trường |
  |---|---|
  | Mô tả xem trước link | `index.html` description + og:description + twitter:description |
  | Ảnh xem trước | dòng ngày trong `og.jpg` (chạy lại `og-image.sh`) |
  | "Save The Date" đầu thiệp | `hero.dateLine` |
  | Ngày đè trên 3 ảnh | `invitation.dateParts` (đi cùng `invitation.title`) |
  | Đếm ngược / lịch | `countdown.target`, `calendar.dateIso` |
- **Ảnh xem trước link (bắt buộc)** — thiếu `og:image` thì Messenger/Zalo chỉ hiện chữ, không có ảnh. Tạo `public/images/og.jpg` 1200×630 từ ảnh `hero` (cắt ngang + tên ♥ tên + ngày):
  ```bash
  $K/og-image.sh public/images/<hero>.jpg <vị-trí-dọc-%> "Ngọc Hưng ♥ Thu Uyên" "Thứ Hai, 02 . 11 . 2026" public/images/og.jpg
  ```
  `vị-trí-dọc-%` ≈ 4–15 khi mặt nằm ở phần trên ảnh dọc. Read ảnh ra kiểm tra mặt không bị cắt, chữ không đè mặt. Nhánh cũ chưa có script → `git show ngoc_an:.claude/skills/wedding-invite/scripts/og-image.sh > $S/og-image.sh` (đừng chạy đường dẫn không tồn tại trong chuỗi `;` — lệnh sau vẫn chạy và commit thiếu). **Không** thêm `og:url` (Facebook coi là link gốc → bấm thẻ của link `?khach=` có thể mở trang chủ, mất tên khách). Thêm vào `<head>` sau `og:locale` — URL **tuyệt đối** `https://<tên-project>.vercel.app` (§11; `deploy.sh` chặn nếu sai domain):
  ```html
  <meta property="og:image" content="https://<domain>/images/og.jpg" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta name="twitter:image" content="https://<domain>/images/og.jpg" />   <!-- sau twitter:description -->
  ```
  Messenger lưu bản xem trước cũ: sau deploy, dán link vào https://developers.facebook.com/tools/debug/ → "Scrape Again".
- Sửa nhiều chuỗi một lần: file JSON `[[cũ, mới], …]` + script python assert mỗi chuỗi cũ xuất hiện đúng 1 lần, chạy `python3 -I`. Thay cả khối (vd `accounts: [...]`) bằng cắt theo hai mốc `s.index(a)`, `s.index(b)` thì **assert a < b** — mốc đầu khớp nhầm chỗ sau sẽ làm hỏng file mà không báo lỗi.

Mẫu 05 (`thuhong_tronghoang_nha_gai`) có `content.js` / `image.js` khác mẫu 01:
- `hero.names`, `hero.dateLines: ['25.11', '2026']` (hai dòng dưới tên), `hero.hint` (chữ dưới phong bì).
- `families.sides` xếp **dọc** trên → dưới; `invitation.announce: ['Trân Trọng Báo Tin', 'Lễ Thành Hôn', 'Của']`.
- `events.items[]`: `hour: '15 giờ 00'`, `weekday: 'Thứ Tư'`, `day: '25'`, `monthYear: '11 - 2026'`, `lunar`, `places[]`.
- `calendar.dateIso` là **mảng** nhiều ngày cùng tháng (`[]` = ẩn lịch), `calendar.photoCaption: 'My Love'`.
- `story.title/text` (mục "Our memories").
- `image.js`: `hero` (ảnh trong phong bì, dọc, object-top), `wide` (ảnh ngang 387×240), `dateStrip` 3 ảnh, `polaroid` (cạnh lịch), `circle` (ảnh tròn trong vòng lá), `album` số chẵn, `gift`, `thankYou`, và `deco` (ảnh trang trí của mẫu — không đổi theo cặp).
- Chưa có tên bố mẹ → cột gia đình vẫn giữ chiều cao mẫu (`min-h-[461px]`), khi điền tên sẽ vừa khít.

Mẫu 10 (`kimnhung_bang`):
- `*_SIDE.lines[]` là các dòng tự do (`'Cố phụ: Giuse Nguyễn Bé'`, `'Ông: …'`) — hợp với thiệp Công giáo / bố mẹ đã mất ("Cố phụ / Cố mẫu").
- `hero.names` (dòng viết tay trên tranh, ≤ ~24 ký tự), `families.couple[] = { name, role }` (tên đầy đủ + "Thứ Nam / Thứ Nữ"), `families.announce`, `event` (weekday/hour/day/month/year/lunar — **một** buổi), `calendar.dateIso` (một ngày, `null` = ẩn), `venue` (+ `mapQuery` cho nút chỉ đường và bản đồ nhúng), `closing`.
- `image.js` chỉ có `deco` (nền 囍, tranh cô dâu chú rể, 囍 đỏ, tim) + `gift` → ticket không có ảnh cưới thì dùng mẫu này được ngay.
- Thiệp **đính hôn**: tiêu đề `Engagement Invitation`, "Trân Trọng Báo Tin Lễ Đính Hôn Của", meta `Thiệp đính hôn …`.

## 5. Nhánh

**Mỗi ticket một nhánh**, tạo từ nhánh **mới nhất của cùng mẫu** (để mang theo các bản sửa chung: `vercel.json`, skill này, các fix hiệu ứng) — không tạo từ `main` (main là bản app cũ). Mỗi mẫu một `main.jsx` riêng, không trộn:

| Mẫu (ticket ghi) | Giao diện | Nhánh mới nhất |
|---|---|---|
| 01 / thiepso01 (mặc định) | khung vàng, rèm đỏ chạm mở | `thuuyen_ngochung_nha_trai`, `thanhnhan_thanhtung_nha_*` |
| 05 / thiepso05 | phong bì đỏ đô bấm mở, hoa văn vàng, lịch nền đỏ, "Our memories" | `thuhong_tronghoang_nha_gai` |
| 06 | xanh rêu, mép giấy xé | `tuan_hong` |
| 07 | Nắng Wedding: xanh rêu nhạt, giấy xé, đếm ngược | `haanh_07` (nhà gái), `ngoctien_haanh` (nhà trai) |
| 10 / thiep-moi-10 | nền đỏ 囍 + **tranh vẽ** cô dâu chú rể (không cần ảnh cưới), thẻ kem bấm lỗ như vé, bản đồ nhúng, không có màn bấm mở | `kimnhung_bang` (thiệp đính hôn) |
| ziuwedding.site/… (LadiPage "HIME WEDDING INVITATION") | phong bì đỏ dấu sáp + tên khách, nền giấy kem ngọc trai, chữ #9e3745 — **thiệp chung** hai họ: 4 sự kiện, form có "khách mời của ai", 2 nút Mừng cưới nhà trai / nhà gái, album trình chiếu | `ngoc_an` (issue #20) |
| lovecard.click/mau31 | xanh rêu #415e34 + nền giấy, bìa ảnh mờ dần vào nền xanh + 2 tên viết tay chéo + SAVE THE DATE + lịch tháng (tim vẽ tay quanh ngày), hoa ly trắng (SVG `Lily`), thẻ ảnh cô dâu / chú rể bo góc nghiêng, thẻ sự kiện xám-xanh, ảnh dán băng keo, ảnh tròn, banner "Album of Love" — cùng cấu trúc `content.js` với lovecard (thêm `couple.groom/bride`), `image.js` có `groom`, `bride`, `polaroid`, `circle` | `hien_thanh` (issue #24, mới nhất), `thuy_tuananh` (issue #21) |
| lovecard.click/mau37 | đỏ đô #5f0806 + nền giấy trắng xám, không màn mở: bìa ảnh mờ dần vào nền + tên in hoa serif (Cormorant Garamond) "&" mờ, ảnh "SAVE the DATE" + 2 polaroid nghiêng, "Chú rể \| Cô dâu" vạch dọc, lịch tháng nền đỏ (tim hồng quanh ngày), Nhà trai \| Nhà gái (Ông/Bà), 3 ảnh + ngày/tháng/năm, thẻ sự kiện xám-xanh + nút XEM VỊ TRÍ xanh lá, khối "ALBUM of LOVE" nền đỏ, form radio, ảnh tròn viền lá, Thank You — ảnh trang trí `deco-*.png` lấy từ trang mẫu; `image.js` có `polaroids`, `circle`, `deco`; sự kiện có `note` (dòng phụ) | `thuy_duy` (issue #23) |
| lovecard.click/mau-49 | nền giấy trắng, đỏ rượu #7f0606, hoa rum (calla) đỏ — ảnh trang trí lấy từ trang mẫu (`image.js → deco`); bìa ảnh "SAVE the DATE" + tên, chữ lồng 2 chữ cái + câu tiếng Anh, 3 ảnh khung hồng ngày/tháng/năm, lịch tim vân tay, Nhà trai / Nhà gái hai cột, tên hai người giữa hai vạch dọc, sự kiện THÁNG – ngày to – NĂM + XEM CHỈ ĐƯỜNG, ảnh "Two hearts…", Timeline đường cong 4 mốc (`content.timeline`), Countdown trên ảnh, Our Moments, ảnh lớn + dải ảnh nhỏ, ảnh tròn vòng lá, Thank You loang đỏ. Toạ độ theo khung 420px (`boxIn`, `fz` = cqw). Không có màn mở | `nhi_manh` (issue #22) |
| mẫu lovecard khác (mauNN) | thường cùng các mục với thiepso01 — lấy nhánh lovecard gần nhất, chỉ dựng lại giao diện (`WeddingPage`, họa tiết, `index.css`); logic nhạc / Reveal / tên khách / form / mừng cưới giữ nguyên | nhánh lovecard mới nhất |
| mẫu khác chưa có | dựng mới theo mẫu (vẽ hoa văn bằng CSS/SVG, không lấy ảnh của trang mẫu), báo người dùng | — |

Mẫu Hime: `content.js` khác cấu trúc lovecard (`envelope`, `hero.shortNames`, `events.items[].place/address`, `gift.accounts[].button`, `rsvp.guestOfOptions`), `image.js` có `hero`, `wide`, `happyBg`, `happyPair`, `album`, `gift`.

Mẫu chưa có trong bảng → dựng theo §13 rồi thêm vào bảng. Tìm nhánh của một mẫu: `git log --all --format='%h %D %s' | grep -i "mẫu 0N"`.

```bash
git branch --show-current          # người dùng có thể đã tự đổi nhánh
git checkout -b <tencodau>_<tenchure> <nhánh-mới-nhất-cùng-mẫu>    # vd thuuyen_ngochung_nha_trai
```

Tách bản chung đã làm thành hai bản: tạo `…_nha_gai` và `…_nha_trai` từ nhánh chung, sửa theo bảng dưới, mỗi bản chỉ giữ tài khoản mừng cưới của bên mình; project Vercel của bản chung xóa bằng `project rm` (§11) nếu người dùng đồng ý.

Chỉ có thiệp một bên (thường gặp) → một bản, ghi rõ là bản nhà trai hay chung. Cần **cả hai bản**:

| | Nhà gái | Nhà trai |
|---|---|---|
| `hero.names`, `fullNames`, title trang | Cô dâu trước | Chú rể trước |
| `families.sides` | `[BRIDE_SIDE, GROOM_SIDE]` | `[GROOM_SIDE, BRIDE_SIDE]` |
| `invitation.title` | Tham Dự Lễ Vu Quy | Tham Dự Lễ Thành Hôn |
| Sự kiện 1 | Tiệc Mừng Lễ Vu Quy (địa điểm nhà gái) | Tiệc Mừng Lễ Thành Hôn (tư gia nhà trai) |
| Sự kiện 2 | Lễ Thành Hôn | Lễ Thành Hôn |
| Ngày chính (dateLine, dateParts, calendar, meta) | Ngày tiệc nhà gái | **Ngày Lễ Thành Hôn** |

Đặt tên `…_nha_gai` / `…_nha_trai`. `src/main.jsx` phải **giống hệt** giữa hai nhánh — chỉ `content.js`, `image.js`, `index.html` khác nhau.

## 6. Ẩn / đổi theo yêu cầu thường gặp

| Yêu cầu | Sửa |
|---|---|
| Đưa ảnh X lên làm ảnh chính | đổi chỗ `hero` ↔ ô đang chứa ảnh X trong `image.js` |
| Ẩn lịch "Save The Date" | `calendar.dateIso: null` |
| Ẩn form "Gửi Lời Chúc & Xác Nhận" | `rsvp.show: false` |
| Chỉ nhận lời chúc, bỏ xác nhận tham dự | `rsvp.askAttend: false` |
| Ẩn nút "Gửi mừng cưới" | `gift.accounts: []` |
| Ẩn bố/mẹ/địa chỉ một bên | giá trị `null` trong `*_SIDE` |
| Đổi nhạc nền | quy trình ở §3 "Đổi nhạc nền theo yêu cầu khách" (tìm trong repo → tải nhaccuatui.com → `music.src`) |
| Đổi phông chữ "nhẹ nhàng hơn" | `tailwind.config.js` `fontFamily` (`date` / `lora` / `oswald` đang là font dày) → Cormorant Garamond nét mảnh; nhớ đổi `<link>` Google Fonts trong `index.html`, thêm `font-variant-numeric: lining-nums` ở `body` (số kiểu cổ) và `lining-nums` cạnh `tabular-nums` (class này ghi đè). Chọn font viết tay có tiếng Việt: kiểm tra `curl -A "<UA Chrome đầy đủ>" "https://fonts.googleapis.com/css2?family=X" \| grep "/\* vietnamese \*/"`, render thử bằng Chrome headless trước khi áp dụng |
| Đổi thứ tự tên (chú rể / cô dâu trước) | `hero.names`, `families.fullNames`, `families.sides` (cột trái), `<title>` / og trong `index.html`, chạy lại `og-image.sh`. **Chỉ đổi khi khách nói rõ** — mẫu của khách gửi có thể ghi thứ tự khác mà không phải yêu cầu |

### Khách nhắn thay đổi qua Zalo

Đọc nhóm Zalo của khách bằng extension Claude in Chrome (đã đăng nhập sẵn chat.zalo.me; mở tab mới, **chỉ đọc đúng nhóm "TOL - …" của ticket đang xử lý**, không mở cuộc trò chuyện khác): `navigate https://chat.zalo.me/` → chờ ~3 giây → bấm nhóm trong danh sách (hoặc tìm bằng ô tìm kiếm) → `get_page_text` đọc chữ, `screenshot` + `zoom` xem ảnh khách gửi (mẫu phông chữ, ảnh sửa). Tin nhắn có thể ghi thứ tự khác với yêu cầu thật — **chỉ làm đúng điều khách yêu cầu**, đừng suy ra thêm (vd khách gửi ảnh mẫu có tên chú rể đứng trước chưa chắc muốn đổi thứ tự tên → hỏi lại người dùng). Việc cần Google Sheet / Apps Script riêng (bật form xác nhận) → người dùng tự tạo và gửi URL `.../exec`. Gửi link thiệp vào nhóm Zalo là gửi tin nhắn thay người dùng → luôn hỏi trước.

Ảnh "bỏ phần này" thường chụp nhiều mục cùng lúc — ẩn mục ở giữa ảnh/rõ nhất, nói rõ đã giữ mục nào và hỏi lại.

## 7. Sửa chung cho nhiều nhánh

Không cherry-pick (luôn xung đột ở `dist/`). Sửa + commit ở nhánh A, rồi sang nhánh B và lấy `main.jsx` **từ nhánh A** (`git checkout <A> -- src/main.jsx`) — trước đó `git diff --stat B A -- src/main.jsx` để chắc chỉ khác phần vừa sửa; sau đó grep xác nhận bản sửa có ở cả hai nhánh. Với từng nhánh: `npm run build && git add -A src index.html public dist && git commit`.

Nếu lỡ cherry-pick bị xung đột `dist/`: xóa `dist/assets/index-*.js`, build lại, `git add -A dist`, `git cherry-pick --continue`; kiểm tra `dist/index.html` trỏ đúng file js duy nhất trong `dist/assets/`.

## 8. Link tên khách (đã có sẵn trong `useGuestName`)

- `/hoa` → "Bạn Hoa" (không có xưng hô → thêm "Bạn"); `/co-lan` → "Cô Lan"; `/gia-dinh-bac-hung` → "Gia Đình Bác Hung"; `/đức` → "Bạn Đức".
- `?khach=Tên` giữ nguyên chữ người dùng gõ, ưu tiên hơn đường dẫn.
- Từ xưng hô không dấu → có dấu: bảng `GUEST_TITLES` trong `src/main.jsx`. Tên riêng không tự thêm dấu được.
- `vercel.json` rewrite mọi đường dẫn về `index.html` (đã có trên các nhánh thiệp; Vite dev tự làm).

## 9. Kiểm tra trên trình duyệt (trước khi commit)

Dev server `npm run dev` (thường đã chạy sẵn ở `localhost:5173`, tự nhận file mới):

```bash
node $K/shot.cjs $S/pw page http://localhost:5173/ $S/t9/thiep   # → thiep-1-dau / -2-gia-dinh / -3-cuoi.png
```

Read cả 3 ảnh, soát: tên, ngày, ảnh chính; bố mẹ + địa chỉ; thẻ sự kiện; album không có viền đen; **mục Thank You có chữ + ký tên và không che mặt**; chữ không đè nút nhạc (góc trái dưới). Mục nào bị thiếu chữ → xem `Reveal` (nó quan sát lớp bọc ngoài, lớp đó phải có chiều cao thật, không được là phần tử absolute cao 0).

Mẫu có màn "bấm để mở" (05): chụp thêm chuỗi mở ở **cả điện thoại lẫn desktop** — người dùng xem trên Chrome desktop, màn cao 1054px lộ lỗi mà 430×900 không thấy:

```bash
node $K/open-seq.cjs $S/pw http://localhost:5173/ $S/t18/m             # → m-closed, m-open0..4 (mỗi 500ms), m-open-done, m-s01…
node $K/open-seq.cjs $S/pw http://localhost:5173/ $S/t18/d 1916 1054   # desktop
```

Soát: màn đóng **không** ló mục bên dưới (desktop); 5 khung sau khi bấm không có gì chớp tắt / nhảy vị trí; mở xong có tên + ngày; cuộn tới cuối đủ mọi mục. Nghi phần tử nào giật thì **đo** bằng playwright (`getBoundingClientRect` / `getComputedStyle` của nó tại 50/150/300/600ms sau khi bấm) thay vì nhìn ảnh.

Đổi `tailwind.config.js` (thêm font…) thì dev server đang chạy **không** nạp lại → ảnh chụp sai font. Kiểm tra trên bản build: `npx vite preview --port 4174 --strictPort &` rồi chụp `http://localhost:4174/`, xong `pkill -f "vite preview --port 4174"`; nhắc người dùng khởi động lại `npm run dev`.

Rồi `npm run build` (phải thành công), grep `dist/index.html` thấy đúng tên/ngày, `ls dist/images` không còn ảnh cũ/ảnh mẫu (`deco-*.png` của mẫu 05 thì giữ).

## 10. Commit

Commit message tiếng Việt, kiểu `feat: thiệp <Tên> & <Tên> — bản nhà trai (issue #9)`. **Không push** trừ khi được yêu cầu. Không commit `.gitignore` / `.env.local` do Vercel CLI sinh ra.

## 11. Deploy Vercel (khi người dùng yêu cầu)

Team: `leducuet-5765s-projects` (https://vercel.com/leducuet-5765s-projects). Mỗi thiệp **một project, tên = tên nhánh** (`gam_ngoc` → gamngoc.vercel.app). Deploy production thẳng từ code nhánh hiện tại trên máy (không cần push).

```bash
# máy không cài vercel global → gõ thẳng `npx -y vercel@65.0.0 …`; zsh KHÔNG chạy được kiểu V="npx …"; $V
npx -y vercel@65.0.0 whoami          # "Logged out" → chạy `npx -y vercel@65.0.0 login` NỀN, đọc log lấy link
                                     # https://vercel.com/oauth/device?user_code=XXXX-XXXX, đưa người dùng bấm xác nhận
git branch --show-current && git status --short                                   # đúng nhánh, đã commit
npx -y vercel@65.0.0 project ls --scope leducuet-5765s-projects                   # đã có project của nhánh này chưa
npx -y vercel@65.0.0 link --yes --project <tên-nhánh> --scope leducuet-5765s-projects   # tạo mới hoặc link project có sẵn
npx -y vercel@65.0.0 deploy --prod --yes --scope leducuet-5765s-projects          # in "Aliased https://<tên>.vercel.app", readyState READY
npx -y vercel@65.0.0 project rm <tên> --yes --scope leducuet-5765s-projects       # xóa project (vd bản chung sau khi tách hai bản) — hỏi trước
```

Kiểm tra link chính trả 200 cho `/`, một link tên khách (`/co-lan`), một ảnh QR và file nhạc; `<title>` đúng tên. Hai bản → hai project `…_nha_gai`, `…_nha_trai`, `git checkout` từng nhánh rồi link + deploy lần lượt. Cập nhật thiệp đã deploy = commit rồi chạy lại `deploy --prod` ở đúng nhánh.

Lưu ý: `vercel link` tự nối project vào repo GitHub với production branch `main` (giống các project cũ) — push lên `main` có thể deploy đè; nhắc người dùng nếu họ định push.

## 12. Báo cáo

Tiếng Việt: bảng thông tin đã lấy; cách xếp ảnh; **các điểm tự quyết định / suy luận** (thứ tự tên, bản nhà trai/chung, họ suy ra, ảnh bỏ đi…); thông tin còn thiếu cần hỏi khách; commit hash từng nhánh; nhánh đang đứng; link Vercel nếu đã deploy.

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

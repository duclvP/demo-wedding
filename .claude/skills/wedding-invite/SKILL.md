---
name: wedding-invite
description: Tạo / cập nhật thiệp cưới online cho một cặp đôi mới trong repo demo-wedding — từ ticket GitHub (issue / board "Ready") hoặc ảnh thiệp giấy, ảnh cưới, ảnh QR ngân hàng — rồi deploy lên Vercel. Dùng khi người dùng đưa link/số ticket, ảnh thiệp, thông tin cô dâu chú rể, yêu cầu làm bản nhà trai / nhà gái, tách bản chung thành hai bản, đổi ngày, địa chỉ, ảnh chính, nhạc nền, tài khoản mừng cưới, ẩn lịch / form, chỉnh link tên khách, deploy / xóa project Vercel, hoặc dựng một mẫu thiệp mới theo link lovecard.click/thiepsoNN (bóc ảnh, tọa độ, animation của mẫu).
---

# Thiệp cưới online — quy trình chuẩn

Repo: Vite + React + Tailwind. Mọi nội dung chữ nằm ở `src/content.js`, ảnh ở `src/image.js` + `public/images/`. `dist/` **được commit** nên luôn `npm run build` trước khi commit.

Đặt `S=<scratchpad>`, `K=.claude/skills/wedding-invite/scripts`. Mọi file tải về / ảnh tạm để trong `$S`, không để trong repo.

> Skill chia hai tầng để tiết kiệm token: file này là quy trình chính; chi tiết hiếm dùng nằm trong `references/` (QR, đổi nhạc, Zalo, sửa chung nhiều nhánh, link tên khách, deploy, dựng mẫu mới) — chỉ đọc khi gặp tình huống ghi ở mục tương ứng.

## 0. Đọc ticket

Trước khi làm: `git branch -a | grep` tên cặp đôi + `git log --all --oneline --grep "issue #<số>"` — ticket có thể **đã làm xong ở nhánh riêng** (chỉ thiếu form / deploy / comment); khi đó checkout nhánh đó, đừng tạo lại.

**Mẫu đã có chưa? (quyết định model)** — đọc số mẫu trong ticket ("Mẫu NN", `lovecard.click/mauNN`, `thiepsoNN`) rồi tra bảng mẫu ở §5 + `git log --all --format='%h %D %s' | grep -i "mẫu NN"`:
- **Đã có** → làm tiếp ngay ở phiên hiện tại (Sonnet đủ).
- **Chưa có** → việc dựng giao diện giao cho **subagent Opus**: gọi `Agent` với `model: "opus"`, `subagent_type: "general-purpose"`, prompt tự chứa đủ (số ticket, link mẫu, nhánh gốc, đường dẫn `$S`, yêu cầu làm theo `references/dung-mau-moi.md`, chỉ dựng giao diện — không điền nội dung cặp đôi, không push / deploy; trả về tên nhánh + commit + bảng đã thêm vào §5). Subagent không hỏi được người dùng và không thấy hội thoại này. Phiên chính nhận kết quả rồi điền nội dung / ảnh / QR (§1–§4) và deploy.
- Không chắc mẫu có hay không → hỏi người dùng một câu, đừng đoán.

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

→ **Đọc `references/qr-ngan-hang.md`** khi: Có mã QR / tài khoản mừng cưới cần giải mã (BIN → ngân hàng, crop QR).

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

→ **Đọc `references/doi-nhac.md`** khi: Khách yêu cầu đổi nhạc nền ("bài X của Y").

## 4. Cập nhật nội dung (`src/content.js`, `index.html`)

- Hằng số đầu file: `ADDRESS_*`, `GROOM_SIDE`, `BRIDE_SIDE` (father/mother/address, `null` = ẩn).
- `hero.names`, `families.fullNames` — bỏ họ (vd "Quang Hưng", "Minh Nguyệt"); tên một chữ thì giữ chữ đệm ("Thị Long") hoặc cả họ ("Phạm Ngân"). `families.fullNames` cũng là dòng ký tên cuối mục Thank You.
- `families.sides` (thứ tự cột trái → phải).
- `invitation.title`, `invitation.dateParts`, `hero.dateLine`, `calendar.dateIso`.
- `events.items`: theo thứ tự thời gian; mỗi sự kiện có `places[]` (nút chỉ đường theo `mapQuery ?? address`; `mapQuery` = địa chỉ cũ trước sáp nhập / tên địa danh dễ tìm).
- `gift.accounts`: holder (IN HOA không dấu như app ngân hàng), number (không dấu cách), bank, qr. `[]` = ẩn nút mừng cưới.
- `rsvp` (form lời chúc / xác nhận) — **dùng script Google dùng chung, đừng tạo Sheet / Apps Script riêng** (chi tiết: google-apps-script/README.md):
  - `endpoint: 'https://script.google.com/macros/s/AKfycbxGFb49383QZuzEF1D_sx_JSNSCecscN3j2aZShNuCGpbDiKK9bwoPawGo5Y_pKbacu/exec'` (URL chung, tài khoản leducuet@gmail.com; endpoint của thiệp cũ là Sheet riêng của cặp khác → không copy).
  - `coupleId`: slug duy nhất mỗi thiệp (vd `khong-thuy-duc-duy`), `coupleName`: tên Sheet (vd `Khổng Thủy & Đức Duy`) — **không đổi coupleId sau khi đã có lời chúc** (mất liên kết với Sheet cũ). `show: true` mới hiện form.
  - Sheet riêng tự tạo ở lời chúc đầu tiên (thư mục Drive "Thiệp cưới - Lời chúc"), mặc định **chỉ chủ tài khoản mở được**. Muốn tạo ngay không chờ khách: gửi thử `curl -s -X POST "$URL" --data-urlencode couple=<id> --data-urlencode coupleName=<tên> --data-urlencode name="TEST" --data-urlencode message=thử` (trả 302 là đã chạy — `curl -L` ra 404 là bình thường vì gọi lại POST), rồi nhắc người dùng xoá dòng TEST.
  - Nhánh cũ chưa có `coupleId` trong `RsvpForm` (`src/main.jsx`): `if (!c.endpoint || !c.coupleId)` và thêm `couple: c.coupleId, coupleName: c.coupleName || ""` vào `URLSearchParams`; thêm `coupleId`, `coupleName` vào `rsvp` trong `content.js`.
  - Lấy link Sheet gửi khách: Chrome extension → `drive.google.com/drive/search?q=Lời chúc - <tên>` → ID trong `data-id`; link `https://docs.google.com/spreadsheets/d/<ID>/edit`. Chia sẻ cho khách bằng hàm `shareWithClient` trong Apps Script (điền email khách; không bật "ai có link" cho repo public) — việc cấp quyền tài khoản Google do người dùng tự bấm (popup OAuth nằm ngoài tab extension điều khiển).
  - Cần triển khai lại script (URL mới): dán Code.gs vào script.google.com bằng `monaco.editor.getModels()[0].setValue(code)` qua javascript_tool, Triển khai → Ứng dụng web → Bất kỳ ai; popup cấp quyền người dùng tự bấm. Sửa script cũ: Quản lý bản triển khai → phiên bản mới để giữ URL.
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

→ **Đọc `references/zalo.md`** khi: Cần đọc nhóm Zalo của khách (yêu cầu sửa, ảnh mẫu).

## 7. Sửa chung cho nhiều nhánh

→ **Đọc `references/sua-chung-nhieu-nhanh.md`** khi: Một bản sửa phải áp cho nhiều nhánh (main.jsx dùng chung).

## 8. Link tên khách (đã có sẵn trong `useGuestName`)

→ **Đọc `references/link-ten-khach.md`** khi: Hỏi về link tên khách, `?khach=`, trang tạo link `/tao-link`.

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

Chỉ deploy khi người dùng yêu cầu; một lệnh `$K/deploy.sh <tên-project>` (chạy nền; `--check` trước). Team `ducs-projects-2e3ef64b`, quota 100 lượt/24h.

→ **Đọc `references/deploy-vercel.md`** (bắt buộc trước khi deploy) khi: Người dùng yêu cầu deploy; hạn mức 100 lượt; tên project trùng; comment ticket sau deploy.

## 12. Báo cáo

Tiếng Việt: bảng thông tin đã lấy; cách xếp ảnh; **các điểm tự quyết định / suy luận** (thứ tự tên, bản nhà trai/chung, họ suy ra, ảnh bỏ đi…); thông tin còn thiếu cần hỏi khách; commit hash từng nhánh; nhánh đang đứng; link Vercel nếu đã deploy.

## 13. Dựng mẫu mới từ trang lovecard (ticket đòi mẫu chưa có trong bảng §5)

→ **Đọc `references/dung-mau-moi.md`** khi: Ticket đòi mẫu chưa có trong bảng mẫu (§0).

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

## 4. Cập nhật nội dung (`src/content.js`, `index.html`)

- Hằng số đầu file: `ADDRESS_*`, `GROOM_SIDE`, `BRIDE_SIDE` (father/mother/address, `null` = ẩn).
- `hero.names`, `families.fullNames` — bỏ họ (vd "Quang Hưng", "Minh Nguyệt"); tên một chữ thì giữ chữ đệm ("Thị Long") hoặc cả họ ("Phạm Ngân"). `families.fullNames` cũng là dòng ký tên cuối mục Thank You.
- `families.sides` (thứ tự cột trái → phải).
- `invitation.title`, `invitation.dateParts`, `hero.dateLine`, `calendar.dateIso`.
- `events.items`: theo thứ tự thời gian; mỗi sự kiện có `places[]` (nút chỉ đường theo `mapQuery ?? address`; `mapQuery` = địa chỉ cũ trước sáp nhập / tên địa danh dễ tìm).
- `gift.accounts`: holder (IN HOA không dấu như app ngân hàng), number (không dấu cách), bank, qr. `[]` = ẩn nút mừng cưới.
- `rsvp.endpoint: ''` cho cặp mới (endpoint cũ là Google Sheet của cặp khác). `rsvp.show: false` đang là mặc định.
- `index.html`: `<title>`, description, og:*, twitter:* — tên theo thứ tự của bản đó + thứ, ngày chính.
- Sửa nhiều chuỗi một lần: file JSON `[[cũ, mới], …]` + script python assert mỗi chuỗi cũ xuất hiện đúng 1 lần, chạy `python3 -I`. Thay cả khối (vd `accounts: [...]`) bằng cắt theo hai mốc `s.index(a)`, `s.index(b)` thì **assert a < b** — mốc đầu khớp nhầm chỗ sau sẽ làm hỏng file mà không báo lỗi.

Mẫu 05 (`thuhong_tronghoang_nha_gai`) có `content.js` / `image.js` khác mẫu 01:
- `hero.names`, `hero.dateLines: ['25.11', '2026']` (hai dòng dưới tên), `hero.hint` (chữ dưới phong bì).
- `families.sides` xếp **dọc** trên → dưới; `invitation.announce: ['Trân Trọng Báo Tin', 'Lễ Thành Hôn', 'Của']`.
- `events.items[]`: `hour: '15 giờ 00'`, `weekday: 'Thứ Tư'`, `day: '25'`, `monthYear: '11 - 2026'`, `lunar`, `places[]`.
- `calendar.dateIso` là **mảng** nhiều ngày cùng tháng (`[]` = ẩn lịch), `calendar.photoCaption: 'My Love'`.
- `story.title/text` (mục "Our memories").
- `image.js`: `hero` (ảnh trong phong bì, dọc, object-top), `wide` (ảnh ngang 387×240), `dateStrip` 3 ảnh, `polaroid` (cạnh lịch), `circle` (ảnh tròn trong vòng lá), `album` số chẵn, `gift`, `thankYou`, và `deco` (ảnh trang trí của mẫu — không đổi theo cặp).
- Chưa có tên bố mẹ → cột gia đình vẫn giữ chiều cao mẫu (`min-h-[461px]`), khi điền tên sẽ vừa khít.

## 5. Nhánh

**Mỗi ticket một nhánh**, tạo từ nhánh **mới nhất của cùng mẫu** (để mang theo các bản sửa chung: `vercel.json`, skill này, các fix hiệu ứng) — không tạo từ `main` (main là bản app cũ). Mỗi mẫu một `main.jsx` riêng, không trộn:

| Mẫu (ticket ghi) | Giao diện | Nhánh mới nhất |
|---|---|---|
| 01 / thiepso01 (mặc định) | khung vàng, rèm đỏ chạm mở | `thuuyen_ngochung_nha_trai`, `thanhnhan_thanhtung_nha_*` |
| 05 / thiepso05 | phong bì đỏ đô bấm mở, hoa văn vàng, lịch nền đỏ, "Our memories" | `thuhong_tronghoang_nha_gai` |
| 06 | xanh rêu, mép giấy xé | `tuan_hong` |
| 07 | Nắng Wedding: xanh rêu nhạt, giấy xé, đếm ngược | `haanh_07` (nhà gái), `ngoctien_haanh` (nhà trai) |

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

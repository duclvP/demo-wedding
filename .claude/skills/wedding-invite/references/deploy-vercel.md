## 11. Deploy Vercel (khi người dùng yêu cầu)

**Từ 24/10/2026 mọi thiệp deploy vào team `ducs-projects-2e3ef64b`** (https://vercel.com/ducs-projects-2e3ef64b, tài khoản Vercel **xduclv**). Team cũ `leducuet-5765s-projects` bỏ, không deploy nữa — thiệp cũ cần sửa thì chuyển sang team mới (link đổi, báo người dùng gửi link mới cho khách). Đăng nhập lưu riêng ở `~/.config/vercel-ducs` (không đụng đăng nhập mặc định của CLI; **không** để trong scratchpad — mất khi hết phiên):

```bash
V="npx -y vercel@65.0.0 --global-config ~/.config/vercel-ducs"
$V whoami        # phải ra xduclv. Lỗi → chạy NỀN `$V login > ~/.config/vercel-ducs/login.log 2>&1`,
                 # grep link https://vercel.com/oauth/device?user_code=XXXX-XXXX, đưa người dùng (đăng nhập xduclv)
```

**Tên project** = `<tencodau>-<tenchure>` (gạch ngang, vd `thuuyen-ngochung`, `truongan-hongngoc`) → domain `https://<tên>.vercel.app`. Tên `.vercel.app` là toàn cầu: nếu đã có người dùng, Vercel gán tên có hậu tố ngẫu nhiên → og:image sai domain. `deploy.sh` tự kiểm tra (`DEPLOYMENT_NOT_FOUND` = còn trống).

**Deploy = một lệnh** (ở gốc repo, đúng nhánh, đã commit hết):

```bash
$K/deploy.sh <tên-project> --check   # chỉ kiểm tra, không tốn lượt — chạy trước khi báo người dùng "sẵn sàng"
$K/deploy.sh <tên-project>           # kiểm tra → push GitHub → link + ngắt GitHub → deploy --prod → curl kiểm tra
```

Script dừng **trước khi tốn lượt** nếu: chưa đăng nhập; còn file chưa commit (kể cả file mới chưa track — Vercel CLI upload cả thư mục); `dist/` không khớp mã nguồn (build lại thấy khác = quên build trước commit); og:image không trỏ đúng domain thật của project; thiếu `og.jpg`; `vercel.json` thiếu `deploymentEnabled: false`; hết hạn mức; push GitHub lỗi. Sau deploy in mã HTTP cho `/`, `/co-lan`, `/tao-link`, `/images/og.jpg` + `<title>`. Thiệp đã deploy cập nhật = sửa → commit → `deploy.sh` lại. Dừng ở bước nào thì sửa đúng lỗi đó rồi chạy lại, không deploy tay vòng qua script.

### Hạn mức 100 deployment / 24h (Hobby, cho cả team)

Cửa sổ **trượt 24h** (không reset nửa đêm): lượt thứ N có lại đúng 24h sau khi nó được tạo. `$K/quota.sh [số-lượt-cần]` in số đã dùng / còn lại và giờ có lại lượt. Lỗi `api-deployments-free-per-day` = hết; tạo project mới **cùng team không giúp gì** (chung hạn mức) — chỉ team khác mới có 100 lượt riêng.

Ngày 24/10/2026 team cũ hết hạn mức vì ~21 project cùng nối GitHub repo này: mỗi push sinh ~21 preview deployment (5 push ≈ 100). Quy tắc tiết kiệm:
- **Một yêu cầu của khách = một lần deploy.** Gom mọi chỉnh sửa (ngày, ảnh, chữ, og.jpg…) → soát trên dev server `localhost:5173` + `npm run build` → deploy một lần. Khách gửi liên tiếp nhiều sửa nhỏ → làm hết rồi mới deploy; đừng deploy "để xem thử" — xem bằng dev server (`vite preview` nếu cần bản build).
- Không bao giờ nối GitHub: `deploy.sh` luôn `git disconnect` sau link; `vercel.json` giữ `"git": { "deploymentEnabled": false }` (nhánh mới tạo từ nhánh mới nhất nên tự có — nhánh cũ thiếu thì `git checkout ngoc_an -- vercel.json`).
- Không dùng preview deployment, không `vercel deploy` không có `--prod`.
- Sửa nhiều thiệp một lúc: `quota.sh <số thiệp>` trước, đủ lượt mới làm.
- Xem trước link (Messenger/Zalo) bị cache: link cũ đã gửi không tự đổi; dán link vào https://developers.facebook.com/tools/debug/ → "Scrape Again" — việc này không tốn lượt deploy.

### Tên project bị trùng / sau khi deploy

- `deploy.sh` báo "`<tên>.vercel.app đã có người dùng`" → dừng **trước khi tốn lượt**. Chạy `deploy.sh <tên-khác> --check` (vd `thuy-duy` = `<tencodau>-<tenchure>`) rồi đổi tên domain trong `index.html` (`sed -i 's#<tên-cũ>.vercel.app#<tên-mới>.vercel.app#g' index.html`), `npm run build`, commit, deploy. Nên `--check` tên đó **ngay từ đầu** (kể cả tên đã đặt sẵn trong `index.html` từ ticket trước), tránh build / commit hai lần.
- Nếu `.vercel/project.json` còn của thiệp khác thì xoá trước khi deploy project mới.
- **Sau deploy, comment lên ticket** (`gh issue comment <số> --repo duclvP/demo-wedding`): link thiệp + link Sheet lời chúc (Sheet vẫn riêng tư; repo public nên không bật "ai có link"). Đây là việc người dùng đã yêu cầu cho #23; ticket khác thì hỏi lần đầu.

## 8. Link tên khách (đã có sẵn trong `useGuestName`)

- `/hoa` → "Bạn Hoa" (không có xưng hô → thêm "Bạn"); `/co-lan` → "Cô Lan"; `/gia-dinh-bac-hung` → "Gia Đình Bác Hung"; `/đức` → "Bạn Đức".
- `?khach=Tên` giữ nguyên chữ người dùng gõ, ưu tiên hơn đường dẫn.
- Từ xưng hô không dấu → có dấu: bảng `GUEST_TITLES` trong `src/main.jsx`. Tên riêng không tự thêm dấu được.
- `vercel.json` rewrite mọi đường dẫn về `index.html` (đã có trên các nhánh thiệp; Vite dev tự làm).

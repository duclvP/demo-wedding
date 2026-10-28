## 7. Sửa chung cho nhiều nhánh

Không cherry-pick (luôn xung đột ở `dist/`). Sửa + commit ở nhánh A, rồi sang nhánh B và lấy `main.jsx` **từ nhánh A** (`git checkout <A> -- src/main.jsx`) — trước đó `git diff --stat B A -- src/main.jsx` để chắc chỉ khác phần vừa sửa; sau đó grep xác nhận bản sửa có ở cả hai nhánh. Với từng nhánh: `npm run build && git add -A src index.html public dist && git commit`.

Nếu lỡ cherry-pick bị xung đột `dist/`: xóa `dist/assets/index-*.js`, build lại, `git add -A dist`, `git cherry-pick --continue`; kiểm tra `dist/index.html` trỏ đúng file js duy nhất trong `dist/assets/`.

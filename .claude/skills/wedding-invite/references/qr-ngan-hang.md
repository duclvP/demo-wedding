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

# fetch-issue-linux.sh dùng: tạo bản xem thử 700px (JPEG) và in kích thước ảnh gốc. Chạy: python3 -I preview.py <ảnh gốc> <ảnh ra.jpg>
import sys
from PIL import Image, ImageOps
src, dst = sys.argv[1:3]
try:
    im = ImageOps.exif_transpose(Image.open(src))
    print(f"{src.split('/')[-1]} {im.size[0]}x{im.size[1]}", end='')
    im = im.convert('RGB'); im.thumbnail((700, 700)); im.save(dst, quality=85)
except Exception as e:
    print(f"{src} LỖI {e}", end='')

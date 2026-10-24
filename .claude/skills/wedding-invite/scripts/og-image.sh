#!/usr/bin/env bash
# Ảnh xem trước link (og:image) 1200×630: ảnh cưới cắt ngang + tên & ngày ở giữa dưới.
# og-image.sh <ảnh> <vị-trí-dọc-%> "<Tên ♥ Tên>" "<dòng ngày>" <out.jpg>
#   vị-trí-dọc-%: background-position-y (0 = lấy mép trên, 50 = giữa) — chọn sao cho thấy rõ mặt.
set -euo pipefail
IMG=$(realpath "$1"); POS=$2; NAMES=$3; DATE=$4; OUT=$5
CHROME=${CHROME:-$(command -v google-chrome || echo "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome")}
T=$(mktemp -d)
cat > "$T/og.html" <<EOF
<!doctype html><html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600&display=swap" rel="stylesheet">
<style>
html,body{margin:0;width:1200px;height:630px;overflow:hidden}
.bg{position:absolute;inset:0;background:url('file://$IMG') center $POS%/cover}
.shade{position:absolute;inset:0;background:linear-gradient(to bottom,rgba(0,0,0,0) 45%,rgba(0,0,0,.55) 100%)}
.txt{position:absolute;left:0;right:0;bottom:56px;text-align:center;color:#fff;font-family:'Cormorant Garamond',serif;text-shadow:0 2px 12px rgba(0,0,0,.5)}
.n{font-size:68px;font-weight:600;line-height:1.1}
.d{font-size:36px;font-weight:500;margin-top:8px;letter-spacing:1px;font-variant-numeric:lining-nums}
</style></head><body><div class="bg"></div><div class="shade"></div>
<div class="txt"><div class="n">$NAMES</div><div class="d">$DATE</div></div></body></html>
EOF
"$CHROME" --headless=new --disable-gpu --hide-scrollbars --allow-file-access-from-files \
  --virtual-time-budget=5000 --window-size=1200,630 --screenshot="$T/og.png" "file://$T/og.html" 2>/dev/null
python3 -c "from PIL import Image; Image.open('$T/og.png').convert('RGB').save('$OUT', quality=85, optimize=True)"
rm -rf "$T"
echo "$OUT $(du -h "$OUT" | cut -f1)"

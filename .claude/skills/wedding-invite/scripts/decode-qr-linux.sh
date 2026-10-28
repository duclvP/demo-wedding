#!/bin/bash
# Giải mã QR trên Linux (thay decode-qr.swift): jsQR + PIL.
# Dùng: decode-qr-linux.sh <ảnh> [x0 y0 x1 y1]    (toạ độ crop quanh mã QR, chừa lề; bỏ trống = cả ảnh)
# Cài một lần mỗi phiên: npm i --prefix $S/qr jsqr@1.4.0   (S = scratchpad; đặt QRDIR nếu để chỗ khác)
# In chuỗi VietQR: 0006<BIN 6 số>01<độ dài><STK> → tra BIN trong SKILL.md §2.
set -e
QRDIR=${QRDIR:-${S:?đặt S hoặc QRDIR}/qr}
RAW=$(mktemp --suffix=.rgba)
python3 -I - "$@" "$RAW" <<'PY'
import sys
from PIL import Image
a = sys.argv[1:]; raw = a[-1]; img = a[0]; box = tuple(map(int, a[1:5])) if len(a) == 6 else None
im = Image.open(img).convert('L')
if box: im = im.crop(box)
im = im.point(lambda v: 255 if v > 140 else 0).convert('RGBA').resize((400, 400))
open(raw, 'wb').write(im.tobytes())
PY
cd "$QRDIR" && node -e "
const jsQR=require('jsqr');const d=new Uint8ClampedArray(require('fs').readFileSync('$RAW'));
const r=jsQR(d,400,400);console.log(r?r.data:'KHÔNG ĐỌC ĐƯỢC — crop sát mã hơn / đổi ngưỡng 140');"
rm -f "$RAW"

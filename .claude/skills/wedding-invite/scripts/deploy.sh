#!/usr/bin/env bash
# Deploy production một thiệp lên team Vercel — tốn đúng 1 lượt, chặn mọi lỗi đã gặp TRƯỚC khi tốn lượt.
# Dùng (ở gốc repo, đúng nhánh, đã commit hết): deploy.sh <tên-project>     vd: deploy.sh thuuyen-ngochung
#      deploy.sh <tên-project> --check   → chỉ chạy các bước kiểm tra 1–5, không push, không deploy.
# Biến môi trường: VC (thư mục --global-config, mặc định ~/.config/vercel-ducs), SCOPE (slug team).
set -euo pipefail
P=${1:?Dùng: deploy.sh <tên-project>}
VC=${VC:-$HOME/.config/vercel-ducs}
SCOPE=${SCOPE:-ducs-projects-2e3ef64b}
K=$(cd "$(dirname "$0")" && pwd)
export NODENV_VERSION=${NODENV_VERSION:-22.22.3}
V="npx -y vercel@65.0.0 --global-config $VC"
die() { echo "✗ $*" >&2; exit 1; }

# 1. Đăng nhập đúng tài khoản
$V whoami >/dev/null 2>&1 || die "Chưa đăng nhập Vercel ($VC). Chạy NỀN: $V login — đưa người dùng link oauth/device trong log."

# 2. Cây làm việc sạch (bỏ qua node_modules linux chưa track)
DIRTY=$(git status --porcelain | grep -v '^?? node_modules/' || true)
[ -z "$DIRTY" ] || die "Còn thay đổi chưa commit:
$DIRTY"

# 3. dist/ khớp mã nguồn: build lại, dist phải không đổi (đã từng commit index.html mà quên build)
if [ -d node_modules/@rollup/rollup-linux-x64-gnu ] || [ "$(uname)" = Darwin ]; then :; else
  npm i --no-save @rollup/rollup-linux-x64-gnu >/dev/null; fi
npm run build >/dev/null 2>&1 || die "npm run build lỗi"
[ "$(uname)" = Darwin ] || git checkout -- node_modules 2>/dev/null || true
[ -z "$(git status --porcelain dist)" ] || die "dist/ chưa build lại trước khi commit — git add dist && commit rồi chạy lại."

# 4. Project + domain: og:image phải trỏ đúng domain thật của project
TOKEN=$(python3 -c "import json;print(json.load(open('$VC/auth.json'))['token'])")
TEAM=$(curl -s -H "Authorization: Bearer $TOKEN" https://api.vercel.com/v2/teams \
  | python3 -c "import json,sys;print(next(t['id'] for t in json.load(sys.stdin)['teams'] if t['slug']=='$SCOPE'))")
PJ=$(curl -s -H "Authorization: Bearer $TOKEN" "https://api.vercel.com/v9/projects/$P?teamId=$TEAM")
DOMAIN=$(echo "$PJ" | python3 -c "
import json,sys; p=json.load(sys.stdin)
if 'error' in p: print('')
else:
  a=[x for x in (p.get('targets',{}).get('production',{}) or {}).get('alias',[]) if x.endswith('.vercel.app') and '-$SCOPE' not in x]
  print(min(a,key=len) if a else '')")
if [ -z "$DOMAIN" ]; then
  # Chưa có deploy production nào thành công (vd bị BLOCKED) → alias rỗng; hỏi thẳng danh sách domain của project
  DOMAIN=$(curl -s -H "Authorization: Bearer $TOKEN" "https://api.vercel.com/v9/projects/$P/domains?teamId=$TEAM" \
    | python3 -c "
import json,sys; d=json.load(sys.stdin)
a=[x['name'] for x in d.get('domains',[]) if x['name'].endswith('.vercel.app')]
print(min(a,key=len) if a else '')" 2>/dev/null || true)
fi
if [ -z "$DOMAIN" ]; then
  DOMAIN="$P.vercel.app"
  curl -s -m 30 "https://$DOMAIN/" | grep -q DEPLOYMENT_NOT_FOUND \
    || die "Project mới nhưng $DOMAIN đã có người dùng → Vercel sẽ gán tên khác, og:image sai. Chọn tên project khác."
  echo "• Project mới: $P → https://$DOMAIN"
else
  echo "• Project có sẵn: $P → https://$DOMAIN"
fi
grep -q "content=\"https://$DOMAIN/images/og.jpg\"" index.html \
  || die "index.html: og:image phải là https://$DOMAIN/images/og.jpg (hiện: $(grep -o 'og:image" content="[^"]*' index.html || echo 'không có'))"
[ -f public/images/og.jpg ] || die "Thiếu public/images/og.jpg — tạo bằng og-image.sh"
grep -q '"deploymentEnabled": false' vercel.json || die "vercel.json thiếu \"git\": { \"deploymentEnabled\": false }"

# 5. Hạn mức
VC=$VC SCOPE=$SCOPE "$K/quota.sh" 1 || die "Hết hạn mức deploy — đợi tới giờ trên."
[ "${2:-}" = --check ] && { echo "✓ Kiểm tra xong (--check), chưa push/deploy."; exit 0; }

# 6. Push GitHub (bắt buộc trước deploy)
git push -q -u origin HEAD || die "Push GitHub lỗi — không deploy."
git status -sb | head -1 | grep -q ahead && die "Nhánh vẫn ahead origin sau push."

# 7. Link đúng project + ngắt GitHub, rồi deploy
CUR=$(python3 -c "import json;print(json.load(open('.vercel/project.json')).get('projectName',''))" 2>/dev/null || true)
if [ "$CUR" != "$P" ] || ! grep -q "$TEAM" .vercel/project.json 2>/dev/null; then
  rm -rf .vercel
  $V link --yes --project "$P" --scope "$SCOPE" >/dev/null 2>&1 || die "vercel link lỗi"
fi
$V git disconnect --yes >/dev/null 2>&1 || true
OUT=$($V deploy --prod --yes --scope "$SCOPE" 2>&1) || { echo "$OUT" | tail -15; die "deploy lỗi"; }
ALIAS=$(echo "$OUT" | grep -o 'Aliased *https://[^ ]*' | grep -o 'https://.*' | head -1)
echo "• Đã deploy: $ALIAS"
[ "$ALIAS" = "https://$DOMAIN" ] || echo "⚠ Alias ($ALIAS) khác domain trong og:image (https://$DOMAIN) — sửa index.html rồi deploy lại."

# 8. Kiểm tra bản thật
# HEAD + giới hạn thời gian: mạng chậm từng làm script treo khi tải ảnh. og.jpg so etag với md5 file local.
for p in / /co-lan /tao-link; do
  printf '  %-16s %s\n' "$p" "$(curl -s -m 30 -o /dev/null -w '%{http_code}' "https://$DOMAIN$p" || echo timeout)"
done
ETAG=$(curl -sI -m 30 "https://$DOMAIN/images/og.jpg" | tr -d '\r"' | awk -F': ' 'tolower($1)=="etag"{print $2}')
MD5=$(md5sum public/images/og.jpg 2>/dev/null | cut -d' ' -f1 || md5 -q public/images/og.jpg)
[ "$ETAG" = "$MD5" ] && echo "  /images/og.jpg   khớp file local" || echo "  ⚠ /images/og.jpg etag=$ETAG ≠ md5 local=$MD5"
echo "  title: $(curl -s -m 30 "https://$DOMAIN/" | grep -o '<title>[^<]*' | sed 's/<title>//')"

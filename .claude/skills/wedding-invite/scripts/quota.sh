#!/usr/bin/env bash
# Đếm số deployment của team Vercel trong 24 giờ gần nhất (hạn mức Hobby: 100, cửa sổ trượt 24h).
# Dùng: quota.sh [số-lượt-cần=1]   → in "đã dùng / còn lại"; thoát mã 1 nếu không đủ lượt, kèm giờ có lại lượt.
# Biến môi trường: VC (thư mục --global-config, mặc định ~/.config/vercel-ducs), SCOPE (slug team).
set -euo pipefail
NEED=${1:-1}
VC=${VC:-$HOME/.config/vercel-ducs}
SCOPE=${SCOPE:-ducs-projects-2e3ef64b}
python3 - "$VC/auth.json" "$SCOPE" "$NEED" <<'EOF'
import json, sys, time, urllib.request, datetime as dt
auth, slug, need = sys.argv[1], sys.argv[2], int(sys.argv[3])
tok = json.load(open(auth))['token']
def get(u):
    return json.load(urllib.request.urlopen(urllib.request.Request(
        'https://api.vercel.com' + u, headers={'Authorization': 'Bearer ' + tok})))
team = next(t['id'] for t in get('/v2/teams')['teams'] if t['slug'] == slug)
now = int(time.time() * 1000); since = now - 86400000; until = now; ts = []
while True:
    ds = get(f'/v6/deployments?teamId={team}&limit=100&since={since}&until={until}')['deployments']
    ts += [d['created'] for d in ds]
    if len(ds) < 100: break
    until = min(d['created'] for d in ds) - 1
ts.sort(); LIMIT = 100; left = LIMIT - len(ts)
print(f'Team {slug}: {len(ts)}/{LIMIT} deployment trong 24h, còn {max(left, 0)} lượt.')
if left >= need: sys.exit(0)
# Lượt thứ k cũ nhất hết tính lúc created + 24h
free_at = dt.datetime.fromtimestamp((ts[need - left - 1] + 86400000) / 1000)
print(f'KHÔNG ĐỦ {need} lượt — có lại lúc {free_at:%H:%M %d/%m}.')
sys.exit(1)
EOF

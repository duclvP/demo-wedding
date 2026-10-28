#!/bin/bash
# Bản Linux của fetch-issue.sh (không cần zsh / sips / md5): issue.md + i10.bin… + p*.jpg xem thử 700px.
# Dùng: fetch-issue-linux.sh <số issue> <thư mục ra>
set -e
export PATH=$HOME/.local/bin:$PATH
N=$1; OUT=$2; [ -z "$N" ] || [ -z "$OUT" ] && { echo "dùng: fetch-issue-linux.sh <issue> <dir>"; exit 1; }
mkdir -p "$OUT"
gh issue view "$N" -R duclvP/demo-wedding --json title,body,comments \
  --jq '"# " + .title, .body, (.comments[] | "\n--- comment " + .author.login + " " + .createdAt + "\n" + .body)' > "$OUT/issue.md"
T=$(gh auth token)
grep -o 'https://github.com/user-attachments/assets/[a-f0-9-]*' "$OUT/issue.md" > "$OUT/urls.txt" || true
i=10
while read -r u; do
  curl -sL -H "Authorization: token $T" -o "$OUT/i$i.bin" "$u"
  python3 -I "$(dirname "$0")/preview.py" "$OUT/i$i.bin" "$OUT/p$i.jpg"
  echo "  md5:$(md5sum "$OUT/i$i.bin" | cut -c1-8)"
  i=$((i+1))
done < "$OUT/urls.txt"
echo "→ $OUT/issue.md ($(wc -l < "$OUT/urls.txt") ảnh). md5 trùng = ảnh trùng."
echo "Ticket có file .zip đính kèm (link .../user-attachments/files/...): tải bằng curl -sL -H \"Authorization: token \$(gh auth token)\" rồi giải nén vào thư mục riêng."

#!/bin/zsh
# Tải nội dung + toàn bộ ảnh đính kèm (cả trong BÌNH LUẬN) của một issue GitHub.
# Dùng: fetch-issue.sh <số issue> <thư mục ra>
# Ra: issue.md (body + comments), i10.bin, i11.bin… theo thứ tự xuất hiện, p*.jpg (bản xem thử 700px)
set -e
N=$1; OUT=$2
[[ -z $N || -z $OUT ]] && { echo "dùng: fetch-issue.sh <issue> <dir>"; exit 1; }
mkdir -p $OUT
gh issue view $N --json title,body,comments \
  --jq '"# " + .title, .body, (.comments[] | "\n--- comment " + .author.login + " " + .createdAt + "\n" + .body)' > $OUT/issue.md
T=$(gh auth token)
grep -o 'https://github.com/user-attachments/assets/[a-f0-9-]*' $OUT/issue.md > $OUT/urls.txt || true
i=10
while read u; do
  curl -sL -H "Authorization: token $T" -o $OUT/i$i.bin "$u"
  sips -s format jpeg -Z 700 $OUT/i$i.bin --out $OUT/p$i.jpg >/dev/null 2>&1 || true
  wh=$(sips -g pixelWidth -g pixelHeight $OUT/i$i.bin | awk '/pixel/{printf $2"x"}')
  echo "i$i ${wh%x} md5:$(md5 -q $OUT/i$i.bin | cut -c1-8)"
  i=$((i+1))
done < $OUT/urls.txt
echo "→ $OUT/issue.md ($(wc -l < $OUT/urls.txt | tr -d ' ') ảnh). md5 trùng = ảnh trùng."

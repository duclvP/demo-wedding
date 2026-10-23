// Bóc một mẫu thiệp lovecard.click (LadiPage) để dựng lại trong repo.
//
// node ladi-dump.cjs $S/pw https://www.lovecard.click/thiepso05 $S/mau05
//
// Ra trong <outdir>:
//   elements.txt   mọi phần tử theo thứ tự y: ID  x,y w×h | chữ | font cỡ/lh/đậm/màu | bg <file> crop w% l% t% | anim
//                  (tọa độ trên khung rộng ~420px của mẫu, y tính từ đỉnh trang; crop = ảnh nền bị cắt thế nào so với hộp)
//   fonts.txt      @font-face: tên hash → file font (nhận ra font trả phí của mẫu: 1FTV VIP High Spirited, Ed Drayton…)
//   keyframes.txt  mọi @keyframes của trang
//   assets/        mọi ảnh nền (PNG/JPG; WebP đã đổi sang PNG), tên = số thứ tự + tên gốc
//   closed.png, open.png, s01.png…  màn đóng, sau khi bấm mở 3s, rồi cuộn từng màn
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { chromium } = require(path.join(process.argv[2], 'node_modules/playwright-core'));
const [url, out] = process.argv.slice(3);
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

(async () => {
  fs.mkdirSync(path.join(out, 'assets'), { recursive: true });
  const browser = await chromium.launch({ executablePath: CHROME });
  const p = await browser.newPage({ viewport: { width: 430, height: 900 } });
  await p.goto(url, { waitUntil: 'networkidle' });
  await p.waitForTimeout(1500);
  await p.screenshot({ path: path.join(out, 'closed.png') });
  // Các mẫu đều mở bằng cách bấm vào giữa màn đầu
  await p.mouse.click(215, 420);
  await p.waitForTimeout(3000);
  await p.screenshot({ path: path.join(out, 'open.png') });
  // Cuộn hết trang để lazy-load ảnh + chạy animation, chụp từng màn
  let n = 1;
  for (let i = 0; i < 40; i++) {
    const before = await p.evaluate(() => window.scrollY);
    await p.mouse.wheel(0, 800);
    await p.waitForTimeout(1200);
    await p.screenshot({ path: path.join(out, `s${String(n++).padStart(2, '0')}.png`) });
    if ((await p.evaluate(() => window.scrollY)) === before) break;
  }
  await p.evaluate(() => window.scrollTo(0, 0));
  await p.waitForTimeout(500);

  const data = await p.evaluate(() => {
    const px = (v) => Math.round(parseFloat(v) * 10) / 10;
    const items = [];
    for (const e of document.querySelectorAll('.ladi-element')) {
      const bb = e.getBoundingClientRect();
      if (bb.width === 0 && bb.height === 0) continue;
      const inner = e.firstElementChild;
      const cs = inner ? getComputedStyle(inner) : null;
      const txt = e.querySelector('.ladi-headline, .ladi-paragraph');
      const tcs = txt ? getComputedStyle(txt) : null;
      const bg = e.querySelector(':scope > .ladi-image > .ladi-image-background');
      let bgInfo = null;
      if (bg) {
        const b = getComputedStyle(bg);
        const m = /url\("?([^")]+)"?\)/.exec(b.backgroundImage);
        if (m) {
          bgInfo = {
            url: m[1],
            w: Math.round((px(b.width) / bb.width) * 1000) / 10,
            l: Math.round((px(b.left) / bb.width) * 1000) / 10,
            t: Math.round((px(b.top) / bb.height) * 1000) / 10,
          };
        }
      }
      items.push({
        id: e.id,
        x: Math.round(bb.x),
        y: Math.round(bb.y + window.scrollY),
        w: Math.round(bb.width),
        h: Math.round(bb.height),
        text: (e.innerText || '').replace(/\s*\n\s*/g, ' / ').trim().slice(0, 60),
        font: tcs
          ? `${tcs.fontFamily.split(',')[0].replace(/"/g, '').slice(0, 30)} ${tcs.fontSize}/${tcs.lineHeight} ${tcs.fontWeight} ${tcs.color} ${tcs.textTransform !== 'none' ? tcs.textTransform : ''} ${tcs.textAlign}`
          : '',
        bg: bgInfo,
        style: cs
          ? [
              cs.opacity !== '1' ? `opacity ${cs.opacity}` : '',
              cs.transform !== 'none' ? `transform ${cs.transform}` : '',
              cs.borderTopWidth !== '0px' ? `border ${cs.borderTopWidth} ${cs.borderTopColor} r${cs.borderRadius}` : '',
              cs.backgroundColor !== 'rgba(0, 0, 0, 0)' ? `bg ${cs.backgroundColor}` : '',
            ]
              .filter(Boolean)
              .join(' ')
          : '',
        anim: cs && cs.animationName !== 'none' ? `${cs.animationName} ${cs.animationDuration}` : '',
      });
    }
    items.sort((a, b) => a.y - b.y || a.x - b.x);
    const fonts = [];
    const keyframes = [];
    for (const ss of document.styleSheets) {
      try {
        for (const r of ss.cssRules) {
          if (r instanceof CSSFontFaceRule) fonts.push(`${r.style.fontFamily} ← ${r.style.getPropertyValue('src').slice(0, 160)}`);
          if (r.type === CSSRule.KEYFRAMES_RULE) keyframes.push(r.cssText);
        }
      } catch (e) {}
    }
    const sec = document.querySelector('.ladi-section');
    return { canvas: sec ? Math.round(sec.getBoundingClientRect().width) : null, items, fonts, keyframes };
  });

  // Tải ảnh nền (đổi WebP → PNG bằng sips)
  const urls = [...new Set(data.items.map((i) => i.bg && i.bg.url).filter(Boolean))];
  const fileOf = {};
  for (let i = 0; i < urls.length; i++) {
    const u = urls[i];
    const raw = decodeURIComponent(u.split('/').pop().split('?')[0]).replace(/[^\w.-]+/g, '_');
    const ext = (/\.(png|jpe?g|webp|gif|svg)$/i.exec(raw) || ['.png'])[0];
    let file = `${String(i + 1).padStart(2, '0')}-${raw.replace(/\.[a-z]+$/i, '').slice(0, 50)}${ext}`;
    try {
      const buf = Buffer.from(await (await fetch(u)).arrayBuffer());
      let fp = path.join(out, 'assets', file);
      fs.writeFileSync(fp, buf);
      if (buf.slice(0, 4).toString() === 'RIFF') {
        const png = fp.replace(/\.[a-z]+$/i, '') + '.png';
        execSync(`sips -s format png "${fp}" --out "${png}" >/dev/null 2>&1`);
        fs.unlinkSync(fp);
        file = path.basename(png);
      }
    } catch (e) {
      file = `LỖI ${e.message}`;
    }
    fileOf[u] = file;
  }

  const lines = [`# ${url} — khung rộng ${data.canvas}px. Tọa độ x,y w×h (y từ đỉnh trang). crop: ảnh nền rộng w% hộp, lệch l% (ngang) t% (dọc).`];
  for (const i of data.items) {
    const bg = i.bg ? `bg ${fileOf[i.bg.url]} crop ${i.bg.w}% ${i.bg.l}% ${i.bg.t}%` : '';
    lines.push([`${i.id}`, `${i.x},${i.y} ${i.w}×${i.h}`, i.text, i.font, bg, i.style, i.anim].filter(Boolean).join(' | '));
  }
  fs.writeFileSync(path.join(out, 'elements.txt'), lines.join('\n'));
  fs.writeFileSync(path.join(out, 'fonts.txt'), data.fonts.join('\n'));
  fs.writeFileSync(path.join(out, 'keyframes.txt'), data.keyframes.join('\n\n'));
  console.log(`${data.items.length} phần tử, ${urls.length} ảnh → ${out}/elements.txt, assets/, ${n - 1} ảnh màn hình`);
  await browser.close();
})();

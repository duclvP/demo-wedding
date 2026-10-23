// Chụp chuỗi mở thiệp + cuộn hết trang, để soát hiệu ứng mở (giật, chớp, ló mục dưới) và mọi mục.
//
// node open-seq.cjs $S/pw http://localhost:5173/ $S/t18/m            # điện thoại 430×900
// node open-seq.cjs $S/pw http://localhost:5173/ $S/t18/d 1916 1054  # desktop (người dùng hay xem trên Chrome desktop)
//
// Ra: <prefix>-closed.png, -open0..4.png (mỗi 500ms sau khi bấm), -open-done.png (sau 6s), -s01.png… (cuộn mỗi 800px)
const path = require('path');
const { chromium } = require(path.join(process.argv[2], 'node_modules/playwright-core'));
const [url, prefix, w = '430', h = '900'] = process.argv.slice(3);
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

(async () => {
  const browser = await chromium.launch({ executablePath: CHROME });
  const p = await browser.newPage({ viewport: { width: +w, height: +h } });
  await p.goto(url, { waitUntil: 'networkidle' });
  await p.waitForTimeout(1500);
  await p.screenshot({ path: `${prefix}-closed.png` });
  await p.mouse.click(+w / 2, Math.min(420, +h / 2));
  for (let i = 0; i < 5; i++) {
    await p.waitForTimeout(500);
    await p.screenshot({ path: `${prefix}-open${i}.png` });
  }
  await p.waitForTimeout(3500);
  await p.screenshot({ path: `${prefix}-open-done.png` });
  let n = 1;
  for (let i = 0; i < 20; i++) {
    await p.mouse.wheel(0, 800);
    await p.waitForTimeout(1500);
    await p.screenshot({ path: `${prefix}-s${String(n++).padStart(2, '0')}.png` });
    const [bottom, total] = await p.evaluate(() => [window.scrollY + innerHeight, document.documentElement.scrollHeight]);
    if (bottom >= total - 5) break;
  }
  console.log(`→ ${prefix}-closed / -open0..4 / -open-done / -s01..s${String(n - 1).padStart(2, '0')}.png`);
  await browser.close();
})();

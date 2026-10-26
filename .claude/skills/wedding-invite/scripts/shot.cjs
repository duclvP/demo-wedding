// Chụp màn hình bằng Chrome headless (playwright-core cài trong scratchpad, dùng Chrome có sẵn).
//
// Cài một lần mỗi phiên:  npm i --prefix $S/pw playwright-core@1.49.1
//
// node shot.cjs $S/pw sheet <dir> <out.png> <số ảnh…>   ghép p<số>.jpg trong <dir> thành 1 bảng 6 cột
// node shot.cjs $S/pw page  <url> <out-prefix>          mở thiệp (chạm mở rèm), chụp màn đầu, sau phần gia đình, cuối trang
const path = require('path');
const { chromium } = require(path.join(process.argv[2], 'node_modules/playwright-core'));
const [mode, a, b, ...rest] = process.argv.slice(3);
const CHROME =
  process.env.CHROME ||
  (process.platform === 'darwin' ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' : '/usr/bin/google-chrome');

(async () => {
  const browser = await chromium.launch({ executablePath: CHROME });
  if (mode === 'sheet') {
    const p = await browser.newPage({ viewport: { width: 1500, height: 800 } });
    const cells = rest
      .map((n) => `<div><img src="p${n}.jpg" style="width:100%"><b>${n}</b></div>`)
      .join('');
    // Trang phải nằm cạnh ảnh và mở qua file:// — setContent (about:blank) không được đọc ảnh file://
    const html = path.join(a, 'sheet.html');
    require('fs').writeFileSync(
      html,
      `<body style="margin:0;display:grid;grid-template-columns:repeat(6,1fr);gap:4px;font:20px sans-serif">${cells}</body>`,
    );
    await p.goto('file://' + html);
    await p.waitForTimeout(500);
    await p.screenshot({ path: b, fullPage: true });
  } else {
    const p = await browser.newPage({ viewport: { width: 430, height: 900 } });
    await p.goto(a, { waitUntil: 'networkidle' });
    await p.mouse.click(215, 450);
    await p.waitForTimeout(3000);
    await p.screenshot({ path: `${b}-1-dau.png` });
    for (let i = 0; i < 6; i++) { await p.mouse.wheel(0, 150); await p.waitForTimeout(150); }
    await p.waitForTimeout(1500);
    await p.screenshot({ path: `${b}-2-gia-dinh.png` });
    // Cuộn từ từ để mọi Reveal kịp hiện
    for (let i = 0; i < 80; i++) { await p.mouse.wheel(0, 300); await p.waitForTimeout(80); }
    await p.waitForTimeout(1500);
    await p.screenshot({ path: `${b}-3-cuoi.png` });
  }
  await browser.close();
})();

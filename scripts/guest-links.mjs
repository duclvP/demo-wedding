/**
 * Xuất link mời cho từng khách trong src/guests.js
 *   npm run links -- https://ten-mien.vercel.app
 * → in ra màn hình + ghi file guest-links.csv (mở được bằng Excel / Google Sheets)
 */
import { writeFileSync } from 'node:fs';
import { guestEntries } from '../src/guests.js';

const site = (process.argv[2] || process.env.SITE_URL || '').replace(/\/+$/, '');
if (!site) {
  console.error('Thiếu domain. Ví dụ: npm run links -- https://ten-mien.vercel.app');
  process.exit(1);
}

const entries = guestEntries();
const seen = new Map();
for (const g of entries) {
  if (seen.has(g.slug)) {
    console.error(`Trùng link "/${g.slug}": "${seen.get(g.slug)}" và "${g.name}" — thêm slug riêng trong src/guests.js`);
    process.exit(1);
  }
  seen.set(g.slug, g.name);
}

const csvCell = (v) => `"${String(v).replace(/"/g, '""')}"`;
const rows = entries.map((g) => [g.name, `${site}/${g.slug}`]);
// BOM để Excel đọc đúng tiếng Việt
writeFileSync('guest-links.csv', '﻿' + [['Khách mời', 'Link'], ...rows].map((r) => r.map(csvCell).join(',')).join('\n'));

for (const [name, link] of rows) console.log(`${name}\t${link}`);
console.log(`\n✓ ${rows.length} link — đã ghi guest-links.csv`);

import sharp from 'sharp';
import { writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dir = dirname(fileURLToPath(import.meta.url));
const publicDir = resolve(__dir, '../public');

function makeSvg(size) {
  const cx = size / 2;
  const cy = size / 2;
  const r  = size / 2;
  const fs = Math.round(size * 0.60);
  const dy = Math.round(size * 0.22);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <circle cx="${cx}" cy="${cy}" r="${r}" fill="#F5F1E8"/>
  <text
    x="${cx}" y="${cy + dy}"
    font-family="Georgia, 'Times New Roman', serif"
    font-weight="900"
    font-size="${fs}"
    fill="#556B4D"
    text-anchor="middle"
    dominant-baseline="auto"
  >m</text>
</svg>`;
}

async function svgToPng(size) {
  return sharp(Buffer.from(makeSvg(size)))
    .resize(size, size)
    .png({ compressionLevel: 9 })
    .toBuffer();
}

// Pure-JS ICO writer — embeds raw PNG data (PNG-in-ICO, supported by all modern browsers)
function createIco(images) {
  const ICON_DIR  = 6;
  const ICON_ENTRY = 16;
  const totalHeader = ICON_DIR + ICON_ENTRY * images.length;
  const totalSize   = totalHeader + images.reduce((s, i) => s + i.data.length, 0);
  const buf = Buffer.alloc(totalSize);

  buf.writeUInt16LE(0, 0); // reserved
  buf.writeUInt16LE(1, 2); // type = ICO
  buf.writeUInt16LE(images.length, 4);

  let offset = totalHeader;
  images.forEach(({ data, size }, i) => {
    const e = ICON_DIR + ICON_ENTRY * i;
    buf.writeUInt8(size >= 256 ? 0 : size, e);
    buf.writeUInt8(size >= 256 ? 0 : size, e + 1);
    buf.writeUInt8(0,  e + 2);
    buf.writeUInt8(0,  e + 3);
    buf.writeUInt16LE(1,  e + 4);
    buf.writeUInt16LE(32, e + 6);
    buf.writeUInt32LE(data.length, e + 8);
    buf.writeUInt32LE(offset,      e + 12);
    data.copy(buf, offset);
    offset += data.length;
  });

  return buf;
}

const jobs = [
  { size: 16,  name: 'favicon-16x16.png' },
  { size: 32,  name: 'favicon-32x32.png' },
  { size: 180, name: 'apple-touch-icon.png' },
  { size: 192, name: 'android-chrome-192x192.png' },
  { size: 512, name: 'android-chrome-512x512.png' },
];

console.log('Generating favicons…');
const pngBuffers = {};

for (const { size, name } of jobs) {
  const buf = await svgToPng(size);
  pngBuffers[size] = buf;
  writeFileSync(resolve(publicDir, name), buf);
  console.log(`  ✓ ${name}`);
}

// favicon.ico with 16x16 + 32x32
const ico = createIco([
  { data: pngBuffers[16], size: 16 },
  { data: pngBuffers[32], size: 32 },
]);
writeFileSync(resolve(publicDir, 'favicon.ico'), ico);
console.log('  ✓ favicon.ico');

// site.webmanifest
const manifest = {
  name: 'MomMenu',
  short_name: 'MomMenu',
  icons: [
    { src: '/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
    { src: '/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' },
  ],
  theme_color: '#465940',
  background_color: '#F5F1E8',
  display: 'standalone',
  start_url: '/',
};
writeFileSync(resolve(publicDir, 'site.webmanifest'), JSON.stringify(manifest, null, 2));
console.log('  ✓ site.webmanifest');
console.log('Done!');

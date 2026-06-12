import sharp from 'sharp';
import { writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dir = dirname(fileURLToPath(import.meta.url));
const publicDir = resolve(__dir, '../public');
const appDir    = resolve(__dir, '../app');

const SOURCE = resolve(publicDir, 'cooking.jpg');

async function photoPng(size) {
  return sharp(SOURCE)
    .resize(size, size, { fit: 'cover', position: 'centre' })
    .png({ compressionLevel: 9 })
    .toBuffer();
}

// Pure-JS ICO writer — embeds raw PNG data (PNG-in-ICO, supported by all modern browsers)
function createIco(images) {
  const ICON_DIR   = 6;
  const ICON_ENTRY = 16;
  const totalHeader = ICON_DIR + ICON_ENTRY * images.length;
  const totalSize   = totalHeader + images.reduce((s, i) => s + i.data.length, 0);
  const buf = Buffer.alloc(totalSize);

  buf.writeUInt16LE(0, 0);
  buf.writeUInt16LE(1, 2);
  buf.writeUInt16LE(images.length, 4);

  let offset = totalHeader;
  images.forEach(({ data, size }, i) => {
    const e = ICON_DIR + ICON_ENTRY * i;
    buf.writeUInt8(size >= 256 ? 0 : size, e);
    buf.writeUInt8(size >= 256 ? 0 : size, e + 1);
    buf.writeUInt8(0, e + 2);
    buf.writeUInt8(0, e + 3);
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
  { size: 16,  name: 'favicon-16x16.png',         dir: publicDir },
  { size: 32,  name: 'favicon-32x32.png',          dir: publicDir },
  { size: 32,  name: 'icon.png',                   dir: appDir    },
  { size: 180, name: 'apple-touch-icon.png',       dir: publicDir },
  { size: 180, name: 'apple-icon.png',             dir: appDir    },
  { size: 192, name: 'android-chrome-192x192.png', dir: publicDir },
  { size: 512, name: 'android-chrome-512x512.png', dir: publicDir },
];

console.log('Generating favicons from cooking.jpg…');
const pngBuffers = {};

for (const { size, name, dir } of jobs) {
  if (!pngBuffers[size]) {
    pngBuffers[size] = await photoPng(size);
  }
  writeFileSync(resolve(dir, name), pngBuffers[size]);
  console.log(`  ✓ ${name}`);
}

// favicon.ico with 16×16 + 32×32
const ico = createIco([
  { data: pngBuffers[16], size: 16 },
  { data: pngBuffers[32], size: 32 },
]);
writeFileSync(resolve(publicDir, 'favicon.ico'), ico);
console.log('  ✓ favicon.ico');

console.log('Done!');

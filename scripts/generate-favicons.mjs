#!/usr/bin/env node
/**
 * Generate favicon PNGs from SVG using sharp
 */

import sharp from 'sharp';
import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, '..', 'public');
const svgPath = join(publicDir, 'favicon.svg');

const sizes = [
  { name: 'favicon-16x16.png', size: 16 },
  { name: 'favicon-32x32.png', size: 32 },
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'android-chrome-192x192.png', size: 192 },
  { name: 'android-chrome-512x512.png', size: 512 },
];

async function generateFavicons() {
  const svg = readFileSync(svgPath);

  for (const { name, size } of sizes) {
    const output = join(publicDir, name);
    await sharp(svg)
      .resize(size, size)
      .png()
      .toFile(output);
    console.log(`Generated: ${name}`);
  }

  // Generate ICO from 16x16 and 32x32 PNGs
  // ICO format is complex, so we'll just use the 32x32 PNG as favicon.ico
  const png32 = await sharp(svg).resize(32, 32).png().toBuffer();
  writeFileSync(join(publicDir, 'favicon.ico'), png32);
  console.log('Generated: favicon.ico (32x32 PNG)');

  console.log('\nAll favicons generated!');
}

generateFavicons().catch(console.error);

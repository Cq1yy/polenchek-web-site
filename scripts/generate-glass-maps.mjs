// Rebuild the lossless displacement textures used by the site's pill-shaped controls.
import { mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const out = new URL("../src/assets/glass/", import.meta.url);
await mkdir(out, { recursive: true });
const height = 64;
const radius = height / 2;

for (const aspect of [1, 2, 4, 8]) {
  const width = height * aspect;
  const pixels = Buffer.alloc(width * height * 3, 128);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const px = x + 0.5;
      const dx = px - Math.max(radius, Math.min(width - radius, px));
      const dy = y + 0.5 - radius;
      const distance = Math.hypot(dx, dy);
      const depth = radius - distance;
      if (depth < 0 || depth >= height * 0.42) continue;
      const t = 1 - depth / (height * 0.42);
      const strength = (127 * t * t * (3 - 2 * t)) / distance;
      const offset = (y * width + x) * 3;
      pixels[offset] = Math.round(128 - dx * strength);
      pixels[offset + 1] = Math.round(128 - dy * strength);
    }
  }
  await sharp(pixels, { raw: { width, height, channels: 3 } })
    .png().toFile(fileURLToPath(new URL(`pill-${aspect}.png`, out)));
}

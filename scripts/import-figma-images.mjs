// Converts the raw images extracted from the Figma .fig file into web-ready WebP.
// Usage: node scripts/import-figma-images.mjs <path-to-extracted-fig/images>
// (A .fig file is a zip: unzip it and pass the "images" folder.)
import sharp from "sharp";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const src = process.argv[2];
if (!src) {
  console.error("Pass the folder with the extracted Figma images");
  process.exit(1);
}

const out = path.resolve("src/assets");

/** figma image hash -> [output file, max long side] */
const map = {
  // decor
  "4711967c3b46e79b0852b1d6630be99060093607": ["decor/stars-wide.webp", 2400],
  f056f3f51c1d7ff34cf814ad6b041400f1ba1d34: ["decor/stars-tall.webp", 2400],
  a4034ee555f6185dceb80344d89af62937827448: ["decor/title-polenchek.webp", 1800],
  "3f590fc619fb8c1a5f57f75114e01d8f41249abe": ["decor/title-gallery.webp", 1800],
  b8ad6d03513673f63c3fc39da6b30344a1b172f3: ["decor/title-price.webp", 1800],
  "7ea2fc36caf904d3c966bcbc12fa3a9a2384c029": ["decor/title-tos.webp", 1400],
  // headshot
  "05f2591a1622948ac8d6f0899665969831c2cce7": ["art/headshot-1.webp", 2000],
  a872e558480e03f2a78c5590173b605b5ffbb3d3: ["art/headshot-2.webp", 2000],
  f7db8d1fabe141ab9f43410229ea8fe129460e92: ["art/headshot-3.webp", 2000],
  // halfbody
  "264813685946bbf5afe8a12f6a95f174adc16297": ["art/halfbody-1.webp", 2000],
  "5d8fcf19bb202e36b5dec5e66295a044279cb8ce": ["art/halfbody-2.webp", 2000],
  "7dff2acbe8c1adb33175c0dcfebb8f6ed5993159": ["art/halfbody-3.webp", 2000],
  // fullbody
  "5225b4083830db5a5686864005c3eec4ae53dc95": ["art/fullbody-1.webp", 2000],
  b9139ebec9106f8921656d04adcc847a2b442000: ["art/fullbody-2.webp", 2000],
  effed5811342233d7d7a77cfda524101ff66b84c: ["art/fullbody-3.webp", 2000],
  "1341f788418371d125da7f9d7f3a9bd68d91de32": ["art/fullbody-4.webp", 2000],
  f668bf458e3c28809772c98a7ad27d773f7bf897: ["art/fullbody-5.webp", 2000],
};

for (const [hash, [file, max]] of Object.entries(map)) {
  const dest = path.join(out, file);
  await mkdir(path.dirname(dest), { recursive: true });
  const info = await sharp(path.join(src, hash))
    .rotate()
    .resize({ width: max, height: max, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 86, alphaQuality: 90, effort: 5 })
    .toFile(dest);
  console.log(file.padEnd(28), `${info.width}x${info.height}`, `${Math.round(info.size / 1024)} KB`);
}

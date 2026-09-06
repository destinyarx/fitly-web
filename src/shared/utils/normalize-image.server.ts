import "server-only";

import sharp from "sharp";

const MAX_UPLOAD_BYTES = 12 * 1024 * 1024;
const MAX_OUTPUT_BYTES = 7 * 1024 * 1024;
const MAX_DIMENSION = 4096;
const ACCEPTED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export async function normalizeImage(file: File) {
  if (!ACCEPTED_TYPES.has(file.type) || file.size === 0 || file.size > MAX_UPLOAD_BYTES) {
    throw new Error("invalid_image");
  }

  const input = Buffer.from(await file.arrayBuffer());
  let quality = 88;
  let bytes = await renderJpeg(input, quality);

  while (bytes.byteLength > MAX_OUTPUT_BYTES && quality > 58) {
    quality -= 10;
    bytes = await renderJpeg(input, quality);
  }

  if (bytes.byteLength > MAX_OUTPUT_BYTES) throw new Error("image_too_large");
  return { bytes, contentType: "image/jpeg" as const, byteSize: bytes.byteLength };
}

function renderJpeg(input: Buffer, quality: number) {
  return sharp(input, { failOn: "warning", limitInputPixels: 40_000_000 })
    .rotate()
    .resize({
      width: MAX_DIMENSION,
      height: MAX_DIMENSION,
      fit: "inside",
      withoutEnlargement: true,
    })
    .jpeg({ quality, mozjpeg: true })
    .toBuffer();
}

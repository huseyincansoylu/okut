const MAX_SIZE = 1200;

function encode(canvas: HTMLCanvasElement, type: string, quality: number) {
  return new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, quality));
}

/**
 * Downscales a photo in the browser and re-encodes it as WebP (JPEG where the
 * browser can't encode WebP, e.g. older Safari). Phone photos drop from
 * several MB to a few hundred KB.
 */
export async function compressImage(file: File): Promise<File> {
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  const scale = Math.min(1, MAX_SIZE / Math.max(bitmap.width, bitmap.height));

  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  let blob = await encode(canvas, "image/webp", 0.82);
  if (!blob || blob.type !== "image/webp") blob = await encode(canvas, "image/jpeg", 0.85);
  if (!blob) throw new Error("Image encoding failed");

  const extension = blob.type === "image/webp" ? "webp" : "jpg";
  return new File([blob], `photo.${extension}`, { type: blob.type });
}

import "server-only";
import { randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";

const BUCKET = "menu-images";
const MAX_BYTES = 2 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/webp", "image/jpeg", "image/png"]);
const EXTENSIONS: Record<string, string> = { "image/webp": "webp", "image/jpeg": "jpg", "image/png": "png" };

// Server-only admin client: bypasses Storage RLS, so callers must check shop ownership first.
function storage() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  }).storage.from(BUCKET);
}

/** Why an image is rejected (a dictionary key under `errors`), or null if it's acceptable. */
export function validateImage(file: File) {
  if (!ALLOWED_TYPES.has(file.type)) return "imageType" as const;
  if (file.size > MAX_BYTES) return "imageSize" as const;
  return null;
}

/** Uploads a menu image under the shop's folder and returns its public URL. */
export async function uploadMenuImage(shopId: string, file: File) {
  const path = `${shopId}/${randomUUID()}.${EXTENSIONS[file.type]}`;
  const bucket = storage();
  const { error } = await bucket.upload(path, file, {
    contentType: file.type,
    cacheControl: "31536000", // paths are unique, so the file never changes
  });
  if (error) throw new Error(`Image upload failed: ${error.message}`);
  return bucket.getPublicUrl(path).data.publicUrl;
}

/** Best-effort removal of images by their public URLs; never throws. */
export async function removeMenuImages(urls: (string | null | undefined)[]) {
  const marker = `/object/public/${BUCKET}/`;
  const paths = urls.flatMap((url) => {
    const index = url?.indexOf(marker) ?? -1;
    return url && index !== -1 ? [decodeURIComponent(url.slice(index + marker.length))] : [];
  });
  if (paths.length === 0) return;

  const { error } = await storage().remove(paths);
  if (error) console.error("[storage] failed to remove images:", error.message);
}

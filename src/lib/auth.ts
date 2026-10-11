import "server-only";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { getRequestLocale } from "@/i18n/request";
import { createClient } from "@/lib/supabase/server";

/** Returns the signed-in user's id, or opens the sign-in modal. */
export async function requireUserId() {
  // Auth is per-request; mark it so before Supabase checks token expiry with Date.now().
  await connection();
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;
  if (!userId) redirect(`/${await getRequestLocale()}?auth=login`);
  return userId;
}

import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { getRequestLocale } from "@/i18n/request";
import { createClient } from "@/lib/supabase/server";

// Target of the email confirmation link.
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const code = searchParams.get("code");

  const supabase = await createClient();
  const { error } = tokenHash && type
    ? await supabase.auth.verifyOtp({ type, token_hash: tokenHash })
    : code
      ? await supabase.auth.exchangeCodeForSession(code)
      : { error: new Error("Missing token") };

  const url = request.nextUrl.clone();
  url.search = "";
  const locale = await getRequestLocale();
  url.pathname = error ? `/${locale}` : `/${locale}/dashboard`;
  if (error) url.searchParams.set("auth", "login");
  return NextResponse.redirect(url);
}

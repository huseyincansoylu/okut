import { NextResponse, type NextRequest } from "next/server";
import { DEFAULT_LOCALE, hasLocale, LOCALE_COOKIE, matchLocale, RETIRED_LOCALES } from "@/i18n/config";
import { updateSession } from "@/lib/supabase/proxy";

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // Route handlers outside app/[lang] (e.g. the email confirmation link).
  if (pathname.startsWith("/auth/")) return updateSession(request);

  const locale = pathname.split("/")[1];

  // Links from when the site also served English and Spanish (/en/..., /es/...).
  if ((RETIRED_LOCALES as readonly string[]).includes(locale)) {
    const url = request.nextUrl.clone();
    url.pathname = `/${DEFAULT_LOCALE}${pathname.slice(locale.length + 1)}`;
    return NextResponse.redirect(url, 308);
  }

  if (!hasLocale(locale)) {
    // Unprefixed URLs, including printed QR codes (/menu/<slug>), go to the
    // visitor's language: their last choice, else the browser's preference.
    const saved = request.cookies.get(LOCALE_COOKIE)?.value;
    const target = hasLocale(saved) ? saved : matchLocale(request.headers.get("accept-language"));
    const url = request.nextUrl.clone();
    url.pathname = `/${target}${pathname === "/" ? "" : pathname}`;
    url.search = search;
    return NextResponse.redirect(url);
  }

  // Public menus don't need the Supabase session.
  const response = pathname.startsWith(`/${locale}/menu/`)
    ? NextResponse.next()
    : await updateSession(request, locale);

  if (request.cookies.get(LOCALE_COOKIE)?.value !== locale) {
    response.cookies.set(LOCALE_COOKIE, locale, { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" });
  }
  return response;
}

export const config = {
  matcher: [
    // Skip Next.js internals and static files.
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/** Refreshes the Supabase session; with a `locale`, also guards that language's dashboard. */
export async function updateSession(request: NextRequest, locale?: string) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
          Object.entries(headers ?? {}).forEach(([key, value]) =>
            response.headers.set(key, value),
          );
        },
      },
    },
  );

  // Do not run code between createServerClient and getClaims().
  const { data } = await supabase.auth.getClaims();
  const user = data?.claims;

  if (!locale) return response;

  const { pathname } = request.nextUrl;
  const home = `/${locale}`;
  if (!user && (pathname === `${home}/dashboard` || pathname.startsWith(`${home}/dashboard/`))) {
    const url = request.nextUrl.clone();
    url.pathname = home;
    url.search = "";
    url.searchParams.set("auth", "login");
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  // Signed-in users don't need the auth modal.
  if (user && pathname === home && request.nextUrl.searchParams.has("auth")) {
    const url = request.nextUrl.clone();
    url.pathname = `${home}/dashboard`;
    url.search = "";
    return NextResponse.redirect(url);
  }

  return response;
}

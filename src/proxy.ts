import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    // Skip static files, image optimization and public menu pages.
    "/((?!_next/static|_next/image|favicon.ico|menu/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

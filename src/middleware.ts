import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getActiveSessionAdmin, SUPABASE_ACCESS_COOKIE } from "@/lib/supabase/session";

function redirectToLogin(req: NextRequest) {
  const url = req.nextUrl.clone();
  url.pathname = "/login";
  url.searchParams.set("next", req.nextUrl.pathname);
  return NextResponse.redirect(url);
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const publicApiRoutes = ["/api/auth/logout", "/api/auth/username-login"];

  if (publicApiRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/panel") || pathname.startsWith("/api/")) {
    const accessToken = req.cookies.get(SUPABASE_ACCESS_COOKIE)?.value;
    const admin = accessToken ? await getActiveSessionAdmin(accessToken).catch(() => null) : null;

    if (!admin) {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      return redirectToLogin(req);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/panel/:path*",
    "/api/:path*",
  ],
};

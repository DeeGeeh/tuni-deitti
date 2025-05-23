import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  const maintenanceMode = true; // NOTE TO SELF: THIS IS STUPID, BUT WORKS FOR NOW

  // Early exits for assets and API routes
  const shouldSkip =
    path.startsWith("/_next/") ||
    path.startsWith("/favicon.ico") ||
    path.includes(".") ||
    (maintenanceMode &&
      (path.startsWith("/api/notify-email") ||
        path.startsWith("/api/construction-admin-auth")));

  if (shouldSkip) {
    return NextResponse.next();
  }

  // Check authentication states
  const isAdmin = req.cookies.get("admin-authenticated")?.value === "true";
  const hasSession = !!req.cookies.get("session")?.value;

  // Maintenance mode
  if (maintenanceMode && !isAdmin) {
    return path === "/construction"
      ? NextResponse.next()
      : NextResponse.redirect(new URL("/construction", req.url));
  }

  // Protected paths logic (only runs if not in maintenance)
  const protectedPaths = ["/matches", "/profile", "/settings", "/swipe"];
  const isProtected = protectedPaths.some((p) => path.startsWith(p));

  if (isProtected && !hasSession) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("redirect", path);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

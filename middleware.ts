import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const maintenanceMode = true; // Set to true when the site is under maintenance

  if (maintenanceMode && !req.nextUrl.pathname.startsWith("/maintenance")) {
    return NextResponse.redirect(new URL("/maintenance", req.url));
  }

  // Get the pathname
  const path = req.nextUrl.pathname;

  // Define which paths are protected
  const protectedPaths = ["/matches", "/profile", "/settings", "/swipe"];
  const isPathProtected = protectedPaths.some((protectedPath) =>
    path.startsWith(protectedPath)
  );

  // If the path is not protected, allow the request
  if (!isPathProtected) {
    return NextResponse.next();
  }

  // Check for the session cookie
  const session = req.cookies.get("session")?.value;

  // If there's no session, redirect to login
  if (!session) {
    const url = new URL("/login", req.url);
    url.searchParams.set("redirect", path);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

// Configure the middleware to run on specific paths
export const config = {
  matcher: ["/dashboard/:path*", "/profile/:path*", "/settings/:path*"],
};

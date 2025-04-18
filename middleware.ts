import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  // Set to true when site is under maintenance
  // I'll figure out a better way of doing this later....
  const maintenanceMode = true;
  const path = req.nextUrl.pathname;

  // Allow access to '/' even in maintenance mode
  if (maintenanceMode && path !== "/" && !path.startsWith("/maintenance")) {
    console.log("Page is under maintenance.");
    return NextResponse.redirect(new URL("/maintenance", req.url));
  }

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

// Config the middleware to run on specific paths
export const config = {
  matcher: ["/swipe/:path*", "/profile/:path*", "/settings/:path*"],
};

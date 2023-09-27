import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Public routes that don't require authentication
const publicRoutes = ["/auth", "/community", "/profile"];

function isPublicRoute(path: string) {
  return (
    publicRoutes.includes(path) ||
    path.startsWith("/community/") ||
    path.startsWith("/create-community") ||
    path.startsWith("/chat")
  );
}

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Allow access to public routes
  if (isPublicRoute(path)) {
    return NextResponse.next();
  }

  // Check if the user has a session cookie
  const session = request.cookies.get("firebaseSession")?.value;

  if (!session) {
    return NextResponse.redirect(new URL("/auth", request.url));
  }

  // With this approach, we just check if the session exists
  // The actual validation happens client-side
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|public).*)"],
};

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtDecode } from "jwt-decode";

// Route permission mapping
const ROUTE_PERMISSIONS = [
  { pattern: /^\/dashboard(\/.*)?$/, atom: "view:dashboard" },
  { pattern: /^\/users(\/.*)?$/, atom: "view:users" },
  { pattern: /^\/leads(\/.*)?$/, atom: "view:leads" },
  { pattern: /^\/tasks(\/.*)?$/, atom: "view:tasks" },
  { pattern: /^\/reports(\/.*)?$/, atom: "view:reports" },
  { pattern: /^\/audit-log(\/.*)?$/, atom: "view:audit-log" },
  { pattern: /^\/customer-portal(\/.*)?$/, atom: "view:customer-portal" },
  { pattern: /^\/settings(\/.*)?$/, atom: "manage:settings" },
];

// Public routes that don't require authentication
const PUBLIC_ROUTES = ["/login", "/forgot-password", "/reset-password"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if it's a public route
  if (PUBLIC_ROUTES.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  try {
    // Try to get token from cookie
    let accessToken = request.cookies.get("obliq_access")?.value;

    // If no token, or it's invalid/expired, try to refresh
    if (!accessToken) {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/v1";
      
      // Attempt silent refresh via backend /auth/refresh
      try {
        const response = await fetch(`${apiUrl}/auth/refresh`, {
          method: 'POST',
          headers: {
            'Cookie': request.headers.get('cookie') || '',
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          const newAccessToken = data.accessToken;
          
          if (newAccessToken) {
            // Return response with new session cookie
            const res = NextResponse.next();
            res.cookies.set("obliq_access", newAccessToken, { 
              path: "/", 
              maxAge: 900, 
              sameSite: "strict",
              secure: process.env.NODE_ENV === 'production'
            });
            return res;
          }
        }
      } catch (e) {
        console.error("Middleware refresh error:", e);
      }
      
      // If refresh fails or no new token, redirect to login
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Double check to satisfy TS: accessToken is guaranteed to be a string here
    if (typeof accessToken !== "string") {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Decode JWT - Handle potential decode errors
    let payload: any;
    try {
      payload = jwtDecode(accessToken);
    } catch (e) {
      // Invalid token format
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Check if token is expired
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      // Token expired - redirect to login
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Find required permission for this route
    const routeMatch = ROUTE_PERMISSIONS.find((r) => r.pattern.test(pathname));

    // If route requires permission
    if (routeMatch) {
      const requiredAtom = routeMatch.atom;
      const userPermissions = payload.permissions || [];

      // Check if user has the required permission
      if (!userPermissions.includes(requiredAtom)) {
        // Redirect to 403 page
        return NextResponse.redirect(new URL("/403", request.url));
      }
    }

    // All checks passed - allow request
    return NextResponse.next();
  } catch (error) {
    // Invalid token - redirect to login
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/users/:path*",
    "/leads/:path*",
    "/tasks/:path*",
    "/reports/:path*",
    "/audit-log/:path*",
    "/customer-portal/:path*",
    "/settings/:path*",
  ],
};

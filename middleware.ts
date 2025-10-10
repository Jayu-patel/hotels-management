import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function middleware(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const { pathname } = request.nextUrl;

  const { data: { user } } = await supabase.auth.getUser();

  const publicRoutes = ["/login", "/hotels", "/search"];
  const userRoutes = ["/profile", "/bookings"];
  const adminRoutes = ["/admin"];

  if(pathname === "/"){
    return NextResponse.next();
  }

  if (user && pathname === "/login") {
    const redirectUrl = new URL("/", request.url);
    return NextResponse.redirect(redirectUrl);
  }

  if (publicRoutes.some((r) => pathname.startsWith(r))) {
    return NextResponse.next();
  }

  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (adminRoutes.some((r) => pathname.startsWith(r))) {
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (error || profile?.role !== "admin") {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  if (userRoutes.some((r) => pathname.startsWith(r))) {
    return NextResponse.next();
  }

  const res = await updateSession(request, user);

  res.headers.set("Cache-Control", "no-store, must-revalidate");
  res.headers.set("Pragma", "no-cache");
  res.headers.set("Expires", "0");

  return res;
}

export const config = {
  matcher: [
    '/', 
    '/admin', '/admin/:path*', 
    '/profile', 
    '/hotels', '/hotels/:path*', 
    '/search', 
    '/bookings'
  ],
};

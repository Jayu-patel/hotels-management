import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function middleware(request: NextRequest) {
  const supabase = await createSupabaseServerClient();

  // Fetch user once
  const { data: { user } } = await supabase.auth.getUser();

  const protectedRoutes = ["/admin", "profile"];

  if (protectedRoutes.some((path) => request.nextUrl.pathname.startsWith(path))) {
    if (!user) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    // 2. Role check
    const { data } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (data?.role !== "admin") {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return await updateSession(request, user);
}

export const config = {
  matcher: [
    '/', '/admin/:path*'
  ],
};
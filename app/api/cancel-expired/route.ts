// import { supabase } from "@/lib/supabase/client";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  const now = new Date().toISOString();

  const { error } = await supabase
    .from("bookings")
    .update({ status: "Cancelled" })
    .lte("expires_at", now)
    .eq("status", "Confirmed")
    .neq("payment_status", "Paid");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ message: "Expired bookings cancelled" });
}
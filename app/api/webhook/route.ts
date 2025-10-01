import { headers } from "next/headers";
import { NextResponse } from "next/server";
// @ts-ignore
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-08-27.basil",
});

export async function POST(req: Request) {

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  const body = await req.arrayBuffer();
//   const sig = headers().get("stripe-signature")!;

  const headersList = await headers(); // await the headers() Promise
  const sig = headersList.get("stripe-signature");

  if (!sig) {
    return new Response("Missing Stripe signature", { status: 400 });
  }
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      Buffer.from(body),
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    const bookingId = paymentIntent.metadata.bookingId;

    await supabase
      .from("bookings")
      .update({
        payment_status: "Paid",
        transaction_id: paymentIntent.id,
        amount_paid: paymentIntent.amount / 100,
      })
      .eq("id", bookingId);

  }

  if (event.type === "payment_intent.payment_failed") {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    const bookingId = paymentIntent.metadata.bookingId;

    await supabase
      .from("bookings")
      .update({
        payment_status: "Pending",
        transaction_id: paymentIntent.id,
      })
      .eq("id", bookingId);

  }

  if (event.type === "charge.failed") {
    const charge = event.data.object as Stripe.Charge;
    const bookingId = charge.metadata.bookingId;

    if (bookingId) {
      await supabase
        .from("bookings")
        .update({
          payment_status: "Failed",
          transaction_id: charge.payment_intent as string, // link back to intent
        })
        .eq("id", bookingId);

    }
  }

  return NextResponse.json({ received: true });
}

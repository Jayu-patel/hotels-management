import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
// @ts-ignore
import Stripe from "stripe";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-08-27.basil",
});

//stripe listen --forward-to localhost:3000/api/webhook

export async function POST(req: Request) {
  try {
    const {
      room_id,
      hotel_id,
      user_id,
      check_in,
      check_out,
      room_booked,
      guest_count,
      total_amount,
      adults,
      children,
      infants,
    } = await req.json();

    // 1️⃣ Create booking in Supabase with pending status
    const { data: booking, error } = await supabase
      .from("bookings")
      .insert([
        {
          hotel_id,
          room_id,
          user_id,
          check_in,
          check_out,
          guest_count,
          room_booked,
          total_amount,
          adults,
          children,
          infants,
          payment_status: "Pending",
        },
      ])
      .select()
      .single();

    if (error) throw error;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { name: "Hotel Room Booking" },
            unit_amount: Math.round(total_amount * 100),
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_SITE_LINK}/success`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_LINK}/failed`,
      metadata: { bookingId: booking.id },
      payment_intent_data: {
        metadata: { bookingId: booking.id },
      },
    });

    return NextResponse.json({ url: session.url }, {status: 200});
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: Request){
    try{
        const {id} = await req.json()

        const {data, error} = await supabase.from("bookings").select("total_amount").eq("id", id).single()
        if (error) throw error;

        const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
            {
            price_data: {
                currency: "usd",
                product_data: { name: "Hotel Room Booking" },
                unit_amount: Math.round(data?.total_amount * 100),
            },
            quantity: 1,
            },
        ],
        mode: "payment",
        success_url: `http://localhost:3000?payment=success`,
        cancel_url: `http://localhost:3000?payment=failed`,
        metadata: { bookingId: id },
        payment_intent_data: {
            metadata: { bookingId: id },
        },
        });

        return NextResponse.json({ url: session.url }, {status: 200});
    }
    catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
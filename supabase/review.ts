import {supabase} from "@/lib/supabase/client"

export async function reviewBooking(reviewData: any){
    const {bookingId, user_id, room_id, rating, comment, title} = reviewData

    const { data: existing } = await supabase
    .from("reviews")
    .select("id")
    .eq("user_id", user_id)
    .eq("room_id", room_id)
    .eq("booking_id", bookingId)
    .single()

    const {data, error} = await supabase.from("reviews").upsert({
        id: existing?.id,
        booking_id: bookingId,
        user_id,
        room_id,
        rating,
        comment,
        title,
        updated_at: new Date().toISOString(),
    })

    if(error){
        throw error
    }

    const {error: updateError} = await supabase.from("bookings").update({reviewed: true}).eq("id", bookingId)
    if(updateError){
        throw updateError
    }
}
import {supabase} from "@/lib/supabase/client"

export async function reviewBooking(reviewData: any){
    const {bookingId, user_id, room_id, rating, comment} = reviewData

    const { data: existing } = await supabase
    .from("reviews")
    .select("id")
    .eq("user_id", user_id)
    .eq("room_id", room_id)
    .single()

    const {data, error} = await supabase.from("reviews").upsert({
        id: existing?.id,
        user_id,
        room_id,
        rating,
        comment,
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
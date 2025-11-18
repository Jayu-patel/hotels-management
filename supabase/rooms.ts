import { supabase } from "@/lib/supabase/client";

export const getRooms=async(id: string)=>{
    const {data: roomsData, error: roomsError} = await supabase
    .from("rooms")
    .select(`
        id,
        hotel_id,
        name,
        price,
        capacity,
        count,
        room_type,
        status,
        images: room_images(id, image_url),
        amenities: room_amenities(amenity_id ( id, name )),
        seasonal_slab_ids,
        duration_slab_ids,
        options: room_options(id, name, additional_price, type)
    `)
    .eq('hotel_id', id)

    const allSeasonalIds = roomsData?.flatMap((r: any) => r?.seasonal_slab_ids || []) || [];
    const allDurationIds = roomsData?.flatMap((r: any) => r?.duration_slab_ids || []) || [];

    let seasonalSlabs = [];
    let durationSlabs = [];

    if (allSeasonalIds.length) {
        const { data, error } = await supabase
            .from("price_slabs")
            .select("*")
            .in("id", allSeasonalIds.filter(Boolean));
        if (error) throw error;
        seasonalSlabs = data || [];
    }

    if (allDurationIds.length) {
        const { data, error } = await supabase
            .from("price_slabs")
            .select("*")
            .in("id", allDurationIds.filter(Boolean));
        if (error) throw error;
        durationSlabs = data || [];
    }

    let rooms = (roomsData || []).map((room: any) => {
        const roomSeasonal = seasonalSlabs.filter((s) => room.seasonal_slab_ids?.includes(s.id)) || [];
        const roomDuration = durationSlabs.filter((d) => room.duration_slab_ids?.includes(d.id)) || [];

        return {
            id: room.id,
            hotelId: room.hotel_id,
            name: room.name,
            type: room.room_type,
            description: room.description ?? "",
            imageUrls: room.images?.map((img: any) => img.image_url) || [],
            pricePerNight: room.price,
            maxOccupancy: room.capacity,
            amenities: room.amenities?.map((a: any) => a.amenity_id.name) || [],
            available: Boolean(room.status),
            seasonalSlabs: roomSeasonal,
            durationSlabs: roomDuration,
            options: room.options
        };
    });

    return {rooms}
}
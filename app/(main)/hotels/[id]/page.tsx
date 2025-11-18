import { supabase } from "@/lib/supabase/client";
import React from "react"
import HotelDetailsPage from "@/components/hotels/HotelDetailsPage"
import { getRoomsAvailability } from "@/supabase/hotels";
import { getRooms } from "@/supabase/rooms";

type PageProps = {
  params: { id: string };
  searchParams: { checkIn?: string; checkOut?: string; };
};

export default async function page(props : PageProps) {
  const {id} = props.params
  const {checkIn, checkOut} = props.searchParams

  const {data, error} = await supabase
    .from("hotels")
    .select(`
        id,
        name,
        destination,
        description,
        address,
        star_rating,
        review_count,
        status,
        facilities,
        policies,
        check_in_time,
        check_out_time,
        phone,
        email,
        images: hotel_images(id, image_url, is_primary),
        amenities: hotel_amenities(amenity_id ( id, name ))
    `)
    .eq("id", id)
    .single()
  
  const hotel = {
    id: data?.id,
    name: data?.name,
    location: data?.destination,
    rating: data?.star_rating,
    reviewCount: data?.review_count,
    description: data?.description,
    facilities: data?.facilities,
    policies: data?.policies,
    // imageUrls: data?.images?.map((img: any) => img.image_url) || [],
    imageUrls: data?.images?.sort((a: any, b: any) => (a.is_primary ? -1 : b.is_primary ? 1 : 0)).map((img: any) => img.image_url) || [],
    amenities: data?.amenities?.map((a: any) => a.amenity_id.name) || [],
    address: data?.address,
    check_in_time: data?.check_in_time,
    check_out_time: data?.check_out_time,
    phone: data?.phone,
    email: data?.email,
  };

  let rooms : any[] = [];
  if(!checkIn || !checkOut){
    const {rooms: roomsData} = await getRooms(id)
    rooms = roomsData
  }
  else{
      const data = await getRoomsAvailability({hotelId: id, checkIn, checkOut})
      rooms = data
  }

  return (
    <div>
      <HotelDetailsPage  hotel={hotel} rooms={rooms}/>
    </div>
  )
}

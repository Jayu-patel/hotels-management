import { supabase } from "@/lib/supabase/client";
import React from "react"
import HotelDetailsPage from "../HotelDetailsPage"

interface Params{
  id?: string
}

export default async function page({params}:{params : Promise<Params>}) {
  const {id} = await params

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
        images: hotel_images(id, image_url, is_primary),
        amenities: hotel_amenities(amenity_id ( id, name ))
    `)
    .eq("id", id)
    .single()

  const hotels = {
    id: data?.id,
    name: data?.name,
    location: data?.destination,
    rating: data?.star_rating,
    reviewCount: data?.review_count,
    description: data?.description,
    imageUrls: data?.images?.map((img: any) => img.image_url) || [],
    amenities: data?.amenities?.map((a: any) => a.amenity_id.name) || [],
    address: data?.address,
  };

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
      amenities: room_amenities(amenity_id ( id, name ))
  `)
  .eq('hotel_id', id)

  const rooms = (roomsData || []).map((room: any) => ({
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
  }));

  return (
    <div>
      <HotelDetailsPage  hotel={hotels} rooms={rooms}/>
    </div>
  )
}

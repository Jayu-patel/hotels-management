"use client";
import { supabase } from "@/lib/supabase/client";
import { createContext, useContext, useState, ReactNode } from "react";

interface HotelsContextType {
  hotels: any[];
  adminHotels: any[];
  setHotels: (hotels: any[]) => void;
  setAdminHotels: (adminHotels: any[]) => void;
  searchParams: boolean;
  setSearchParams: (searchParams: boolean) => void;
  loading: boolean,
  setLoading: (loading: boolean)=> void;
  fetchHotels: (params: FetchHotelsParams)=> Promise<{ count: number }>;
  getHotelRooms: (hotelId: string, searchStart?: string, searchEnd?: string)=> Promise<{rooms: any, name: string, range: { start: string, end: string }}>;
  updateHotelFeatured: (id: string, featured: boolean) => void;
  bookingData: any;
  setBookingData: (booking: any)=> void;
}

type FetchHotelsParams = {
  page: number;
  itemsPerPage: number;
  searchTerm?: string;
  status?: string; // 'All' means no status filter
};

const HotelsContext = createContext<HotelsContextType | undefined>(undefined);

export function HotelsProvider({ children }: { children: ReactNode }) {
  const [hotels, setHotels] = useState<any[]>([]);
  const [adminHotels, setAdminHotels] = useState<any[]>([]);
  const [searchParams, setSearchParams] = useState<boolean>(false)
  const [bookingData, setBookingData] = useState<any>({})
  const [loading, setLoading] = useState<boolean>(true)

  function getDefaultDateRange() {
    const today = new Date();
    const start = today.toISOString().split("T")[0];

    const endDate = new Date(today);
    endDate.setDate(endDate.getDate() + 6);
    const end = endDate.toISOString().split("T")[0];

    return { start, end };
  }

  async function fetchHotels({ page, itemsPerPage, searchTerm = '', status = 'All' }: FetchHotelsParams) : Promise<{ count: number }>{
    let query = supabase
      .from('hotels')
      .select(`
        id,
        name,
        destination,
        description,
        address,
        star_rating,
        review_count,
        status,
        country,
        latitude,
        longitude,
        facilities,
        policies,
        state,
        featured,
        check_in_time,
        check_out_time,
        phone,
        email,
        images: hotel_images ( id, image_url, is_primary ),
        amenities: hotel_amenities ( amenity_id ( id, name ) )
      `, {count: "exact"})
      .order("created_at", {ascending: false})

    // if (searchTerm) {
    //   query = query.ilike('name', `%${searchTerm}%`).or(`destination.ilike.%${searchTerm}%`);
    // }

    if (searchTerm) {
      const safe = searchTerm.replace(/'/g, "''");
      query = query.or(
        `name.ilike.%${safe}%,destination.ilike.%${safe}%,address.ilike.%${safe}%`
      );
    }

    if (status !== 'All') {
      query = query.eq('status', status);
    }
    const from = (page - 1) * itemsPerPage;
    const to = from + itemsPerPage - 1;
    const { data, error, count } = await query.range(from, to);
    if (error) throw error;

    const transformedHotels = (data || []).map((h: any) => ({
      id: h.id,
      name: h.name,
      location: h.address,
      destination: h.destination,
      country: h.country,
      state: h.state,
      rating: h.star_rating,
      status: h.status,
      description: h.description,
      latitude: h.latitude,
      longitude: h.longitude,
      facilities: h.facilities,
      policies: h.policies,
      featured: h.featured,
      check_in_time: h.check_in_time,
      check_out_time: h.check_out_time,
      email: h.email,
      phone: h.phone,
      images: h.images?.map((img: any) => ({
        id: img.id,
        url: img.image_url,
        is_primary: img.is_primary
      })) || [],
      // amenities: h.amenities?.map((a: any) => a.amenity_id.name) || []
      amenities: h.amenities?.map((a: any) => ({
        id: a.amenity_id.id,
        name: a.amenity_id.name,
      })) || [],
    }));

    setAdminHotels(transformedHotels)
    return {count: count || 0}
  }

  // async function getHotelRooms(hotelId: string) : Promise<{rooms: any, name: string}>{
  //   const {data, error} = await supabase
  //   .from("rooms")
  //   .select(`
  //     id,
  //     hotel_id,
  //     name,
  //     price,
  //     capacity,
  //     count,
  //     room_type,
  //     status,
  //     description,
  //     images: room_images(id, image_url, is_primary),
  //     amenities: room_amenities(amenity_id ( id, name ))
  //   `)
  //   .eq("hotel_id", hotelId)
  //   .order("created_at", {ascending: false})

  //   if(error){
  //     throw error
  //   }

  //   const {data: hotelData, error: hotelError} = await supabase.from("hotels").select("name").eq("id", hotelId).single()
  //   if(hotelError){
  //     throw hotelError
  //   }

  //   const rooms = (data || []).map((room) => ({
  //     id: room.id,
  //     hotelId: room.hotel_id,
  //     name: room.name,
  //     type: room.room_type,
  //     capacity: room.capacity,
  //     price: room.price,
  //     description: room.description,
  //     // amenities: room.amenities?.map((a: any) => a.amenity_id.name) || [],
  //     amenities: room.amenities?.map((a: any) => ({
  //       id: a.amenity_id.id,
  //       name: a.amenity_id.name,
  //     })) || [],
  //     available: Boolean(room.status),
  //     roomCount: room.count,
  //     images: room.images?.map((img: any) => ({
  //       id: img.id,
  //       url: img.image_url,
  //       is_primary: img.is_primary,
  //     })) || [],
  //   }));

  //   return {rooms, name: hotelData.name}
  // }

  async function getHotelRooms(
    hotelId: string,
    searchStart?: string,
    searchEnd?: string
  ): Promise<{ rooms: any; name: string; range: { start: string; end: string } }> {
    const { start: defaultStart, end: defaultEnd } = getDefaultDateRange();
    const startDate = searchStart || defaultStart;
    const endDate = searchEnd || defaultEnd;

    // fetch rooms
    const { data, error } = await supabase
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
        description,
        policies,
        images: room_images(id, image_url, is_primary),
        amenities: room_amenities(amenity_id ( id, name )),
        options: room_options(id, name, additional_price, type)
      `)
      .eq("hotel_id", hotelId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    // fetch hotel name
    const { data: hotelData, error: hotelError } = await supabase
      .from("hotels")
      .select("name")
      .eq("id", hotelId)
      .single();

    if (hotelError) throw hotelError;

    const roomIds = data?.map((r) => r.id) || [];

    // fetch bookings that overlap with selected range
    const { data: bookingsData, error: bookingsError } = await supabase
      .from("bookings")
      .select("room_id, room_booked, check_in, check_out, status")
      .in("room_id", roomIds)
      .not("status", "eq", "Cancelled")
      .lte("check_in", endDate)
      .gte("check_out", startDate);

    if (bookingsError) throw bookingsError;

    // Helper: get all dates in range
    const getDatesBetween = (start: string, end: string) => {
      const dates: string[] = [];
      const s = new Date(start);
      const e = new Date(end);
      for (let d = new Date(s); d <= e; d.setDate(d.getDate() + 1)) {
        dates.push(new Date(d).toISOString().split("T")[0]);
      }
      return dates;
    };

    const datesInRange = getDatesBetween(startDate, endDate);

    // group bookings by room
    const bookingsByRoom: Record<
      string,
      Array<{ check_in: string; check_out: string; room_booked: number }>
    > = {};

    bookingsData?.forEach((b) => {
      if (!bookingsByRoom[b.room_id]) bookingsByRoom[b.room_id] = [];
      bookingsByRoom[b.room_id].push({
        check_in: b.check_in,
        check_out: b.check_out,
        room_booked: b.room_booked || 0,
      });
    });

    // calculate max booked rooms per room in selected range
    const bookingsCountMap: Record<string, number> = {};

    Object.keys(bookingsByRoom).forEach((roomId) => {
      const bookings = bookingsByRoom[roomId];
      let maxBooked = 0;

      datesInRange.forEach((date) => {
        const bookedToday = bookings.reduce((sum, b) => {
          if (b.check_in <= date && b.check_out >= date) return sum + b.room_booked;
          return sum;
        }, 0);
        if (bookedToday > maxBooked) maxBooked = bookedToday;
      });

      bookingsCountMap[roomId] = maxBooked;
    });

    // prepare room response
    const rooms = (data || []).map((room) => {
      const bookedCount = bookingsCountMap[room.id] || 0;
      const remainingCount = room.count - bookedCount;
      return {
        id: room.id,
        hotelId: room.hotel_id,
        name: room.name,
        type: room.room_type,
        capacity: room.capacity,
        price: room.price,
        description: room.description,
        policies: room.policies,
        amenities:
          room.amenities?.map((a: any) => ({
            id: a.amenity_id.id,
            name: a.amenity_id.name,
          })) || [],
        available: remainingCount > 0,
        roomCount: room.count,
        bookedCount, // max booked in selected range
        remainingCount: room.count - bookedCount,
        images:
          room.images?.map((img: any) => ({
            id: img.id,
            url: img.image_url,
            is_primary: img.is_primary,
          })) || [],
        options: room.options
      };
    });

    return { rooms, name: hotelData.name, range: { start: startDate, end: endDate } };
  }

  const updateHotelFeatured = (id: string, featured: boolean) => {
    setAdminHotels((prev) =>
      prev.map((h) => (h.id === id ? { ...h, featured } : h))
    );
  };

  return (
    <HotelsContext.Provider 
      value={
        { 
          hotels,
          setHotels,
          adminHotels,
          setAdminHotels,
          searchParams, 
          setSearchParams,
          loading,
          setLoading,
          fetchHotels,
          getHotelRooms,
          updateHotelFeatured,
          bookingData,
          setBookingData
        }
      }
    >
      {children}
    </HotelsContext.Provider>
  );
}

export function useHotels() {
  const context = useContext(HotelsContext);
  if (!context) {
    throw new Error("useHotels must be used within a HotelsProvider");
  }
  return context;
}

interface GetHotelsParams {
  destination?: string;
  page?: number;
  size?: number;
  checkIn?: string;
  checkOut?: string;
  guestCount?: number;
  search?: string;
  selectedAmenities?: string[];
  sortBy?: string;
  priceRange?: number[];
}

import {supabase} from "@/lib/supabase/client"

export async function searchHotels({
  destination,
  checkIn,
  checkOut,
  guestCount,
  page = 1,
  size = 10,
}: {
  destination: string;
  checkIn: string;
  checkOut: string;
  guestCount: number;
  page?: number;
  size?: number;
}) {
  const from = (page - 1) * size;
  const to = from + size - 1;

  // 🔹 Step 1: Fetch hotels with pagination + count
  const { data: hotels, error: hotelError, count } = await supabase
    .from("hotels")
    .select(
      `
        id,
        name,
        destination,
        description,
        address,
        star_rating,
        review_count,
        hotel_images ( id, image_url, is_primary ),
        hotel_amenities ( amenity_id ( id, name ) )
      `,
      { count: "exact" }
    )
    .or(`destination.ilike.%${destination}%,name.ilike.%${destination}%`)
    .range(from, to);

  if (hotelError) throw hotelError;
  if (!hotels || hotels.length === 0) {
    return { data: [], totalCount: 0, totalPages: 0 };
  }

  // 🔹 Step 2: Fetch all rooms for these hotels in one query
  const hotelIds = hotels.map((h) => h.id);

  const { data: rooms, error: roomError } = await supabase
    .from("rooms")
    .select(
      `
        id,
        name,
        price,
        capacity,
        count,
        room_type,
        hotel_id,
        bookings!left(
          room_booked,
          check_in,
          check_out
        )
      `
    )
    .in("hotel_id", hotelIds);

  if (roomError) throw roomError;

  // 🔹 Step 3: Group rooms by hotel_id
  const roomsByHotel: Record<string, any[]> = {};
  rooms.forEach((room) => {
    if (!roomsByHotel[room.hotel_id]) {
      roomsByHotel[room.hotel_id] = [];
    }
    roomsByHotel[room.hotel_id].push(room);
  });

  // 🔹 Step 4: Check availability
  const availableHotels: any[] = [];

  for (const hotel of hotels) {
    const hotelRooms = roomsByHotel[hotel.id] || [];

    const availableRooms = hotelRooms.filter((room) => {
      const overlappingBookings =
        room.bookings?.filter(
          (b: any) => b.check_in < checkOut && b.check_out > checkIn
        ) || [];

      const bookedCount = overlappingBookings.reduce(
        (sum: any, b: any) => sum + b.room_booked,
        0
      );

      return bookedCount < room.count; // ✅ at least 1 room left
    });

    if (availableRooms.length > 0) {
      availableHotels.push({ ...hotel, availableRooms });
    }
  }

  const totalCount = availableHotels.length;
  const totalPages = Math.ceil(totalCount / size);
  const from2 = (page - 1) * size;
  const to2 = from + size;
  const paginatedResults = availableHotels.slice(from2, to2);

  // return {
  //   data: availableHotels,
  //   totalCount: count ?? 0,
  //   totalPages: Math.ceil((count ?? 0) / size),
  // };
  
  return {
    data: paginatedResults,
    totalCount,
    totalPages,
  };
}

export async function getHotelRooms(hotelId: string, checkIn: string, checkOut: string) {
  const { data: rooms, error } = await supabase
    .from("rooms")
    .select(`
      id,
      name,
      price,
      capacity,
      count,
      room_type,
      bookings!left(
        room_booked,
        check_in,
        check_out
      )
    `)
    .eq("hotel_id", hotelId)
    .eq("status", true);

  if (error) throw error;

  return rooms.filter((room) => {
    const overlappingBookings = room.bookings?.filter((b) => {
      return b.check_in < checkOut && b.check_out > checkIn;
    }) || [];

    const bookedCount = overlappingBookings.reduce((sum, b) => sum + b.room_booked, 0);
    return bookedCount < room.count;
  });
}

export async function getFilterData(): Promise<{ uniqueLocations: any, uniqueAmenities: string[] }>{
  const { data: allAmenities, error: amenityError } = await supabase
    .from("amenities")
    .select("id, name");
  if (amenityError) throw amenityError;

  const uniqueAmenities = allAmenities.map((e)=> e.name)

  const { data: allDestinations, error: destError, count } = await supabase
  .from("hotels")
  .select("destination", { count: "exact" })
  .neq("destination", null); // exclude nulls if any

  if (destError) throw destError;

  const uniqueLocations = Array.from(
    new Set(allDestinations.map((h) => h.destination))
  );

  return {uniqueAmenities, uniqueLocations}
}

export async function getHotels({
  destination,
  page = 1,
  size = 3,
  checkIn,
  checkOut,
  guestCount,
  selectedAmenities = [],
  search,
  sortBy = "recommended",
  priceRange
}: GetHotelsParams = {}): Promise<{ data: any[], totalPages: number, totalCount: number}> {

  // 1️⃣ Fetch all amenities dynamically
  const { data: allAmenities, error: amenityError } = await supabase
    .from("amenities")
    .select("id, name");
  if (amenityError) throw amenityError;

  const nameToIdMap = Object.fromEntries(allAmenities.map(a => [a.name, a.id]));
  const amenityIds = selectedAmenities
    .map(name => nameToIdMap[name])
    .filter((id): id is string => !!id);

  // 2️⃣ Fetch all hotels with their amenities and images
  let query = supabase
    .from("hotels")
    .select(`
      * ,
      hotel_images(id, image_url, is_primary),
      hotel_amenities(amenity_id(id, name))
    `);
  
  if (search) {
    // ilike does partial match, % is wildcard
    query = query.or(
      `name.ilike.%${search}%,destination.ilike.%${search}%,address.ilike.%${search}%`
    );
  }

  // if (destination) query = query.ilike("destination", `%${destination}%`);
  if (destination && destination !== "all") query = query.eq("destination", destination);

  const { data: hotels, error: hotelsError } = await query;
  if (hotelsError) throw hotelsError;
  if (!hotels || hotels.length === 0) return { data: [], totalPages: 0, totalCount: 0 };

  // 3️⃣ Filter by amenities
  let results = hotels.map(hotel => ({
    ...hotel,
    amenities: allAmenities?.map(a => a.name) ?? [],
    amenityIds: hotel.hotel_amenities?.map((a: any) => a.amenity_id?.id) ?? []
  }));

  if (amenityIds.length > 0) {
    results = results.filter(hotel =>
      amenityIds.every(id => hotel.amenityIds.includes(id))
    );
  }

  // 4️⃣ Fetch all rooms first
  const { data: allRooms, error: allRoomsError } = await supabase
    .from("rooms")
    .select("id, hotel_id, price, capacity");
  if (allRoomsError) throw allRoomsError;

  let safeRooms = allRooms ?? [];

  // 5️⃣ If availability filters applied, filter rooms accordingly
  if (checkIn && checkOut && guestCount) {
    const { data: availableRooms, error: roomsError } = await supabase
      .from("rooms")
      .select("*, bookings!left(id, status, check_in, check_out)")
      .gte("capacity", guestCount)
      .or(`bookings.id.is.null,bookings.status.eq.canceled`)
      .lt("bookings.check_in", checkOut)
      .gt("bookings.check_out", checkIn);

    if (roomsError) throw roomsError;
    safeRooms = availableRooms ?? [];
  }

  // 6️⃣ Attach rooms to hotels (always an array)
  results = results.map(hotel => ({
    ...hotel,
    rooms: safeRooms.filter(r => r.hotel_id === hotel.id)
  }));

  // Remove hotels without rooms if availability filter applied
  if (checkIn && checkOut && guestCount) {
    results = results.filter(hotel => hotel.rooms.length > 0);
  }

  if (priceRange) {
    const [minPrice, maxPrice] = priceRange;

    // Keep only hotels with at least one room in the price range
    results = results.filter(hotel =>
      hotel.rooms.some((r : any) => {
        const price = Number(r.price);
        return price >= minPrice && price <= maxPrice;
      })
    );

    // Optional: also filter rooms themselves to only those in range
    results = results.map(hotel => ({
      ...hotel,
      rooms: hotel.rooms.filter((r: any) => {
        const price = Number(r.price);
        return price >= minPrice && price <= maxPrice;
      })
    }));
  }

  // 7️⃣ Sorting
  results = results.sort((a, b) => {
    const aMinPrice = a.rooms.length ? Math.min(...a.rooms.map((r: any) => Number(r.price))) : Infinity;
    const bMinPrice = b.rooms.length ? Math.min(...b.rooms.map((r: any) => Number(r.price))) : Infinity;

    const aMaxPrice = a.rooms.length ? Math.max(...a.rooms.map((r: any) => Number(r.price))) : -Infinity;
    const bMaxPrice = b.rooms.length ? Math.max(...b.rooms.map((r: any) => Number(r.price))) : -Infinity;

    switch (sortBy) {
      case "price-low":
        return aMinPrice - bMinPrice;
      case "price-high":
        return bMaxPrice - aMaxPrice;
      case "rating":
        return (b.star_rating ?? 0) - (a.star_rating ?? 0);
      case "recommended":
      default:
        return (b.star_rating ?? 0) * (b.review_count ?? 0) - (a.star_rating ?? 0) * (a.review_count ?? 0);
    }
  });

  // 8️⃣ Pagination
  const totalCount = results.length;
  const totalPages = Math.ceil(totalCount / size);
  const paginatedResults = results.slice((page - 1) * size, page * size);

  return { data: paginatedResults, totalPages, totalCount };
}

export async function checkRoomAvailability(roomId: string, checkIn: string, checkOut: string) {
  const { data: bookings, error } = await supabase
    .from("bookings")
    .select("room_booked")
    .eq("room_id", roomId)
    .in("status", ["Checked In", "Confirmed"])
    // Overlapping booking condition
    .or(`and(check_in.lte.${checkOut},check_out.gte.${checkIn})`);

  if (error) throw error;

  const alreadyBookedCount = bookings.reduce((acc, b) => acc + b.room_booked, 0);

  const { data: room, error: roomError } = await supabase
    .from("rooms")
    .select("count")
    .eq("id", roomId)
    .single();

  if (roomError) throw roomError;

  const availableCount = room.count - alreadyBookedCount;

  return availableCount > 0 ? availableCount : 0;
}

export async function createBooking({
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
  infants
}: {
  room_id: string;
  hotel_id: string;
  user_id: string;
  check_in: string;
  check_out: string;
  guest_count: number;
  room_booked: number;
  total_amount: number;
  adults: number;
  children: number;
  infants: number;
}) {
  const { data, error } = await supabase
    .from("bookings")
    .insert([{
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
    }])
    .select();

  if (error) throw error;

  return data[0];
}

export async function addHotel(name: string, destination: string, description: string, created_by: string) {
  const { data, error } = await supabase
    .from("hotels")
    .insert([{ name, destination, description, created_by }])
    .select()
    .single();

  if (error) throw error.message;
  return data;
}

export async function addRoom(hotelId: string, name: string, price: number, max_guests: number) {
  const { data, error } = await supabase
    .from("rooms")
    .insert([{ hotel_id: hotelId, name, price, max_guests }])
    .select()
    .single();

  if (error) throw error.message;
  return data;
}

export async function getAmenities(){
  const  {data, error} = await supabase.from("amenities").select("id, name")

  if(error){
    throw error.message
  }
  
  return {data}
}
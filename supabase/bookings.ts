import {supabase} from "@/lib/supabase/client"

interface BookingFromDB {
  id: string;
  check_in: string;
  check_out: string;
  created_at: string;
  updated_at: string;
  guest_count: number;
  payment_status: string;
  room_booked: number;
  status: string;
  total_amount: number;
  user_id: {
    id: string;
    full_name: string;
    email: string;
  };
  hotel_id: {
    id: string;
    name: string;
  };
  rooms: Array<{ id: string; name: string }>;
}

interface BookingMapped {
  id: string;
  check_in: Date;
  check_out: Date;
  created_at: Date;
  updated_at: Date;
  guest_count: number;
  payment_status: string;
  room_booked: number;
  status: string;
  total_amount: number;
  users: BookingFromDB["user_id"];
  hotels: BookingFromDB["hotel_id"];
  rooms: BookingFromDB["rooms"];
}

export async function getAllBookings({
  page = 1,
  size = 4,
  searchTerm = "",
  statusFilter = "All",
  paymentFilter = "All",
}: {
  page?: number;
  size?: number;
  searchTerm?: string;
  statusFilter?: string;
  paymentFilter?: string;
}): Promise<{ bookings: any[]; totalPages: number }> {
  // Fetch all rows (without range)
  const { data, error } = await supabase
    .from("bookings")
    .select(`
      id,
      check_in,
      check_out,
      created_at,
      updated_at,
      guest_count,
      payment_status,
      room_booked,
      status,
      total_amount,
      inr_amount,
      user_id!inner(id, full_name, email),
      hotel_id!inner(id, name),
      rooms:room_id (id, name)
    `)
    .order("created_at", { ascending: false })

  if (error) throw error;

  let bookings = (data ?? []) as any[];

  // Filter top-level columns
  if (statusFilter && statusFilter !== "All") {
    bookings = bookings.filter(b => b.status === statusFilter);
  }
  if (paymentFilter && paymentFilter !== "All") {
    bookings = bookings.filter(b => b.payment_status === paymentFilter);
  }

  // Filter nested columns by searchTerm
  if (searchTerm && searchTerm.trim() !== "") {
    const term = searchTerm.toLowerCase();
    bookings = bookings.filter(
      (b) =>
        b.user_id.full_name.toLowerCase().includes(term) ||
        b.user_id.email.toLowerCase().includes(term) ||
        b.hotel_id.name.toLowerCase().includes(term)
    );
  }

  // Calculate total pages after filtering
  const totalPages = Math.ceil(bookings.length / size);

  // Apply pagination in JS
  const from = (page - 1) * size;
  const to = from + size;
  const paginatedBookings = bookings.slice(from, to);

  // Map final structure
  const mappedBookings: BookingMapped[] = paginatedBookings.map((b) => ({
    id: b.id,
    check_in: new Date(b.check_in),
    check_out: new Date(b.check_out),
    created_at: new Date(b.created_at),
    updated_at: new Date(b.updated_at),
    guest_count: b.guest_count,
    payment_status: b.payment_status,
    room_booked: b.room_booked,
    status: b.status,
    total_amount: b.total_amount,
    inr_amount: b.inr_amount,
    users: b.user_id,
    hotels: b.hotel_id,
    rooms: b.rooms,
  }));

  return { bookings: mappedBookings as any[], totalPages };
}

export async function getBookingsById(id: string){
  const { data, error } = await supabase
  .from("bookings")
  .select(
    `
    id,
    check_in,
    check_out,
    created_at,
    updated_at,
    guest_count,
    payment_status,
    room_booked,
    status,
    total_amount,
    user_id!inner(id, full_name, email),
    hotel_id!inner(id, name),
    rooms:room_id (id, name)
  `)
  .eq("id", id)
  .single()

  if (error) throw error;

  const booking = {
    id: data?.id,
    check_in: new Date(data?.check_in),
    check_out: new Date(data?.check_out),
    created_at: new Date(data?.created_at),
    updated_at: new Date(data?.updated_at),
    guest_count: data?.guest_count,
    payment_status: data?.payment_status,
    room_booked: data?.room_booked,
    status: data?.status,
    total_amount: data?.total_amount,
    users: data?.user_id,
    hotels: data?.hotel_id,
    rooms: data?.rooms,
  };

  return {booking}
}

export async function getUserBookings(
  userId: string, 
  page = 1, 
  size = 3
): Promise<{ bookings: any; totalPages: number, totalBookings: number }>{
  const from = (page - 1) * size;
  const to = from + size - 1;

 const { data, error, count } = await supabase
  .from("bookings")
  .select(
    `
      id,
      check_in,
      check_out,
      guest_count,
      status,
      total_amount,
      payment_status,
      created_at,
      inr_amount,
      reviewed,

      hotel:hotel_id (
        id,
        name,
        address,
        star_rating,
        hotel_images (
          id,
          image_url,
          is_primary
        ),
        hotel_amenities (
          amenity_id (name)
        )
      ),

      room: room_id (
        id,
        name,
        room_type,
        room_images (
          id,
          image_url,
          is_primary
        )
      )
    `,
    { count: "exact" }
  )
  .eq('user_id', userId)
  .order("created_at", { ascending: false })
  .range(from, to);

  if(error){
    throw error
  }

  const totalPages = Math.ceil((count ?? 0) / size);
  const totalBookings = count ?? 0

    const bookings =
    data?.map((b: any) => {
      const primaryImage =
        b.room?.room_images?.find((img: any) => img.is_primary)?.image_url ?? "";

      return {
        id: b.id,
        bookingNumber: b.id,
        hotelName: b.hotel?.name ?? "",
        hotelLocation: b.hotel?.address ?? "",
        hotelImage: primaryImage,
        rating: b.hotel.star_rating,
        roomName: b.room?.name ?? "",
        checkIn: new Date(b.check_in),
        checkOut: new Date(b.check_out),
        guests: b.guest_count,
        totalAmount: b.total_amount,
        inr_amount: b.inr_amount,
        status: b.status,
        paymentStatus: b.payment_status,
        bookingDate: new Date(b.created_at),
        hotel_amenities: b.hotel?.hotel_amenities?.map((ra: any) => ra.amenity_id?.name) ?? [],
        room_info: {id: b.room?.id, name: b.room?.name, type: b.room?.room_type},
        reviewed: b.reviewed
      };
    }) ?? [];

  return {bookings, totalBookings, totalPages}

}

export async function bookingStatistics(){
  const {data, error, count} = await supabase
  .from("bookings")
  .select(`
    check_in,
    status,
    payment_status,
    total_amount,
    created_at
  `,
  { count: "exact" }
  )

  if (error) {
    throw error
  }

  const totalBookings = count ?? 0

  const activeBookings = data?.filter(b => 
    b.status === 'Confirmed' || b.status === 'Checked In'
  ).length;

  const todayCheckIns = data?.filter(b => 
    new Date(b.check_in).toDateString() === new Date().toDateString()
  ).length;

  const totalRevenue = data?.filter(b => b.payment_status === 'Paid').reduce((sum, b) => sum + b.total_amount, 0);

  return {totalBookings, activeBookings, todayCheckIns, totalRevenue}
}

export async function updateBookings(bookingId: string, status: string){
  const {data, error} = await supabase
  .from("bookings")
  .update({status})
  .eq("id", bookingId)
  .select()

  if(error){
    throw error
  }

  if (!data || data.length === 0) {
    throw new Error("Not authorized or booking not found");
  }

  return {data}
}

export async function getNextAvailableRanges(
  roomId: string,
  checkIn: string,
  checkOut: string,
  requestedRooms: number
) {
  // 1. Get all bookings that overlap with requested range and are not cancelled
  const { data: bookings } = await supabase
    .from("bookings")
    .select("check_in, check_out, room_booked, status")
    .eq("room_id", roomId)
    .neq("status", "cancelled")
    .or(`and(check_in.lte.${checkOut},check_out.gte.${checkIn})`);

  // 2. Get total room count
  const { data: room } = await supabase
    .from("rooms")
    .select("count")
    .eq("id", roomId)
    .single();

  if (!room) return [];

  const totalRooms = room.count;

  // 3. Build a map of each date in the requested range -> rooms booked
  const bookedMap: Record<string, number> = {};
  let current = new Date(checkIn);
  const end = new Date(checkOut);

  while (current <= end) {
    bookedMap[current.toISOString().split("T")[0]] = 0;
    current.setDate(current.getDate() + 1);
  }

  bookings?.forEach((b) => {
    let start = new Date(b.check_in);
    let endB = new Date(b.check_out);
    while (start <= endB) {
      const dateKey = start.toISOString().split("T")[0];
      if (bookedMap[dateKey] !== undefined) {
        bookedMap[dateKey] += b.room_booked;
      }
      start.setDate(start.getDate() + 1);
    }
  });

  // 4. Find dates where requestedRooms are available
  const availableDates: string[] = [];
  Object.entries(bookedMap).forEach(([date, booked]) => {
    if (totalRooms - booked >= requestedRooms) availableDates.push(date);
  });

  return availableDates; // array of dates available
}

export async function removeRoom(id: string){
  const {error, data} = await supabase.from("rooms").delete().eq("id", id)

  if(error) throw error
  
  return {data}
}

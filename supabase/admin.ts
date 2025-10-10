import {supabase} from "@/lib/supabase/client"

export async function getAdminStats(): Promise<{totalHotels: number, activeBookings: number, totalUsers: number, monthlyRevenue: number}>{

    const { count: totalUsers, error: totalUsersError } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("role", "user");

    if (totalUsersError) throw totalUsersError;

    const {count: totalHotels, error: hotelError} = await supabase
    .from("hotels")
    .select("*", {count: "exact", head: true})

    const {data: bookingsData, error: bookingsError, count: bookingsCount} = await supabase
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

    if (bookingsError) {
        throw bookingsError
    }

    const activeBookings = bookingsData?.filter(b => 
        b.status === 'Confirmed' || b.status === 'Checked In'
    ).length;

    const monthlyRevenue = bookingsData
    ?.filter(b => {
        const isPaid = b.payment_status === "Paid";
        const bookingDate = new Date(b.created_at);
        const now = new Date();
        return (
        isPaid &&
        bookingDate.getMonth() === now.getMonth() &&
        bookingDate.getFullYear() === now.getFullYear()
        );
    })
    .reduce((sum, b) => sum + b.total_amount, 0) ?? 0;
    
    return {
        totalHotels: totalHotels ?? 0,
        activeBookings: activeBookings ?? 0,
        totalUsers: totalUsers ?? 0,
        monthlyRevenue: monthlyRevenue ? Number(monthlyRevenue.toFixed(2)) : 0
    };

}

export async function getTopHotels() {
  const { data, error } = await supabase
    .from("bookings")
    .select(`
      hotel_id,
      hotels(name),
      total_amount,
      room_booked,
      payment_status
    `)
    .eq("payment_status", "Paid");

  if (error) throw error;

  const stats = Object.values(
    data.reduce((acc, b: any) => {
      const hotelName = b.hotels?.name ?? "Unknown Hotel";
      if (!acc[hotelName]) {
        acc[hotelName] = { name: hotelName, bookings: 0, revenue: 0 };
      }
      acc[hotelName].bookings += Number(b.room_booked) || 0; // sum of rooms
      acc[hotelName].revenue += Number(b.total_amount) || 0;
      return acc;
    }, {} as Record<string, { name: string; bookings: number; revenue: number }>)
  );

  const filtered = stats.filter(h => h.bookings > 0 && h.revenue > 0);

  const topHotels = filtered.sort((a, b) => b.revenue - a.revenue).slice(0, 5);

  return topHotels.map(h => ({ ...h, revenue: parseFloat(h.revenue.toFixed(2)) }));
}


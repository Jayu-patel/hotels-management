import {supabase} from "@/lib/supabase/client"

export async function getAllUsers({page = 1, size = 8, searchTerm = ''}): Promise<{ users: any; totalPages: number, totalUsers: number }>{
    const from = (page  - 1) * size;
    const to = from + size - 1;

    let query = supabase
    .from("profiles")
    .select(`
        id,
        full_name,
        address,
        role,
        phone,
        avatar_url,
        created_at,
        email,
        bookings: bookings(user_id, room_booked, total_amount, payment_status)
    `,
        { count: "exact" }
    )
    .order("created_at", { ascending: false })
    .eq("role", "user")
    .range(from, to);

    if (searchTerm) {
        const search = `%${searchTerm}%`;
        query = query.or(
        `full_name.ilike.${search},email.ilike.${search},phone.ilike.${search}`
        );
    }

    const {data, error, count} = await query 

    if (error) {
        throw error
    }

    const users = data?.map((user) => ({
        ...user,
        name: user.full_name,
        phoneNumber: user.phone,
        createdAt: user.created_at,
        totalBookings: user.bookings?.reduce((acc, b) => acc + (b.room_booked || 0),0) || 0,
        // totalSpent: user.bookings?.reduce((acc, b) => acc + (b.total_amount  || 0),0) || 0,
        totalSpent: user.bookings
            ?.filter(b => b.payment_status == "Paid")
            .reduce((acc, b) => acc + (b.total_amount || 0), 0) || 0,
    }));

    const totalPages = Math.ceil((count ?? 0) / size);
    const totalUsers = count ?? 0

    return {users, totalPages, totalUsers}
}

export async function userStatistic(): Promise<{totalUsers: number, totalGuests?: number, newUsersThisMonth: number}>{
    const { count: totalUsers, error: totalUsersError } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("role", "user");

    if (totalUsersError) throw totalUsersError;

    // Total regular users (role = 'user')
    // const { count: totalGuests, error: totalGuestsError } = await supabase
    //     .from("profiles")
    //     .select("*", { count: "exact", head: true })
    //     .eq("role", "user");

    // if (totalGuestsError) throw totalGuestsError;

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString();

    const { count: newUsersThisMonth, error: newUsersError } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("role", "user")
        .gte("created_at", startOfMonth)
        .lte("created_at", endOfMonth);

    if (newUsersError) throw newUsersError;

    return {
        totalUsers: totalUsers ?? 0,
        // totalGuests: totalGuests ?? 0,
        newUsersThisMonth: newUsersThisMonth ?? 0,
    };
}
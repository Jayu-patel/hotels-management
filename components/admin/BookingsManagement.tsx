"use client"
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Search, Filter, Calendar, User, Hotel, DollarSign } from 'lucide-react';
import { bookingStatistics, getAllBookings, getBookingsById, updateBookings } from '@/supabase/bookings';
import { toast } from 'react-toastify';
import Loader from '@/components/loader'
import { supabase } from '@/lib/supabase/client';
import { useConfirm } from '@/contexts/confirmation';
import PaginationComponent from "@/components/pagination"
import TextLoader from '@/components/textLoader'

export interface Booking {
  id: string;
  check_in: string;
  check_out: string;
  created_at: string;
  updated_at: string;
  guest_count: number;
  room_booked: number;
  total_amount: number;
  status: "Confirmed" | "Checked In" | "Checked Out" | "Cancelled";
  payment_status: "Paid" | "Pending" | "Refunded";

  users: {
    id: string;
    full_name: string;
    email: string;
  } | null;

  hotels: {
    id: string;
    name: string;
  } | null;

  rooms: {
    id: string;
    name: string;
  } | null;
}

export function BookingsManagement() {
  const [bookings, setBookings] = useState<Booking[] | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [paymentFilter, setPaymentFilter] = useState('All');

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  const [totalBookings, setTotalBookings] = useState(0)
  const [activeBookings, setActiveBookings] = useState(0)
  const [todayCheckIns, setTodaysCheckIns] = useState(0)
  const [totalRevenue, setTotalRevenue] = useState(0)
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({id: "", loading: false})
  const [cancelLoading, setCancelLoading] = useState({id: "", loading: false})
  const confirm = useConfirm();

  function truncateString(str: string, maxLength: number): string {
    if (str.length <= maxLength) return str;
    return str.slice(0, maxLength) + "....";
  }
  
  const filteredBookings = bookings
  // const filteredBookings = bookings?.filter((booking) => {
  //   const matchesSearch = 
  //     booking.users?.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //     booking.users?.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //     booking.hotels?.name.toLowerCase().includes(searchTerm.toLowerCase());
    
  //   const matchesStatus = statusFilter === 'All' || booking.status === statusFilter;
  //   const matchesPayment = paymentFilter === 'All' || booking.payment_status === paymentFilter;
    
  //   return matchesSearch && matchesStatus && matchesPayment;
  // });

  const updateBookingStatus = async(bookingId: string, newStatus: Booking['status']) => {
    let config;
    switch (newStatus) {
      case "Checked In":
        config = {
          title: "Confirm Check-In",
          description:
            "Are you sure you want to check in this guest? This will mark the booking as checked-in.",
          confirmText: "Check-In",
          intent: "default" as const,
        };
        break;

      case "Checked Out":
        config = {
          title: "Confirm Check-Out",
          description:
            "This will mark the booking as completed. Make sure the guest has actually checked out.",
          confirmText: "Check-Out",
          intent: "default" as const,
        };
        break;

      case "Cancelled":
        config = {
          title: "Cancel Booking",
          description:
            "This will cancel the booking and notify the guest. This action cannot be undone.",
          confirmText: "Cancel Booking",
          intent: "danger" as const,
          cancelText: "Close",
        };
        break;

      default:
        throw new Error("Unknown booking action");
    }

    const ok = await confirm(config);
    if (!ok) return;

    switch (newStatus) {
      case "Checked In":
        setActionLoading({id: bookingId, loading: true})
        break;

      case "Checked Out":
        setActionLoading({id: bookingId, loading: true})
        break;

      case "Cancelled":
        setCancelLoading({id: bookingId, loading: true})
        break;

      default:
        throw new Error("Unknown booking action");
    }

    try{
      const {data} = await updateBookings(bookingId, newStatus)
    }
    catch(err: any){
      toast.error(err.message)
    }
    finally{
      setActionLoading({id: "", loading: false})
      setCancelLoading({id: "", loading: false})
    }

  };

  const getStatusColor = (status: Booking['status']) => {
    switch (status) {
      case 'Confirmed': return 'default';
      case 'Checked In': return 'secondary';
      case 'Checked Out': return 'outline';
      case 'Cancelled': return 'destructive';
      default: return 'default';
    }
  };

  const getPaymentStatusColor = (status: Booking['payment_status']) => {
    switch (status) {
      case 'Paid': return 'default';
      case 'Pending': return 'secondary';
      case 'Refunded': return 'outline';
      default: return 'default';
    }
  };

  async function getBookingSatistic(){
    try{
      const {activeBookings, todayCheckIns, totalBookings, totalRevenue} = await bookingStatistics()
      setTotalBookings(totalBookings)
      setTodaysCheckIns(todayCheckIns)
      setTotalRevenue(totalRevenue)
      setActiveBookings(activeBookings)
    }
    catch(err: any){
      toast.error(err.message)
    }
  }
  
  async function commonFetch(currentPage: number, totalSize: number){
    try{
      const { bookings, totalPages } = await getAllBookings({page: currentPage, size: totalSize, paymentFilter, searchTerm: search, statusFilter});
      if(bookings){
        setBookings(bookings);
        setTotalPages(totalPages);
      }
    }
    catch(err: any){
      toast.error(err.message)
    }
  }

  async function fetchBookings() {
    setLoading(true);
    try{
      const { bookings, totalPages } = await getAllBookings({page, size: 4, paymentFilter, searchTerm: search, statusFilter});
      if(bookings){
        setBookings(bookings);
        setTotalPages(totalPages);
      }
      await getBookingSatistic()
    }
    catch(err: any){
      toast.error(err.message)
      setLoading(false);
    }
    setLoading(false);
  }


  useEffect(()=>{
      commonFetch(1,4);
      setPage(1)
  },[statusFilter, paymentFilter, search]) // add search filter here

  useEffect(() => {
    commonFetch(page,4);
  }, [page]);

  useEffect(()=>{
    fetchBookings()
  },[])

  useEffect(()=>{
    const channel = supabase.channel("booking_update");

    channel
    .on("postgres_changes", {event: "*", schema: "public", table: "bookings"}, 
    async(payload : any)=>{
      const updatedBookingId = payload.new?.id || payload.old?.id;
      if (!updatedBookingId) return;

    try {
      const updatedBookingId = payload.new?.id || payload.old?.id;
      if (!updatedBookingId) return;

      let booking;

      if (payload.eventType === "DELETE") {
        booking = payload.old;
      } else {
        booking = (await getBookingsById(updatedBookingId)).booking;
      }

      if (payload.eventType === "INSERT") {
        setBookings((prev: any) => [booking, ...prev]);
        toast.success(`New booking ${booking.id} added!`);
      } 
      else if (payload.eventType === "UPDATE") {
        setBookings((prev: any) =>
          prev?.map((b: any) => (b.id === booking.id ? booking : b))
        );
        toast.info(`Booking ${booking.id} updated to ${booking.status}!`);
      } 
      else if (payload.eventType === "DELETE") {
        setBookings((prev: any) => prev?.filter((b: any) => b.id !== booking.id));
        toast.warn(`Booking ${booking.id} has been deleted!`);
      }

      getBookingSatistic();
    } catch (err: any) {
      toast.error(err.message);
    }

    })
    .subscribe((status) => {
    })
    
    return () => {
      supabase.removeChannel(channel);
    }
  },[page])


  if(loading) 
  return <div className="flex justify-center items-center h-[calc(100vh-65px)]"> <Loader/> </div>
  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Bookings</p>
                <p className="text-2xl">{totalBookings}</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Active Bookings</p>
                <p className="text-2xl">{activeBookings}</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <User className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
                <p className="text-2xl">${totalRevenue.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <DollarSign className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Today's Check-ins</p>
                <p className="text-2xl">{todayCheckIns}</p>
              </div>
              <div className="p-3 bg-orange-50 rounded-lg">
                <Hotel className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Bookings Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by booking number, guest name, email, or hotel..."
                  value={search}
                  onChange={(e) => {setSearch(e.target.value); setPage(1);}}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Statuses</SelectItem>
                <SelectItem value="Confirmed">Confirmed</SelectItem>
                <SelectItem value="Checked In">Checked In</SelectItem>
                <SelectItem value="Checked Out">Checked Out</SelectItem>
                <SelectItem value="Cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={paymentFilter} onValueChange={setPaymentFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by payment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Payments</SelectItem>
                <SelectItem value="Paid">Paid</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Refunded">Refunded</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Bookings Table */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Booking #</TableHead>
                  <TableHead>Guest</TableHead>
                  <TableHead>Hotel & Room</TableHead>
                  <TableHead>Dates</TableHead>
                  <TableHead>Guests</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBookings?.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell>
                      <div>
                        <div className="text-xs text-gray-500">
                          {new Date(booking.created_at).toLocaleDateString()}
                        </div>
                        <div className='text-xs text-gray-500'>
                          {truncateString(booking.id, 20)}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="text-sm">{booking.users?.full_name}</div>
                        <div className="text-xs text-gray-500">{booking.users?.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="text-sm">{booking.hotels?.name}</div>
                        <div className="text-xs text-gray-500">{booking.rooms?.name}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{new Date(booking.check_in).toLocaleDateString("en-GB")}</div>
                        <div className="text-xs text-gray-500">
                          to {new Date(booking.check_out).toLocaleDateString("en-GB")}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{booking.guest_count}</TableCell>
                    <TableCell>${booking.total_amount.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusColor(booking.status)}>
                        {booking.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getPaymentStatusColor(booking.payment_status)}>
                        {booking.payment_status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {booking.status === 'Confirmed' && (
                          <Button
                            size="sm"
                            variant="outline"
                            className='cursor-pointer'
                            onClick={() => updateBookingStatus(booking.id, 'Checked In')}
                          >
                            {
                              (actionLoading.loading && actionLoading.id == booking.id) ?
                              <TextLoader text='Check In' loading={actionLoading?.loading} /> :
                              <>Check In</>
                            }
                          </Button>
                        )}
                        {booking.status === 'Checked In' && (
                          <Button
                            size="sm"
                            variant="outline"
                            className='cursor-pointer'
                            onClick={() => updateBookingStatus(booking.id, 'Checked Out')}
                          >
                            {
                              (actionLoading.loading && actionLoading.id == booking.id) ?
                                <TextLoader text='Check Out' loading={actionLoading?.loading} /> :
                                <>Check Out</>
                            }
                          </Button>
                        )}
                        {(booking.status === 'Confirmed' || booking.status === 'Checked In') && (
                          <Button
                            size="sm"
                            variant="destructive"
                            className='cursor-pointer'
                            onClick={() => updateBookingStatus(booking.id, 'Cancelled')}
                          >
                            {
                              (cancelLoading.loading && cancelLoading.id == booking.id) ?
                                <TextLoader text='Cancel' loading={cancelLoading?.loading} /> :
                                <>Cancel</>
                            }
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          <div className="flex justify-center mt-6">
            <PaginationComponent page={page} totalPages={totalPages} onPageChange={(newPage)=>{setPage(newPage)}}/>
          </div>


          {filteredBookings?.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No bookings found matching your criteria</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
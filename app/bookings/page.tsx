'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Search, Calendar, MapPin, Users, DollarSign, Download, Eye } from 'lucide-react';
import { BookingDetailsModal } from './BookingsDetailModal';
import Navbar from '@/components/navbar'
import Image from 'next/image';
import { getUserBookings, updateBookings } from '@/supabase/bookings';
import { toast } from 'react-toastify';
import { useAuth } from '@/contexts/auth-context';
import { useConfirm } from '@/contexts/confirmation';
import { supabase } from '@/lib/supabase/client';
import axios from 'axios';
import Loader from '@/components/loader'
import PaginationComponent from '@/components/pagination';

interface Booking {
  id: string;
  bookingNumber: string;
  hotelName: string;
  hotelLocation: string;
  hotelImage: string;
  roomName: string;
  checkIn: Date;
  checkOut: Date;
  guests: number;
  totalAmount: number;
  status: 'Confirmed' | 'Upcoming' | 'Completed' | 'Cancelled';
  paymentStatus: 'Paid' | 'Pending' | 'Refunded';
  bookingDate: Date;
  room_info?: {name: string, type: string}
}

export default function MyBookingsPage() {
  const {user} = useAuth()
  const confirm = useConfirm();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [activeTab, setActiveTab] = useState('all');

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1)


  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const itemsPerPage = 3;
  const [bookings, setBookings] = useState<Booking[] | null>(null)
  const [bookLoading, setBookLoading] = useState(false)
  const [cancelLoading, setCancelLoading] = useState(false)
  const [loading, setLoading] = useState(true)

  const filteredBookings = bookings?.filter((booking) => {
    const matchesSearch = 
      booking.bookingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.hotelName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.hotelLocation.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'All' || booking.status === statusFilter;
    
    let matchesTab = true;
    if (activeTab === 'upcoming') {
      matchesTab = booking.status === 'Upcoming';
    } else if (activeTab === 'completed') {
      matchesTab = booking.status === 'Completed';
    } else if (activeTab === 'cancelled') {
      matchesTab = booking.status === 'Cancelled';
    }
    
    return matchesSearch && matchesStatus && matchesTab;
  });

  const getStatusColor = (status: Booking['status']) => {
    switch (status) {
      case 'Upcoming': return 'default';
      case 'Completed': return 'secondary';
      case 'Cancelled': return 'destructive';
      default: return 'default';
    }
  };

  const getPaymentStatusColor = (status: Booking['paymentStatus']) => {
    switch (status) {
      case 'Paid': return 'default';
      case 'Pending': return 'secondary';
      case 'Refunded': return 'outline';
      default: return 'default';
    }
  };

  // const totalSpent = mockBookings
  //   .filter(b => b.paymentStatus === 'Paid')
  //   .reduce((sum, b) => sum + b.totalAmount, 0);

  // const upcomingBookings = mockBookings.filter(b => b.status === 'Upcoming').length;
  // const completedBookings = mockBookings.filter(b => b.status === 'Completed').length;
  // const cancelledBookings = mockBookings.filter(b => b.status === 'Cancelled').length;

  // Pagination logic
  // const totalPages = Math.ceil((filteredBookings?.length ?? 0) / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedBookings = filteredBookings?.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, activeTab]);

  const handleViewDetails = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsDetailsModalOpen(true);
  };

  const handleCloseDetailsModal = () => {
    setSelectedBooking(null);
    setIsDetailsModalOpen(false);
  };

  const firstLoad=async()=>{
    setLoading(true)
    getAllUserBookings()
    setLoading(false)
  }

  const getAllUserBookings=async()=>{
    try{
      if(user){
        const {bookings, totalPages} = await getUserBookings(user?.id, currentPage, 3)
        if(bookings){
          setBookings(bookings)
          setTotalPages(totalPages)
        }
      }
    }
    catch(err: any){
      toast.error(err.message)
    }
    finally{
      setLoading(false)
    }
  }

  const cancelBooking=async(bookingId: string, newStatus: Booking['status'])=>{
    const ok = await confirm({
          title: "Cancel Booking",
          description:
            "This will cancel the booking. This action cannot be undone.",
          confirmText: "Cancel Booking",
          intent: "danger" as const,
          cancelText: "Close",
        })
    if (!ok) return;
    setCancelLoading(true)
    try{
      await updateBookings(bookingId, newStatus)
      toast.success("Booking cancelled successfully")
    }
    catch(err: any){
      console.log("error: ", err.message)
      toast.error(err.message)
    }
    finally{
      setCancelLoading(false)
      handleCloseDetailsModal()
    }
  }

  const payNow=async(bookingId: string)=>{
    setBookLoading(true)
    try{
      const res = await axios.patch(`/api/bookings`, {id: bookingId})
      const data = res.data
      if (data.url) window.location.href = data.url;
    }
    catch(err: any){
      toast.error("Booking failed")
      console.log(err)
    }
    finally{
      setBookLoading(false)
    }
  }

  useEffect(()=>{
    firstLoad()
  },[user])

  useEffect(()=>{
    getAllUserBookings()
  },[currentPage])

  useEffect(()=>{
    if (!user?.id) return; 
    const channel = supabase.channel("booking_update");

    channel
    .on("postgres_changes", {event: "UPDATE", schema: "public", table: "bookings", filter: `user_id=eq.${user?.id}`}, (payload)=>{
      getAllUserBookings()
      console.log(payload)
    })
    .subscribe((status) => {
      console.log("Realtime channel status:", status)
    });
    
    return () => {
      supabase.removeChannel(channel);
    };
  },[user?.id])


  if(loading) 
  return <div className="flex justify-center items-center h-[calc(100vh-65px)]"> <Loader/> </div>
  return (
    <div>
        <Navbar/>
        <div className="space-y-6 w-[95%] sm:w-[85%] mx-auto mt-5 sm:mt-10">
          <div className="flex justify-between items-center">
              <h1 className="text-3xl">My Bookings</h1>
          </div>

        {/* Statistics Cards */}
        {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
            <CardContent className="p-6">
                <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-gray-600 mb-1">Total Bookings</p>
                    <p className="text-2xl">{mockBookings.length}</p>
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
                    <p className="text-sm text-gray-600 mb-1">Upcoming</p>
                    <p className="text-2xl">{upcomingBookings}</p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                    <Calendar className="h-6 w-6 text-green-600" />
                </div>
                </div>
            </CardContent>
            </Card>

            <Card>
            <CardContent className="p-6">
                <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-gray-600 mb-1">Completed</p>
                    <p className="text-2xl">{completedBookings}</p>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg">
                    <Calendar className="h-6 w-6 text-purple-600" />
                </div>
                </div>
            </CardContent>
            </Card>

            <Card>
            <CardContent className="p-6">
                <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-gray-600 mb-1">Total Spent</p>
                    <p className="text-2xl">${totalSpent.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-orange-50 rounded-lg">
                    <DollarSign className="h-6 w-6 text-orange-600" />
                </div>
                </div>
            </CardContent>
            </Card>
        </div> */}

        {/* Filters and Tabs */}
        <Card>
            {/* <CardHeader>
            <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                <CardTitle>Booking History</CardTitle>
                
                <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                    placeholder="Search bookings..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-full md:w-64"
                    />
                </div>
                
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                    <SelectItem value="All">All Statuses</SelectItem>
                    <SelectItem value="Upcoming">Upcoming</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                    </SelectContent>
                </Select>
                </div>
            </div>
            </CardHeader> */}
            
            <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                {/* <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="all">All ({bookings?.length})</TabsTrigger>
                <TabsTrigger value="upcoming">Upcoming ({0})</TabsTrigger>
                <TabsTrigger value="completed">Completed ({0})</TabsTrigger>
                <TabsTrigger value="cancelled">Cancelled ({0})</TabsTrigger>
                </TabsList> */}
                
                <TabsContent value={activeTab} className="mt-6">
                <div className="space-y-4">
                    {filteredBookings?.map((booking) => (
                    <Card key={booking.id} className="overflow-hidden">
                        <div className="md:flex">
                        <div className="md:w-1/4">
                            <div className='w-full h-48 md:h-full relative'>
                              <Image
                                fill
                                src={`/api/image-proxy?url=${booking.hotelImage}`}
                                alt={booking.hotelName}
                                className="object-cover"
                              />
                            </div>
                        </div>
                        
                        <CardContent className="md:w-3/4 p-4 md:p-6">
                            <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                            <div className="flex-1 space-y-3">
                                <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <h3 className="text-lg">{booking.roomName}</h3>
                                    <Badge variant={getStatusColor(booking.status)}>
                                    {booking.status}
                                    </Badge>
                                </div>
                                <div className="flex items-center text-gray-600 text-sm">
                                    <MapPin className="h-4 w-4 mr-1" />
                                    {booking.hotelLocation}
                                </div>
                                <p className="text-sm text-gray-600">{booking.hotelName}</p>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div>
                                    <p className="text-gray-600">Booking #</p>
                                    <p className="text-sm">{booking.bookingNumber}</p>
                                </div>
                                <div>
                                    <p className="text-gray-600">Check-in</p>
                                    <p className="text-sm">{new Date(booking.checkIn).toLocaleDateString("en-GB")}</p>
                                </div>
                                <div>
                                    <p className="text-gray-600">Check-out</p>
                                    <p className="text-sm">{new Date(booking.checkOut).toLocaleDateString("en-GB")}</p>
                                </div>
                                <div>
                                    <p className="text-gray-600">Guests</p>
                                    <p className="text-sm flex items-center gap-1">
                                    <Users className="h-3 w-3" />
                                    {booking.guests}
                                    </p>
                                </div>
                                </div>
                            </div>

                            <div className="text-right space-y-2">
                                <div>
                                <p className="text-2xl text-green-600">${booking.totalAmount.toLocaleString()}</p>
                                <Badge variant={getPaymentStatusColor(booking.paymentStatus)} className="text-xs">
                                    {booking.paymentStatus}
                                </Badge>
                                </div>
                                
                                <div className="flex flex-col gap-2">
                                <Button 
                                    size="sm" 
                                    variant="outline" 
                                    className="flex items-center gap-1"
                                    onClick={() => handleViewDetails(booking)}
                                >
                                    <Eye className="h-4 w-4" />
                                    View Details
                                </Button>
                                
                                {booking.paymentStatus === 'Pending' && booking.status != "Cancelled"  && (
                                    <Button 
                                      size="sm" 
                                      variant="default"
                                      onClick={()=>{payNow(booking.id)}}
                                      className='cursor-pointer'
                                      disabled={bookLoading}
                                    >
                                      {
                                        bookLoading ? "Loading..." : "Pay Now"
                                      }
                                    </Button>
                                )}

                                {booking.status === 'Confirmed' && (
                                    <Button 
                                      size="sm" 
                                      variant="destructive"
                                      onClick={()=>{cancelBooking(booking.id, "Cancelled")}}
                                      className='cursor-pointer'
                                      disabled={cancelLoading}
                                    >
                                      {
                                        cancelLoading ? "Loading..." : "Cancel Booking"
                                      }
                                    </Button>
                                )}
                                </div>
                            </div>
                            </div>
                        </CardContent>
                        </div>
                    </Card>
                    ))}

                    {filteredBookings?.length === 0 && (
                      <div className="text-center py-12">
                          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <h3 className="text-xl text-gray-600 mb-2">No bookings found</h3>
                          <p className="text-gray-500">
                          {activeTab === 'all' 
                              ? "You haven't made any bookings yet." 
                              : `No ${activeTab} bookings found.`
                          }
                          </p>
                      </div>
                    )}

                    {/* Pagination */}
                    {/* {totalPages > 1 && ( */}
                    <div className="flex justify-center mt-8">
                       <PaginationComponent page={currentPage} totalPages={totalPages} onPageChange={(newPage)=>{setCurrentPage(newPage)}}/>
                        {/* <Pagination>
                        <PaginationContent>
                            <PaginationItem>
                            <PaginationPrevious 
                                href="#"
                                onClick={(e) => {
                                e.preventDefault();
                                if (currentPage > 1) handlePageChange(currentPage - 1);
                                }}
                                className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
                            />
                            </PaginationItem>
                            
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                            <PaginationItem key={page}>
                                <PaginationLink
                                href="#"
                                onClick={(e) => {
                                    e.preventDefault();
                                    handlePageChange(page);
                                }}
                                isActive={currentPage === page}
                                >
                                {page}
                                </PaginationLink>
                            </PaginationItem>
                            ))}
                            
                            <PaginationItem>
                            <PaginationNext 
                                href="#"
                                onClick={(e) => {
                                e.preventDefault();
                                if (currentPage < totalPages) handlePageChange(currentPage + 1);
                                }}
                                className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
                            />
                            </PaginationItem>
                        </PaginationContent>
                        </Pagination> */}
                    </div>
                    {/* )} */}
                </div>
                </TabsContent>
            </Tabs>
            </CardContent>
        </Card>

        {/* Booking Details Modal */}
        <BookingDetailsModal
            booking={selectedBooking}
            isOpen={isDetailsModalOpen}
            onClose={handleCloseDetailsModal}
            onCancel={cancelBooking}
        />
        </div>
    </div>
  );
}
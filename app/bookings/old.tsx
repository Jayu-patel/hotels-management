'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Search, Calendar, MapPin, Users, DollarSign, Download, Eye } from 'lucide-react';
import Navbar from '@/components/navbar'
import Image from 'next/image';

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
  status: 'Upcoming' | 'Completed' | 'Cancelled';
  paymentStatus: 'Paid' | 'Pending' | 'Refunded';
  bookingDate: Date;
}

const mockBookings: Booking[] = [
    {
    id: '1',
    bookingNumber: 'HB001234',
    hotelName: 'Grand Luxury Hotel',
    hotelLocation: 'New York, NY',
    hotelImage: 'link',
    roomName: 'Deluxe King Room',
    checkIn: new Date('2024-04-15'),
    checkOut: new Date('2024-04-18'),
    guests: 2,
    totalAmount: 897,
    status: 'Upcoming',
    paymentStatus: 'Paid',
    bookingDate: new Date('2024-03-01'),
  },
]
// const mockBookings: Booking[] = [
//   {
//     id: '1',
//     bookingNumber: 'HB001234',
//     hotelName: 'Grand Luxury Hotel',
//     hotelLocation: 'New York, NY',
//     hotelImage: 'https://images.unsplash.com/photo-1634041441461-a1789d008830?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBob3RlbCUyMGV4dGVyaW9yfGVufDF8fHx8MTc1Njc0OTUzOXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
//     roomName: 'Deluxe King Room',
//     checkIn: new Date('2024-04-15'),
//     checkOut: new Date('2024-04-18'),
//     guests: 2,
//     totalAmount: 897,
//     status: 'Upcoming',
//     paymentStatus: 'Paid',
//     bookingDate: new Date('2024-03-01'),
//   },
//   {
//     id: '2',
//     bookingNumber: 'HB001235',
//     hotelName: 'Ocean View Resort',
//     hotelLocation: 'Miami, FL',
//     hotelImage: 'https://images.unsplash.com/photo-1678687114989-ad452a24f289?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiZWFjaCUyMHJlc29ydCUyMHZhY2F0aW9ufGVufDF8fHx8MTc1Njc3MzkxMXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
//     roomName: 'Ocean View Suite',
//     checkIn: new Date('2024-02-10'),
//     checkOut: new Date('2024-02-14'),
//     guests: 2,
//     totalAmount: 756,
//     status: 'Completed',
//     paymentStatus: 'Paid',
//     bookingDate: new Date('2024-01-15'),
//   },
//   {
//     id: '3',
//     bookingNumber: 'HB001236',
//     hotelName: 'Mountain Lodge',
//     hotelLocation: 'Aspen, CO',
//     hotelImage: 'https://images.unsplash.com/photo-1689729830276-6b8a3fe230f9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb3VudGFpbiUyMGhvdGVsJTIwdmlld3xlbnwxfHx8fDE3NTY3ODk1NzN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
//     roomName: 'Mountain View Cabin',
//     checkIn: new Date('2024-01-05'),
//     checkOut: new Date('2024-01-08'),
//     guests: 4,
//     totalAmount: 777,
//     status: 'Completed',
//     paymentStatus: 'Paid',
//     bookingDate: new Date('2023-12-10'),
//   },
//   {
//     id: '4',
//     bookingNumber: 'HB001237',
//     hotelName: 'Boutique City Hotel',
//     hotelLocation: 'New York, NY',
//     hotelImage: 'https://images.unsplash.com/photo-1634041441461-a1789d008830?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBob3RlbCUyMGV4dGVyaW9yfGVufDF8fHx8MTc1Njc0OTUzOXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
//     roomName: 'Standard Queen Room',
//     checkIn: new Date('2024-05-20'),
//     checkOut: new Date('2024-05-22'),
//     guests: 1,
//     totalAmount: 398,
//     status: 'Cancelled',
//     paymentStatus: 'Refunded',
//     bookingDate: new Date('2024-03-10'),
//   },
// ];

export default function MyBookingsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [activeTab, setActiveTab] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const filteredBookings = mockBookings.filter((booking) => {
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

  const totalSpent = mockBookings
    .filter(b => b.paymentStatus === 'Paid')
    .reduce((sum, b) => sum + b.totalAmount, 0);

  const upcomingBookings = mockBookings.filter(b => b.status === 'Upcoming').length;
  const completedBookings = mockBookings.filter(b => b.status === 'Completed').length;
  const cancelledBookings = mockBookings.filter(b => b.status === 'Cancelled').length;

  // Pagination logic
  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedBookings = filteredBookings.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Reset to first page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, activeTab]);

  return (
    <div>
      <Navbar/>
      <div className="space-y-6 w-[95%] sm:w-[85%] mx-auto mt-5 sm:mt-10">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl">My Bookings</h1>
          {/* <Button variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Download All
          </Button> */}
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
          <CardHeader>
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
          </CardHeader>
          
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="all">All ({mockBookings.length})</TabsTrigger>
                <TabsTrigger value="upcoming">Upcoming ({upcomingBookings})</TabsTrigger>
                <TabsTrigger value="completed">Completed ({completedBookings})</TabsTrigger>
                <TabsTrigger value="cancelled">Cancelled ({cancelledBookings})</TabsTrigger>
              </TabsList>
              
              <TabsContent value={activeTab} className="mt-6">
                <div className="space-y-4">
                  {paginatedBookings.map((booking) => (
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
                                  <h3 className="text-lg">{booking.hotelName}</h3>
                                  <Badge variant={getStatusColor(booking.status)}>
                                    {booking.status}
                                  </Badge>
                                </div>
                                <div className="flex items-center text-gray-600 text-sm">
                                  <MapPin className="h-4 w-4 mr-1" />
                                  {booking.hotelLocation}
                                </div>
                                <p className="text-sm text-gray-600">{booking.roomName}</p>
                              </div>

                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div>
                                  <p className="text-gray-600">Booking #</p>
                                  <p className="text-sm">{booking.bookingNumber}</p>
                                </div>
                                <div>
                                  <p className="text-gray-600">Check-in</p>
                                  <p className="text-sm">{booking.checkIn.toLocaleDateString()}</p>
                                </div>
                                <div>
                                  <p className="text-gray-600">Check-out</p>
                                  <p className="text-sm">{booking.checkOut.toLocaleDateString()}</p>
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
                                <Button size="sm" variant="outline" className="flex items-center gap-1">
                                  <Eye className="h-4 w-4" />
                                  View Details
                                </Button>
                                
                                {booking.status === 'Upcoming' && (
                                  <Button size="sm" variant="destructive">
                                    Cancel Booking
                                  </Button>
                                )}
                                
                                {booking.status === 'Completed' && (
                                  <Button size="sm" variant="outline">
                                    Write Review
                                  </Button>
                                )}
                                
                                <Button size="sm" variant="outline" className="flex items-center gap-1">
                                  <Download className="h-4 w-4" />
                                  Download
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </div>
                    </Card>
                  ))}

                  {filteredBookings.length === 0 && (
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
                  {totalPages > 1 && (
                    <div className="flex justify-center mt-8">
                      <Pagination>
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
                      </Pagination>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
// import { MapPin } from "lucide-react"
// import { Button } from "@/components/ui/button"
// import { Badge } from "@/components/ui/badge"
// import Navbar from "@/components/navbar"

// export default function BookingsPage() {
//   const bookings = [
//     {
//       id: 1,
//       hotelName: "Crystal Waters Resort",
//       location: "Night Sky Parkway, AZ, USA",
//       roomType: "Single Bed",
//       guests: 2,
//       total: 200,
//       checkIn: "September 20, 2025",
//       checkOut: "September 26, 2025",
//       status: "Paid",
//       image: "/comfortable-hotel-room.png",
//     },
//     {
//       id: 2,
//       hotelName: "The Grand Resort",
//       location: "Los Angeles, California, USA",
//       roomType: "Single Bed",
//       guests: 2,
//       total: 299,
//       checkIn: "September 20, 2025",
//       checkOut: "September 26, 2025",
//       status: "Unpaid",
//       image: "/luxury-hotel-exterior.png",
//     },
//     {
//       id: 3,
//       hotelName: "The Grand Resort",
//       location: "Los Angeles, California, USA",
//       roomType: "Single Bed",
//       guests: 2,
//       total: 299,
//       checkIn: "September 20, 2025",
//       checkOut: "September 26, 2025",
//       status: "Paid",
//       image: "/luxurious-hotel-suite.png",
//     },
//   ]

//   return (
//     <main className="min-h-screen bg-white">
//       <Navbar />
//       <div className="max-w-7xl mx-auto px-6 py-8">
//         <div className="mb-8">
//           <h1 className="text-3xl font-bold mb-2">My Bookings</h1>
//           <p className="text-gray-600">
//             Easily manage your past, current, and upcoming hotel reservations in one place. Plan your trips seamlessly
//             with just a few clicks.
//           </p>
//         </div>

//         <div className="space-y-6">
//           {/* Table Header */}
//           <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pb-4 border-b">
//             <div className="font-medium">Hotels</div>
//             <div className="font-medium">Date & Timings</div>
//             <div className="font-medium">Payment</div>
//             <div></div>
//           </div>

//           {/* Bookings */}
//           <div className="space-y-4">
//             {bookings.map((booking) => (
//               <div
//                 key={booking.id}
//                 className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border rounded-lg hover:shadow-sm transition-shadow"
//               >
//                 {/* Hotel Info */}
//                 <div className="flex items-center gap-4">
//                   <img
//                     src={booking.image || "/placeholder.svg"}
//                     alt={booking.hotelName}
//                     className="w-16 h-16 rounded-lg object-cover"
//                   />
//                   <div>
//                     <h3 className="font-semibold">{booking.hotelName}</h3>
//                     <Badge variant="outline" className="text-xs mb-1">
//                       {booking.roomType}
//                     </Badge>
//                     <div className="flex items-center gap-1 text-gray-600 text-sm">
//                       <MapPin className="h-3 w-3" />
//                       <span>{booking.location}</span>
//                     </div>
//                     <div className="text-sm text-gray-600">Guests: {booking.guests}</div>
//                     <div className="font-semibold">Total: ${booking.total}</div>
//                   </div>
//                 </div>

//                 {/* Date & Timings */}
//                 <div className="space-y-2">
//                   <div>
//                     <div className="text-sm font-medium">Check-In:</div>
//                     <div className="text-sm text-gray-600">{booking.checkIn}</div>
//                   </div>
//                   <div>
//                     <div className="text-sm font-medium">Check-Out:</div>
//                     <div className="text-sm text-gray-600">{booking.checkOut}</div>
//                   </div>
//                 </div>

//                 {/* Payment Status */}
//                 <div className="flex items-center">
//                   <Badge className={booking.status === "Paid" ? "bg-green-500 text-white" : "bg-red-500 text-white"}>
//                     {booking.status}
//                   </Badge>
//                 </div>

//                 {/* Actions */}
//                 <div className="flex items-center justify-end">
//                   {booking.status === "Unpaid" && (
//                     <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
//                       Pay now
//                     </Button>
//                   )}
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>
//     </main>
//   )
// }

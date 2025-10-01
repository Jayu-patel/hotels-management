'use client';

import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent } from '@/components/ui/card';
import { 
  MapPin, 
  Calendar, 
  Users, 
  Phone, 
  Mail, 
  CreditCard, 
  Download,
  Star,
  Wifi,
  Car,
  UtensilsCrossed,
  Dumbbell,
  Waves
} from 'lucide-react';
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
  status: 'Confirmed' | 'Upcoming' | 'Completed' | 'Cancelled';
  paymentStatus: 'Paid' | 'Pending' | 'Refunded';
  bookingDate: Date;
  room_info?: {name: string, type: string},
  hotel_amenities?: string[],
  rating?: number
}

interface BookingDetailsModalProps {
  booking: Booking | null;
  isOpen: boolean;
  onClose: () => void;
  onCancel: (bookingId: string, newStatus: Booking["status"]) => void;
}

const generateBookingDetails = (booking: Booking) => {
  const nights = Math.ceil((booking.checkOut.getTime() - booking.checkIn.getTime()) / (1000 * 60 * 60 * 24));
  const pricePerNight = Math.round(booking.totalAmount / nights);
  const taxes = Math.round(booking.totalAmount * 0.12);
  const subtotal = booking.totalAmount - taxes;

  return {
    nights,
    pricePerNight,
    subtotal,
    taxes,
    confirmation: booking.bookingNumber,
    guestDetails: {
      name: 'John Doe',
      email: 'john.doe@example.com',
      phone: '+1 (555) 123-4567'
    },
    hotelDetails: {
      address: `${booking.hotelLocation}`,
      phone: '+1 (555) 987-6543',
      email: 'info@hotel.com',
      amenities: ['Free WiFi', 'Parking', 'Restaurant', 'Gym', 'Pool']
    },
  };
};

export function BookingDetailsModal({ booking, isOpen, onClose, onCancel }: BookingDetailsModalProps) {
  if (!booking) return null;
  const details = generateBookingDetails(booking);

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

  const amenityIcons = {
    'Free WiFi': Wifi,
    'Parking': Car,
    'Restaurant': UtensilsCrossed,
    'Gym': Dumbbell,
    'Pool': Waves,
    'Free breakfast': UtensilsCrossed,
    'Room service': Dumbbell
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      {/* <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto"> */}
      <DialogContent className="w-full max-w-[95vw] sm:max-w-2xl md:max-w-3xl
             max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Booking Details</span>
            <div className="flex items-center gap-2 mr-5">
              <Badge variant={getStatusColor(booking.status)}>
                {booking.status}
              </Badge>
              <Badge variant={getPaymentStatusColor(booking.paymentStatus)}>
                {booking.paymentStatus}
              </Badge>
            </div>
          </DialogTitle>
          <DialogDescription>
            Complete details for booking #{booking.bookingNumber}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Hotel Overview */}
          <Card>
            <CardContent className="p-0">
              <div className="md:flex">
                <div className="md:w-1/3">
                  <div className='relative w-full h-48 md:h-full'>
                    <Image
                      fill
                      src={`/api/image-proxy?url=${booking.hotelImage}`}
                      alt={booking.hotelName}
                      className="object-cover rounded-l-lg"
                    />
                  </div>
                </div>
                <div className="md:w-2/3 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl mb-2">{booking.roomName} : {booking.hotelName}</h3>
                      <div className="flex items-center text-gray-600 mb-2">
                        <MapPin className="h-4 w-4 mr-1" />
                        <span className="text-sm">{details.hotelDetails.address}</span>
                      </div>
                      <div className="flex items-center gap-1 mb-4">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              className={`h-4 w-4 ${
                                i < Math.floor(booking.rating ?? 0) 
                                  ? 'text-yellow-400 fill-current' 
                                  : 'text-gray-300'
                              }`} 
                            />
                          ))}
                        </div>
                        <span className="text-sm text-gray-600 ml-1">
                          {booking.rating ?? 0} stars
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* <div className="space-y-3">
                    <div className="flex items-center text-sm text-gray-600">
                      <Phone className="h-4 w-4 mr-2" />
                      {details.hotelDetails.phone}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Mail className="h-4 w-4 mr-2" />
                      {details.hotelDetails.email}
                    </div>
                  </div> */}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Booking Information */}
            <Card>
              <CardContent className="p-6">
                <h4 className="mb-4">Booking Information</h4>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Confirmation #</p>
                      <p className="text-sm">{booking.bookingNumber}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Booking Date</p>
                      <p className="text-sm">{booking.bookingDate.toLocaleDateString("en-GB")}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Check-in</p>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span className="text-sm">{booking.checkIn.toLocaleDateString("en-GB")}</span>
                      </div>
                      <p className="text-xs text-gray-500">After 3:00 PM</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Check-out</p>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span className="text-sm">{booking.checkOut.toLocaleDateString("en-GB")}</span>
                      </div>
                      <p className="text-xs text-gray-500">Before 11:00 AM</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Duration</p>
                      <p className="text-sm">{details.nights} night{details.nights > 1 ? 's' : ''}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Guests</p>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span className="text-sm">{booking.guests} guest{booking.guests > 1 ? 's' : ''}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Room Information */}
            <Card>
              <CardContent className="p-6">
                <h4 className="mb-4">Room Information</h4>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600">Room Name</p>
                    <p className="text-sm">{booking.roomName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Room Type</p>
                    <div className="flex items-center gap-1">
                      <span className="text-sm">{booking?.room_info?.type}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Hotel Amenities */}
          <Card>
            <CardContent className="p-6">
              <h4 className="mb-4">Hotel Amenities</h4>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {booking?.hotel_amenities?.map((amenity, index) => {
                  const IconComponent = amenityIcons[amenity as keyof typeof amenityIcons];
                  return (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      {IconComponent && <IconComponent className="h-4 w-4 text-gray-600" />}
                      <span>{amenity}</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Payment Summary */}
          <Card>
            <CardContent className="p-6">
              <h4 className="mb-4">Payment Summary</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm">
                    {booking.roomName} × {details.nights} night{details.nights > 1 ? 's' : ''}
                  </span>
                  <span className="text-sm">${details.subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Taxes & Fees</span>
                  <span className="text-sm">${details.taxes.toLocaleString()}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-base">Total Amount</span>
                  <span className="text-lg text-green-600">${booking.totalAmount.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <CreditCard className="h-4 w-4" />
                  <span className="text-sm text-gray-600">
                    Payment Status: {booking.paymentStatus}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-end">
            {/* <Button variant="outline" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Download Receipt
            </Button> */}
            
            {booking.status === 'Confirmed' && (
              <Button 
                variant="destructive"
                className='cursor-pointer'
                onClick={()=>{onCancel(booking.id, "Cancelled")}}
              >
                Cancel Booking
              </Button>
            )}
            
            {/* {booking.status === 'Completed' && (
              <Button variant="outline">
                Write Review
              </Button>
            )} */}
            
            <Button onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
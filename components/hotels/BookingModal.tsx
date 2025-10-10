import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Users, Check, X } from 'lucide-react';
import { DateRange } from 'react-day-picker';
import Image from 'next/image';
import { toast } from 'react-toastify';
import { checkRoomAvailability, createBooking } from '@/supabase/hotels';
import axios from 'axios';
import { useCurrency } from '@/contexts/currency-context';

interface Room {
  id: string;
  hotelId: string;
  name: string;
  type: string;
  description: string;
  imageUrls: string[];
  pricePerNight: number;
  maxOccupancy: number;
  amenities: string[];
  available: boolean;
}

interface Hotel {
  id: string;
  name: string;
  location: string;
  rating: number;
  reviewCount: number;
  description: string;
  imageUrls: string[];
  amenities: string[];
  address: string;
}

interface BookingModalProps {
  room: Room;
  hotel: Hotel;
  userId: string;
  onClose: () => void;
  onSubmit: (bookingData: any) => void;
  dates: {from?: string, to?: string}
}

interface GuestCount {
  adults: number;
  children: number;
  infants: number;
}

export function BookingModal({ room, hotel, userId, onClose, onSubmit, dates }: BookingModalProps) {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: undefined,
    to: undefined,
  });
  const [guests, setGuests] = useState(1);
  const [guestCount, setGuestCount] = useState<GuestCount>({
    adults: 1,
    children: 0,
    infants: 0,
  });
  
  const [rooms, setRooms] = useState('1');
  const { currency, symbol, rate, currencyConverter } = useCurrency();

  const [loading, setLoading] = useState(false)
  const [bookLoading, setBookLoading] = useState(false)
  const [availableRooms, setAvailableRooms] = useState<number | null>(0)

  useEffect(()=>{
    if(dates.from && dates.to){
      setDateRange({
        from: new Date(dates.from),
        to: new Date(dates.to)
      })
    }
  },[dates])

  const calculateNights = () => {
    if (dateRange?.from && dateRange?.to) {
      const diffTime = Math.abs(dateRange.to.getTime() - dateRange.from.getTime());
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
    return 0;
  };

  const nights = calculateNights();

  let subtotal = nights * room.pricePerNight * Number(rooms);
  let taxes = subtotal * 0;
  let serviceFee = subtotal * 0.05;
  let total = Math.floor(subtotal + taxes + serviceFee)
  const dollorPrice = total

  if (currency === "inr") {
    subtotal *= rate;
    serviceFee *= rate;
    taxes *= rate;
    total = Math.floor(total * rate)
  }

  const maxGuestsAllowed = Number(rooms) * room.maxOccupancy;
  const guestError =
    guests > maxGuestsAllowed
      ? `Maximum ${maxGuestsAllowed} guests allowed for ${rooms} room(s).`
      : null;
    

  const handleSubmit = async(e: React.FormEvent) => {
    e.preventDefault();
    if (guestError) return;

    try{
      const availableCount = await checkRoomAvailability(room.id, dateRange?.from ? dateRange.from.toISOString().split('T')[0] : '', dateRange?.to ? dateRange.to.toISOString().split('T')[0] : '');
      if (availableCount < Number(rooms)) {
        toast.error(`Only ${availableCount} room(s) are available for these dates`);
        return;
      }

      setBookLoading(true)
      const res = await axios.post("/api/bookings", {
        room_id: room.id,
        hotel_id: hotel.id,
        user_id: userId,
        check_in: dateRange?.from ? dateRange.from.toISOString() : '',
        check_out: dateRange?.to ? dateRange.to.toISOString() : '',
        room_booked: Number(rooms),
        guest_count: Number(guests),
        total_amount: dollorPrice,
        adults: guestCount.adults,
        children: guestCount.children,
        infants: guestCount.infants,
        inr_amount: Math.floor(dollorPrice * rate),
        currency
      });

      if(res.status == 200){
        const data = res.data;
        if (data.url) window.location.href = data.url;
        toast.success("Room booked successfully!")
        onClose()
      }
      else{
        toast.error("Booking failed!!")
      }
    }
    catch(err: any){
      toast.error(err.message)
    }
    finally{
      setBookLoading(false)
    }
    
    onSubmit({
      room_id: room.id,
      hotel_id: hotel.id,
      user_id: userId,
      check_in: dateRange?.from ? dateRange.from.toISOString().split('T')[0] : '',
      check_out: dateRange?.to ? dateRange.to.toISOString().split('T')[0] : '',
      room_booked: Number(rooms),
      guest_count: Number(guests),
      total_amount: total
    });
  };

  const isFormValid = dateRange?.from && dateRange?.to && guests && nights > 0 && !guestError;

  // derive date strings from dateRange
const checkIn = dateRange?.from
  ? dateRange.from.toISOString().split("T")[0]
  : "";
const checkOut = dateRange?.to
  ? dateRange.to.toISOString().split("T")[0]
  : "";

useEffect(() => {
  const fetchAvailability = async () => {
    if (!room?.id || !checkIn || !checkOut || Number(rooms) < 1) {
      setAvailableRooms(null); // reset if input incomplete
      return;
    }

    setLoading(true);
    try {
      const available = await checkRoomAvailability(
        room.id,
        checkIn,
        checkOut
      );
      setAvailableRooms(available);
    } catch (err: any) {
      toast.error(err.message);
    }
    setLoading(false);
  };

  fetchAvailability();
}, [room?.id, checkIn, checkOut, rooms]);

useEffect(()=>{
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let nextDate = new Date(today);
  nextDate.setDate(today.getDate() + 6);

},[dateRange])


  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="w-full max-w-[95vw] sm:max-w-2xl md:max-w-4xl lg:max-w-5xl xl:max-w-6xl max-h-[95vh] overflow-y-auto p-0">
        <DialogClose asChild>
          <button
            className="absolute right-2 top-2 p-1 rounded-full hover:bg-gray-100 cursor-pointer z-10"
            aria-label="Close"
          >
            <X className="h-6 w-6" /> {/* Change size here */}
          </button>
        </DialogClose>
        <DialogHeader className="p-6 pb-4">
          <DialogTitle>Book Your Stay</DialogTitle>
        </DialogHeader>

        <div className="px-6 pb-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Room Details */}
            <div className="space-y-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex gap-4 mb-4">
                    <div className="w-20 h-20 relative">
                      <Image
                        fill
                        src={`/api/image-proxy?url=${room.imageUrls[0]}`}
                        alt={room.name}
                        className="object-cover rounded-lg"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg mb-1">{room.name}</h3>
                      <p className="text-sm text-gray-600 mb-2">{hotel.name}</p>
                      <Badge variant="secondary">{room.type}</Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>Up to {room.maxOccupancy} guests</span>
                    </div>
                  </div>

                  <Separator className="my-4" />

                  <div>
                    <h4 className="text-sm mb-2">Room Amenities</h4>
                    <div className="flex flex-wrap gap-2">
                      {room.amenities.slice(0, 6).map((amenity) => (
                        <div
                          key={amenity}
                          className="flex items-center gap-1 text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded"
                        >
                          <Check className="h-3 w-3" />
                          {amenity}
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <h4 className="text-lg mb-3">Hotel Information</h4>
                  <h3 className="text-sm">Location</h3>
                  <div className="text-sm text-gray-600">
                    <p className="pt-2">{hotel.address}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Booking Form */}
            <div className="space-y-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Date Range Picker */}
                <div className="space-y-2">
                  <Label>Check-in and Check-out Dates</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal h-12">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateRange?.from ? (
                          dateRange.to ? (
                            <>
                              {dateRange.from.toLocaleDateString("en-GB")} - {dateRange.to.toLocaleDateString("en-GB")}
                            </>
                          ) : (
                            dateRange.from.toLocaleDateString("en-GB")
                          )
                        ) : (
                          <span className="text-muted-foreground">Pick check-in and check-out dates</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={dateRange?.from}
                        selected={dateRange}
                        onSelect={setDateRange}
                        numberOfMonths={2}
                        // disabled={(date) => date < new Date() || date < new Date('1900-01-01')}
                        disabled={(date) => {
                          const today = new Date();
                          today.setHours(0, 0, 0, 0); // reset time → 00:00:00

                          return date < today || date < new Date("1900-01-01");
                        }}

                      />
                    </PopoverContent>
                  </Popover>
                  {dateRange?.from && dateRange?.to && (
                    <div className="text-sm text-gray-600 mt-1">
                      {nights} night{nights > 1 ? 's' : ''} selected
                    </div>
                  )}
                </div>

                {/* Room Selector */}
                <div>
                  <Label htmlFor="rooms">Number of Rooms</Label>
                  <Select value={rooms} onValueChange={setRooms}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select rooms" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => (
                        <SelectItem key={num} value={num.toString()}>
                          {num} room{num > 1 ? 's' : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* New Guests */}
                <div className="space-y-2 relative">
                  <label className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4" />
                    Guests
                  </label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-between text-left"
                      >
                        <span>
                          {/* ✅ Exclude infants from total count */}
                          {guestCount.adults + guestCount.children} Guest
                          {guestCount.adults + guestCount.children > 1 ? "s" : ""}

                          {/* Optionally show infants separately */}
                          {guestCount.infants > 0 &&
                            `, ${guestCount.infants} Infant${
                              guestCount.infants > 1 ? "s" : ""
                            }`}
                        </span>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-64 p-4">
                      <div className="space-y-4">
                        {([
                          { label: "Adults", key: "adults", min: 1, max: 10 },
                          { label: "Children", key: "children", min: 0, max: 5 },
                          { label: "Infants", key: "infants", min: 0, max: 5 },
                        ] as const).map((item) => (
                          <div key={item.key} className="flex items-center justify-between">
                            <div className="flex flex-col">
                              <span className="font-medium">{item.label}</span>
                              <span className="text-xs text-gray-500">
                                {item.label === "Adults"
                                  ? "Ages 13+"
                                  : item.label === "Children"
                                  ? "Ages 2-12"
                                  : "Under 2"}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={guestCount[item.key as keyof GuestCount] <= item.min}
                                onClick={() =>
                                  setGuestCount((prev) => {
                                    const updated = {
                                      ...prev,
                                      [item.key]: Math.max(
                                        prev[item.key as keyof GuestCount] - 1,
                                        item.min
                                      ),
                                    };
                                    setGuests(updated.adults + updated.children); // ✅ Update guests state
                                    return updated;
                                  })
                                }
                              >
                                -
                              </Button>
                              <span>{guestCount[item.key as keyof GuestCount]}</span>
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={
                                  guestCount[item.key as keyof GuestCount] >= item.max ||
                                  (item.key !== "infants" &&
                                    guestCount.adults + guestCount.children >= 10)
                                }
                                onClick={() =>
                                  setGuestCount((prev) => {
                                    const updated = {
                                      ...prev,
                                      [item.key]: Math.min(
                                        prev[item.key as keyof GuestCount] + 1,
                                        item.max
                                      ),
                                    };
                                    setGuests(updated.adults + updated.children); // ✅ Update guests state
                                    return updated;
                                  })
                                }
                              >
                                +
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>
                   {guestError && <p className="text-sm text-red-500 mt-1">{guestError}</p>}
                </div>

                  {loading && <p>Checking availability...</p>}

                  {!dateRange?.from || !dateRange?.to ? null : (
                    <>
                      {availableRooms === null ? null : availableRooms > 0 ? (
                        <p>{availableRooms} room(s) available ✅</p>
                      ) : (
                        <p>No rooms are available ❌</p>
                      )}
                    </>
                  )}

                {/* Price Summary */}
                {nights > 0 && (
                  <Card>
                    <CardContent className="p-4">
                      <h4 className="text-lg mb-3">Price Summary</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>
                            {symbol}{currencyConverter(room.pricePerNight)} × {rooms} room{Number(rooms) > 1 ? 's' : ''} × {nights} night
                            {nights > 1 ? 's' : ''}
                          </span>
                          <span>{symbol}{subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Service fee</span>
                          <span>{symbol}{serviceFee.toFixed(2)}</span>
                        </div>
                        {/* <div className="flex justify-between">
                          <span>Taxes</span>
                          <span>{symbol}{taxes.toFixed(2)}</span>
                        </div> */}
                        <Separator />
                        <div className="flex justify-between text-lg">
                          <span>Total</span>
                          <span>{symbol}{total.toFixed(2)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                    Cancel
                  </Button>
                  <Button type="submit" disabled={!isFormValid || loading || bookLoading} className="flex-1 cursor-pointer">
                    {
                      bookLoading ? 
                      "Booking..." :
                      "Confirm Booking"
                    }
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

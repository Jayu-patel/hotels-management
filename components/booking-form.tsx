"use client"

import { useState } from "react"
import { MapPin, Users, Search, CalendarIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@radix-ui/react-popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export function BookingForm() {
  const [destination, setDestination] = useState("")
  const [checkIn, setCheckIn] = useState<Date>()
  const [checkOut, setCheckOut] = useState<Date>()
  const [guests, setGuests] = useState(1)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
  }

  return (
  <Card className="bg-white/95 backdrop-blur-sm p-6 rounded-xl shadow-xl max-w-6xl mx-auto">
    <form onSubmit={handleSubmit}>
      <div className="flex flex-col md:flex-row gap-4">
        {/* Destination */}
        <div className="flex flex-col flex-1 space-y-2">
          <label className="text-sm font-medium text-foreground flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Destination
          </label>
          <Input
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            className="bg-white border-border h-[42px]"
            placeholder="Where to?"
          />
        </div>

        {/* Check-in */}
        <div className="flex flex-col flex-1 space-y-2">
          <label className="text-sm">Check-in</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left h-[42px]"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {checkIn ? checkIn.toLocaleDateString("en-GB") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={checkIn}
                onSelect={setCheckIn}
                disabled={(date) => date < new Date()}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Check-out */}
        <div className="flex flex-col flex-1 space-y-2">
          <label className="text-sm">Check-out</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left h-[42px]"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {checkOut ? checkOut.toLocaleDateString("en-GB") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={checkOut}
                onSelect={setCheckOut}
                disabled={(date) =>
                  date < new Date() ||
                  (checkIn !== undefined && date <= checkIn)
                }
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Guests */}
        <div className="flex flex-col flex-1 space-y-2">
          <label className="flex items-center gap-2 text-sm">
            <Users className="h-4 w-4" />
            Guests
          </label>
          <Select
            value={guests.toString()}
            onValueChange={(value) => setGuests(parseInt(value))}
          >
            <SelectTrigger className="h-[42px] bg-white p-5">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                <SelectItem key={num} value={num.toString()}>
                  {num} {num === 1 ? "Guest" : "Guests"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Submit Button */}
        <div className="flex flex-col justify-end">
          <Button
            type="submit"
            className="w-full md:w-auto h-[42px]"
            size="lg"
          >
            <Search className="mr-2 h-4 w-4" />
            Search Hotels
          </Button>
        </div>
      </div>
    </form>
  </Card>
)

}

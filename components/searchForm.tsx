"use client"

import { useEffect, useState } from "react"
import { CalendarIcon, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { DateRange } from "react-day-picker"
import { cn } from "@/lib/utils"
import { CalendarRange } from "./calander-range"

type SearchBarProps = {
  checkIn: string;
  setCheckIn: (date: string) => void;
  checkOut: string;
  setCheckOut: (date: string) => void;
  roomGuests: { adults: number, children: number, rooms: number};
  setRoomGuests: (props: any) => void;
  onSearch: (checkInDate: string, checkOutDate: string, guest: {adults: number, children: number, rooms: number}) => void;
  className?: string
};

export function SearchBar({checkIn, setCheckIn, checkOut, setCheckOut, roomGuests, setRoomGuests, onSearch, className} : SearchBarProps) {

  function toLocalDate(dateStr: string) {
    const [y, m, d] = dateStr.split("-").map(Number);
    return new Date(y, m - 1, d); // local midnight, no timezone shift
  }

  // const [dateRange, setDateRange] = useState<DateRange | undefined>({
  //   from: checkIn ? toLocalDate(checkIn) : undefined,
  //   to: checkOut ? toLocalDate(checkOut) : undefined,
  // });

    const [dateRange, setDateRange] = useState<DateRange | undefined>({
      from: new Date(checkIn),
      to: new Date(checkOut),
    });

  // const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});

  const [guest, setGuest] = useState({ adults: 2, children: 0, rooms: 1 })
  const [openGuest, setOpenGuest] = useState(false)
  const [openDate, setOpenDate] = useState(false)

  const increment = (field: keyof typeof guest) => setGuest((prev) => ({ ...prev, [field]: prev[field] + 1 }))
  const decrement = (field: keyof typeof guest) => setGuest((prev) => ({ ...prev, [field]: Math.max(0, prev[field] - 1) }))


  // const onSubmit=async()=>{

  //   if (dateRange?.from) setCheckIn(dateRange.from.toISOString().split("T")[0]);
  //   if (dateRange?.to)   setCheckOut(dateRange.to.toISOString().split("T")[0]);

  //   if(dateRange?.from){
  //     console.log("range: ", {start: dateRange.from.toISOString().split("T")[0], original: dateRange.from})
  //   }
  //   if(dateRange?.to){
  //     console.log("range: ", {end: dateRange.to.toISOString().split("T")[0], original: dateRange.to})
  //   }

  //   const newCheckIn = dateRange?.from?.toISOString().split("T")[0] || checkIn;
  //   const newCheckOut = dateRange?.to?.toISOString().split("T")[0] || checkOut;

  //   setRoomGuests(guest)
  //   onSearch(newCheckIn, newCheckOut, guest)
  // }

const onSubmit = async () => {
  if (dateRange?.from) setCheckIn(format(dateRange.from, "yyyy-MM-dd"));
  if (dateRange?.to)   setCheckOut(format(dateRange.to, "yyyy-MM-dd"));

  const newCheckIn = dateRange?.from ? format(dateRange.from, "yyyy-MM-dd") : checkIn;
  const newCheckOut = dateRange?.to ? format(dateRange.to, "yyyy-MM-dd") : checkOut;

  setRoomGuests(guest);
  onSearch(newCheckIn, newCheckOut, guest);
};


  return (
    // <div className="flex flex-col md:flex-row gap-1 md:gap-0 items-center border-2 border-yellow-400 rounded-md overflow-hidden">
    <div className={cn("flex flex-col md:flex-row md:inline-flex items-stretch border-2 border-yellow-400 rounded-md overflow-hidden", className)}>

      <Popover open={openDate} onOpenChange={setOpenDate}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="flex items-center gap-2 justify-start bg-white text-gray-700 px-4 py-2 rounded-none border-none w-full md:w-72"
          >
            <CalendarIcon className="h-4 w-4 text-gray-600" />
            <span className="text-sm font-medium">
              {dateRange?.from
                ? `${format(dateRange.from, "EEE d MMM")}`
                : "Select date"}{" "}
              —{" "}
              {dateRange?.to
                ? `${format(dateRange.to, "EEE d MMM")}`
                : "Select date"}
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto max-w-[90vw] p-0" align="start" sideOffset={4}>
            {/* <Calendar
                autoFocus
                className="w-full"
                mode="range"
                defaultMonth={dateRange?.from}
                selected={dateRange}
                onSelect={setDateRange}
                numberOfMonths={2}
                disabled={(date) => {
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    return date < today || date < new Date("1900-01-01");
                }}
            /> */}

            <div>
              <CalendarRange
                dates={dateRange}
                setDates={setDateRange}
              />
            </div>
        </PopoverContent>
      </Popover>

      <Popover open={openGuest} onOpenChange={setOpenGuest}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="flex items-center gap-2 justify-start bg-white text-gray-700 px-4 py-2 rounded-none border-none w-full md:w-64"
          >
            <Users className="h-4 w-4 text-gray-600" />
            <span className="text-sm">
              {guest.adults} adults · {guest.children} children · {guest.rooms} room
            </span>
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-72 p-4 space-y-3">
          {[
            { label: "Adults", key: "adults" },
            { label: "Children", key: "children" },
            { label: "Rooms", key: "rooms" },
          ].map((item) => {
            let isDisabled = ((item.label == "Adults" || item.label == "Rooms") && guest[item.key as keyof typeof guest] == 1)
            let isMaxGuest = ((item.label == "Adults" || item.label == "Children") && guest[item.key as keyof typeof guest] == 15)
            let isMaxRoom = ((item.label == "Room") && guest[item.key as keyof typeof guest] == 10)
            return <div key={item.key} className="flex justify-between items-center">
              <span>{item.label}</span>
              <div className="flex items-center border rounded-md">
                <Button
                  variant="ghost"
                  className={`px-2 ${isDisabled ? "cursor-not-allowed" : ""}`}
                  onClick={() =>{
                    if(isDisabled) return
                    decrement(item.key as keyof typeof guest)}
                  }
                >
                  -
                </Button>
                <Input
                  readOnly
                  className="w-10 text-center border-none focus-visible:ring-0"
                  value={guest[item.key as keyof typeof guest]}
                  min={item.label === "Adults" ? 1 : 0}
                />
                <Button
                  variant="ghost"
                  className="px-2"
                  onClick={() => {
                    if(isMaxGuest) return
                    if(isMaxRoom) return
                    increment(item.key as keyof typeof guest)}
                  } 
                >
                  +
                </Button>
              </div>
            </div>
          })}

          <Button className="w-full mt-2" onClick={() => setOpenGuest(false)}>
            Done
          </Button>
        </PopoverContent>
      </Popover>

      <Button className="bg-primary text-white hover:bg-blue-700 rounded-none px-6 py-3 md:py-5 w-full md:w-auto" onClick={()=>{onSubmit()}}>
        Change search
      </Button>

    </div>
  )
}

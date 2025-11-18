"use client";
import { useCurrency } from "@/contexts/currency-context";
import Image from "next/image";
import { useEffect, useState } from "react";

const roomDetails = [
      "398 sq ft",
      "Sleeps 3",
      "1 King Bed"
    ]

// const rooms = [
//   {
//     id: 1,
//     name: "Colonial Room",
//     img: "/luxury-resort-bedroom.png",
//     price: "₹16,200",
//     oldPrice: "₹18,000",
//     total: "₹38,232 total",
//     perks: ["Free breakfast", "Free self parking"],
//     details: [
//       "398 sq ft",
//       "Sleeps 3",
//       "1 King Bed",
//       "Reserve now, pay later",
//       "All-inclusive (food/drinks/snacks)",
//       "Free WiFi",
//     ],
//     left: 2,
//   },
//   {
//     id: 2,
//     name: "Victorian Room",
//     img: "/luxury-resort-sunset-pool.png",
//     price: "₹22,500",
//     oldPrice: "₹25,000",
//     total: "₹53,100 total",
//     perks: ["Free breakfast", "Free self parking"],
//     details: [
//       "398 sq ft",
//       "Sleeps 3",
//       "1 King Bed",
//       "Reserve now, pay later",
//       "All-inclusive (food/drinks/snacks)",
//       "Free airport shuttle",
//       "Free WiFi",
//     ],
//     left: 2,
//   },
//   {
//     id: 3,
//     name: "Heritage Room",
//     img: "/modern-hotel-bathroom.png",
//     price: "Sold Out",
//     oldPrice: "",
//     total: "",
//     perks: ["Free breakfast", "Free self parking"],
//     details: ["398 sq ft", "Sleeps 3", "1 King Bed", "Free WiFi"],
//     left: 0,
//   },
// ];

interface RoomGridProp{
  rooms?: any,
  checkIn?: any;
  checkOut?: any;
  handleSelectRoom: (room: any, roomChoice?: any)=> void;
}

type Option = {
  id: string;
  name: string;
  additional_price: number;
};


export default function RoomGrid({rooms, checkIn, checkOut, handleSelectRoom}: RoomGridProp) {
  const {currencyConverter, getEffectivePrice, symbol} = useCurrency()

  const [selectedOptions, setSelectedOptions] = useState<Record<number, Option | null>>(
    {}
  );

  const [errorId, setErrorId] = useState("");
  const [error, setError] = useState(false);

  // Update a room’s selected option
  const handleSelectOption = (roomId: string, option: Option) => {
    setSelectedOptions(prev => ({
      ...prev,
      [roomId]: option
    }));
  };

  return (
    <div className="grid res:grid-cols-1 md:grid-cols-3 gap-6 p-6">
      {rooms.map((room: any) => (
        <div
          key={room.id}
          className="flex flex-col rounded-2xl shadow-md overflow-hidden border bg-white h-full"
        >
          <div className="relative h-48 w-full">
            <Image
              src={room.imageUrls[0]}
              alt={room.name}
              fill
              className="object-cover"
            />
          </div>

          <div className="flex flex-col justify-between flex-1 p-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">{room.name}</h3>

              <ul className="text-gray-700 text-sm space-y-1">
                {roomDetails.map((d, i) => (
                  <li key={i}>{d}</li>
                ))}
              </ul>

              <ul className="text-gray-700 text-sm space-y-1 mt-1">
                {room.amenities.map((d: any, i: number) => (
                  <li key={i}>{d}</li>
                ))}
              </ul>
            </div>

            <div className="space-y-3 mt-2">
              {room.options.map((opt: any) => {
                const isSelected = selectedOptions[room.id]?.id === opt.id;
                return(
                <label
                  key={opt.id}
                  className="flex items-center justify-between border rounded-lg p-4 cursor-pointer hover:border-blue-500 transition"
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      name={`room-${room.id}`}
                      checked={isSelected}
                      // onChange={() => selectOption(room.id, opt.id)}
                      onChange={() => handleSelectOption(room.id, opt)}
                      className="mt-1 h-4 w-4"
                    />

                    <div>
                      <p className="font-semibold">{opt.name}</p>
                      {opt.description && (
                        <p className="text-xs text-gray-600 mt-1">
                          {opt.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <p className="text-blue-700 font-semibold">
                    +${opt.additional_price}
                  </p>
                </label>
              )})}
            </div>

            {
              (error && errorId == room.id) ? 
              <p className="text-red-500 text-sm mt-2">
                Select an option to continue.
              </p> : <></>
            }


            {/* Footer aligned at bottom */}
            <div className="mt-4 pt-3 border-t flex flex-col items-start justify-end">
              <p className="font-semibold text-lg">
                {symbol}
                {currencyConverter(
                  getEffectivePrice(room, checkIn, checkOut) + (selectedOptions[room.id]?.additional_price || 0)
                ).toLocaleString()}
              </p>
              <p className="text-xs text-gray-600">Price per night</p>

              {room.available ? (
                <button
                  className="mt-2 py-1 px-10 border border-blue-600 text-blue-600 rounded hover:bg-blue-50 cursor-pointer"
                  // onClick={() => handleRoomSelect(room, choice)}
                  onClick={() => {
                    if(!(selectedOptions[room.id])){
                      setError(true)
                      setErrorId(room.id)
                      return
                    };
                    setError(false)
                    setErrorId("")
                    handleSelectRoom(room, selectedOptions[room.id])
                  }}
                  disabled={!room.available}
                >
                  Select
                </button>
              ) : (
                <p className="text-red-500">Currently Unavailable</p>
              )}
              {/* {room.left > 0 ? (
                <>
                  <div className="text-sm text-gray-500">
                    We have {room.left} left
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="line-through text-gray-400 text-sm">
                      {room.oldPrice}
                    </span>
                    <span className="text-lg font-semibold text-primary">
                      {room.price}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">{room.total}</p>
                  <button className="w-full bg-primary text-white py-2 mt-3 rounded-xl hover:bg-blue-700 transition">
                    Book
                  </button>
                </>
              ) : (
                <div className="w-full text-center text-red-600 font-medium">
                  We are sold out
                </div>
              )} */}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

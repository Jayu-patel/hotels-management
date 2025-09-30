import { SearchResultCard } from "@/components/search-result-card"

const searchResults = [
  {
    id: 1,
    name: "The Grand Resort",
    location: "San Diego, CA, USA",
    rating: 4.5,
    reviews: 200,
    price: 100,
    image: "/luxury-resort-bedroom.png",
    amenities: ["Free wifi", "Free breakfast", "room service"],
  },
  {
    id: 2,
    name: "The Regal Palace",
    location: "Skyline Boulevard, NY, USA",
    rating: 4.5,
    reviews: 200,
    price: 150,
    image: "/luxury-hotel-suite.png",
    amenities: ["Free wifi", "Free breakfast", "room service"],
  },
  {
    id: 3,
    name: "Velvet Nights Inn",
    location: "Beachfront Drive, CA, USA",
    rating: 4.5,
    reviews: 200,
    price: 120,
    image: "/elegant-red-hotel-room.png",
    amenities: ["Free wifi", "Free breakfast", "room service"],
  },
  {
    id: 4,
    name: "Crystal Waters Resort",
    location: "Night Sky Parkway, AZ, USA",
    rating: 4.5,
    reviews: 200,
    price: 180,
    image: "/placeholder-j30c4.png",
    amenities: ["Free wifi", "Free breakfast", "room service"],
  },
]

export function SearchResults() {
  return (
    <div className="space-y-6">
      {searchResults.map((hotel) => (
        <SearchResultCard key={hotel.id} hotel={hotel} />
      ))}
    </div>
  )
}

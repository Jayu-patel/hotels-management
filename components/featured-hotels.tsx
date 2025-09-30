import { HotelCard } from "@/components/hotel-card"

const featuredHotels = [
  {
    id: 1,
    name: "The Grand Resort",
    location: "Maldives",
    rating: 4.9,
    price: 450,
    image: "/placeholder-j30c4.png",
    badge: "Best Seller",
  },
  {
    id: 2,
    name: "The Grand Resort",
    location: "Maldives",
    rating: 4.9,
    price: 450,
    image: "/luxury-resort-bedroom.png",
    badge: "Best Seller",
  },
  {
    id: 3,
    name: "The Grand Resort",
    location: "Maldives",
    rating: 4.9,
    price: 450,
    image: "/luxury-hotel-suite.png",
    badge: "Best Seller",
  },
  {
    id: 4,
    name: "The Grand Resort",
    location: "Maldives",
    rating: 4.9,
    price: 450,
    image: "/elegant-red-hotel-room.png",
    badge: "New",
  },
]

export function FeaturedHotels() {
  return (
    <section className="py-20 px-6 bg-background">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold font-heading text-foreground mb-4">Featured Hotels</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover our handpicked selection of exceptional properties around the world, offering unparalleled luxury
            and unforgettable experiences
          </p>
        </div>

        {/* Hotels Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredHotels.map((hotel) => (
            <HotelCard key={hotel.id} hotel={hotel} />
          ))}
        </div>
      </div>
    </section>
  )
}

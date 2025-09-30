import { Star, MapPin, Wifi, Coffee, Car } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface Hotel {
  id: number
  name: string
  location: string
  rating: number
  reviews: number
  price: number
  image: string
  amenities: string[]
}

interface SearchResultCardProps {
  hotel: Hotel
}

const amenityIcons = {
  "Free wifi": Wifi,
  "Free breakfast": Coffee,
  "room service": Car,
}

export function SearchResultCard({ hotel }: SearchResultCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <CardContent className="p-0">
        <div className="flex flex-col md:flex-row">
          {/* Image */}
          <div className="md:w-80 h-48 md:h-auto">
            <img src={hotel.image || "/placeholder.svg"} alt={hotel.name} className="w-full h-full object-cover" />
          </div>

          {/* Content */}
          <div className="flex-1 p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="flex items-center gap-1 text-muted-foreground text-sm mb-1">
                  <MapPin className="h-4 w-4" />
                  <span>{hotel.location}</span>
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">{hotel.name}</h3>
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex items-center gap-1">
                    {[...Array(4)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                    <Star className="h-4 w-4 text-gray-300" />
                  </div>
                  <span className="text-sm text-muted-foreground">{hotel.reviews}+ reviews</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-foreground">
                  ${hotel.price}
                  <span className="text-sm font-normal text-muted-foreground">/ day</span>
                </div>
              </div>
            </div>

            {/* Amenities */}
            <div className="flex items-center gap-6 mb-4">
              {hotel.amenities.map((amenity) => {
                const Icon = amenityIcons[amenity as keyof typeof amenityIcons]
                return (
                  <div key={amenity} className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{amenity}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

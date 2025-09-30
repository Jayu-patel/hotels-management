"use client"

import { Star, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

interface Hotel {
  id: number
  name: string
  location: string
  rating: number
  price: number
  image: string
  badge: string
}

interface HotelCardProps {
  hotel: Hotel
}

export function HotelCard({ hotel }: HotelCardProps) {
  return (
    <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      <div className="relative">
        <img
          src={hotel.image || "/placeholder.svg"}
          alt={hotel.name}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <Badge
          className={`absolute top-3 left-3 ${
            hotel.badge === "Best Seller" ? "bg-primary text-primary-foreground" : "bg-green-500 text-white"
          }`}
        >
          {hotel.badge}
        </Badge>
      </div>

      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-foreground">{hotel.name}</h3>
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-medium">{hotel.rating}</span>
          </div>
        </div>

        <div className="flex items-center gap-1 text-muted-foreground mb-3">
          <MapPin className="h-4 w-4" />
          <span className="text-sm">{hotel.location}</span>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <span className="text-xl font-bold text-foreground">${hotel.price}</span>
            <span className="text-sm text-muted-foreground">/night</span>
          </div>
          {/* <Button
            variant="outline"
            size="sm"
            className="hover:bg-primary hover:text-primary-foreground bg-transparent cursor-pointer"
            onClick={() => (window.location.href = `/hotels/${hotel.id}`)}
          >
            View Details
          </Button> */}
          <Link href={`/hotels/${hotel.id}`} className="border text-sm hover:bg-primary hover:text-primary-foreground bg-transparent shadow-xs dark:bg-input/30 dark:border-input dark:hover:bg-input/50 rounded-md gap-1.5 px-3 py-1">
            View Details
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}

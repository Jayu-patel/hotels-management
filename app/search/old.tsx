"use client"
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { Search, MapPin, Star, Wifi, Car, Coffee, Dumbbell, SlidersHorizontal, Bed, Waves, Flower, Umbrella, Mountain, Flame, Briefcase, Bell } from 'lucide-react';
import { useHotels } from '@/contexts/hotels-context';
import ResponsiveSkeleton from '@/components/responsiveSkeleton';
import Link from 'next/link';
import Image from 'next/image';

interface Hotel {
  id: string;
  name: string;
  location: string;
  rating: number;
  reviewCount: number;
  pricePerNight: number;
  originalPrice?: number;
  imageUrl: string;
  amenities: string[];
  distance: string;
  bedrooms: number;
  bathrooms: number;
}

interface HotelsPageProps {
  onHotelSelect: (hotel: Hotel) => void;
  onLoginRequired: () => void;
}

const amenityIcons: { [key: string]: React.ReactNode } = {
  'Free WiFi': <Wifi className="h-4 w-4" />,
  'Parking': <Car className="h-4 w-4" />,
  'Restaurant': <Coffee className="h-4 w-4" />,
  'Gym': <Dumbbell className="h-4 w-4" />,
  'Spa': <Flower className="h-4 w-4" />,
  'Beach Access': <Umbrella className="h-4 w-4" />,
  'Ski Access': <Mountain className="h-4 w-4" />,
  'Fireplace': <Flame className="h-4 w-4" />,
  'Business Center': <Briefcase className="h-4 w-4" />,
  'Concierge': <Bell  className="h-4 w-4" />,
  'Pool': <Waves className="h-4 w-4" />,
};

export default function HotelsPage({ onHotelSelect, onLoginRequired }: HotelsPageProps) {
  const { hotels, setSearchParams, loading } = useHotels(); // ✅ Hotels from context
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [selectedBedrooms, setSelectedBedrooms] = useState('all');
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('recommended');

  const uniqueLocations = Array.from(new Set(hotels.map(hotel => hotel.destination)));
  const uniqueAmenities = Array.from(new Set(hotels.flatMap(hotel => hotel.amenities)));

  const filteredHotels = hotels.filter(hotel => {
    const matchesSearch = hotel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         hotel.destination.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLocation = selectedLocation === 'all' || hotel.destination === selectedLocation;
    // const matchesPrice = hotel.pricePerNight >= priceRange[0] && hotel.pricePerNight <= priceRange[1];
    // const matchesBedrooms = selectedBedrooms === 'all' || hotel.bedrooms.toString() === selectedBedrooms;
    const matchesAmenities = selectedAmenities.length === 0 || 
                            selectedAmenities.every(amenity => hotel.amenities.includes(amenity));

    return matchesSearch && matchesLocation && true && true && matchesAmenities;
  });

  const sortedHotels = [...filteredHotels].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.pricePerNight - b.pricePerNight;
      case 'price-high':
        return b.pricePerNight - a.pricePerNight;
      case 'rating':
        return b.rating - a.rating;
      case 'recommended':
      default:
        return b.rating * b.reviewCount - a.rating * a.reviewCount;
    }
  });

  const handleAmenityChange = (amenity: string, checked: boolean) => {
    if (checked) {
      setSelectedAmenities([...selectedAmenities, amenity]);
    } else {
      setSelectedAmenities(selectedAmenities.filter(a => a !== amenity));
    }
  };

  const handleHotelClick = (hotel: Hotel) => {
    onLoginRequired();
  };

  useEffect(()=>{
    console.log("search hotels...",hotels)
  },[hotels])
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Filters Sidebar */}
      <div className="lg:col-span-1 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SlidersHorizontal className="h-5 w-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Search */}
            <div className="space-y-2">
              <Label>Search Hotels</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Hotel name or location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Separator />

            {/* Location Filter */}
            <div className="space-y-2">
              <Label>Location</Label>
              <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                <SelectTrigger>
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  {uniqueLocations.map((location) => (
                    <SelectItem key={location} value={location}>
                      {location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Separator />

            {/* Price Range */}
            <div className="space-y-4">
              <Label>Price Range (per night)</Label>
              <div className="px-3">
                <Slider
                  value={priceRange}
                  onValueChange={setPriceRange}
                  max={1000}
                  min={0}
                  step={10}
                  className="w-full"
                />
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>${priceRange[0]}</span>
                <span>${priceRange[1]}</span>
              </div>
            </div>

            {/* <Separator /> */}

            {/* Bedrooms Filter */}
            {/* <div className="space-y-2"> ... </div> */}

            {/* <Separator /> */}

            {/* Amenities Filter */}
            {/* <div className="space-y-3"> ... </div> */}
          </CardContent>
        </Card>
      </div>

      {/* Hotels List */}
      <div className="lg:col-span-3 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl">Browse Hotels</h1>
            {
              !loading ?
              <p className="text-gray-600">{sortedHotels.length} hotels found</p> :
              <></>
            }
          </div>
          
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recommended">Recommended</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
              <SelectItem value="rating">Highest Rated</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Hotels Grid */}
        {
          loading ?
          <ResponsiveSkeleton variant="grid" count={4} responsive /> :
          <div className="space-y-4">
            {sortedHotels.map((hotel) => (
              <Card key={hotel.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleHotelClick(hotel)}>
                <div className="md:flex">
                  <div className="md:w-1/3">
                    <div className='w-full h-48 md:h-full relative'>
                      <Image
                        fill
                          src={
                            `/api/image-proxy?url=${hotel.hotel_images.find((img: any) => img.is_primary)?.image_url || hotel.hotel_images[0]?.image_url}
                            `
                          }
                        alt={hotel.name}
                        className="object-cover"
                      />
                    </div>
                  </div>
                  
                  <CardContent className="md:w-2/3 p-4 md:p-6">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="text-xl mb-1">{hotel.name}</h3>
                        <div className="flex items-center text-gray-600 mb-2">
                          <MapPin className="h-4 w-4 mr-1" />
                          <span className="text-sm">{hotel.address}</span>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="flex items-center gap-1 mb-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm">{hotel.star_rating}</span>
                          <span className="text-xs text-gray-500">({hotel.review_count})</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                      <div className="flex items-center gap-1">
                        <Bed className="h-4 w-4" />
                        <span>{hotel.bedrooms} bed{hotel.bedrooms > 1 ? 's' : ''}</span>
                      </div>
                      <span>{hotel.bathrooms} bath{hotel.bathrooms > 1 ? 's' : ''}</span>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {hotel.hotel_amenities.slice(0, 4).map((amenity : any) => (
                        <Badge key={amenity.amenity_id.id} variant="secondary" className="text-xs flex items-center gap-1">
                          {amenityIcons[amenity.amenity_id.name]}
                          {amenity.amenity_id.name}
                        </Badge>
                      ))}
                      {hotel.hotel_amenities.length > 4 && (
                        <Badge variant="outline" className="text-xs">
                          +{hotel.hotel_amenities.length - 4} more
                        </Badge>
                      )}
                    </div>

                    <div className="flex justify-between items-end">
                      {/* <div>
                        <div className="flex items-center gap-2">
                          {hotel.originalPrice && (
                            <span className="text-sm text-gray-500 line-through">
                              ${hotel.originalPrice}
                            </span>
                          )}
                          <span className="text-2xl text-green-600">
                            ${hotel.pricePerNight}
                          </span>
                          <span className="text-sm text-gray-600">/ night</span>
                        </div>
                        <p className="text-xs text-gray-500">Includes taxes and fees</p>
                      </div> */}
                      
                      <Link href={`/hotels/${hotel.id}`}>
                        <Button className='cursor-pointer'>
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </div>
              </Card>
            ))}
          </div>
        }

        {!loading && sortedHotels.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-xl text-gray-600 mb-2">No hotels found</h3>
            <p className="text-gray-500">Try adjusting your filters to see more results</p>
          </div>
        )}
      </div>
    </div>
  );
}

// "use client"
// import React, { useState } from 'react';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Badge } from '@/components/ui/badge';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import { Slider } from '@/components/ui/slider';
// import { Checkbox } from '@/components/ui/checkbox';
// import { Separator } from '@/components/ui/separator';
// import { Search, MapPin, Star, Wifi, Car, Coffee, Dumbbell, SlidersHorizontal, Bed, Waves, Flower, Umbrella, Mountain, Flame, Briefcase, Bell } from 'lucide-react';
// import { ImageWithFallback } from '@/components/image-with-fallback';

// interface Hotel {
//   id: string;
//   name: string;
//   location: string;
//   rating: number;
//   reviewCount: number;
//   pricePerNight: number;
//   originalPrice?: number;
//   imageUrl: string;
//   amenities: string[];
//   distance: string;
//   bedrooms: number;
//   bathrooms: number;
// }

// interface HotelsPageProps {
//   onHotelSelect: (hotel: Hotel) => void;
//   onLoginRequired: () => void;
// }

// const mockHotels: Hotel[] = [
//   {
//     id: '1',
//     name: 'Grand Luxury Hotel',
//     location: 'New York, NY',
//     rating: 4.8,
//     reviewCount: 1234,
//     pricePerNight: 299,
//     originalPrice: 399,
//     imageUrl: 'https://images.unsplash.com/photo-1634041441461-a1789d008830?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBob3RlbCUyMGV4dGVyaW9yfGVufDF8fHx8MTc1Njc0OTUzOXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
//     amenities: ['Free WiFi', 'Parking', 'Restaurant', 'Gym', 'Pool', 'Spa'],
//     distance: '0.5 km from center',
//     bedrooms: 1,
//     bathrooms: 1,
//   },
//   {
//     id: '2',
//     name: 'Boutique City Hotel',
//     location: 'New York, NY',
//     rating: 4.5,
//     reviewCount: 892,
//     pricePerNight: 199,
//     imageUrl: 'https://images.unsplash.com/photo-1634041441461-a1789d008830?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBob3RlbCUyMGV4dGVyaW9yfGVufDF8fHx8MTc1Njc0OTUzOXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
//     amenities: ['Free WiFi', 'Restaurant', 'Gym'],
//     distance: '1.2 km from center',
//     bedrooms: 1,
//     bathrooms: 1,
//   },
//   {
//     id: '3',
//     name: 'Ocean View Resort',
//     location: 'Miami, FL',
//     rating: 4.6,
//     reviewCount: 567,
//     pricePerNight: 189,
//     imageUrl: 'https://images.unsplash.com/photo-1678687114989-ad452a24f289?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiZWFjaCUyMHJlc29ydCUyMHZhY2F0aW9ufGVufDF8fHx8MTc1Njc3MzkxMXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
//     amenities: ['Beach Access', 'Pool', 'Restaurant', 'Free WiFi'],
//     distance: '0.8 km from beach',
//     bedrooms: 2,
//     bathrooms: 2,
//   },
//   {
//     id: '4',
//     name: 'Mountain Lodge',
//     location: 'Aspen, CO',
//     rating: 4.7,
//     reviewCount: 423,
//     pricePerNight: 259,
//     imageUrl: 'https://images.unsplash.com/photo-1689729830276-6b8a3fe230f9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb3VudGFpbiUyMGhvdGVsJTIwdmlld3xlbnwxfHx8fDE3NTY3ODk1NzN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
//     amenities: ['Ski Access', 'Fireplace', 'Spa', 'Free WiFi'],
//     distance: '0.3 km from slopes',
//     bedrooms: 3,
//     bathrooms: 2,
//   },
//   {
//     id: '5',
//     name: 'Downtown Business Hotel',
//     location: 'Los Angeles, CA',
//     rating: 4.3,
//     reviewCount: 789,
//     pricePerNight: 149,
//     imageUrl: 'https://images.unsplash.com/photo-1722409195473-d322e99621e3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjByZXNvcnQlMjBwb29sfGVufDF8fHx8MTc1NjY4OTY5NHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
//     amenities: ['Free WiFi', 'Business Center', 'Gym', 'Parking'],
//     distance: '0.7 km from center',
//     bedrooms: 1,
//     bathrooms: 1,
//   },
//   {
//     id: '6',
//     name: 'Luxury Suite Hotel',
//     location: 'San Francisco, CA',
//     rating: 4.9,
//     reviewCount: 234,
//     pricePerNight: 449,
//     originalPrice: 599,
//     imageUrl: 'https://images.unsplash.com/photo-1634041441461-a1789d008830?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBob3RlbCUyMGV4dGVyaW9yfGVufDF8fHx8MTc1Njc0OTUzOXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
//     amenities: ['Concierge', 'Spa', 'Restaurant', 'Free WiFi', 'Gym'],
//     distance: '1.0 km from center',
//     bedrooms: 2,
//     bathrooms: 2,
//   },
// ];

// const amenityIcons: { [key: string]: React.ReactNode } = {
//   'Free WiFi': <Wifi className="h-4 w-4" />,
//   'Parking': <Car className="h-4 w-4" />,
//   'Restaurant': <Coffee className="h-4 w-4" />,
//   'Gym': <Dumbbell className="h-4 w-4" />,
//   'Spa': <Flower className="h-4 w-4" />,
//   'Beach Access': <Umbrella className="h-4 w-4" />,
//   'Ski Access': <Mountain className="h-4 w-4" />,
//   'Fireplace': <Flame className="h-4 w-4" />,
//   'Business Center': <Briefcase className="h-4 w-4" />,
//   'Concierge': <Bell  className="h-4 w-4" />,
//   'Pool': <Waves className="h-4 w-4" />,
// };

// export default function HotelsPage({ onHotelSelect, onLoginRequired }: HotelsPageProps) {
//   const [searchTerm, setSearchTerm] = useState('');
//   const [selectedLocation, setSelectedLocation] = useState('all');
//   const [priceRange, setPriceRange] = useState([0, 1000]);
//   const [selectedBedrooms, setSelectedBedrooms] = useState('all');
//   const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
//   const [sortBy, setSortBy] = useState('recommended');

//   const uniqueLocations = Array.from(new Set(mockHotels.map(hotel => hotel.location)));
//   const uniqueAmenities = Array.from(new Set(mockHotels.flatMap(hotel => hotel.amenities)));

//   const filteredHotels = mockHotels.filter(hotel => {
//     const matchesSearch = hotel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//                          hotel.location.toLowerCase().includes(searchTerm.toLowerCase());
//     const matchesLocation = selectedLocation === 'all' || hotel.location === selectedLocation;
//     const matchesPrice = hotel.pricePerNight >= priceRange[0] && hotel.pricePerNight <= priceRange[1];
//     const matchesBedrooms = selectedBedrooms === 'all' || hotel.bedrooms.toString() === selectedBedrooms;
//     const matchesAmenities = selectedAmenities.length === 0 || 
//                             selectedAmenities.every(amenity => hotel.amenities.includes(amenity));

//     return matchesSearch && matchesLocation && matchesPrice && matchesBedrooms && matchesAmenities;
//   });

//   const sortedHotels = [...filteredHotels].sort((a, b) => {
//     switch (sortBy) {
//       case 'price-low':
//         return a.pricePerNight - b.pricePerNight;
//       case 'price-high':
//         return b.pricePerNight - a.pricePerNight;
//       case 'rating':
//         return b.rating - a.rating;
//       case 'recommended':
//       default:
//         return b.rating * b.reviewCount - a.rating * a.reviewCount;
//     }
//   });

//   const handleAmenityChange = (amenity: string, checked: boolean) => {
//     if (checked) {
//       setSelectedAmenities([...selectedAmenities, amenity]);
//     } else {
//       setSelectedAmenities(selectedAmenities.filter(a => a !== amenity));
//     }
//   };

//   const handleHotelClick = (hotel: Hotel) => {
//     onLoginRequired();
//   };

//   return (
//     <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
//       {/* Filters Sidebar */}
//       <div className="lg:col-span-1 space-y-6">
//         <Card>
//           <CardHeader>
//             <CardTitle className="flex items-center gap-2">
//               <SlidersHorizontal className="h-5 w-5" />
//               Filters
//             </CardTitle>
//           </CardHeader>
//           <CardContent className="space-y-6">
//             {/* Search */}
//             <div className="space-y-2">
//               <Label>Search Hotels</Label>
//               <div className="relative">
//                 <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
//                 <Input
//                   placeholder="Hotel name or location..."
//                   value={searchTerm}
//                   onChange={(e) => setSearchTerm(e.target.value)}
//                   className="pl-10"
//                 />
//               </div>
//             </div>

//             <Separator />

//             {/* Location Filter */}
//             <div className="space-y-2">
//               <Label>Location</Label>
//               <Select value={selectedLocation} onValueChange={setSelectedLocation}>
//                 <SelectTrigger>
//                   <SelectValue placeholder="Select location" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="all">All Locations</SelectItem>
//                   {uniqueLocations.map((location) => (
//                     <SelectItem key={location} value={location}>
//                       {location}
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//             </div>

//             <Separator />

//             {/* Price Range */}
//             <div className="space-y-4">
//               <Label>Price Range (per night)</Label>
//               <div className="px-3">
//                 <Slider
//                   value={priceRange}
//                   onValueChange={setPriceRange}
//                   max={1000}
//                   min={0}
//                   step={10}
//                   className="w-full"
//                 />
//               </div>
//               <div className="flex justify-between text-sm text-gray-600">
//                 <span>${priceRange[0]}</span>
//                 <span>${priceRange[1]}</span>
//               </div>
//             </div>

//             {/* <Separator /> */}

//             {/* Bedrooms Filter */}
//             {/* <div className="space-y-2">
//               <Label className="flex items-center gap-2">
//                 <Bed className="h-4 w-4" />
//                 Bedrooms
//               </Label>
//               <Select value={selectedBedrooms} onValueChange={setSelectedBedrooms}>
//                 <SelectTrigger>
//                   <SelectValue placeholder="Any bedrooms" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="all">Any</SelectItem>
//                   <SelectItem value="1">1 Bedroom</SelectItem>
//                   <SelectItem value="2">2 Bedrooms</SelectItem>
//                   <SelectItem value="3">3+ Bedrooms</SelectItem>
//                 </SelectContent>
//               </Select>
//             </div> */}

//             {/* <Separator /> */}

//             {/* Amenities Filter */}
//             {/* <div className="space-y-3">
//               <Label>Amenities</Label>
//               <div className="space-y-2 max-h-40 overflow-y-auto">
//                 {uniqueAmenities.map((amenity) => (
//                   <div key={amenity} className="flex items-center space-x-2">
//                     <Checkbox
//                       id={amenity}
//                       checked={selectedAmenities.includes(amenity)}
//                       onCheckedChange={(checked) => handleAmenityChange(amenity, checked as boolean)}
//                     />
//                     <Label
//                       htmlFor={amenity}
//                       className="text-sm flex items-center gap-2 cursor-pointer"
//                     >
//                       {amenityIcons[amenity]}
//                       {amenity}
//                     </Label>
//                   </div>
//                 ))}
//               </div>
//             </div> */}
//           </CardContent>
//         </Card>
//       </div>

//       {/* Hotels List */}
//       <div className="lg:col-span-3 space-y-6">
//         {/* Header */}
//         <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
//           <div>
//             <h1 className="text-3xl">Browse Hotels</h1>
//             <p className="text-gray-600">{sortedHotels.length} hotels found</p>
//           </div>
          
//           <Select value={sortBy} onValueChange={setSortBy}>
//             <SelectTrigger className="w-full md:w-48">
//               <SelectValue placeholder="Sort by" />
//             </SelectTrigger>
//             <SelectContent>
//               <SelectItem value="recommended">Recommended</SelectItem>
//               <SelectItem value="price-low">Price: Low to High</SelectItem>
//               <SelectItem value="price-high">Price: High to Low</SelectItem>
//               <SelectItem value="rating">Highest Rated</SelectItem>
//             </SelectContent>
//           </Select>
//         </div>

//         {/* Hotels Grid */}
//         <div className="space-y-4">
//           {sortedHotels.map((hotel) => (
//             <Card key={hotel.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleHotelClick(hotel)}>
//               <div className="md:flex">
//                 <div className="md:w-1/3">
//                   <ImageWithFallback
//                     src={hotel.imageUrl}
//                     alt={hotel.name}
//                     className="w-full h-48 md:h-full object-cover"
//                   />
//                 </div>
                
//                 <CardContent className="md:w-2/3 p-4 md:p-6">
//                   <div className="flex justify-between items-start mb-2">
//                     <div>
//                       <h3 className="text-xl mb-1">{hotel.name}</h3>
//                       <div className="flex items-center text-gray-600 mb-2">
//                         <MapPin className="h-4 w-4 mr-1" />
//                         <span className="text-sm">{hotel.location} • {hotel.distance}</span>
//                       </div>
//                     </div>
                    
//                     <div className="text-right">
//                       <div className="flex items-center gap-1 mb-1">
//                         <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
//                         <span className="text-sm">{hotel.rating}</span>
//                         <span className="text-xs text-gray-500">({hotel.reviewCount})</span>
//                       </div>
//                     </div>
//                   </div>

//                   <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
//                     <div className="flex items-center gap-1">
//                       <Bed className="h-4 w-4" />
//                       <span>{hotel.bedrooms} bed{hotel.bedrooms > 1 ? 's' : ''}</span>
//                     </div>
//                     <span>{hotel.bathrooms} bath{hotel.bathrooms > 1 ? 's' : ''}</span>
//                   </div>

//                   <div className="flex flex-wrap gap-2 mb-4">
//                     {hotel.amenities.slice(0, 4).map((amenity) => (
//                       <Badge key={amenity} variant="secondary" className="text-xs flex items-center gap-1">
//                         {amenityIcons[amenity]}
//                         {amenity}
//                       </Badge>
//                     ))}
//                     {hotel.amenities.length > 4 && (
//                       <Badge variant="outline" className="text-xs">
//                         +{hotel.amenities.length - 4} more
//                       </Badge>
//                     )}
//                   </div>

//                   <div className="flex justify-between items-end">
//                     <div>
//                       <div className="flex items-center gap-2">
//                         {hotel.originalPrice && (
//                           <span className="text-sm text-gray-500 line-through">
//                             ${hotel.originalPrice}
//                           </span>
//                         )}
//                         <span className="text-2xl text-green-600">
//                           ${hotel.pricePerNight}
//                         </span>
//                         <span className="text-sm text-gray-600">/ night</span>
//                       </div>
//                       <p className="text-xs text-gray-500">Includes taxes and fees</p>
//                     </div>
                    
//                     <Button>
//                       View Details
//                     </Button>
//                   </div>
//                 </CardContent>
//               </div>
//             </Card>
//           ))}
//         </div>

//         {sortedHotels.length === 0 && (
//           <div className="text-center py-12">
//             <h3 className="text-xl text-gray-600 mb-2">No hotels found</h3>
//             <p className="text-gray-500">Try adjusting your filters to see more results</p>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }
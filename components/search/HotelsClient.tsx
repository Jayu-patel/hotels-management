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
import ResponsiveSkeleton from '@/components/responsiveSkeleton';
import Link from 'next/link';
import Image from 'next/image';
import { toast } from 'react-toastify';
import PaginationComponent from "@/components/pagination"
import { getFilterData, getHotels, searchHotels } from '@/supabase/hotels';
import { Checkbox } from '@/components/ui/checkbox';
import { useDebounce } from "@/hooks/debounce";
import { useSearchParams } from 'next/navigation';

interface Hotel {
  id?: string;
  name?: string;
  location?: string;
  rating?: number;
  reviewCount?: number;
  pricePerNight?: number;
  originalPrice?: number;
  imageUrl?: string;
  amenities?: string[];
  distance?: string;
  bedrooms?: number;
  bathrooms?: number;
}

const amenityIcons: { [key: string]: React.ReactNode } = {
  'Free WiFi': <Wifi className="h-4 w-4" />,
  'Parking': <Car className="h-4 w-4" />,
  'Restaurant': <Coffee className="h-4 w-4" />,
  'Free breakfast': <Coffee className="h-4 w-4" />,
  'Gym': <Dumbbell className="h-4 w-4" />,
  'Spa': <Flower className="h-4 w-4" />,
  'Beach Access': <Umbrella className="h-4 w-4" />,
  'Ski Access': <Mountain className="h-4 w-4" />,
  'Fireplace': <Flame className="h-4 w-4" />,
  'Business Center': <Briefcase className="h-4 w-4" />,
  'Concierge': <Bell  className="h-4 w-4" />,
  'Room service': <Bell  className="h-4 w-4" />,
  'Pool': <Waves className="h-4 w-4" />,
};

export default function HotelsPage() {
  const [hotels, setHotels] = useState<any[] | []>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [priceRange, setPriceRange] = useState<number[]>([0, 1000]);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('recommended');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [uniqueLocations, setUniqueLocations] = useState([]);
  const [uniqueAmenities, setUniqueamenities] = useState<string[]>([]);
  const [totalHotels, setTotalHotels] = useState(0)
  const [firstLoad, setFirstLoad] = useState(true);

  const handleAmenityChange = (amenity: string, checked: boolean) => {
    if (checked) {
      setSelectedAmenities([...selectedAmenities, amenity]);
    } else {
      setSelectedAmenities(selectedAmenities.filter(a => a !== amenity));
    }
  };

  const cap = (str: any) => str ? str[0].toUpperCase() + str.slice(1) : "";

  const debouncedSearch = useDebounce(searchTerm, 500);   // 500ms delay
  const debouncedPrice = useDebounce(priceRange, 500);   // 500ms delay

  const searchParams = useSearchParams();
  const destination = searchParams.get('destination') || '';
  const checkIn = searchParams.get('checkIn') || '';
  const checkOut = searchParams.get('checkOut') || '';
  const adults = searchParams.get('adults') || '';
  const children = searchParams.get('children') || '';
  const infants = searchParams.get('infants') || '';


  const searchLoad=async()=>{
    const totalGuests = Number(adults) + Number(children)
    if(destination){
      setSelectedLocation(cap(destination))
    }
    setLoading(true)
    try{
      const {data, totalCount, totalPages} = await searchHotels({destination, checkIn, checkOut, guestCount: totalGuests, page, size: 3})
      setTotalPages(totalPages)
      setHotels(data)
      setTotalHotels(totalCount)
      setFirstLoad(false)
    }
    catch(err: any){
      toast.error(err.message)
    }
    finally{
      setLoading(false)
    }
  }

  const firstFetch=async()=>{
    try{
      const {data, totalPages, totalCount} = await getHotels({page, size: 3, selectedAmenities, destination: selectedLocation, search: debouncedSearch, sortBy, priceRange: debouncedPrice})
      setTotalPages(totalPages)
      setHotels(data)
      setTotalHotels(totalCount)
    }
    catch(err: any){
      toast.error(err.message)
    }
  }
  
  useEffect(()=>{
    const getFilter=async()=>{
      const {uniqueAmenities, uniqueLocations} = await getFilterData()
      setUniqueLocations(uniqueLocations)
      setUniqueamenities(uniqueAmenities)
    }
    getFilter()
  },[])

  useEffect(()=>{
    searchLoad()
  },[])

  useEffect(() => {
    if(!firstLoad){
      firstFetch();
    }
  }, [page, selectedAmenities, selectedLocation, debouncedSearch, sortBy, debouncedPrice]);
  
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

            <div className="space-y-3">
               <Label>Amenities</Label>
               <div className="space-y-2 max-h-40 overflow-y-auto">
                 {uniqueAmenities?.map((amenity,i) => (
                   <div key={i} className="flex items-center space-x-2">
                     <Checkbox
                       id={amenity}
                       className='cursor-pointer'
                       checked={selectedAmenities.includes(amenity)}
                       onCheckedChange={(checked) => handleAmenityChange(amenity, checked as boolean)}
                     />
                     <Label
                       htmlFor={amenity}
                       className="text-sm flex items-center gap-2 cursor-pointer"
                     >
                       {amenityIcons[amenity]}
                       {amenity}
                     </Label>
                   </div>
                 ))}
               </div>
             </div>

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
              <p className="text-gray-600">{totalHotels} hotels found</p> :
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
            {hotels.map((hotel) => (
              <Card key={hotel.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                <div className="md:flex">
                  <div className="md:w-1/3">
                    <div className='w-full h-48 md:h-full relative'>
                      <Image
                        fill
                        src={`/api/image-proxy?url=${
                          hotel.hotel_images.find((img: any) => img.is_primary)?.image_url || hotel.hotel_images[0]?.image_url}
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
        <div className="flex justify-center mt-6 mb-5">
          <PaginationComponent page={page} totalPages={totalPages} onPageChange={(newPage)=>{setPage(newPage)}}/>
        </div>

        {!loading && hotels.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-xl text-gray-600 mb-2">No hotels found</h3>
            <p className="text-gray-500">Try adjusting your filters to see more results</p>
          </div>
        )}
      </div>
    </div>
  );
}
'use client'

import React, { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Plus, Star, MapPin } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { useHotels } from '@/contexts/hotels-context'
import PaginationComponent from "@/components/pagination"
import Loader from '@/components/loader'
import { toast } from 'react-toastify'
import { useDebounce } from "@/hooks/debounce";
import { supabase } from '@/lib/supabase/client'

const FeaturedHotelsPage = () => {
  const {adminHotels, updateHotelFeatured, fetchHotels} = useHotels()
  const [featuredHotels, setFeaturedHotels] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const debounceSearch = useDebounce(searchTerm, 500)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true)
  const itemsPerPage = 3

  const getFeaturedHotel=async()=>{
    try{
      const {data, error} = await supabase
        .from("hotels")
        .select(`
          id,
          name,
          destination,
          country,
          star_rating,
          images: hotel_images ( id, image_url, is_primary )
        `)
        .eq("featured", true)

      if(error) throw error

      const transformedHotels = (data || []).map((h: any) => ({
        id: h.id,
        name: h.name,
        destination: h.destination,
        country: h.country,
        rating: h.star_rating,
        images: h.images?.map((img: any) => ({
          id: img.id,
          url: img.image_url,
          is_primary: img.is_primary
        })) || [],
      }));

      setFeaturedHotels(transformedHotels)
    }
    catch(err: any){
      toast.error(err?.message || "Network error")
    }
  }

  const firstLoad=async()=>{
    setLoading(true)
    await getFeaturedHotel()
    setLoading(false)
  }

  // const handleAddFeatured = (hotel: any) => {
  //   console.log(hotel.id, " - " ,hotel.featured)
  //   if (!featuredHotels.find((f) => f.id === hotel.id)) {
  //     setFeaturedHotels([...featuredHotels, hotel])
  //   }
  // }
  // const handleRemoveFeatured = (id: number) => {
  //   setFeaturedHotels(featuredHotels.filter((h) => h.id !== id))
  // }

  // const updateHotelFeatured = (id: string, featured: boolean) => {
  //   setAdminHotels((prev: any[]) =>
  //     prev.map((h: any) =>
  //       h.id === id ? { ...h, featured } : h
  //     )
  //   );
  // };

  const handleAddFeatured = async (hotel: any) => {
    try {
      updateHotelFeatured(hotel.id, true); // Optimistic UI
      setFeaturedHotels((prev) => [...prev, hotel]);
      const { error } = await supabase
        .from("hotels")
        .update({ featured: true })
        .eq("id", hotel.id);
      if (error) throw error;
      toast.success(`${hotel.name} marked as featured`);
    } catch (err: any) {
      toast.error("Failed to update");
      updateHotelFeatured(hotel.id, false); // rollback on error
    }
  };

  const handleRemoveFeatured = async (id: string) => {
    try {
      updateHotelFeatured(id, false);
      setFeaturedHotels((prev) => prev.filter((h) => h.id !== id));
      const { error } = await supabase
        .from("hotels")
        .update({ featured: false })
        .eq("id", id);
      if (error) throw error;
      toast.success("Removed from featured");
    } catch (err: any) {
      toast.error("Failed to update");
      updateHotelFeatured(id, true);
    }
  };


  const getPrimaryImage = (hotel: any) => {
    const primaryImg = hotel.images.find((img : any) => img.is_primary);
    return primaryImg?.url || hotel.images[0]?.url || '';
  };

  useEffect(() => {
    fetchHotels({ page, itemsPerPage, searchTerm: debounceSearch })
      .then(({ count }) => 
      setTotalCount(count))
      .catch((err: any)=>{
        toast.error(err.message)
      })
  }, [page, debounceSearch]);

  useEffect(()=>{
    let num = Math.ceil(totalCount / itemsPerPage);
    setTotalPages(num)
  },[totalCount, itemsPerPage])

  useEffect(()=>{
    firstLoad()
  },[])


  if(loading)
  return <div className="flex justify-center items-center h-[calc(100vh-65px)]"> <Loader/> </div>
  return (
    <div className="space-y-6">
      {/* Header with Add Button */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Featured Hotels</h2>
        <Dialog
          onOpenChange={(open)=>{
            if(!open){
              setPage(1)
            }
          }}
        >
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" /> Add Featured Hotel
            </Button>
          </DialogTrigger>
          {/* <DialogContent className="w-full max-w-[95vw] sm:max-w-2xl md:max-w-4xl lg:max-w-5xl xl:max-w-6xl max-h-[95vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Select a Hotel</DialogTitle>
            </DialogHeader>

            <div className="mb-3">
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-white border-border h-[42px]"
                placeholder="Search Hotels by name and city..."
              />
            </div>

            <div className="space-y-3 min-h-[60vh] max-h-80 overflow-y-auto">
              {filteredHotels.length > 0 ? (
                filteredHotels.map((hotel) => (
                  <div
                    key={hotel.id}
                    className="border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition bg-white"
                  >
                    <div className="flex gap-4">
                      <img
                        src={hotel.image || "/placeholder.jpg"}
                        alt={hotel.name}
                        className="h-24 w-24 object-cover rounded-l-xl"
                      />
                      <div className="flex flex-col justify-between flex-1 py-2">
                        <div>
                          <p className="font-semibold text-gray-800">
                            {hotel.name}
                          </p>
                          <p className="text-sm text-gray-500">{hotel.city}</p>
                          <p className="text-xs text-gray-400">
                            ⭐ {hotel.rating || "4.5"} • 'Unknown'
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAddFeatured(hotel)}
                          className="w-fit mt-2 text-blue-600 border-blue-200 hover:bg-blue-100 cursor-pointer"
                        >
                          <Star className="h-4 w-4 mr-1" /> Select
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground mt-2">
                  No hotels match your search/destination.
                </p>
              )}
            </div>
          </DialogContent> */}
          <DialogContent className="w-full max-w-[95vw] sm:max-w-2xl md:max-w-4xl lg:max-w-5xl xl:max-w-6xl max-h-[95vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Select a Hotel</DialogTitle>
            </DialogHeader>

            <div className="mb-3">
              <Input
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1);
                }}
                className="bg-white border-border h-[42px]"
                placeholder="Search Hotels by name and city..."
              />
            </div>

            <div className="space-y-3 min-h-[60vh] max-h-80 overflow-y-auto">
              {adminHotels.length > 0 ? (
                adminHotels.map((hotel: any) => (
                  <div
                    key={hotel.id}
                    className="border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition bg-white"
                  >
                    <div className="flex gap-4">
                      <img
                        src={getPrimaryImage(hotel) || "/placeholder.jpg"}
                        alt={hotel.name}
                        className="h-24 w-24 object-cover rounded-l-xl"
                      />
                      <div className="flex flex-col justify-between flex-1 py-2">
                        <div>
                          <p className="font-semibold text-gray-800">
                            {hotel.name}
                          </p>
                          <p className="text-sm text-gray-500">{hotel.destination}</p>
                          <p className="text-xs text-gray-400 my-1">
                            ⭐ {hotel.rating || "4.5"} •{" "}
                            {hotel.country || "Unknown"}
                          </p>
                        </div>
                        {
                          hotel.featured ? 
                          <RemoveFeatured submit={()=>{handleRemoveFeatured(hotel.id)}}/> :
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAddFeatured(hotel)}
                            className="w-fit text-blue-600 border-blue-200 hover:bg-blue-600 cursor-pointer"
                          >
                            Mark as Featured
                          </Button>
                        }
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground mt-2">
                  No hotels match your search/destination.
                </p>
              )}
            </div>

            {
              totalPages > 1 && (
                <div className="flex justify-center mt-6">
                  <PaginationComponent page={page} totalPages={totalPages} onPageChange={(newPage)=>{setPage(newPage)}}/>
                </div>
              )
            }
          </DialogContent>
        </Dialog>
      </div>

      <Separator />

      {/* Featured Hotels Grid */}
      {featuredHotels.length === 0 ? (
        <p className="text-muted-foreground text-center mt-8">
          No featured hotels added yet.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {featuredHotels.map((hotel) => (
            <Card
              key={hotel.id}
              className="overflow-hidden hover:shadow-md transition-shadow duration-200 rounded-xl border"
            >
              <img
                src={getPrimaryImage(hotel) || "/placeholder.jpg"}
                alt={hotel.name}
                className="h-32 w-full object-cover"
              />

              <CardContent className="p-4 flex flex-col justify-between">
                <div className="mb-3">
                  <p className="font-semibold text-gray-800 text-sm">
                    {hotel.name}
                  </p>
                  <p className="text-sm text-gray-500">{hotel.destination}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    ⭐ {hotel.rating || "4.5"} • {hotel.country || "Unknown"}
                  </p>
                </div>

                <div className="flex justify-end">
                  <RemoveFeatured submit={()=>{handleRemoveFeatured(hotel.id)}}/>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

const RemoveFeatured=({submit} : {submit : ()=> void})=>{
  return(
    <Button
      variant="outline"
      size="sm"
      onClick={submit}
      className="w-fit text-rose-600 border-rose-200 hover:bg-rose-600 cursor-pointer"
    >
      Unmark Featured
    </Button>
  )
}

export default FeaturedHotelsPage
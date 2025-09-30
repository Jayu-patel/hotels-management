'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { ScrollArea } from '../ui/scroll-area';
import { Plus, Edit, Trash2, MapPin, Star, Bed, Upload, X, Search, Image as ImageIcon, Crown } from 'lucide-react';
import { toast } from 'react-toastify';
import { supabase } from '@/lib/supabase/client';
import { useHotels } from '@/contexts/hotels-context';
import Link from 'next/link';
import Image from 'next/image';
import PaginationComponent from "@/components/pagination"
import { useConfirm } from '@/contexts/confirmation';
import { Country, State, City } from "country-state-city";


interface HotelImage {
  id: string;
  url: string;
  file?: File;
  is_primary: boolean;
}

interface RoomType {
  type: string;
  count: number;
}

interface Hotel {
  id: string;
  name: string;
  location: string;
  destination: string;
  country: string;
  state: string;
  rating: number;
  // totalRooms: number;
  // availableRooms: number;
  // priceRange: string;
  status: 'Active' | 'Inactive';
  images: HotelImage[];
  description: string;
  amenities: amenityType[];
  // roomTypes: RoomType[];
}

interface Room {
  id: string;
  hotelId: string;
  name: string;
  type: string;
  capacity: number;
  price: number;
  amenities: string[];
  available: boolean;
  images: HotelImage[];
  roomCount: number;
}

interface amenityType{
  id: string,
  name: string
}

interface props{
  amenityData : amenityType[]
}

export function HotelsManagement({amenityData = []} : props) {
  const {adminHotels, fetchHotels} = useHotels()
  const [isHotelDialogOpen, setIsHotelDialogOpen] = useState(false);
  const [editingHotel, setEditingHotel] = useState<Hotel | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const itemsPerPage = 3;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [amenities, setAmenities] = useState<amenityType[] | null>(amenityData)
  const [amenitiesOptions, setAmenitiesOptions] = useState<{ label: string; value: string }[]>([])
  const [searchCityTerm, setSearchCityTerm] = useState("");
  
  const confirm = useConfirm();

  useEffect(()=>{
    if(amenities){
      setAmenitiesOptions(amenities.map((a: amenityType) => ({ label: a.name, value: a.id })))
    }
  },[])

  useEffect(()=>{
    console.log("lol", adminHotels)
  },[adminHotels])

  const [hotelForm, setHotelForm] = useState({
    name: '',
    location: '',
    destination: '',
    description: '',
    amenities: [] as { id: string; name: string }[],
    images: [] as HotelImage[],
    // roomTypes: [] as RoomType[],
  });

  // const filteredHotels = hotels.filter((hotel) => {
  //   const matchesSearch = 
  //     hotel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //     hotel.location.toLowerCase().includes(searchTerm.toLowerCase());
    
  //   const matchesStatus = statusFilter === 'All' || hotel.status === statusFilter;
    
  //   return matchesSearch && matchesStatus;
  // });

  const totalPages = Math.ceil(totalCount / itemsPerPage);
  // const startIndex = (currentPage - 1) * itemsPerPage;
  // const paginatedHotels = filteredHotels.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

useEffect(() => {
    setCurrentPage(1);
}, [searchTerm, statusFilter]);

useEffect(() => {
  fetchHotels({ page: currentPage, itemsPerPage, searchTerm })
    .then(({ count }) => 
    setTotalCount(count))
    .catch((e)=>{
      console.log(e)
    })
}, [currentPage, searchTerm, statusFilter]);

  useEffect(() => {
    let hotelInserted = false;
    let imagesInserted = false;
    let amenitiesInserted = false;

    const refreshIfComplete = () => {
      if (hotelInserted == true && imagesInserted == true && amenitiesInserted == true) {
        console.log("All related inserts detected — refreshing data...");
        fetchHotels({ page: currentPage, itemsPerPage, searchTerm })
          .then(({ count }) => setTotalCount(count))
          .catch((err)=>{console.log(err)});
        hotelInserted = imagesInserted = amenitiesInserted = false; // reset for next insert
      }
    };

    const channel = supabase.channel("hotel_updates");

    channel
    .on("postgres_changes", { event: "*", schema: "public", table: "hotels" }, (payload) => {
      hotelInserted = true;
      refreshIfComplete();
    })
    .on("postgres_changes", { event: "DELETE", schema: "public", table: "hotels" }, (payload) => {
      setCurrentPage(1);
      fetchHotels({ page: currentPage, itemsPerPage, searchTerm }).then(({ count }) => setTotalCount(count)).catch((e)=>{console.log(e)})
    })
    .on("postgres_changes", { event: "INSERT", schema: "public", table: "hotel_images" }, (payload) => {
      imagesInserted = true;
      refreshIfComplete();
    })
    .on("postgres_changes", { event: "INSERT", schema: "public", table: "hotel_amenities" }, (payload) => {
      amenitiesInserted = true;
      refreshIfComplete();
    })
    .on("postgres_changes", { event: "UPDATE", schema: "public", table: "hotels" }, (payload) => {
      hotelInserted = imagesInserted = amenitiesInserted = true;
      refreshIfComplete();
    })
    .on("postgres_changes", { event: "INSERT", schema: "public", table: "hotel_images" }, (payload) => {
      hotelInserted = imagesInserted = amenitiesInserted = true;
      refreshIfComplete();
    })
    .on("postgres_changes", { event: "INSERT", schema: "public", table: "hotel_amenities" }, (payload) => {
      hotelInserted = imagesInserted = amenitiesInserted = true;
      refreshIfComplete();
    })
    .subscribe((status) => {
      console.log("Realtime channel status:", status)
    });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleAddHotel = () => {
    setEditingHotel(null);
    setHotelForm({
      name: '',
      location: '',
      destination: '',
      description: '',
      amenities: [],
      images: [],
      // roomTypes: [{ type: 'Standard', count: 0 }],
    });

    setErrors({
      name: "",
      location: "",
      country: "",
      state: "",
      city: "",
      description: "",
      amenities: "",
    })

    setCountry("")
    setState("")
    setCity("")
    setIsHotelDialogOpen(true);
  };

  const handleEditHotel = (hotel: Hotel) => {
    setEditingHotel(hotel);
    setHotelForm({
      name: hotel.name,
      location: hotel.location,
      destination: hotel.destination,
      description: hotel.description,
      amenities: hotel.amenities,
      images: hotel.images,
      // roomTypes: hotel.roomTypes || [{ type: 'Standard', count: 0 }],
    });
    setCountry(hotel.country)
    setState(hotel.state)
    setCity(hotel.destination)
    setIsHotelDialogOpen(true);

    setErrors({
      name: "",
      location: "",
      country: "",
      state: "",
      city: "",
      description: "",
      amenities: "",
    })
  };
  

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {   
  const files = event.target.files;
  if (files) {
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        const newImage: HotelImage = {
          id: Math.random().toString(),   // temporary key
          url: imageUrl,                  // preview
          file,                           // keep original File for upload
          is_primary: hotelForm.images.length === 0, // first image primary
        };
        setHotelForm(prev => ({
          ...prev,
          images: [...prev.images, newImage]
        }));
      };
      reader.readAsDataURL(file);
    });
  }
};

  const setPrimaryImage = (imageId: string) => {
    setHotelForm(prev => ({
      ...prev,
      images: prev.images.map(img => ({
        ...img,
        is_primary: img.id === imageId
      }))
    }));
  };

  const removeImage = (imageId: string) => {
    setHotelForm(prev => {
      const newImages = prev.images.filter(img => img.id !== imageId);
      if (newImages.length > 0 && !newImages.find(img => img.is_primary)) {
        newImages[0].is_primary = true;
      }
      return {
        ...prev,
        images: newImages
      };
    });
  };

  const handleSaveHotel = async () => {

    if(!validateForm()){
      return
    }

    if (hotelForm.images.length === 0) {
      toast.error('Please add at least one image');
      return;
    }
    try {
      // 1️⃣ Insert or update hotel basic info
      const { data: hotelData, error: hotelError } = await supabase
        .from('hotels')
        .upsert({
          name: hotelForm.name,
          address: hotelForm.location,
          destination: city,
          description: hotelForm.description,
          status: 'active',
          star_rating: 1,
          review_count: 1,
          country,
          state
        })
        .select("id")
        .single();

      if (hotelError) throw hotelError;

      let hotelId = hotelData?.id

      // 2️⃣ Upload images to Supabase Storage
      const uploadedImages = await Promise.all(
        hotelForm.images.map(async (img) => {
          if (!img.file) return img; // already has URL, skip upload

          const fileExt = img.file.name.split('.').pop();
          const fileName = `${crypto.randomUUID()}.${fileExt}`;

          const { data, error: uploadError } = await supabase.storage
            .from('hotels')
            .upload(fileName, img.file);

          if (uploadError) throw uploadError;

          const { data: {publicUrl} } = supabase.storage.from('hotels').getPublicUrl(fileName);

          return {
            hotel_id: hotelId,
            image_url: publicUrl,
            is_primary: img.is_primary,
          };
        })
      );

      // 3️⃣ Insert images
      const { error: imagesError } = await supabase
        .from('hotel_images')
        .upsert(uploadedImages);

      if (imagesError) throw imagesError;

      // 4️⃣ Insert hotel amenities
      const amenitiesInsert = hotelForm.amenities.map((amenityId) => ({
        hotel_id: hotelId,
        amenity_id: amenityId?.id,
      }));

      if (amenitiesInsert.length > 0) {
        const { error: amenitiesError } = await supabase
          .from('hotel_amenities')
          .upsert(amenitiesInsert);

        if (amenitiesError) throw amenitiesError;
      }

      toast.success('Hotel added successfully');
      setIsHotelDialogOpen(false);
    } catch (error: any) {
      console.log(error);
      toast.error('Error saving hotel: ' + error.message);
    }
  };

  const handleUpdateHotel = async (hotelId: string) => {
    if (hotelForm.images.length === 0) {
      toast.error("Please add at least one image");
      return;
    }

    try {
      // 1️⃣ Update hotel basic info
      const { error: updateError } = await supabase
        .from("hotels")
        .update({
          name: hotelForm.name,
          address: hotelForm.location,
          destination: city,
          description: hotelForm.description,
          country,
          state
        })
        .eq("id", hotelId);

      if (updateError) throw updateError;

      // 2️⃣ Get existing images
      const { data: existingImages, error: fetchImagesError } = await supabase
        .from("hotel_images")
        .select("*")
        .eq("hotel_id", hotelId);

      if (fetchImagesError) throw fetchImagesError;

      const existingImageUrls = existingImages.map((img) => img.image_url);

      // 3️⃣ Find removed images
      const removedImages = existingImages.filter(
        (img) => !hotelForm.images.some((formImg) => formImg.url === img.image_url)
      );

      // Delete removed images from DB
      if (removedImages.length > 0) {
        const { error: deleteImagesError } = await supabase
          .from("hotel_images")
          .delete()
          .in(
            "id",
            removedImages.map((img) => img.id)
          );

        if (deleteImagesError) throw deleteImagesError;
      }

      // 4️⃣ Update primary status of existing images
      const imagesToUpdate = hotelForm.images.filter((img) =>
        existingImageUrls.includes(img.url)
      );

      for (const img of imagesToUpdate) {
        const { error: updateImageError } = await supabase
          .from("hotel_images")
          .update({ is_primary: img.is_primary })
          .eq("hotel_id", hotelId)
          .eq("image_url", img.url);

        if (updateImageError) throw updateImageError;
      }

      // 5️⃣ Handle new image uploads
      const newImagesToInsert = await Promise.all(
        hotelForm.images
          .filter((img) => !existingImageUrls.includes(img.url))
          .map(async (img) => {
            let imageUrl = img.url;

            if (img.file) {
              const fileExt = img.file.name.split(".").pop();
              const fileName = `${crypto.randomUUID()}.${fileExt}`;
              const filePath = `hotel-images/${fileName}`;

              const { error: uploadError } = await supabase.storage
                .from("hotels")
                .upload(filePath, img.file);

              if (uploadError) throw uploadError;

              const {
                data: { publicUrl },
              } = supabase.storage.from("hotels").getPublicUrl(filePath);

              imageUrl = publicUrl;
            }

            return {
              hotel_id: hotelId,
              image_url: imageUrl,
              is_primary: img.is_primary,
            };
          })
      );

      if (newImagesToInsert.length > 0) {
        const { error: insertImagesError } = await supabase
          .from("hotel_images")
          .insert(newImagesToInsert);
        if (insertImagesError) throw insertImagesError;
      }

      // 6️⃣ Update amenities: delete old ones and insert new
      await supabase.from("hotel_amenities").delete().eq("hotel_id", hotelId);

      const amenitiesInsert = hotelForm.amenities.map((amenity) => ({
        hotel_id: hotelId,
        amenity_id: amenity.id,
      }));

      if (amenitiesInsert.length > 0) {
        const { error: insertAmenitiesError } = await supabase
          .from("hotel_amenities")
          .insert(amenitiesInsert);

        if (insertAmenitiesError) throw insertAmenitiesError;
      }

      toast.success("Hotel updated successfully");
      setIsHotelDialogOpen(false);
    } catch (error: any) {
      console.error(error.message);
      toast.error("Error updating hotel: " + error.message);
    }
  };

  const handleDeleteHotel = async(hotelId: string) => {
    const ok = await confirm({
      title: "Delete Hotel",
      description: "Are you sure you want to delete this hotel? This action cannot be undone.",
      confirmText: "Delete",
      intent: "danger",
    });

    if (!ok) return;
    
    try{
      const {error} = await supabase.from("hotels").delete().eq("id", hotelId)
      if(error){
        throw error
      }
      toast.success("Hotel deleted successfully");
    }
    catch(err: any){
      toast.error(err.message)
    }
  };

  const getPrimaryImage = (hotel: Hotel) => {
    const primaryImg = hotel.images.find(img => img.is_primary);
    return primaryImg?.url || hotel.images[0]?.url || '';
  };

  useEffect(()=>{
    // setC
  },[adminHotels])

  const [country, setCountry] = useState("");
  const [state, setState] = useState("");
  const [city, setCity] = useState("");
  const [countryCode, setCountryCode] = useState("");
  const [stateCode, setStateCode] = useState("");

  const [errors, setErrors] = useState({
    name: "",
    location: "",
    country: "",
    state: "",
    city: "",
    description: "",
    amenities: "",
  });

  const validateForm = () => {
    let valid = true;
    let newErrors = {
      name: "",
      location: "",
      country: "",
      state: "",
      city: "",
      description: "",
      amenities: "",
    };
    
    if (!hotelForm.name.trim()) {
      newErrors.name = "Hotel name is required";
      valid = false;
    }
    if (!hotelForm.location.trim()) {
      newErrors.location = "Location is required";
      valid = false;
    }
    if (!country) {
      newErrors.country = "Country is required";
      valid = false;
    }
    if (!state) {
      newErrors.state = "State is required";
      valid = false;
    }
    if (!city) {
      newErrors.city = "Destination is required";
      valid = false;
    }
    if (!hotelForm.description.trim()) {
      newErrors.description = "Description is required";
      valid = false;
    }
    if (hotelForm.amenities.length === 0) {
      newErrors.amenities = "Select at least one amenity";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };


  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl">Hotels Management</h2>
        <Button onClick={handleAddHotel}>
          <Plus className="w-4 h-4 mr-2" />
          Add Hotel
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search hotels..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Status</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Hotels Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {adminHotels.map((hotel) => (
          <Card key={hotel.id} className="overflow-hidden">
            <div className="aspect-video relative">
              <div className="w-full h-full relative">
                <Image
                  fill
                  src={`/api/image-proxy?url=${getPrimaryImage(hotel)}`}
                  alt={hotel.name}
                  className="object-cover"
                />
              </div>
              <Badge
                className="absolute top-2 right-2"
                variant={hotel.status === "Active" ? "default" : "secondary"}
              >
                {hotel.status}
              </Badge>
              {hotel.images.length > 1 && (
                <Badge className="absolute top-2 left-2 bg-black/50 text-white">
                  <ImageIcon className="w-3 h-3 mr-1" />
                  {hotel.images.length}
                </Badge>
              )}
            </div>
            <CardContent className="p-4">
              <div className="space-y-3">
                <div>
                  <h3 className="text-lg">{hotel.name}</h3>
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <MapPin className="w-4 h-4" />
                    {hotel.location}
                  </div>
                  <div className="text-sm text-blue-600 mt-1">
                    Destination: {hotel.destination}
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    {hotel.rating}
                  </div>
                  {/* <span className="text-gray-600">{hotel.priceRange}</span> */}
                </div>

                {/* <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Bed className="w-4 h-4" />
                    {hotel.totalRooms} rooms
                  </div>
                  <span className="text-green-600">{hotel.availableRooms} available</span>
                </div> */}

                {/* Room Types Display */}
                {/* <div className="space-y-1">
                  <div className="text-sm">Room Types:</div>
                  <div className="flex flex-wrap gap-1">
                    {hotel.roomTypes.map((roomType, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {roomType.type}: {roomType.count}
                      </Badge>
                    ))}
                  </div>
                </div> */}

                <div className="flex flex-wrap gap-1">
                  {hotel.amenities
                    .slice(0, 3)
                    .map((amenity: { id: string; name: string }) => (
                      <Badge
                        key={amenity.id}
                        variant="secondary"
                        className="text-xs"
                      >
                        {amenity.name}
                      </Badge>
                    ))}
                  {hotel.amenities.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{hotel.amenities.length - 3}
                    </Badge>
                  )}
                </div>

                <div className="flex gap-2 pt-2">
                  <Link href={`/admin/hotels/${hotel.id}`} className="flex-1">
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full cursor-pointer"
                    >
                      <Bed className="w-4 h-4 mr-1" />
                      Rooms
                    </Button>
                  </Link>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEditHotel(hotel)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDeleteHotel(hotel.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center">
          <PaginationComponent
            page={currentPage}
            totalPages={totalPages}
            onPageChange={(newPage) => {
              setCurrentPage(newPage);
            }}
          />
        </div>
      )}

      <Dialog open={isHotelDialogOpen} onOpenChange={setIsHotelDialogOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>
              {editingHotel ? "Edit Hotel" : "Add New Hotel"}
            </DialogTitle>
            <DialogDescription>
              Configure hotel information, room types, and image gallery.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[calc(90vh-120px)]">
            <div className="space-y-6 p-1">
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="basic">Basic Information</TabsTrigger>
                  <TabsTrigger value="images">Images & Gallery</TabsTrigger>
                </TabsList>

                <TabsContent value="basic" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="hotel-name">Hotel Name</Label>
                      <Input
                        id="hotel-name"
                        className="border-2 border-blue-500 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                        value={hotelForm.name}
                        onChange={(e) =>
                          setHotelForm({ ...hotelForm, name: e.target.value })
                        }
                      />
                      {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="hotel-location">Location</Label>
                      <Input
                        id="hotel-location"
                        className="border-2 border-blue-500 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                        value={hotelForm.location}
                        onChange={(e) =>
                          setHotelForm({
                            ...hotelForm,
                            location: e.target.value,
                          })
                        }
                      />
                      {errors.location && <p className="text-sm text-red-500">{errors.location}</p>}
                    </div>
                  </div>

                  {/* <div className="space-y-2">
                    <Label htmlFor="hotel-destination">Destination</Label>
                    <Select value={hotelForm.destination} onValueChange={(value) => setHotelForm({ ...hotelForm, destination: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select destination" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Mumbai">Mumbai</SelectItem>
                        <SelectItem value="Dubai">Dubai</SelectItem>
                        <SelectItem value="London">London</SelectItem>
                        <SelectItem value="New York">New York</SelectItem>
                        <SelectItem value="Paris">Paris</SelectItem>
                        <SelectItem value="Tokyo">Tokyo</SelectItem>
                        <SelectItem value="San Diego">San Diego</SelectItem>
                        <SelectItem value="Delhi">Delhi</SelectItem>
                      </SelectContent>
                    </Select>
                  </div> */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Country */}
                    <div>
                      <Label htmlFor="country" className="mb-1">Country</Label>
                      <Input
                        id="country"
                        list="countries"
                        autoComplete="off"
                        value={country}
                        onChange={(e) => {
                          const selected = Country.getAllCountries().find(
                            (c) => c.name.toLowerCase() === e.target.value.toLowerCase()
                          );
                          setCountry(selected?.name || e.target.value);
                          setCountryCode(selected?.isoCode || "");
                          setState("");
                          setStateCode("");
                          setCity("");
                        }}
                        placeholder="Select or search country"
                        className="border-2 border-blue-500 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                      />
                      <datalist id="countries">
                        {Country.getAllCountries().map((c) => (
                          <option key={c.isoCode} value={c.name} />
                        ))}
                      </datalist>
                      {errors.country && <p className="text-sm text-red-500">{errors.country}</p>}
                    </div>

                    {/* State */}
                    <div>
                      <Label htmlFor="state" className="mb-1">State</Label>
                      <Input
                        id="state"
                        list="states"
                        autoComplete="off"
                        value={state}
                        onChange={(e) => {
                          const selected = State.getStatesOfCountry(countryCode).find(
                            (s) => s.name.toLowerCase() === e.target.value.toLowerCase()
                          );
                          setState(selected?.name || e.target.value);
                          setStateCode(selected?.isoCode || "");
                          setCity("");
                        }}
                        disabled={!countryCode}
                        placeholder="Select or search state"
                        className="border-2 border-blue-500 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                      />
                      <datalist id="states">
                        {countryCode &&
                          State.getStatesOfCountry(countryCode).map((s) => (
                            <option key={s.isoCode} value={s.name} />
                          ))}
                      </datalist>
                      {errors.state && <p className="text-sm text-red-500">{errors.state}</p>}
                    </div>

                    {/* Destination / City */}
                    <div>
                      <Label htmlFor="city" className="mb-1">Destination</Label>
                      <Input
                        id="city"
                        list="cities"
                        autoComplete="off"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        disabled={!stateCode}
                        placeholder="Select or search city"
                        className="border-2 border-blue-500 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                      />
                      <datalist id="cities">
                        {countryCode &&
                          stateCode &&
                          City.getCitiesOfState(countryCode, stateCode).map((c) => (
                            <option key={c.name} value={c.name} />
                          ))}
                      </datalist>
                      {errors.city && <p className="text-sm text-red-500">{errors.city}</p>}
                    </div>
                  </div>


                  <div className="space-y-2">
                    <Label htmlFor="hotel-description">Description</Label>
                    <Textarea
                      id="hotel-description"
                      className="border-2 border-blue-500 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                      value={hotelForm.description}
                      onChange={(e) =>
                        setHotelForm({
                          ...hotelForm,
                          description: e.target.value,
                        })
                      }
                      rows={3}
                    />
                    {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hotel-amenities">Amenities</Label>
                    <Select
                      value={undefined}
                      onValueChange={(value) => {
                        const selectedAmenity = amenitiesOptions.find(
                          (a) => a.value === value
                        );
                        if (!selectedAmenity) return;
                        if (!hotelForm.amenities.some((a) => a.id === value)) {
                          setHotelForm({
                            ...hotelForm,
                            // amenities: [...roomForm.amenities, value],
                            amenities: [
                              ...hotelForm.amenities,
                              { id: value, name: selectedAmenity.label },
                            ],
                          });
                        }
                        setErrors((prev) => ({ ...prev, amenities: "" }));
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select amenities" />
                      </SelectTrigger>
                      <SelectContent>
                        {amenitiesOptions?.map((e, i) => {
                          return (
                            <SelectItem key={i} value={e.value}>
                              {e.label}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>

                    {/* Show selected amenities */}
                    <div className="flex flex-wrap gap-2 mt-2">
                      {hotelForm.amenities.map((amenity) => (
                        <span
                          key={amenity.id}
                          className="px-2 py-1 text-sm bg-gray-200 rounded-full cursor-pointer"
                          onClick={() =>
                            setHotelForm({
                              ...hotelForm,
                              amenities: hotelForm.amenities.filter(
                                (a) => a.id !== amenity.id
                              ),
                            })
                          }
                        >
                          {amenity.name} ✕
                        </span>
                      ))}
                    </div>
                    {errors.amenities && <p className="text-sm text-red-500">{errors.amenities}</p>}
                  </div>
                </TabsContent>

                <TabsContent value="images" className="space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>Hotel Images</Label>
                      <div className="flex gap-2">
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          Upload Images
                        </Button>
                      </div>
                    </div>

                    {hotelForm.images.length === 0 ? (
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                        <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">No images uploaded yet</p>
                        <p className="text-sm text-gray-500">
                          Click "Upload Images" to add photos
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {hotelForm.images.map((image) => (
                          <Card key={image.id} className="overflow-hidden">
                            <div className="aspect-video relative">
                              <img
                                src={image.url}
                                alt={"Hotel image"}
                                className="w-full h-full object-cover"
                              />
                              {image.is_primary && (
                                <Badge className="absolute top-2 left-2 bg-yellow-500">
                                  <Crown className="w-3 h-3 mr-1" />
                                  Primary
                                </Badge>
                              )}
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                className="absolute top-2 right-2"
                                onClick={() => removeImage(image.id)}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                            <CardContent className="p-3">
                              <div className="space-y-2">
                                {!image.is_primary && (
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPrimaryImage(image.id)}
                                    className="w-full"
                                  >
                                    Set as Primary
                                  </Button>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex gap-3 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setIsHotelDialogOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    if (!editingHotel) {
                      handleSaveHotel();
                    } else {
                      handleUpdateHotel(editingHotel.id);
                    }
                  }}
                  className="flex-1"
                >
                  {editingHotel ? "Update" : "Add"} Hotel
                </Button>
              </div>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}
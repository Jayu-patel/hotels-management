"use client"
import React, { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Edit, Trash2, Upload, X, Image as ImageIcon, Crown, CalendarIcon } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { toast } from 'react-toastify';
import { useHotels } from '@/contexts/hotels-context';
import { useRouter } from 'next/navigation';
import { getAmenities } from '@/supabase/hotels';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/lib/supabase/client';
import { DateRange } from 'react-day-picker';
import { Calendar } from '@/components/ui/calendar';
import { useConfirm } from '@/contexts/confirmation';
import Loader from '@/components/loader'
import { removeRoom } from '@/supabase/bookings';

interface RoomImage {
  id: string;
  url: string;
  file?: File;
  caption?: string;
  is_primary: boolean;
}

interface Room {
  id: string;
  hotelId: string;
  name: string;
  type: string;
  capacity: number;
  price: number;
  amenities: amenityType[];
  available: boolean;
  images: RoomImage[];
  roomCount: number;
  description: string;
  bookedCount: number;
}

interface Params{
  id?: string
}

interface amenityType{
  id: string,
  name: string
}


export default function page({params}:{params : Promise<Params>}) {
  const {id} = React.use(params)
  const [rooms, setRooms] = useState<Room[] | null>(null)
  const [hotelName, setHotelName] = useState<string>("")
  const [isRoomDialogOpen, setIsRoomDialogOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const roomTypeOptions = ['Standard', 'Deluxe', 'Suite', 'Premium', 'Executive', 'Presidential'];
  const [amenities, setAmenities] = useState<amenityType[] | null>(null)
  const [amenitiesOptions, setAmenitiesOptions] = useState<{ label: string; value: string }[]>([])
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: undefined,
    to: undefined,
  });
  const [loading, setLoading] = useState(true)
  const [dateLoading, setDateLoading] = useState(true)

  const {getHotelRooms} = useHotels()
  const router = useRouter()
  const confirm = useConfirm();

  const [roomForm, setRoomForm] = useState({
    name: '',
    type: '',
    capacity: 2,
    price: 0,
    // amenities: [] as string[],
    amenities: [] as { id: string; name: string }[],
    roomCount: 1,
    images: [] as RoomImage[],
    description: ''
  });

  // ---------- Validation state ----------
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!roomForm.name || !roomForm.name.trim()) newErrors.name = "Room name is required";
    if (!roomForm.type || !roomForm.type.trim()) newErrors.type = "Room type is required";
    if (!roomForm.capacity || Number.isNaN(roomForm.capacity) || roomForm.capacity < 1) newErrors.capacity = "Capacity must be at least 1";
    if (!roomForm.roomCount || Number.isNaN(roomForm.roomCount) || roomForm.roomCount < 1) newErrors.roomCount = "At least 1 room required";
    if (roomForm.price === undefined || roomForm.price === null || Number.isNaN(roomForm.price) || roomForm.price <= 0) newErrors.price = "Price must be greater than 0";
    if (!roomForm.description || !roomForm.description.trim()) newErrors.description = "Description is required";
    if (roomForm.images.length === 0) newErrors.images = "Please add at least one image";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }
  // ---------- end validation ----------

  const handleAddRoom=async()=>{
    // keep existing image-toast behavior but still validate fields
    if (!validateForm()) {
      return;
    }

    if (roomForm.images.length === 0) {
      toast.error('Please add at least one image');
      return;
    }

    try{
      const {data, error} = await supabase
      .from('rooms')
      .insert({
        hotel_id: id,
        name: roomForm.name,
        price: roomForm.price,
        capacity: roomForm.capacity,
        count: roomForm.roomCount,
        room_type: roomForm.type,
        description: roomForm.description
      })
      .select("id")
      .single()

      if(error) throw error
      const roomId = data?.id

      const uploadedImages = await Promise.all(
        roomForm.images.map(async (img) => {
          if (!img.file) return img;

          const fileExt = img.file.name.split('.').pop();
          const fileName = `${crypto.randomUUID()}.${fileExt}`;
          const filePath = `room-images/${fileName}`;

          const { data, error: uploadError } = await supabase.storage
            .from('hotels')
            .upload(filePath, img.file);

          if (uploadError) throw uploadError;

          const { data: {publicUrl} } = supabase.storage.from('hotels').getPublicUrl(filePath);

          return {
            room_id: roomId,
            image_url: publicUrl,
            is_primary: img.is_primary,
          };
        })
      );

      // 3️⃣ Insert images
      const { error: imagesError } = await supabase.from('room_images').upsert(uploadedImages);
      if (imagesError) throw imagesError;

      const amenitiesInsert = roomForm.amenities.map((amenityId) => ({
        room_id: roomId,
        amenity_id: amenityId.id,
      }));

      if (amenitiesInsert.length > 0) {
        const { error: amenitiesError } = await supabase
          .from('room_amenities')
          .upsert(amenitiesInsert);

        if (amenitiesError) throw amenitiesError;
      }
      toast.success('Room added successfully');
      setIsRoomDialogOpen(false)
    }
    catch (error: any) {
      console.log(error);
      toast.error('Error saving hotel: ' + error.message);
    }
  }

  const handleUpdateRoom = async (roomId: string) => {
    if (!validateForm()) {
      return;
    }

    if (roomForm.images.length === 0) {
      toast.error("Please add at least one image");
      return;
    }

    try {
      const { error: updateError } = await supabase
        .from("rooms")
        .update({
          name: roomForm.name,
          price: roomForm.price,
          capacity: roomForm.capacity,
          count: roomForm.roomCount,
          room_type: roomForm.type,
          description: roomForm.description,
        })
        .eq("id", roomId);

      if (updateError) throw updateError;

      const { data: existingImages, error: fetchImagesError } = await supabase
        .from("room_images")
        .select("*")
        .eq("room_id", roomId);

      if (fetchImagesError) throw fetchImagesError;

      const existingImageUrls = existingImages.map((img) => img.image_url);

      // 3️⃣ Find removed images (present in DB but not in form)
      const removedImages = existingImages.filter(
        (img) => !roomForm.images.some((formImg) => formImg.url === img.image_url)
      );

      // Delete removed images from DB
      if (removedImages.length > 0) {
        const { error: deleteImagesError } = await supabase
          .from("room_images")
          .delete()
          .in(
            "id",
            removedImages.map((img) => img.id)
          );

        if (deleteImagesError) throw deleteImagesError;
      }

      const imagesToUpdate = roomForm.images.filter((img) =>
        existingImageUrls.includes(img.url)
      );

      for (const img of imagesToUpdate) {
        const { error: updateImageError } = await supabase
          .from("room_images")
          .update({ is_primary: img.is_primary })
          .eq("room_id", roomId)
          .eq("image_url", img.url);

        if (updateImageError) throw updateImageError;
      }

      // 4️⃣ Handle new image uploads
      const newImagesToInsert = await Promise.all(
        roomForm.images
          .filter((img) => !existingImageUrls.includes(img.url))
          .map(async (img) => {
            let imageUrl = img.url;

            if (img.file) {
              const fileExt = img.file.name.split(".").pop();
              const fileName = `${crypto.randomUUID()}.${fileExt}`;
              const filePath = `room-images/${fileName}`;

              const { error: uploadError } = await supabase.storage
                .from("hotels")
                .upload(filePath, img.file);

              if (uploadError) throw uploadError;

              const {
                data: { publicUrl },
              } = supabase.storage.from('hotels').getPublicUrl(filePath);

              imageUrl = publicUrl;
            }

            return {
              room_id: roomId,
              image_url: imageUrl,
              is_primary: img.is_primary,
            };
          })
      );

      if (newImagesToInsert.length > 0) {
        const { error: insertImagesError } = await supabase
          .from("room_images")
          .insert(newImagesToInsert);
        if (insertImagesError) throw insertImagesError;
      }

      // 5️⃣ Update amenities: delete old ones and insert new
      await supabase.from("room_amenities").delete().eq("room_id", roomId);

      const amenitiesInsert = roomForm.amenities.map((amenity) => ({
        room_id: roomId,
        amenity_id: amenity.id,
      }));

      if (amenitiesInsert.length > 0) {
        const { error: insertAmenitiesError } = await supabase
          .from("room_amenities")
          .upsert(amenitiesInsert, { onConflict: "room_id, amenity_id" })
          // .insert(amenitiesInsert);
        if (insertAmenitiesError) throw insertAmenitiesError;
      }

      toast.success("Room updated successfully");
      setIsRoomDialogOpen(false);
    } catch (error: any) {
      console.error(error.message);
      toast.error("Error updating room: " + error.message);
    }
  };


  const handleRoomImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      Array.from(files).forEach((file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const imageUrl = e.target?.result as string;
          const newImage: RoomImage = {
            id: Math.random().toString(),
            url: imageUrl,
            file,
            is_primary: roomForm.images.length === 0,
          };
          setRoomForm(prev => ({
            ...prev,
            images: [...prev.images, newImage]
          }));
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeRoomImage = (imageId: string) => {
    setRoomForm(prev => {
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

  const setPrimaryRoomImage = (imageId: string) => {
    setRoomForm(prev => ({
      ...prev,
      images: prev.images.map(img => ({
        ...img,
        is_primary: img.id === imageId
      }))
    }));
  };

  const removeHotelRoom=async(id: string)=>{
    const ok = await confirm({
      title: "Delete Room",
      description: "Are you sure you want to delete this room? This action cannot be undone.",
      confirmText: "Delete",
      intent: "danger"
    });

    if (!ok) return;

    try{
      const {data} = await removeRoom(id)
      toast.success('Room deleted successfully');
    }
    catch(err: any){
      toast.error(err?.message)
    }
  }

  useEffect(() => {
    let roomInserted = false;
    let imagesInserted = false;
    let amenitiesInserted = false;

    const refreshIfComplete =async() => {
      if (roomInserted == true && imagesInserted == true && amenitiesInserted == true) {
          if(id){
            try{
              const {rooms} = await getHotelRooms(id, dateRange?.from?.toLocaleDateString("en-GB"), dateRange?.to?.toLocaleDateString("en-GB"))
              if(rooms){setRooms(rooms)}
            }
            catch(err: any){
              toast.error(err.message)
            }
          }
          roomInserted = imagesInserted = amenitiesInserted = false;
      }
    };

    const channel = supabase.channel("room_updates");

    channel
    .on("postgres_changes", { event: "INSERT", schema: "public", table: "rooms" }, (payload) => {
      roomInserted = true;
      refreshIfComplete();
    })
    .on("postgres_changes", { event: "INSERT", schema: "public", table: "room_images" }, (payload) => {
      imagesInserted = true;
      refreshIfComplete();
    })
    .on("postgres_changes", { event: "INSERT", schema: "public", table: "room_amenities" }, (payload) => {
      amenitiesInserted = true;
      refreshIfComplete();
    })
    .on("postgres_changes", { event: "UPDATE", schema: "public", table: "rooms" }, (payload) => {
      roomInserted = imagesInserted = amenitiesInserted = true;
      refreshIfComplete();
    })
    .on("postgres_changes", { event: "INSERT", schema: "public", table: "room_images" }, (payload) => {
      roomInserted = imagesInserted = amenitiesInserted = true;
      refreshIfComplete();
    })
    .on("postgres_changes", { event: "INSERT", schema: "public", table: "room_amenities" }, (payload) => {
      roomInserted = imagesInserted = amenitiesInserted = true;
      refreshIfComplete();
    })
    .on("postgres_changes", { event: "INSERT", schema: "public", table: "bookings", filter: `hotel_id=eq.${id}` }, (payload) => {
      roomInserted = imagesInserted = amenitiesInserted = true;
      refreshIfComplete();
    })
    .on("postgres_changes", { event: "DELETE", schema: "public", table: "rooms"}, (payload) => {
      roomInserted = imagesInserted = amenitiesInserted = true;
      refreshIfComplete();
    })
    .subscribe((status) => {
      console.log("Realtime channel status:", status)
    });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const getRooms=async()=>{
    if(id){
      setDateLoading(true)
      try{
        const {rooms, name} = await getHotelRooms(id, dateRange?.from?.toLocaleDateString(), dateRange?.to?.toLocaleDateString())
        if(rooms){setRooms(rooms)}
        if(name) setHotelName(name)
        console.log(rooms)
      }
      catch(err: any){
        toast.error(err.message)
      }
      finally{
        setDateLoading(false)
      }
    }
  }

  const firstLoad=async()=>{
    setLoading(true)
    await getRooms()
    setLoading(false)
  }

  useEffect(()=>{
    getRooms()
  },[id, dateRange])

  useEffect(()=>{
    const fetchAmenities=async()=>{
      try{
        const {data} = await getAmenities()
        setAmenities(data)
      }
      catch(err: any){
        toast.error(err.message)
      }
    }

    fetchAmenities()
    firstLoad()
  },[])

  useEffect(()=>{
    if(amenities){
      setAmenitiesOptions(amenities.map((a: amenityType) => ({ label: a.name, value: a.id })))
    }
    if(amenitiesOptions) console.log(amenitiesOptions)
  },[amenities])

  useEffect(()=>{
    const from = new Date();
    from.setHours(0, 0, 0, 0);
  
    let to = new Date(from);
    to.setDate(from.getDate() + 6);

    setDateRange({from, to: to})
  },[])

  if(loading) 
  return <div className="flex justify-center items-center h-[calc(100vh-65px)]"> <Loader/> </div>
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Button variant="outline" onClick={() => {router.back()}}>
            ← Back to Hotels
          </Button>
          {
            hotelName ? 
            <>
              <h2 className="text-2xl mt-2">Rooms - {hotelName}</h2>
              <div className='mt-2'>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal h-12">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateRange?.from ? (
                        dateRange.to ? (
                          <>
                            {dateRange.from.toLocaleDateString("en-GB")} - {dateRange.to.toLocaleDateString("en-GB")}
                            {dateLoading ? <span className="ml-2 h-5 w-5 border-2 border-t-2 border-gray-200 border-t-blue-600 rounded-full animate-spin"></span> : <></>}
                          </>
                        ) : (
                          dateRange.from.toLocaleDateString("en-GB")
                        )
                      ) : (
                        <span className="text-muted-foreground">Pick check-in and check-out dates</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      initialFocus
                      mode="range"
                      defaultMonth={dateRange?.from}
                      selected={dateRange}
                      onSelect={setDateRange}
                      numberOfMonths={2}
                      // disabled={(date) => date < new Date() || date < new Date('1900-01-01')}
                      disabled={(date) => {
                        const today = new Date();
                        today.setHours(0, 0, 0, 0); // reset time → 00:00:00

                        return date < today || date < new Date("1900-01-01");
                      }}

                    />
                  </PopoverContent>
                </Popover>
              </div>
            </> : 
            <></>
          }
        </div>
        <Button onClick={() => {
          setEditingRoom(null);
          setRoomForm({
            name: '',
            type: '',
            capacity: 2,
            price: 0,
            amenities: [],
            roomCount: 1,
            images: [],
            description: ''
          });
          setIsRoomDialogOpen(true);
        }}>
          <Plus className="w-4 h-4 mr-2" />
          Add Room
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Room Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Capacity</TableHead>
                <TableHead>Available Rooms</TableHead>
                <TableHead>Booked Rooms</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rooms?.map((room) => (
                <TableRow key={room.id}>
                  <TableCell>
                    <div>
                      <div className="text-sm">{room.name}</div>
                      <div className="text-xs text-gray-500">
                        {room.amenities.slice(0, 2).map(a => a.name).join(', ')}
                        {room.amenities.length > 2 && '...'}
                      </div>

                    </div>
                  </TableCell>
                  <TableCell>{room.type}</TableCell>
                  <TableCell>{room.capacity} guests</TableCell>
                  <TableCell>{room.roomCount} rooms</TableCell>
                  <TableCell>{room.bookedCount}</TableCell>
                  <TableCell>${room.price}</TableCell>
                  <TableCell>
                    <Badge variant={room.available ? "default" : "destructive"}>
                      {room.available ? 'Available' : 'Unavailable'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        className='cursor-pointer'
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingRoom(room);
                          setRoomForm({
                            name: room.name,
                            type: room.type,
                            capacity: room.capacity,
                            price: room.price,
                            amenities: room.amenities.map(a => ({ id: a.id, name: a.name })),
                            roomCount: room.roomCount,
                            images: room.images,
                            description: room.description
                          });
                          setIsRoomDialogOpen(true);
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        className='cursor-pointer'
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                          removeHotelRoom(room.id)
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Room Dialog */}
      <Dialog open={isRoomDialogOpen} onOpenChange={setIsRoomDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingRoom ? 'Edit Room' : 'Add New Room'}</DialogTitle>
            <DialogDescription>
              Configure room details, images, and availability for this hotel.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="room-name">Room Name</Label>
                <Input
                  id="room-name"
                  value={roomForm.name}
                  onChange={(e) => {
                    setRoomForm({ ...roomForm, name: e.target.value })
                    if (errors.name) setErrors(prev => ({ ...prev, name: '' }))
                  }}
                />
                {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="room-type">Room Type</Label>
                <Select value={roomForm.type} onValueChange={(value) => {
                  setRoomForm({ ...roomForm, type: value });
                  if (errors.type) setErrors(prev => ({ ...prev, type: '' }))
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select room type" />
                  </SelectTrigger>
                  <SelectContent>
                    {roomTypeOptions.map((type) => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.type && <p className="text-sm text-red-500">{errors.type}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="room-capacity">Capacity</Label>
                <Input
                  id="room-capacity"
                  type="number"
                  value={roomForm.capacity}
                  onChange={(e) => {
                    setRoomForm({ ...roomForm, capacity: parseInt(e.target.value) })
                    if (errors.capacity) setErrors(prev => ({ ...prev, capacity: '' }))
                  }}
                />
                {errors.capacity && <p className="text-sm text-red-500">{errors.capacity}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="room-count">Number of Rooms</Label>
                <Input
                  id="room-count"
                  type="number"
                  min="1"
                  value={roomForm.roomCount}
                  onChange={(e) => {
                    setRoomForm({ ...roomForm, roomCount: parseInt(e.target.value) || 1 })
                    if (errors.roomCount) setErrors(prev => ({ ...prev, roomCount: '' }))
                  }}
                />
                {errors.roomCount && <p className="text-sm text-red-500">{errors.roomCount}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="room-price">Price per night</Label>
                <Input
                  id="room-price"
                  type="number"
                  value={roomForm.price}
                  onChange={(e) => {
                    setRoomForm({ ...roomForm, price: parseFloat(e.target.value) })
                    if (errors.price) setErrors(prev => ({ ...prev, price: '' }))
                  }}
                />
                {errors.price && <p className="text-sm text-red-500">{errors.price}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="room-description">Description</Label>
              <Textarea
                id="room-description"
                value={roomForm.description}
                onChange={(e) => {
                  setRoomForm({ ...roomForm, description: e.target.value })
                  if (errors.description) setErrors(prev => ({ ...prev, description: '' }))
                }}
                placeholder="Room description..."
              />
              {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="hotel-amenities">Amenities</Label>
              <Select
                value={undefined}
                onValueChange={(value) => {
                  const selectedAmenity = amenitiesOptions.find((a) => a.value === value);
                  if (!selectedAmenity) return;
                  if (!roomForm.amenities.some((a) => a.id === value)) {
                    setRoomForm({
                      ...roomForm,
                      // amenities: [...roomForm.amenities, value],
                      amenities: [...roomForm.amenities, { id: value, name: selectedAmenity.label }],
                    });
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select amenities" />
                </SelectTrigger>
                <SelectContent>
                  {
                    amenitiesOptions?.map((e,i)=>{
                      return(
                        <SelectItem key={i} value={e.value}>{e.label}</SelectItem>
                      )
                    })
                  }
                </SelectContent>
              </Select>

              {/* Show selected amenities */}
              <div className="flex flex-wrap gap-2 mt-2">
                {roomForm.amenities.map((amenity) => (
                  <span
                    key={amenity.id}
                    className="px-2 py-1 text-sm bg-gray-200 rounded-full cursor-pointer"
                    onClick={() =>
                      setRoomForm({
                        ...roomForm,
                        amenities: roomForm.amenities.filter((a) => a.id !== amenity.id),
                      })
                    }
                  >
                    {amenity.name} ✕
                  </span>
                ))}
              </div>
            </div>

            {/* Room Images Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Room Images</Label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => {
                    // clear image error when user selects files
                    if (e.target.files && e.target.files.length > 0 && errors.images) setErrors(prev => ({ ...prev, images: '' }))
                    handleRoomImageUpload(e)
                  }}
                  className="hidden"
                  id="room-image-upload"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('room-image-upload')?.click()}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Images
                </Button>
              </div>
              
              {roomForm.images.length === 0 ? (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <ImageIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">No images uploaded yet</p>
                  <p className="text-xs text-gray-500">Click "Upload Images" to add photos</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {roomForm.images.map((image) => (
                    <Card key={image.id} className="overflow-hidden">
                      <div className="aspect-video relative">
                        <img
                          src={image.url}
                          alt={image.caption || 'Room image'}
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
                          onClick={() => removeRoomImage(image.id)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                      <CardContent className="p-2">
                        <div className="space-y-2">
                          {!image.is_primary && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => setPrimaryRoomImage(image.id)}
                              className="w-full text-xs"
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
              {errors.images && <p className="text-sm text-red-500">{errors.images}</p>}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsRoomDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => {
                // validate before creating/updating
                if(!validateForm()) return;
                if(!editingRoom){handleAddRoom()}
                else{handleUpdateRoom(editingRoom.id)}
              }}>
                {editingRoom ? 'Update' : 'Add'} Room
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

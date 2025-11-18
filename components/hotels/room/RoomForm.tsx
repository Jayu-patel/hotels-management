"use client"
import { useEffect, useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Crown, Edit, ImageIcon, Plus, Save, Trash2, Upload, X } from 'lucide-react';
import { toast } from 'react-toastify';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getAmenities } from "@/supabase/hotels";
import { supabase } from '@/lib/supabase/client';
import { CitySelector } from '../../city-selector';
import QuillEditor from '@/components/quillEditor'
import { v4 as uuidv4 } from "uuid";

interface RoomImage {
  id: string;
  url: string;
  file?: File;
  is_primary: boolean;
}

interface amenityType{
  id: string,
  name: string
}

interface RoomFormProps {
  room?: any;
  setRoom: (data: any) => void;
  setIsAddDialogOpen: (open: boolean) => void;
  isAddDialogOpen: boolean;
  mode?: 'add' | 'edit' | 'view';
  setFormMode?: (mode: 'add' | 'edit' | 'view') => void;
  hotel_id?: string;
}

type Policy = {
  id: string;
  title: string;
  description: string;
};

type RoomOption = {
  name: string;
  additional_price: string | number;
  type: string;
};

type Tab = 'basic' | 'amenities' | 'image' | 'policies' | 'options';
const tabOrder: Tab[] = ['basic', 'amenities', 'options', 'image', 'policies'];

const tabFieldMap: Record<Tab, string[]> = {
  basic: ['name', 'description', 'type', 'roomCount', 'capacity', 'price' ],
  amenities: ['amenities'],
  options: ["options"],
  image: ['images'],
  policies: ['policies'],
};

export function RoomManagementForm({
  room,
  setRoom,
  setIsAddDialogOpen,
  isAddDialogOpen,
  mode = room ? 'edit' : 'add',
  setFormMode,
  hotel_id,
}: RoomFormProps) {

  const [formData, setFormData] = useState({
    id: room?.id || '',
    name: room?.name || '',
    description: room?.description || '',
    type: room?.type || '',

    roomCount: room?.roomCount || 1,
    capacity: room?.capacity || 2,
    price: room?.price || 10,

    images: room?.images || [],
    amenities: [] as { id: string; name: string }[],
    policies: room?.policies || [] as { id: string; title: string; description: string }[],
    options: room?.options || [] as RoomOption[]

  });

  useEffect(()=>{
    setFormData({
      id: room?.id || '',
      name: room?.name || '',
      description: room?.description || '',
      type: room?.type || '',
      roomCount: room?.roomCount || 1,
      capacity: room?.capacity || 2,
      price: room?.price || 10,

      images: room?.images || [],
      amenities: room?.amenities || [] as { id: string; name: string }[],
      policies: room?.policies || [] as { id: string; title: string; description: string }[],
      options: room?.options || [] as RoomOption[]
    })

  },[room])

  const [loading, setLoading] = useState(false)
  const [amenitiesOptions, setAmenitiesOptions] = useState<{ label: string; value: string }[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<Tab>('basic');
  const isViewMode = mode === 'view';
  const isEditableMode = mode === 'add' || mode === 'edit';
  const currentIndex = tabOrder.indexOf(activeTab);
  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex < tabOrder.length - 1;
  const [facilities, setFacilities] = useState([{ title: "", items: [""] }])
  const roomTypeOptions = ['Standard', 'Deluxe', 'Suite', 'Premium', 'Executive', 'Presidential'];


const [options, setOptions] = useState<RoomOption[]>([
  { name: "", additional_price: "", type: "" },
]);

const handleOptionChange = (
  index: number,
  field: keyof RoomOption,
  value: string
) => {
  const updated = [...formData.options];
  const val =
    field === "additional_price" ? Number(value) || "" : value;
  updated[index] = { ...updated[index], [field]: val };

  setFormData((prev) => ({ ...prev, options: updated }));
};

const addOption = () => {
  const hasEmpty = formData.options.some(
    (opt: RoomOption) => !opt.name.trim() || !opt.type.trim()
  );

  if (hasEmpty) {
    toast.error("Please fill all fields in existing options before adding a new one.");
    return;
  }

  setFormData((prev) => ({
    ...prev,
    options: [...prev.options, { name: "", additional_price: "", type: "" }],
  }));
};


const removeOption = (index: number) => {
  setFormData((prev) => ({
    ...prev,
    options: prev.options.filter((_: any, i: number) => i !== index),
  }));
};


  const getAllAmenities=async()=>{
    try{
        const {data} = await getAmenities()
        if(data){
            setAmenitiesOptions(data.map((a: amenityType) => ({ label: a.name, value: a.id })))
        }
    }
    catch(err: any){
        toast.error(err)
    }
  }
  
  useEffect(()=>{
    getAllAmenities();
    getCategories();
  }, [])

  const goToPrevious = () => {
    if (isEditableMode) setActiveTab(tabOrder[currentIndex - 1]);
  };

  const goToNext = () => {
    if (hasNext) setActiveTab(tabOrder[currentIndex + 1]);
  };

  const getCategories = async () => {
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const isValid = validateFields();
    if (!isValid){
      toast.error("Please fill required fields!")
      return;
    } 

    try {
      if(mode == "add"){
        handleAddRoom()
      }
      else if(mode == "edit"){
        handleUpdateRoom()
      }

    } catch (error) {
      toast.error('Failed to add new hotel');
    }
  };

  const handleAddRoom = async () => {
    if (formData.images.length === 0) {
      toast.error("Please add at least one image");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("rooms")
        .insert({
          hotel_id: hotel_id, // add hotel id here
          name: formData.name,
          price: formData.price,
          capacity: formData.capacity,
          count: formData.roomCount,
          room_type: formData.type,
          description: formData.description,
          policies: formData.policies
        })
        .select("id")
        .single();

      if (error) throw error;
      const roomId = data?.id;

      if (formData.options.length > 0) {
        const optionsToInsert = formData.options.map((opt: RoomOption) => ({
          room_id: roomId,
          name: opt.name,
          additional_price: Number(opt.additional_price),
          type: opt.type,
        }));

        const { error: optError } = await supabase
          .from("room_options")
          .insert(optionsToInsert);

        if (optError) throw optError;
      }

      const uploadedImages = await Promise.all(
        formData.images.map(async (img: any) => {
          if (!img.file) return img;

          const fileExt = img.file.name.split(".").pop();
          const fileName = `${crypto.randomUUID()}.${fileExt}`;
          const filePath = `room-images/${fileName}`;

          const { data, error: uploadError } = await supabase.storage
            .from("hotels")
            .upload(filePath, img.file);

          if (uploadError) throw uploadError;

          const {
            data: { publicUrl },
          } = supabase.storage.from("hotels").getPublicUrl(filePath);

          return {
            room_id: roomId,
            image_url: publicUrl,
            is_primary: img.is_primary,
          };
        })
      );

      // 3️⃣ Insert images
      const { error: imagesError } = await supabase
        .from("room_images")
        .upsert(uploadedImages);
      if (imagesError) throw imagesError;

      const amenitiesInsert = formData.amenities.map((amenityId) => ({
        room_id: roomId,
        amenity_id: amenityId.id,
      }));

      if (amenitiesInsert.length > 0) {
        const { error: amenitiesError } = await supabase
          .from("room_amenities")
          .upsert(amenitiesInsert);

        if (amenitiesError) throw amenitiesError;
      }
      toast.success("Room added successfully");
    } catch (error: any) {
      toast.error("Error saving hotel: " + error.message);
    } finally {
        setLoading(false);
        setIsAddDialogOpen(false);
        setActiveTab("basic")
    }
  };

  const handleUpdateRoom = async () => {

    if (formData.images.length === 0) {
      toast.error("Please add at least one image");
      return;
    }
    setLoading(true)
    try {
      const { error: updateError } = await supabase
        .from("rooms")
        .update({
          name: formData.name,
          price: formData.price,
          capacity: formData.capacity,
          count: formData.roomCount,
          room_type: formData.type,
          description: formData.description,
          policies: formData.policies
        })
        .eq("id", formData.id);

      if (updateError) throw updateError;

      const { data: existingOptions } = await supabase
      .from("room_options")
      .select("id")
      .eq("room_id", formData.id);

      const existingIds = existingOptions?.map((o : any) => o.id);
      const newOptions = formData.options.filter((o : any) => !o.id);
      const updatedOptions = formData.options.filter((o : any) => o.id);
      const removedIds = existingIds?.filter(
        (id) => !formData.options.some((o : any) => o.id === id)
      );

      if (removedIds && removedIds.length > 0) {
        await supabase.from("room_options").delete().in("id", removedIds);
      }

      for (const opt of updatedOptions) {
        await supabase
          .from("room_options")
          .update({
            name: opt.name,
            additional_price: Number(opt.additional_price),
            type: opt.type,
          })
          .eq("id", opt.id);
      }

      if (newOptions.length > 0) {
        const toInsert = newOptions.map((o: any) => ({
          room_id: formData.id,
          name: o.name,
          additional_price: Number(o.additional_price),
          type: o.type,
        }));
        await supabase.from("room_options").insert(toInsert);
      }

      const { data: existingImages, error: fetchImagesError } = await supabase
        .from("room_images")
        .select("*")
        .eq("room_id", formData.id);

      if (fetchImagesError) throw fetchImagesError;

      const existingImageUrls = existingImages.map((img) => img.image_url);

      // 3️⃣ Find removed images (present in DB but not in form)
      const removedImages = existingImages.filter(
        (img) =>
          !formData.images.some((formImg: any) => formImg.url === img.image_url)
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

      const imagesToUpdate = formData.images.filter((img: any) =>
        existingImageUrls.includes(img.url)
      );

      for (const img of imagesToUpdate) {
        const { error: updateImageError } = await supabase
          .from("room_images")
          .update({ is_primary: img.is_primary })
          .eq("room_id", formData.id)
          .eq("image_url", img.url);

        if (updateImageError) throw updateImageError;
      }

      // 4️⃣ Handle new image uploads
      const newImagesToInsert = await Promise.all(
        formData.images
          .filter((img: any) => !existingImageUrls.includes(img.url))
          .map(async (img: any) => {
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
              } = supabase.storage.from("hotels").getPublicUrl(filePath);

              imageUrl = publicUrl;
            }

            return {
              room_id: formData.id,
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
      await supabase.from("room_amenities").delete().eq("room_id", formData.id);

      const amenitiesInsert = formData.amenities.map((amenity) => ({
        room_id: formData.id,
        amenity_id: amenity.id,
      }));

      if (amenitiesInsert.length > 0) {
        const { error: insertAmenitiesError } = await supabase
          .from("room_amenities")
          .upsert(amenitiesInsert, { onConflict: "room_id, amenity_id" });
        // .insert(amenitiesInsert);
        if (insertAmenitiesError) throw insertAmenitiesError;
      }

      toast.success("Room updated successfully");

    } catch (error: any) {
      console.error(error.message);
      toast.error("Error updating room: " + error.message);
    } finally {
        setLoading(false);
        setIsAddDialogOpen(false);
        setActiveTab("basic")
    }
  };

  const handleClose = () => {
    setIsAddDialogOpen(false);
    setRoom(null)
    setFacilities([{ title: "", items: [""] }])
    setActiveTab("basic")

    setFormData({
      id: '',
      name: '',
      description: '',
      type: '',
      roomCount: 1,
      capacity: 2,
      price: 10,
      images: [],
      amenities: [] as { id: string; name: string }[],
      policies: [] as { id: string; title: string; description: string }[],
      options: [] as RoomOption[]
    })

    setErrors({
        name: '',
        description: '',
        type: '',
        roomCount: '',
        capacity: '',
        price: '',
        images: '',
        amenities: '',
        policies: '',
        options: ''
    })
  };

  const getTitle = () => {
    switch (mode) {
      case 'view':
        return 'View Room';
      case 'edit':
        return 'Edit Room';
      case 'add':
        return 'Add New Room';
      default:
        return room ? 'Edit Hotel' : 'Add New Hotel';
    }
  };

  const [errors, setErrors] = useState({
    name: '',
    description: '',
    type: '',
    roomCount: '',
    capacity: '',
    price: '',
    images: '',
    amenities: '',
    policies: '',
    options: '',
  });

  const isQuillEmpty = (html = '') => {
    if (!html) return true;
    const withoutTags = html.replace(/<[^>]*>/g, '');
    const withoutEntities = withoutTags.replace(/&nbsp;|&#160;/g, ' ');
    return withoutEntities.replace(/\s+/g, '') === '';
  };

  const validateFields = () => {
    const newErrors: typeof errors = {
      name: "",
      description: "",
      type: "",
      roomCount: "",
      capacity: "",
      price: "",
      images: "",
      amenities: "",
      policies: "",
      options: "",
    };

    if (!formData.name.trim()) newErrors.name = "Please enter room name";
    if (isQuillEmpty(formData.description))
      newErrors.description = "Please enter room description";
    if (!formData.type.trim()) newErrors.type = "Please select room type";
    if (!formData.roomCount || formData.roomCount <= 0)
      newErrors.roomCount = "Room count must be greater than 0";
    if (!formData.capacity || formData.capacity <= 0)
      newErrors.capacity = "Capacity must be greater than 0";
    if (!formData.price || formData.price <= 0)
      newErrors.price = "Price must be greater than 0";
    if (!formData.images || formData.images.length === 0)
      newErrors.images = "Please upload at least one image";
    if (!formData.amenities || formData.amenities.length === 0)
      newErrors.amenities = "Please select at least one amenity";

    if (
      !formData?.policies?.length ||
      formData?.policies?.some(
        (p: any) => !p.title.trim() || !p.description.trim()
      )
    ) {
      newErrors.policies = "Add valid policies with title and description";
    }

    if (
      formData.options.some(
        (opt: RoomOption) =>
          !opt.name.trim() ||
          !opt.type.trim()
      )
    ) {
      newErrors.options = "Add valid options with name, type, and price (>= 0)";
    }

    setErrors(newErrors);

    for (const tab of tabOrder) {
      const fields = tabFieldMap[tab];
      if (fields.some((f) => Boolean((newErrors as any)[f]))) {
        setActiveTab(tab);
        break;
      }
    }

    return Object.values(newErrors).every((error) => error === "");
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {   
    const files = event.target.files;
    if (files) {
      Array.from(files).forEach((file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const imageUrl = e.target?.result as string;
          const newImage: RoomImage = {
            id: Math.random().toString(),   // temporary key
            url: imageUrl,                  // preview
            file,                           // keep original File for upload
            is_primary: formData.images.length === 0, // first image primary
          };
          setFormData(prev => ({
            ...prev,
            images: [...prev.images, newImage]
          }));
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const setPrimaryImage = (imageId: string) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.map((img : any) => ({
        ...img,
        is_primary: img.id === imageId
      }))
    }));
  };

  const removeImage = (imageId: string) => {
    setFormData(prev => {
      const newImages = prev.images.filter((img : any) => img.id !== imageId);
      if (newImages.length > 0 && !newImages.find((img : any) => img.is_primary)) {
        newImages[0].is_primary = true;
      }
      return {
        ...prev,
        images: newImages
      };
    });
  };

  const handleChangeQuill = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

const [isAdding, setIsAdding] = useState(false);
const [editingId, setEditingId] = useState<string | null>(null);
const [policyForm, setPolicyForm] = useState({ title: "", description: "" });

function handleEditPolicy(id: string) {
  const policy = formData.policies.find((x: any) => x.id === id);
  if (!policy) return;
  setPolicyForm({ title: policy.title, description: policy.description });
  setIsAdding(true);
  setEditingId(id);
}

  return (
    <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
        setIsAddDialogOpen(open)
        if (!open) handleClose()
      }}>
      <DialogContent className="max-w-[90vw] w-full lg:max-w-[80vw] h-[90vh] max-h-[90vh] overflow-hidden">
        <div className="h-full overflow-y-auto p-2">
          <DialogHeader>
            <DialogTitle className="text-xl flex justify-between font-semibold text-[var(--admin-text-primary)]">
              {getTitle()}
              {isViewMode && setFormMode && (
                <Button
                  onClick={() => {
                    setFormMode("edit");
                  }}
                >
                  Edit
                </Button>
              )}
            </DialogTitle>
          </DialogHeader>
          <div className="border-b border-gray-200 bg-white px-6">
            <div className="flex-1 pb-24">
              <Tabs
                value={activeTab}
                onValueChange={(val) => setActiveTab(val as Tab)}
                className="w-full py-4"
              >
                <TabsList className="flex w-full space-x-2 h-12 bg-gray-100 overflow-x-auto">
                  <TabsTrigger
                    value="basic"
                    className="text-sm font-medium whitespace-nowrap data-[state=active]:bg-[var(--primary)] data-[state=active]:text-white"
                  >
                    Basic Info
                  </TabsTrigger>
                  <TabsTrigger
                    value="amenities"
                    className="text-sm font-medium whitespace-nowrap data-[state=active]:bg-[var(--primary)] data-[state=active]:text-white"
                  >
                    Amenities
                  </TabsTrigger>

                  <TabsTrigger
                    value="options"
                    className="text-sm font-medium whitespace-nowrap data-[state=active]:bg-[var(--primary)] data-[state=active]:text-white"
                  >
                    Options
                  </TabsTrigger>

                  <TabsTrigger
                    value="image"
                    className="text-sm font-medium whitespace-nowrap data-[state=active]:bg-[var(--primary)] data-[state=active]:text-white"
                  >
                    Images
                  </TabsTrigger>
                  
                  {/* <TabsTrigger
                    value="options"
                    className="text-sm font-medium whitespace-nowrap data-[state=active]:bg-[var(--primary)] data-[state=active]:text-white"
                  >
                    Options
                  </TabsTrigger> */}

                  <TabsTrigger
                    value="policies"
                    className="text-sm font-medium whitespace-nowrap data-[state=active]:bg-[var(--primary)] data-[state=active]:text-white"
                  >
                    Policies
                  </TabsTrigger> 
               
                </TabsList>
                <div className="p-6">
                  <TabsContent value="basic" className="space-y-4 mt-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      
                      <div className="space-y-2">
                        <Label htmlFor="name">Room Name</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) =>
                            isEditableMode &&
                            setFormData({ ...formData, name: e.target.value })
                          }
                          disabled={isViewMode}
                          required={!isViewMode}
                          placeholder="Oceanview Paradise Hotel"
                          className="border-2 border-gray-300 bg-gray-50 focus:border-primary focus:ring-0 text-gray-800"
                        />
                        {errors?.name && (
                          <p className="text-sm text-red-600">{errors?.name}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="room-type">Room Type</Label>
                        <div className='w-full'>
                            <Select value={formData.type} onValueChange={(value) => {
                                setFormData({ ...formData, type: value });
                            }}>
                                <SelectTrigger className="w-full border-2 border-gray-300 bg-gray-50 focus:border-primary focus:ring-0 text-gray-800">
                                    <SelectValue placeholder="Select room type" />
                                </SelectTrigger>
                                <SelectContent>
                                {roomTypeOptions.map((type) => (
                                    <SelectItem key={type} value={type}>{type}</SelectItem>
                                ))}
                                </SelectContent>
                            </Select>
                        </div>
                        {errors?.type && (
                          <p className="text-sm text-red-600">{errors?.type}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="capacity">Capacity</Label>
                        <Input
                            id="room-capacity"
                            type="number"
                            value={formData.capacity}
                            className="border-2 border-gray-300 bg-gray-50 focus:border-primary focus:ring-0 text-gray-800"
                            onChange={(e) => {
                                setFormData({ ...formData, capacity: parseInt(e.target.value) })
                            }}
                        />

                        {errors?.capacity && (
                          <p className="text-sm text-red-600">{errors?.capacity}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="room-count">Number of Rooms</Label>
                        <Input
                            id="room-count"
                            type="number"
                            min="1"
                            value={formData.roomCount}
                            className="border-2 border-gray-300 bg-gray-50 focus:border-primary focus:ring-0 text-gray-800"
                            onChange={(e) => {
                                setFormData({ ...formData, roomCount: parseInt(e.target.value) || 1 })
                            }}
                        />
                        {errors?.roomCount && (
                          <p className="text-sm text-red-600">{errors?.roomCount}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="room-price">Price per night</Label>
                        <Input
                            id="room-price"
                            type="number"
                            value={formData.price}
                            className="border-2 border-gray-300 bg-gray-50 focus:border-primary focus:ring-0 text-gray-800"
                            onChange={(e) => {
                                setFormData({ ...formData, price: parseFloat(e.target.value) })
                            }}
                        />
                        {errors?.price && (
                          <p className="text-sm text-red-600">{errors?.price}</p>
                        )}
                      </div>

                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <QuillEditor
                        value={formData.description}
                        onChange={(content) => setFormData({...formData, description: content})}
                      />
                      {errors?.description && (
                        <p className="text-sm text-red-600">{errors?.description}</p>
                      )}
                    </div>

                  </TabsContent>

                  <TabsContent value="amenities" className="space-y-4 mt-0">
                    <div className="space-y-2">
                      <Label htmlFor="hotel-amenities">Amenities</Label>
                      <div className='max-w-80'>
                        <Select
                          value={undefined}
                          onValueChange={(value) => {
                            const selectedAmenity = amenitiesOptions.find(
                              (a) => a.value === value
                            );
                            if (!selectedAmenity) return;
                            if (!formData.amenities.some((a) => a.id === value)) {
                              setFormData({
                                ...formData,
                                // amenities: [...roomForm.amenities, value],
                                amenities: [
                                  ...formData.amenities,
                                  { id: value, name: selectedAmenity.label },
                                ],
                              });
                            }
                            setErrors((prev) => ({ ...prev, amenities: "" }));
                          }}
                        >
                          <SelectTrigger className='w-full'>
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
                      </div>

                      {/* Show selected amenities */}
                      <div className="flex flex-wrap gap-2 mt-2">
                        {formData.amenities.map((amenity) => (
                          <span
                            key={amenity.id}
                            className="px-2 py-1 text-sm bg-gray-200 rounded-full cursor-pointer"
                            onClick={() =>
                              setFormData({
                                ...formData,
                                amenities: formData.amenities.filter(
                                  (a) => a.id !== amenity.id
                                ),
                              })
                            }
                          >
                            {amenity.name} ✕
                          </span>
                        ))}
                      </div>
                      {errors.amenities && (
                        <p className="text-sm text-red-500">
                          {errors.amenities}
                        </p>
                      )}
                    </div>

                  </TabsContent>

                  <TabsContent value="options" className='space-y-4 mt-0'>

                    <div className="border-t pt-6 mt-6">
                      <h3 className="text-lg font-semibold mb-4">Room Options</h3>

                      {formData.options.map((opt: RoomOption, index: number) => (
                        <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3 p-3 border rounded-lg bg-gray-50">
                          {/* Option Name */}
                          <div className="col-span-2">
                            <label className="block text-sm font-medium mb-1">Option Name</label>
                            <input
                              type="text"
                              value={opt.name}
                              onChange={(e) => handleOptionChange(index, "name", e.target.value)}
                              placeholder="e.g. Breakfast included"
                              className="w-full bg-white border rounded-md p-2"
                            />
                          </div>

                          {/* Additional Price */}
                          <div>
                            <label className="block text-sm font-medium mb-1">Additional Price ($)</label>
                            <input
                              type="number"
                              value={opt.additional_price}
                              onChange={(e) => handleOptionChange(index, "additional_price", e.target.value)}
                              placeholder="0"
                              min={0}
                              className="w-full bg-white border rounded-md p-2"
                            />
                          </div>

                          {/* Option Type */}
                          <div>
                            <label className="block text-sm font-medium mb-1">Type</label>
                            <select
                              value={opt.type}
                              onChange={(e) => handleOptionChange(index, "type", e.target.value)}
                              className="w-full bg-white border rounded-md p-2"
                            >
                              <option value="">Select type</option>
                              <option value="meal">Meal</option>
                              <option value="payment">Payment</option>
                              <option value="cancellation">Cancellation</option>
                            </select>
                          </div>

                          {/* Delete Option */}
                          <div className="col-span-4 flex justify-end">
                            <button
                              type="button"
                              onClick={() => removeOption(index)}
                              className="text-sm py-1 px-4 rounded-md cursor-pointer
                                bg-white border border-red-600 text-red-600 
                                  hover:bg-red-600 hover:text-white
                                  transition-all duration-300 ease-in-out
                                  "
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ))}

                      {errors?.options && (
                        <p className="text-sm text-red-600">{errors?.options}</p>
                      )}

                      {/* Add Option Button */}
                      <button
                        type="button"
                        onClick={addOption}
                        className="mt-2 text-sm px-3 py-2 border rounded-md bg-blue-50 hover:bg-blue-100"
                      >
                        + Add Option
                      </button>
                    </div>

                    {/* {errors?.options && (
                      <p className="text-sm text-red-600">{errors?.options}</p>
                    )} */}
                  </TabsContent>

                  <TabsContent value="image" className="space-y-4 mt-0">
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

                      {formData.images.length === 0 ? (
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                          <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-600">
                            No images uploaded yet
                          </p>
                          <p className="text-sm text-gray-500">
                            Click "Upload Images" to add photos
                          </p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {
                          [...formData.images]
                          .sort((a: any, b: any) => (a.is_primary ? -1 : b.is_primary ? 1 : 0))
                          .map((image: any) => (
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
                      {errors?.images && (
                        <p className="text-sm text-red-600">{errors?.images}</p>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="policies" className="space-y-4 mt-0">

                      <div>
                        {formData.policies?.length === 0 && (
                          <div className="mt-6 flex flex-col items-center justify-center border border-dashed rounded-xl py-10 text-gray-500 bg-gray-50">
                            <p className="text-md font-medium">No room policies added yet</p>
                            <p className="text-sm text-gray-400 mt-1">Click below to add your first policy</p>
                          </div>
                        )}

                        {formData.policies.length > 0 && (
                          <div className="mt-6">
                            <h3 className="text-lg font-semibold mb-3 border-b pb-2">Room Policies</h3>
                            <div className="space-y-3">
                              {formData.policies.map((p: any) => (
                                <div
                                  key={p.id}
                                  className="rounded-xl border p-4 shadow-sm bg-white hover:shadow-md transition-all"
                                >
                                  <div className="flex items-start justify-between">
                                    <div>
                                      <p className="font-semibold text-lg text-gray-800">{p.title}</p>
                                      <div
                                        className="prose prose-sm text-gray-600 mt-1 max-w-none [&_ol]:list-disc [&_ol_li]:ml-4"
                                        dangerouslySetInnerHTML={{ __html: p.description }}
                                      />
                                    </div>
                                    <div className="flex gap-2 ml-4">
                                      <Button variant="outline" size="sm" onClick={() => handleEditPolicy(p.id)}>
                                        <Edit className="w-4 h-4" />
                                      </Button>
                                      <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() =>
                                          setFormData((prev) => ({
                                            ...prev,
                                            policies: prev.policies.filter((x: any) => x.id !== p.id),
                                          }))
                                        }
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {!isAdding && (
                          <Button className="my-4" onClick={() => setIsAdding(true)}>
                            Add New
                          </Button>
                        )}

                        {isAdding && (
                          <div className="space-y-2 mt-4 border p-3 rounded-lg">
                            <Label htmlFor="title" className='text-lg'>Policy Title</Label>
                            <Input
                              id="title"
                              placeholder='Policy title'
                              value={policyForm.title}
                              onChange={(e) => setPolicyForm({ ...policyForm, title: e.target.value })}
                              className="border-2 border-gray-300 bg-gray-50 focus:border-primary focus:ring-0 text-gray-800"
                            />

                            <Label htmlFor="description" className='text-lg'>Description</Label>
                            <QuillEditor
                              value={policyForm.description}
                              onChange={(content) => setPolicyForm({ ...policyForm, description: content })}
                              placeholder='Add Policy description here'
                            />

                            <div className="flex gap-2 mt-3">
                              <Button
                                onClick={() => {
                                    if (!policyForm.title.trim()) {
                                      toast.error("Policy title is required");
                                      return;
                                    }
                                    const plainText = policyForm.description.replace(/<[^>]*>/g, "").trim();
                                    if (!plainText) {
                                      toast.error("Policy description is required");
                                      return;
                                    }

                                  if (editingId) {
                                    setFormData((prev) => ({
                                      ...prev,
                                      policies: prev.policies.map((p: any) =>
                                        p.id === editingId
                                          ? { ...p, title: policyForm.title, description: policyForm.description }
                                          : p
                                      ),
                                    }));
                                    setEditingId(null);
                                  } else {
                                    setFormData((prev) => ({
                                      ...prev,
                                      policies: [
                                        ...prev.policies,
                                        { id: uuidv4(), title: policyForm.title, description: policyForm.description },
                                      ],
                                    }));
                                  }

                                  setIsAdding(false);
                                  setPolicyForm({ title: "", description: "" });
                                }}
                              >
                                Save
                              </Button>

                              <Button
                                variant="outline"
                                onClick={() => {
                                  setIsAdding(false);
                                  setPolicyForm({ title: "", description: "" });
                                  setEditingId(null);
                                }}
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        )}

                        {errors?.policies && (
                          <p className="text-sm text-red-600">{errors?.policies}</p>
                        )}
                      </div>
                  </TabsContent>

                </div>
              </Tabs>
            </div>
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-md py-3 px-6 flex justify-between items-center">
              <Button
                variant="outline"
                disabled={!hasPrevious}
                onClick={goToPrevious}
              >
                Previous
              </Button>
              {hasNext ? (
                <Button type="button" onClick={goToNext}>
                  Next
                </Button>
              ) : (
                <Button
                  type="submit"
                  onClick={handleSubmit}
                  className="bg-[var(--primary)] text-white cursor-pointer"
                  disabled={loading}
                >
                  {
                    mode === "edit" 
                    ? loading ? "Updating..." : "Update" : 
                      loading ? "Adding.." : "Add Room"
                  }
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
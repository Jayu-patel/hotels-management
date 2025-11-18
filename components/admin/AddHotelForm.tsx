"use client"
import { useEffect, useState, useRef } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CircleAlert, Crown, Edit, ImageIcon, Plus, Save, Trash2, Upload, X } from 'lucide-react';
import { toast } from 'react-toastify';
import { Card, CardContent, CardHeader } from '../ui/card';
import { Badge } from '../ui/badge';
import { getAmenities } from "@/supabase/hotels";
import { supabase } from '@/lib/supabase/client';
import { CitySelector } from '../city-selector';
import QuillEditor from '@/components/quillEditor'
import { v4 as uuidv4 } from "uuid";

interface HotelImage {
  id: string;
  url: string;
  file?: File;
  is_primary: boolean;
}

interface amenityType{
  id: string,
  name: string
}

interface HotelFormProps {
  hotel?: any;
  setHotel: (data: any) => void;
  setIsAddDialogOpen: (open: boolean) => void;
  isAddDialogOpen: boolean;
  mode?: 'add' | 'edit' | 'view';
  setFormMode?: (mode: 'add' | 'edit' | 'view') => void;
}

type Policy = {
  id: string;
  title: string;
  description: string;
};

type Tab = 'basic' | 'contact' | 'amenities' | 'image' | 'policies';
const tabOrder: Tab[] = ['basic', 'contact', 'amenities', 'image', 'policies'];

const tabFieldMap: Record<Tab, string[]> = {
  basic: ['name', 'description', 'city', 'country', 'latitude', 'longitude', 'location', ],
  contact: ['check_in_time', 'check_out_time', 'phone', 'email'],
  amenities: ['amenities', 'facilities'],
  image: ['images'],
  policies: ['policies'],
};

export function HotelManagementForm({
  hotel,
  setHotel,
  setIsAddDialogOpen,
  isAddDialogOpen,
  mode = hotel ? 'edit' : 'add',
  setFormMode,
}: HotelFormProps) {

  const [formData, setFormData] = useState({
    id: hotel?.id || '',
    name: hotel?.name || '',
    description: hotel?.description || '',
    city: hotel?.destination || '',
    country: hotel?.country || '',
    latitude: hotel?.latitude || 0,
    longitude: hotel?.longitude || 0,
    images: hotel?.images || [],

    location: hotel?.location || "",
    amenities: [] as { id: string; name: string }[],
    facilities: [{ title: "", items: [""] }] as {title: string, items: string[]}[],

    check_in_time: hotel?.check_in_time || "",
    check_out_time: hotel?.check_out_time || "",
    phone: hotel?.phone || "",
    email: hotel?.email || "",

    termCondition: "",
    childPolicy: "",
    refundPolicy: "",

    policies: hotel?.policies || [] as { id: string; title: string; description: string }[],

  });

  useEffect(()=>{
    setFormData({
      id: hotel?.id || '',
      name: hotel?.name || '',
      description: hotel?.description || '',
      city: hotel?.destination || '',
      country: hotel?.country || '',
      latitude: hotel?.latitude || 0,
      longitude: hotel?.longitude || 0,
      images: hotel?.images || [],

      location: hotel?.location || "",
      amenities: hotel?.amenities || [] as { id: string; name: string }[],
      facilities: hotel?.facilities as {title: string, items: string[]}[],

      check_in_time: hotel?.check_in_time || "",
      check_out_time: hotel?.check_out_time || "",
      phone: hotel?.phone || "",
      email: hotel?.email || "",

      termCondition: "",
      childPolicy: "",
      refundPolicy: "",

      policies: hotel?.policies || [] as { id: string; title: string; description: string }[],
    })

    if(hotel?.facilities){
      setFacilities(hotel.facilities)
    }

  },[hotel])

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

  const [isFacilityEdited, setFacilityEdited] = useState(false)

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
        handleSaveHotel()
      }
      else if(mode == "edit"){
        handleUpdateHotel()
      }

    } catch (error) {
      toast.error('Failed to add new hotel');
    }
  };

  const handleSaveHotel = async () => {
    if (formData.images.length === 0) {
      toast.error("Please add at least one image");
      return;
    }

    setLoading(true);
    try {
      const { data: hotelData, error: hotelError } = await supabase
        .from("hotels")
        .insert({
          name: formData.name,
          address: formData.location,
          destination: formData.city,
          description: formData.description,
          status: "active",
          star_rating: 1,
          review_count: 1,
          country: formData.country,
          latitude: formData.latitude,
          longitude: formData.longitude,
          facilities: facilities,
          policies: formData.policies,
          check_in_time: formData.check_in_time,
          check_out_time: formData.check_out_time,
          phone: formData.phone,
          email: formData.email,
        })
        .select("id")
        .single();

      if (hotelError) throw hotelError;

      let hotelId = hotelData?.id;

      // 2️⃣ Upload images to Supabase Storage
      const uploadedImages = await Promise.all(
        formData.images.map(async (img: any) => {
          if (!img.file) return img; // already has URL, skip upload

          const fileExt = img.file.name.split(".").pop();
          const fileName = `${crypto.randomUUID()}.${fileExt}`;

          const { data, error: uploadError } = await supabase.storage
            .from("hotels")
            .upload(fileName, img.file);

          if (uploadError) throw uploadError;

          const {
            data: { publicUrl },
          } = supabase.storage.from("hotels").getPublicUrl(fileName);

          return {
            hotel_id: hotelId,
            image_url: publicUrl,
            is_primary: img.is_primary,
          };
        })
      );

      // 3️⃣ Insert images
      const { error: imagesError } = await supabase
        .from("hotel_images")
        .upsert(uploadedImages);

      if (imagesError) throw imagesError;

      // 4️⃣ Insert hotel amenities
      const amenitiesInsert = formData.amenities.map((amenityId) => ({
        hotel_id: hotelId,
        amenity_id: amenityId?.id,
      }));

      if (amenitiesInsert.length > 0) {
        const { error: amenitiesError } = await supabase
          .from("hotel_amenities")
          .upsert(amenitiesInsert);

        if (amenitiesError) throw amenitiesError;
      }

      toast.success("Hotel added successfully");
      // setIsHotelDialogOpen(false);

    } catch (error: any) {
      toast.error("Error saving hotel: " + error.message);
    } finally {
      setLoading(false);
      setIsAddDialogOpen(false);
      setActiveTab("basic")
    }
  };

  const handleUpdateHotel = async () => {
    if (formData.images.length === 0) {
      toast.error("Please add at least one image");
      return;
    }

    setLoading(true);
    try {
      // 1️⃣ Update hotel basic info
      const { error: updateError } = await supabase
        .from("hotels")
        .update({
          name: formData.name,
          address: formData.location,
          destination: formData.city,
          description: formData.description,
          country: formData.country,
          latitude: formData.latitude,
          longitude: formData.longitude,
          facilities: facilities,
          policies: formData.policies,
          check_in_time: formData.check_in_time,
          check_out_time: formData.check_out_time,
          phone: formData.phone,
          email: formData.email,
        })
        .eq("id", formData.id);

      if (updateError) throw updateError;

      // 2️⃣ Get existing images
      const { data: existingImages, error: fetchImagesError } = await supabase
        .from("hotel_images")
        .select("*")
        .eq("hotel_id", formData.id);

      if (fetchImagesError) throw fetchImagesError;

      const existingImageUrls = existingImages.map((img) => img.image_url);

      // 3️⃣ Find removed images
      const removedImages = existingImages.filter(
        (img) =>
          !formData.images.some((formImg: any) => formImg.url === img.image_url)
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
      const imagesToUpdate = formData.images.filter((img: any) =>
        existingImageUrls.includes(img.url)
      );

      for (const img of imagesToUpdate) {
        const { error: updateImageError } = await supabase
          .from("hotel_images")
          .update({ is_primary: img.is_primary })
          .eq("hotel_id", formData.id)
          .eq("image_url", img.url);

        if (updateImageError) throw updateImageError;
      }

      // 5️⃣ Handle new image uploads
      const newImagesToInsert = await Promise.all(
        formData.images
          .filter((img: any) => !existingImageUrls.includes(img.url))
          .map(async (img: any) => {
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
              hotel_id: formData.id,
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
      await supabase.from("hotel_amenities").delete().eq("hotel_id", formData.id);

      const amenitiesInsert = formData.amenities.map((amenity) => ({
        hotel_id: formData.id,
        amenity_id: amenity.id,
      }));

      if (amenitiesInsert.length > 0) {
        const { error: insertAmenitiesError } = await supabase
          .from("hotel_amenities")
          .insert(amenitiesInsert);

        if (insertAmenitiesError) throw insertAmenitiesError;
      }

      toast.success("Hotel updated successfully");
      // setIsHotelDialogOpen(false);
    } catch (error: any) {
      console.error(error.message);
      toast.error("Error updating hotel: " + error.message);
    } finally {
      setLoading(false);
      setIsAddDialogOpen(false);
      setActiveTab("basic")
    }
  };

  const handleClose = () => {
    setIsAddDialogOpen(false);
    setHotel(null)
    setFacilities([{ title: "", items: [""] }])
    setActiveTab("basic")

    setFormData({
      id: '',
      name: '',
      description: '',
      city: '',
      country: '',
      latitude: 0,
      longitude: 0,
      images: [],

      location: "",
      amenities: [] as { id: string; name: string }[],
      facilities: [] as {title: string, items: string[]}[],

      check_in_time: "",
      check_out_time: "",
      phone: "",
      email: "",

      termCondition: "",
      childPolicy: "",
      refundPolicy: "",

      policies: [] as { id: string; title: string; description: string }[],
    })

    setErrors({
      name: '',
      amenities: '',
      description: '',
      city: '',
      country: '',
      latitude: '',
      longitude: '',
      images: '',
      location: '',
      facilities: '',
      policies: '',
      check_in_time: '',
      check_out_time: '',
      phone: '',
      email: '',
    })
  };

  const getTitle = () => {
    switch (mode) {
      case 'view':
        return 'View Hotel';
      case 'edit':
        return 'Edit Hotel';
      case 'add':
        return 'Add New Hotel';
      default:
        return hotel ? 'Edit Hotel' : 'Add New Hotel';
    }
  };

  const [errors, setErrors] = useState({
    name: '',
    amenities: '',
    description: '',
    city: '',
    country: '',
    latitude: '',
    longitude: '',
    images: '',
    location: '',
    facilities: '',
    policies: '',
    check_in_time: '',
    check_out_time: '',
    phone: '',
    email: '',
  });

  const isQuillEmpty = (html = '') => {
    if (!html) return true;
    const withoutTags = html.replace(/<[^>]*>/g, '');
    const withoutEntities = withoutTags.replace(/&nbsp;|&#160;/g, ' ');
    return withoutEntities.replace(/\s+/g, '') === '';
  };

  const validateFields = () => {
    const newErrors: typeof errors = {
      name: '',
      amenities: '',
      description: '',
      city: '',
      country: '',
      latitude: '',
      longitude: '',
      images: '',
      location: '',
      facilities: '',
      policies: '',
      check_in_time: '',
      check_out_time: '',
      phone: '',
      email: '',
    };

    // if (!formData?.name?.trim()) {
    //   newErrors.name = 'Please enter hotel name';
    // }

    // if (formData.amenities.length === 0) {
    //   newErrors.amenities = 'Select at least one amenity';
    // }
    if (!formData.name.trim()) newErrors.name = 'Please enter hotel name';
    if (isQuillEmpty(formData.description)) newErrors.description = 'Please enter description';
    if (!formData.city.trim()) newErrors.city = 'Please enter city';
    if (!formData.country.trim()) newErrors.country = 'Please enter country';
    if (!formData.location.trim()) newErrors.location = 'Please enter location';

    if (!formData.latitude || isNaN(formData.latitude))
      newErrors.latitude = 'Enter valid latitude';
    if (!formData.longitude || isNaN(formData.longitude))
      newErrors.longitude = 'Enter valid longitude';

    if (!formData.images.length) newErrors.images = 'Add at least one image';
    if (!formData.amenities.length) newErrors.amenities = 'Select at least one amenity';

    if (
      !formData?.facilities?.length ||
      formData?.facilities?.some(
        (f) =>
          !f.title.trim() ||
          !f.items.length ||
          f.items.some((i) => !i.trim())
      )
    ) {
      newErrors.facilities = 'Add valid facilities with title and items';
    }
    
    if (isFacilityEdited) {
      newErrors.facilities = 'Save facilities before submitting the form.';
    }

    if (
      !formData?.policies?.length ||
      formData?.policies?.some(
        (p: any) => !p.title.trim() || !p.description.trim()
      )
    ) {
      newErrors.policies = 'Add valid policies with title and description';
    }

    if (!formData.check_in_time.trim())
      newErrors.check_in_time = 'Please enter check-in time';

    if (!formData.check_out_time.trim())
      newErrors.check_out_time = 'Please enter check-out time';

    // Optional: check that checkout is after checkin
    if (
      formData.check_in_time &&
      formData.check_out_time &&
      formData.check_in_time >= formData.check_out_time
    ) {
      newErrors.check_out_time = 'Check-out time must be later than check-in time';
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Please enter email';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Enter a valid email';
    }

    // Phone validation (10–15 digits)
    if (!formData.phone.trim()) {
      newErrors.phone = 'Please enter phone number';
    } else if (!/^\d{10}$/.test(formData.phone)) {
      newErrors.phone = 'Enter a valid phone number';
    }

    setErrors(newErrors);

    for (const tab of tabOrder) {
      const fields = tabFieldMap[tab];
      if (fields.some((f) => Boolean((newErrors as any)[f]))) {
        setActiveTab(tab);
        break;
      }
    }

    return Object.values(newErrors).every(error => error === '');
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

  const addGroup = () => {
    if (facilities.length === 0) {
      setFacilities([{ title: "", items: [""] }]);
      setFacilityEdited(true)
      return;
    }
    
    const lastFacility = facilities[facilities.length - 1];
    const isTitleEmpty = lastFacility.title.trim() === "";
    const areItemsEmpty = lastFacility.items.some(item => item.trim() === "");
    
    if (isTitleEmpty || areItemsEmpty) {
      toast.error("Please fill the title and all items of the last group before adding a new one.");
      return;
    }
    
    setFacilities([...facilities, { title: "", items: [""] }]);
    setFacilityEdited(true)
  };


  const removeGroup = (i: number) =>{
    setFacilities(facilities.filter((_, x) => x !== i));
    setFacilityEdited(true)
  } 

  const updateTitle = (i: number, v: string) => {
    const arr = [...facilities];
    arr[i].title = v;
    setFacilities(arr);
  };

  const addItem = (i: number) => {
    const arr = [...facilities];
    const items = arr[i].items;

    if (items.length === 0) {
      items.push("");
      setFacilities(arr);
      setFacilityEdited(true);
      return;
    }

    const lastItem = items[items.length - 1];

    if (!lastItem || lastItem.trim() === "") {
      toast.error("Please fill the last item before adding a new one.");
      return;
    }

    items.push("");
    setFacilities(arr);
    setFacilityEdited(true);
  };


  const updateItem = (gi: number, ii: number, v: string) => {
    const arr = [...facilities];
    arr[gi].items[ii] = v;
    setFacilities(arr);
  };

  const removeItem = (gi: number, ii: number) => {
    const arr = [...facilities];
    arr[gi].items.splice(ii, 1);
    setFacilities(arr);
    setFacilityEdited(true)
  };

  const validateFacilities = () => {
    for (let i = 0; i < facilities.length; i++) {
      const group = facilities[i];
      if (!group.title.trim()) {
        toast.error(`Facility group #${i + 1} title cannot be empty`);
        return false;
      }
      for (let j = 0; j < group.items.length; j++) {
        if (!group.items[j].trim()) {
          toast.error(`Facility group #${i + 1}, item #${j + 1} cannot be empty`);
          return false;
        }
      }
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateFacilities()) return;
    setFormData({ ...formData, facilities });
    toast.success("Facilities saved successfully");
    setFacilityEdited(false)
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
    <Dialog
      open={isAddDialogOpen}
      onOpenChange={(open) => {
        setIsAddDialogOpen(open);
        if (!open) handleClose();
      }}
    >
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
                    value="contact"
                    className="text-sm font-medium whitespace-nowrap data-[state=active]:bg-[var(--primary)] data-[state=active]:text-white"
                  >
                    Contact
                  </TabsTrigger>
                  <TabsTrigger
                    value="amenities"
                    className="text-sm font-medium whitespace-nowrap data-[state=active]:bg-[var(--primary)] data-[state=active]:text-white"
                  >
                    Amenities
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
                        <Label htmlFor="name">Hotel Name</Label>
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
                        <Label htmlFor="location">Location</Label>
                        <Input
                          id="location"
                          value={formData.location}
                          onChange={(e) =>
                            isEditableMode &&
                            setFormData({
                              ...formData,
                              location: e.target.value,
                            })
                          }
                          disabled={isViewMode}
                          placeholder="Street 1, Sector 28"
                          className="border-2 border-gray-300 bg-gray-50 focus:border-primary focus:ring-0 text-gray-800"
                        />
                        {errors?.location && (
                          <p className="text-sm text-red-600">
                            {errors?.location}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="city">City</Label>
                        {/* <Input
                          id="country"
                          value={formData.country}
                          onChange={(e) =>
                            isEditableMode &&
                            setFormData({
                              ...formData,
                              country: e.target.value,
                            })
                          }
                          disabled={isViewMode}
                          placeholder="India"
                          className="border-2 border-gray-300 bg-gray-50 focus:border-primary focus:ring-0 text-gray-800"
                        /> */}
                        <CitySelector
                          city={formData.city}
                          setCity={(val) =>
                            setFormData((prev) => ({ ...prev, city: val }))
                          }
                          country={formData.country}
                          setCountry={(val) =>
                            setFormData((prev) => ({ ...prev, country: val }))
                          }
                        />
                        {errors?.city && (
                          <p className="text-sm text-red-600">{errors?.city}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="country">Country</Label>
                        {/* <Input
                          id="city"
                          value={formData.city}
                          onChange={(e) =>
                            isEditableMode &&
                            setFormData({ ...formData, city: e.target.value })
                          }
                          disabled={isViewMode}
                          placeholder="Mumbai"
                          className="border-2 border-gray-300 bg-gray-50 focus:border-primary focus:ring-0 text-gray-800"
                        /> */}

                        <input
                          type="text"
                          value={formData.country}
                          placeholder="Country"
                          disabled
                          className="w-full px-2 py-1 border rounded bg-gray-100 cursor-not-allowed"
                        />
                        {errors?.country && (
                          <p className="text-sm text-red-600">
                            {errors?.country}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      {/* <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) =>
                          isEditableMode &&
                          setFormData({...formData, description: e.target.value})
                        }
                        disabled={isViewMode}
                        placeholder="Describe the hotel, its amenities, and unique features"
                        rows={4}
                        className="border-2 border-gray-300 bg-gray-50 focus:border-primary focus:ring-0 text-gray-800"
                      /> */}
                      <QuillEditor
                        value={formData.description}
                        onChange={(content) =>
                          setFormData({ ...formData, description: content })
                        }
                      />
                      {errors?.description && (
                        <p className="text-sm text-red-600">
                          {errors?.description}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="latitude">Latitude</Label>
                        <Input
                          id="latitude"
                          type="number"
                          value={formData.latitude ?? ""}
                          onChange={(e) => {
                            const value = e.target.value;
                            isEditableMode &&
                              setFormData({
                                ...formData,
                                latitude:
                                  value === "" ? null : parseFloat(value),
                              });
                          }}
                          disabled={isViewMode}
                          className="border-2 border-gray-300 bg-gray-50 focus:border-primary focus:ring-0 text-gray-800"
                        />
                        {errors?.latitude && (
                          <p className="text-sm text-red-600">
                            {errors?.latitude}
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="longitude">Longitude</Label>
                        <Input
                          id="longitude"
                          type="number"
                          value={formData.longitude ?? ""}
                          onChange={(e) => {
                            const value = e.target.value;
                            isEditableMode &&
                              setFormData({
                                ...formData,
                                longitude:
                                  value === "" ? null : parseFloat(value),
                              });
                          }}
                          disabled={isViewMode}
                          className="border-2 border-gray-300 bg-gray-50 focus:border-primary focus:ring-0 text-gray-800"
                        />
                        {errors?.longitude && (
                          <p className="text-sm text-red-600">
                            {errors?.longitude}
                          </p>
                        )}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="contact" className="space-y-4 mt-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Check-in Time */}
                      <div className="space-y-2">
                        <Label htmlFor="check_in_time">Check-in Time</Label>
                        <Input
                          id="check_in_time"
                          type="time"
                          value={formData.check_in_time ?? ""}
                          onChange={(e) =>
                            isEditableMode &&
                            setFormData({
                              ...formData,
                              check_in_time: e.target.value,
                            })
                          }
                          disabled={isViewMode}
                          placeholder="15:00"
                          className="border-2 border-gray-300 bg-gray-50 focus:border-primary focus:ring-0 text-gray-800"
                        />
                        {errors?.check_in_time && (
                          <p className="text-sm text-red-600">
                            {errors?.check_in_time}
                          </p>
                        )}
                      </div>

                      {/* Check-out Time */}
                      <div className="space-y-2">
                        <Label htmlFor="check_out_time">Check-out Time</Label>
                        <Input
                          id="check_out_time"
                          type="time"
                          value={formData.check_out_time ?? ""}
                          onChange={(e) =>
                            isEditableMode &&
                            setFormData({
                              ...formData,
                              check_out_time: e.target.value,
                            })
                          }
                          disabled={isViewMode}
                          placeholder="11:00"
                          className="border-2 border-gray-300 bg-gray-50 focus:border-primary focus:ring-0 text-gray-800"
                        />
                        {errors?.check_out_time && (
                          <p className="text-sm text-red-600">
                            {errors?.check_out_time}
                          </p>
                        )}
                      </div>

                      {/* Phone Number */}
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={formData.phone ?? ""}
                          onChange={(e) =>
                            isEditableMode &&
                            setFormData({ ...formData, phone: e.target.value })
                          }
                          disabled={isViewMode}
                          placeholder="+1 (555) 123-4567"
                          className="border-2 border-gray-300 bg-gray-50 focus:border-primary focus:ring-0 text-gray-800"
                        />
                        {errors?.phone && (
                          <p className="text-sm text-red-600">
                            {errors?.phone}
                          </p>
                        )}
                      </div>

                      {/* Email */}
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email ?? ""}
                          onChange={(e) =>
                            isEditableMode &&
                            setFormData({ ...formData, email: e.target.value })
                          }
                          disabled={isViewMode}
                          placeholder="info@grandluxuryhotel.com"
                          className="border-2 border-gray-300 bg-gray-50 focus:border-primary focus:ring-0 text-gray-800"
                        />
                        {errors?.email && (
                          <p className="text-sm text-red-600">
                            {errors?.email}
                          </p>
                        )}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="amenities" className="space-y-4 mt-0">
                    <div className="space-y-2">
                      <Label htmlFor="hotel-amenities">Amenities</Label>
                      <div className="max-w-80">
                        <Select
                          value={undefined}
                          onValueChange={(value) => {
                            const selectedAmenity = amenitiesOptions.find(
                              (a) => a.value === value
                            );
                            if (!selectedAmenity) return;
                            if (
                              !formData.amenities.some((a) => a.id === value)
                            ) {
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
                          <SelectTrigger className="w-full">
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

                    <div className="space-y-3 border-t pt-4">
                      <Label className="text-base font-semibold">
                        Facilities
                      </Label>

                      {facilities.map((group, groupIndex) => (
                        <Card
                          key={groupIndex}
                          className="border border-gray-200 shadow-sm rounded-xl"
                        >
                          <CardHeader className="flex justify-between items-center">
                            <Input
                              placeholder="Facility Title (e.g. Parking)"
                              value={group.title}
                              onChange={(e) =>{
                                setFacilityEdited(true)
                                updateTitle(groupIndex, e.target.value)
                              }}
                              className="text-lg md:text-xl font-semibold"
                            />
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => removeGroup(groupIndex)}
                            >
                              <Trash2 size={16} className="text-red-500" />
                            </Button>
                          </CardHeader>

                          <CardContent className="space-y-2">
                            {group.items.map((item, itemIndex) => (
                              <div
                                key={itemIndex}
                                className="flex gap-2 items-center"
                              >
                                <Input
                                  placeholder="Item (e.g. Valet parking)"
                                  value={item}
                                  onChange={(e) =>{
                                    setFacilityEdited(true)
                                    updateItem(
                                      groupIndex,
                                      itemIndex,
                                      e.target.value
                                    )
                                  }}
                                />
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() =>
                                    removeItem(groupIndex, itemIndex)
                                  }
                                >
                                  <Trash2 size={14} className="text-red-500" />
                                </Button>
                              </div>
                            ))}

                            <Button
                              variant="secondary"
                              onClick={() => addItem(groupIndex)}
                              className="mt-2 w-full"
                            >
                              <Plus size={14} /> Add Item
                            </Button>
                          </CardContent>
                        </Card>
                      ))}

                      {
                        isFacilityEdited &&
                        <div className='flex gap-1 items-center'>
                          <p className='text-sm text-gray-500 font-semibold ml-2'>Click the Save button to apply your changes</p>
                          <CircleAlert className='w-5 h-5 text-red-500' />
                        </div>
                      }

                      <div className="flex gap-2">
                        <Button
                          onClick={addGroup}
                          className="flex items-center gap-1"
                        >
                          <Plus size={16} /> Add Facility Group
                        </Button>

                        {facilities.length > 0 && isFacilityEdited && (
                          <Button
                            onClick={handleSave}
                            className="flex items-center gap-1"
                          >
                            <Save size={16} /> Save Facilities
                          </Button>
                        )}
                      </div>
                      {errors?.facilities && (
                        <p className="text-sm text-red-600">
                          {errors?.facilities}
                        </p>
                      )}
                    </div>
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
                          {[...formData.images]
                            .sort((a: any, b: any) =>
                              a.is_primary ? -1 : b.is_primary ? 1 : 0
                            )
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
                                        onClick={() =>
                                          setPrimaryImage(image.id)
                                        }
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

                  {/* <TabsContent value="options" className="space-y-4 mt-0">
                    <div className="space-y-4">
                      {formData?.options?.map((option: any, index: number) => (
                        <div
                          key={index}
                          className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end border p-4 rounded-md"
                        >
                          <div className="space-y-2">
                            <Label>Option Name *</Label>
                            <Input
                              value={option.name || ""}
                              onChange={(e) => {
                                const newOptions = [...formData?.options];
                                newOptions[index].name = e.target.value;
                                setFormData({
                                  ...formData,
                                  options: newOptions,
                                });
                              }}
                              disabled={isViewMode}
                              placeholder="Enter option name"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Duration *</Label>
                            <Input
                              type="number"
                              value={option.duration || ""}
                              onChange={(e) => {
                                const newOptions = [...formData?.options];
                                newOptions[index].duration = e.target.value;
                                setFormData({
                                  ...formData,
                                  options: newOptions,
                                });
                              }}
                              disabled={isViewMode}
                              placeholder="Enter duration (mins)"
                            />
                          </div>
                          <div className="flex justify-end">
                            <Button
                              type="button"
                              variant="destructive"
                              onClick={() => {
                                const newOptions = formData?.options?.filter(
                                  (_: any, i: number) => i !== index
                                );
                                setFormData({
                                  ...formData,
                                  options: newOptions,
                                });
                              }}
                              disabled={isViewMode}
                            >
                              <Trash2 />
                            </Button>
                          </div>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="default"
                        onClick={() => {
                          const newOption = { name: "", duration: "" };
                          setFormData({
                            ...formData,
                            options: [...(formData.options || []), newOption],
                          });
                        }}
                        disabled={isViewMode}
                      >
                        + Add Option
                      </Button>
                    </div>
                  </TabsContent> */}

                  <TabsContent value="policies" className="space-y-4 mt-0">
                    {/* <div className="space-y-2">
                      <Label htmlFor="termCondition">Terms & Conditions</Label>
                      <QuillEditor value={formData.termCondition} onChange={(content)=> handleChangeQuill("termCondition", content)}/>
                    </div> */}

                    <div>
                      {formData.policies?.length === 0 && (
                        <div className="mt-6 flex flex-col items-center justify-center border border-dashed rounded-xl py-10 text-gray-500 bg-gray-50">
                          <p className="text-md font-medium">
                            No hotel policies added yet
                          </p>
                          <p className="text-sm text-gray-400 mt-1">
                            Click below to add your first policy
                          </p>
                        </div>
                      )}

                      {formData.policies.length > 0 && (
                        <div className="mt-6">
                          <h3 className="text-lg font-semibold mb-3 border-b pb-2">
                            Hotel Policies
                          </h3>
                          <div className="space-y-3">
                            {formData.policies.map((p: any) => (
                              <div
                                key={p.id}
                                className="rounded-xl border p-4 shadow-sm bg-white hover:shadow-md transition-all"
                              >
                                <div className="flex items-start justify-between">
                                  <div>
                                    <p className="font-semibold text-lg text-gray-800">
                                      {p.title}
                                    </p>
                                    <div
                                      className="prose prose-sm text-gray-600 mt-1 max-w-none [&_ol]:list-disc [&_ol_li]:ml-4"
                                      dangerouslySetInnerHTML={{
                                        __html: p.description,
                                      }}
                                    />
                                  </div>
                                  <div className="flex gap-2 ml-4">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleEditPolicy(p.id)}
                                    >
                                      <Edit className="w-4 h-4" />
                                    </Button>
                                    <Button
                                      variant="destructive"
                                      size="sm"
                                      onClick={() =>
                                        setFormData((prev) => ({
                                          ...prev,
                                          policies: prev.policies.filter(
                                            (x: any) => x.id !== p.id
                                          ),
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
                        <Button
                          className="my-4"
                          onClick={() => setIsAdding(true)}
                        >
                          Add New
                        </Button>
                      )}

                      {isAdding && (
                        <div className="space-y-2 mt-4 border p-3 rounded-lg">
                          <Label htmlFor="title" className="text-lg">
                            Policy Title
                          </Label>
                          <Input
                            id="title"
                            value={policyForm.title}
                            placeholder="Enter title"
                            onChange={(e) =>
                              setPolicyForm({
                                ...policyForm,
                                title: e.target.value,
                              })
                            }
                            className="border-2 border-gray-300 bg-gray-50 focus:border-primary focus:ring-0 text-gray-800"
                          />

                          <Label htmlFor="description" className="text-lg">
                            Description
                          </Label>
                          <QuillEditor
                            value={policyForm.description}
                            placeholder="Enter description"
                            onChange={(content) =>
                              setPolicyForm({
                                ...policyForm,
                                description: content,
                              })
                            }
                          />

                          <div className="flex gap-2 mt-3">
                            <Button
                              onClick={() => {
                                if (!policyForm.title.trim()) {
                                  toast.error("Policy title is required");
                                  return;
                                }
                                const plainText = policyForm.description
                                  .replace(/<[^>]*>/g, "")
                                  .trim();
                                if (!plainText) {
                                  toast.error("Policy description is required");
                                  return;
                                }

                                if (editingId) {
                                  setFormData((prev) => ({
                                    ...prev,
                                    policies: prev.policies.map((p: any) =>
                                      p.id === editingId
                                        ? {
                                            ...p,
                                            title: policyForm.title,
                                            description: policyForm.description,
                                          }
                                        : p
                                    ),
                                  }));
                                  setEditingId(null);
                                } else {
                                  setFormData((prev) => ({
                                    ...prev,
                                    policies: [
                                      ...prev.policies,
                                      {
                                        id: uuidv4(),
                                        title: policyForm.title,
                                        description: policyForm.description,
                                      },
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
                        <p className="text-sm text-red-600">
                          {errors?.policies}
                        </p>
                      )}
                    </div>
                  </TabsContent>
                  {/* 
                  <TabsContent value='policies' className='space-y-4 mt-0'>
                    <div className="flex flex-col gap-2 border p-4 rounded-md">
                      <label className="font-semibold">Hotel Policies</label>
                      {policies.map((p, idx) => (
                        <div key={idx} className="flex gap-2 items-center">
                          <Input
                            placeholder="Policy Name"
                            value={p.key}
                            onChange={(e) => updatePolicyKey(idx, e.target.value)}
                          />
                          <Input
                            placeholder="Policy Value"
                            value={p.value}
                            onChange={(e) => updatePolicyValue(idx, e.target.value)}
                          />
                          <Button
                            size={'icon'}
                            variant={"ghost"}
                            onClick={() => removePolicy(idx)}
                          >
                            <Trash2 size={14} className="text-red-500" />
                          </Button>
                        </div>
                      ))}
                      <Button type="button" onClick={addPolicy} className="mt-2">
                        Add Policy
                      </Button>
                    </div>
                  </TabsContent> */}
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
                  {mode === "edit"
                    ? loading
                      ? "Updating..."
                      : "Update"
                    : loading
                    ? "Adding.."
                    : "Add Hotel"}
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
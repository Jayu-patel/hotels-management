"use client"
import { useEffect, useState, useRef } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Switch } from '../../components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Crown, ImageIcon, Plus, Save, Trash2, Upload, X } from 'lucide-react';
import { toast } from 'react-toastify';
import { Card, CardContent, CardHeader } from '../ui/card';
import { Badge } from '../ui/badge';
import { getAmenities } from "@/supabase/hotels";


interface ImageUploadRef {
  uploadImages: () => Promise<{ url: string }[]>;
}

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

interface VideoUploadRef {
  uploadVideos: () => Promise<{ url: string }[]>;
}

interface TourFormProps {
  tour?: any;
  setTours: (data: any) => void;
  setIsAddDialogOpen: (open: boolean) => void;
  isAddDialogOpen: boolean;
  mode?: 'add' | 'edit' | 'view';
  setFormMode?: (mode: 'add' | 'edit' | 'view') => void;
}

type Tab = 'basic' | 'details' | 'image' | 'video' | 'options' | 'policies';
const tabOrder: Tab[] = ['basic', 'details', 'image', 'video', 'options', 'policies'];

export function TourManagementForm({
  tour,
  setTours,
  setIsAddDialogOpen,
  isAddDialogOpen,
  mode = tour ? 'edit' : 'add',
  setFormMode,
}: TourFormProps) {
  const [formData, setFormData] = useState({
    id: tour?.id || '',
    code: tour?.code || '',
    name: tour?.name || '',
    description: tour?.description || '',
    cityId: tour?.cityId || '',
    city: tour?.city || '',
    countryId: tour?.countryId || '',
    country: tour?.country || '',
    latitude: tour?.latitude || 0,
    longitude: tour?.longitude || 0,
    usefulInfo: tour?.usefulInfo || '',
    termCondition: tour?.termCondition || '',
    seoTitle: tour?.seoTitle || '',
    seoKeyword: tour?.seoKeyword || '',
    seoDescription: tour?.seoDescription || '',
    seoData: tour?.seoData || '',
    isRecommended: tour?.isRecommended || false,
    status: tour?.status || 'Draft',
    isActive: tour?.isActive ?? true,
    currencyId: tour?.currencyId || '',
    shortName: tour?.shortName || '',
    noShowValueType: tour?.noShowValueType || '',
    noShowValue: tour?.noShowValue || '',
    childPolicy: tour?.childPolicy || '',
    refundPolicy: tour?.refundPolicy || '',
    images: tour?.images || [],
    videos: tour?.videos || [],
    options: tour?.options ?? [],
    tourCategories: tour?.tourCategories || [],
    tourBuyingPriceModel: tour?.tourBuyingPriceModel || [],
    transferTypes: tour?.transferTypes || [],
    tourSlabs: tour?.tourSlabs || [],
    tariffMaster: tour?.tariffMaster || [],
    cancellationPolicyId: tour?.cancellationPolicyId || '',
    createdAt: tour?.createdAt || '',
    updatedAt: tour?.updatedAt || '',

    amenities: [] as { id: string; name: string }[],
    facilities: [{ title: "", items: [""] }] as {title: string, items: [string]}[]
  });

  const [amenitiesOptions, setAmenitiesOptions] = useState<{ label: string; value: string }[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<Tab>('basic');
  const isViewMode = mode === 'view';
  const isEditableMode = mode === 'add' || mode === 'edit';
  const currentIndex = tabOrder.indexOf(activeTab);
  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex < tabOrder.length - 1;
  const [facilities, setFacilities] = useState([{ title: "", items: [""] }])

  // Refs with explicit types
  const imageUploadRef = useRef<ImageUploadRef>(null);
  const videoUploadRef = useRef<VideoUploadRef>(null);

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
    getAllAmenities()
  }, [])

  const goToPrevious = () => {
    if (isEditableMode) setActiveTab(tabOrder[currentIndex - 1]);
  };

  const goToNext = () => {
    if (hasNext) setActiveTab(tabOrder[currentIndex + 1]);
  };

  const selectedCategories = (value: any) => {
    setFormData((prev: any) => ({ ...prev, tourCategories: value }));
  };


  const getCategories = async () => {
  };

  useEffect(() => {
    getCategories();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let updatedFormData = { ...formData };

      // // Upload images
      // if (imageUploadRef.current) {
      //   const uploadedImages = await imageUploadRef.current.uploadImages();
      //   updatedFormData = { ...updatedFormData, images: uploadedImages };
      // }

      // // Upload videos
      // if (videoUploadRef.current) {
      //   const uploadedVideos = await videoUploadRef.current.uploadVideos();
      //   updatedFormData = { ...updatedFormData, videos: uploadedVideos };
      // }
      const isValid = validateFields();
    } catch (error) {
      console.error(error);
      toast.error('Failed to save tour');
    }
  };

  const handleClose = () => {
    setIsAddDialogOpen(false);
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
        return tour ? 'Edit Hotel' : 'Add New Hotel';
    }
  };

  const [errors, setErrors] = useState({
    name: '',
    tourCategories: "",
    amenities: "",
  });
  console.log("errors",errors)

  const validateFields = () => {
    const newErrors: typeof errors = {
      name: '',
      tourCategories: "",
      amenities: ""
    };

    if (!formData?.name?.trim()) {
      newErrors.name = 'Please Enter name';
    }
    if (!formData?.tourCategories) {
      newErrors.tourCategories = 'Please select tourCategories';
    }

    setErrors(newErrors);

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

  //facilities
const addGroup = () => setFacilities([...facilities, { title: "", items: [""] }])
const removeGroup = (i: number) => setFacilities(facilities.filter((_, x) => x !== i))
const updateTitle = (i: number, v: string) => {
  const arr = [...facilities]
  arr[i].title = v
  setFacilities(arr)
}
const addItem = (i: number) => {
  const arr = [...facilities]
  arr[i].items.push("")
  setFacilities(arr)
}
const updateItem = (gi: number, ii: number, v: string) => {
  const arr = [...facilities]
  arr[gi].items[ii] = v
  setFacilities(arr)
}
const removeItem = (gi: number, ii: number) => {
  const arr = [...facilities]
  arr[gi].items.splice(ii, 1)
  setFacilities(arr)
}
const handleSave = async () => {
//   await addOrUpdateFacilities(hotelId, facilities)
}

  return (
    <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
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
                    value="details"
                    className="text-sm font-medium whitespace-nowrap data-[state=active]:bg-[var(--primary)] data-[state=active]:text-white"
                  >
                    Details
                  </TabsTrigger>
                  <TabsTrigger
                    value="image"
                    className="text-sm font-medium whitespace-nowrap data-[state=active]:bg-[var(--primary)] data-[state=active]:text-white"
                  >
                    Images
                  </TabsTrigger>

                  <TabsTrigger
                    value="options"
                    className="text-sm font-medium whitespace-nowrap data-[state=active]:bg-[var(--primary)] data-[state=active]:text-white"
                  >
                    Options
                  </TabsTrigger>
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
                          placeholder='Oceanview Paradise Hotel'
                          className="border-2 border-gray-300 bg-gray-50 focus:border-primary focus:ring-0 text-gray-800"
                        />
                        {errors?.name && (
                          <p className="text-sm text-red-600">{errors?.name}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="city">City</Label>
                        <Input
                          id="city"
                          value={formData.city}
                          onChange={(e) =>
                            isEditableMode &&
                            setFormData({ ...formData, city: e.target.value })
                          }
                          disabled={isViewMode}
                          placeholder='Mumbai'
                          className="border-2 border-gray-300 bg-gray-50 focus:border-primary focus:ring-0 text-gray-800"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="country">Country</Label>
                        <Input
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
                          placeholder='India'
                          className="border-2 border-gray-300 bg-gray-50 focus:border-primary focus:ring-0 text-gray-800"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) =>
                          isEditableMode &&
                          setFormData({
                            ...formData,
                            description: e.target.value,
                          })
                        }
                        disabled={isViewMode}
                        placeholder='Describe the hotel, its amenities, and unique features'
                        rows={4}
                        className="border-2 border-gray-300 bg-gray-50 focus:border-primary focus:ring-0 text-gray-800"
                      />
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
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="details" className="space-y-4 mt-0">
                    <div className="space-y-2">
                      <Label htmlFor="hotel-amenities">Amenities</Label>
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
                              onChange={(e) =>
                                updateTitle(groupIndex, e.target.value)
                              }
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
                                  onChange={(e) =>
                                    updateItem(
                                      groupIndex,
                                      itemIndex,
                                      e.target.value
                                    )
                                  }
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

                      <div className="flex gap-2">
                        <Button
                          onClick={addGroup}
                          className="flex items-center gap-1"
                        >
                          <Plus size={16} /> Add Facility Group
                        </Button>

                        {facilities.length > 0 && (
                          <Button
                            onClick={handleSave}
                            className="flex items-center gap-1"
                          >
                            <Save size={16} /> Save Facilities
                          </Button>
                        )}
                      </div>
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
                          {formData.images.map((image: any) => (
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

                  <TabsContent value="options" className="space-y-4 mt-0">
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
                  </TabsContent>

                  <TabsContent value="policies" className="space-y-4 mt-0">
                    <div className="space-y-2">
                      <Label htmlFor="termCondition">Terms & Conditions</Label>
                      <Textarea
                        id="termCondition"
                        value={formData.termCondition}
                        onChange={(e) =>
                          isEditableMode &&
                          setFormData({
                            ...formData,
                            termCondition: e.target.value,
                          })
                        }
                        disabled={isViewMode}
                        rows={3}
                        className="border-2 border-gray-300 bg-gray-50 focus:border-primary focus:ring-0 text-gray-800"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="childPolicy">Child Policy</Label>
                      <Textarea
                        id="childPolicy"
                        value={formData.childPolicy}
                        onChange={(e) =>
                          isEditableMode &&
                          setFormData({
                            ...formData,
                            childPolicy: e.target.value,
                          })
                        }
                        disabled={isViewMode}
                        rows={3}
                        className="border-2 border-gray-300 bg-gray-50 focus:border-primary focus:ring-0 text-gray-800"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="refundPolicy">Refund Policy</Label>
                      <Textarea
                        id="refundPolicy"
                        value={formData.refundPolicy}
                        onChange={(e) =>
                          isEditableMode &&
                          setFormData({
                            ...formData,
                            refundPolicy: e.target.value,
                          })
                        }
                        disabled={isViewMode}
                        rows={3}
                        className="border-2 border-gray-300 bg-gray-50 focus:border-primary focus:ring-0 text-gray-800"
                      />
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
                  className="bg-[var(--primary)] text-white"
                >
                  {mode === "edit" ? "Update" : "Submit"}
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
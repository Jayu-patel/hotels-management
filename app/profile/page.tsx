'use client';

import React, { useState, useRef, useContext, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/auth-context';
import { User, Mail, Phone, MapPin, Calendar, Edit, Save, X, Camera, Upload } from 'lucide-react';
import { toast } from 'react-toastify';
import Navbar from '@/components/navbar'
import { supabase } from '@/lib/supabase/client';
import PasswordDialog from './ResetPassword';

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
}

export default function ProfilePage() {
  const { user, setUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [formData, setFormData] = useState({
    name: user?.full_name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    dateOfBirth: user?.dob ||  '',
  });
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);

  const getInitials = (name: string) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';
  };

    const validate = () => {
    const newErrors: FormErrors = {};

    // ✅ Name required
    if (!formData.name.trim()) {
      newErrors.name = "Full name is required.";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Enter a valid email address.";
    }

    if (formData.phone && formData.phone.length !== 10) {
      newErrors.phone = "Phone number must be 10 digits.";
    }
    else if(formData.phone && !/^\d+$/.test(formData.phone)){
        newErrors.phone = "Phone number must contain only digits.";
    }

    if (formData.dateOfBirth && isNaN(new Date(formData.dateOfBirth).getTime())) {
      newErrors.dateOfBirth = "Enter a valid date.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const updateUserProfile = async () => {
    const formattedDob = formData.dateOfBirth
      ? new Date(formData.dateOfBirth).toISOString().split("T")[0] // "YYYY-MM-DD"
      : null;

    const { error } = await supabase
        .from('profiles')
        .update({
            full_name: formData.name,
            phone: formData.phone,
            address: formData.address,
            dob: formData.dateOfBirth || null,
        })
        .eq('id', user?.id);

    if (error) throw error;

      setUser((prev) =>
        prev
            ? {
                ...prev,
                full_name: formData.name,
                phone: formData.phone,
                address: formData.address,
                dob: formattedDob,
            }
            : null
      );
  };

  const handleSave = async () => {
    if (!validate()) return;
    try {
      await updateUserProfile()
      setIsEditing(false);
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

    const uploadAvatar = async () => {
        if (!user?.id) return;

        if (selectedFile) {
        const fileExt = selectedFile.name.split(".").pop();
        const fileName = `public/${user.id}-${Date.now()}.${fileExt}`;

        const { data, error: uploadError } = await supabase.storage
            .from("hotels")
            .upload(fileName, selectedFile, {
            cacheControl: "3600",
            upsert: true,
            });

        if (uploadError) throw uploadError;

        const publicUrl = supabase.storage.from("hotels").getPublicUrl(data.path)
            .data.publicUrl;

        const { error: dbError } = await supabase
            .from("profiles")
            .update({ avatar_url: publicUrl })
            .eq("id", user.id);

        if (dbError) throw dbError;
        } else if (selectedAvatar) {
        const { error } = await supabase
            .from("profiles")
            .update({ avatar_url: selectedAvatar })
            .eq("id", user.id);

        if (error) throw error;
        }
    };

    const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setSelectedFile(file); // ✅ keep file for upload
            setSelectedAvatar(URL.createObjectURL(file)); // preview image
        }
    };

    const saveAvatar = async () => {
        try {
            await uploadAvatar();
            setUser(prev => prev ? { ...prev, avatar_url: selectedAvatar ?? prev.avatar_url } : prev);
            setShowAvatarModal(false);
            setSelectedAvatar(null);
            setSelectedFile(null);
            toast.success('Profile picture updated!');
        } catch (error) {
            console.error(error);
            toast.error('Failed to update profile picture');
        }
    };

  const predefinedAvatars = [
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=faces',
    'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=faces',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=faces',
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=faces',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=faces',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=faces',
  ];

  const handleCancel = () => {
    setFormData({
      name: user?.full_name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      address: user?.address || '',
      dateOfBirth: user?.dob ||  '',
    });
    setIsEditing(false);
  };

  function formatToMonthYear(dateString: string) {
    if(dateString){
        const date = new Date(dateString);
        return date.toLocaleString('en-US', { month: 'long', year: 'numeric' });
    }
    }

  useEffect(()=>{
    console.log(user)
  },[user])

  return (
    <div>
        <Navbar/>
        <div className="max-w-4xl mx-auto space-y-6 mt-5">
        <div className="flex justify-between items-center">
            <h1 className="text-3xl">My Profile</h1>
            {!isEditing ? (
            <Button onClick={() => setIsEditing(true)} className="flex items-center gap-2 cursor-pointer">
                <Edit className="h-4 w-4" />
                Edit Profile
            </Button>
            ) : (
            <div className="flex gap-2">
                <Button onClick={handleSave} className="flex items-center gap-2 cursor-pointer">
                <Save className="h-4 w-4" />
                Save Changes
                </Button>
                <Button variant="outline" onClick={handleCancel} className="flex items-center gap-2 cursor-pointer">
                <X className="h-4 w-4" />
                Cancel
                </Button>
            </div>
            )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile Overview */}
            <Card className="lg:col-span-1">
            <CardContent className="p-6 text-center">
                <div className="relative inline-block">
                <Avatar className="h-24 w-24 mx-auto mb-4">
                    {user?.avatar_url && (
                    <AvatarImage src={user.avatar_url} alt={user.full_name} />
                    )}
                    <AvatarFallback className="bg-blue-600 text-white text-2xl">
                    {getInitials(formData.name)}
                    </AvatarFallback>
                </Avatar>
                <Button
                    size="sm"
                    variant="outline"
                    className="absolute bottom-3 right-3 h-8 w-8 rounded-full p-0"
                    onClick={() => setShowAvatarModal(true)}
                >
                    <Camera className="h-4 w-4" />
                </Button>
                </div>
                <h2 className="text-xl mb-2">{formData.name}</h2>
                <p className="text-gray-600 mb-4">{formData.email}</p>
                <div className="text-sm text-gray-500">
                <p>Member since</p>
                <p>{user?.created_at ? formatToMonthYear(user?.created_at) : ""} </p>
                </div>
            </CardContent>
            </Card>

            {/* Profile Details */}
            <Card className="lg:col-span-2">
            <CardHeader>
                <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label htmlFor="name" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Full Name
                    </Label>
                    {isEditing ? (
                    <>
                        <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                        {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                    </>
                    
                    ) : (
                    <p className="text-gray-900">{formData.name}</p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email Address
                    </Label>
                    {isEditing ? (
                    <>
                        <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                        {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                    </>
                    ) : (
                    <p className="text-gray-900">{formData.email}</p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="phone" className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Phone Number
                    </Label>
                    {isEditing ? (
                    <>
                        <Input
                            id="phone"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        />
                        {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
                    </>
                    ) : (
                    <p className="text-gray-900">{formData.phone}</p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="dateOfBirth" className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                        Date of Birth
                    </Label>
                    {isEditing ? (
                    <>
                        <Input
                            id="dateOfBirth"
                            type="date"
                            value={formData.dateOfBirth}
                            onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                        />
                        {errors.dateOfBirth && <p className="text-sm text-red-500">{errors.dateOfBirth}</p>}
                    </>
                    ) : (
                        user?.dob ?
                        <p className="text-gray-900">{new Date(formData.dateOfBirth).toLocaleDateString("en-GB")}</p> :
                        <p className="text-gray-900">-</p>
                    )}
                </div>
                </div>

                <div className="space-y-2">
                <Label htmlFor="address" className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Address
                </Label>
                {isEditing ? (
                <>
                    <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    />
                    {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                </>
                ) : (
                    <p className="text-gray-900">{formData.address}</p>
                )}
                </div>
            </CardContent>
            </Card>
        </div>

        {/* Account Statistics */}
        {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
            <CardContent className="p-6 text-center">
                <div className="text-3xl text-blue-600 mb-2">12</div>
                <p className="text-gray-600">Total Bookings</p>
            </CardContent>
            </Card>

            <Card>
            <CardContent className="p-6 text-center">
                <div className="text-3xl text-green-600 mb-2">$4,890</div>
                <p className="text-gray-600">Total Spent</p>
            </CardContent>
            </Card>

            <Card>
            <CardContent className="p-6 text-center">
                <div className="text-3xl text-purple-600 mb-2">8</div>
                <p className="text-gray-600">Favorite Hotels</p>
            </CardContent>
            </Card>
        </div> */}

        {/* Account Settings */}
        <Card>
            <CardHeader>
            <CardTitle>Account Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
                <div>
                <h4 className="text-sm">Email Notifications</h4>
                <p className="text-xs text-gray-600">Receive booking confirmations and updates</p>
                </div>
                <Button variant="outline" size="sm">Manage</Button>
            </div>

            <Separator />

            {/* <div className="flex justify-between items-center">
                <div>
                <h4 className="text-sm">Privacy Settings</h4>
                <p className="text-xs text-gray-600">Control how your data is used</p>
                </div>
                <Button variant="outline" size="sm">Manage</Button>
            </div> */}

            <Separator />

            <div className="flex justify-between items-center">
                <div>
                <h4 className="text-sm">Change Password</h4>
                <p className="text-xs text-gray-600">Update your account password</p>
                </div>
                <Button variant="outline" size="sm" onClick={()=>{setShowPasswordDialog(true)}}>Change</Button>
            </div>

            <Separator />
{/* 
            <div className="flex justify-between items-center">
                <div>
                <h4 className="text-sm text-red-600">Delete Account</h4>
                <p className="text-xs text-gray-600">Permanently delete your account and data</p>
                </div>
                <Button variant="destructive" size="sm">Delete</Button>
            </div> */}
            </CardContent>
        </Card>

        {/* Avatar Selection Modal */}
        <Dialog open={showAvatarModal} onOpenChange={setShowAvatarModal}>
            <DialogContent className="sm:max-w-md">
            <DialogHeader>
                <DialogTitle>Change Profile Picture</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
                {/* Upload Custom Image */}
                <div className="space-y-4">
                <h4>Upload Custom Image</h4>
                <div className="flex items-center gap-4">
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        className="hidden"
                    />
                    <Button
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-2"
                    >
                    <Upload className="h-4 w-4" />
                    Choose File
                    </Button>
                    {selectedAvatar && (
                    <Avatar className="h-16 w-16">
                        <AvatarImage src={selectedAvatar} alt="Preview" />
                    </Avatar>
                    )}
                </div>
                </div>

                <Separator />

                <div className="space-y-4">
                <h4>Choose from Gallery</h4>
                <div className="grid grid-cols-3 gap-4">
                    {predefinedAvatars.map((avatar, index) => (
                    <button
                        key={index}
                        onClick={() => setSelectedAvatar(avatar)}
                        className={`relative rounded-lg overflow-hidden transition-all ${
                        selectedAvatar === avatar 
                            ? 'ring-2 ring-blue-500 ring-offset-2' 
                            : 'hover:ring-2 hover:ring-gray-300'
                        }`}
                    >
                        <Avatar className="h-16 w-16">
                        <AvatarImage src={avatar} alt={`Avatar ${index + 1}`} />
                        </Avatar>
                    </button>
                    ))}
                </div>
                </div>

                <div className="flex justify-end gap-2">
                <Button
                    variant="outline"
                    onClick={() => {
                    setShowAvatarModal(false);
                    setSelectedAvatar(null);
                    }}
                >
                    Cancel
                </Button>
                <Button onClick={saveAvatar} disabled={!selectedAvatar}>
                    Save
                </Button>
                </div>
            </div>
            </DialogContent>
        </Dialog>
        </div>
        <PasswordDialog open={showPasswordDialog} setOpen={setShowPasswordDialog} />
    </div>
  );
}
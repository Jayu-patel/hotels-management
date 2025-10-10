"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, KeyRound, Mail, MapPin, Phone, User } from "lucide-react"
import { toast } from "react-toastify"
import { supabase } from "@/lib/supabase/client"
import axios from "axios"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

// Utility to check email format
const isValidEmail = (email: string) => /\S+@\S+\.\S+/.test(email)

// ---------------------- Add User Dialog ----------------------
export function AddUserDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
}) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setErrors({ ...errors, [e.target.name]: "" }) // clear error on change
  }

  const validate = () => {
    let newErrors: { [key: string]: string } = {}
    if (!form.name) newErrors.name = "Name is required"
    if (!form.email) newErrors.email = "Email is required"
    else if (!isValidEmail(form.email)) newErrors.email = "Invalid email format"

    if (!form.password) newErrors.password = "Password is required"
    else if (form.password.length < 6)
      newErrors.password = "Password must be at least 6 characters"

    if (!form.confirmPassword)
      newErrors.confirmPassword = "Confirm Password is required"
    else if (form.password !== form.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit =async() => {
    if (!validate()) return
    setLoading(true)
    const to = form.email
    const subject = "Your New Account Has Been Created"
      axios.post("/api/admin/add-user", {
        email: form.email,
        password: form.password,
        full_name: form.name,
        role: "user",
        to, 
        subject, 
      })
      .then(async()=>{
        toast.success("New user has been created!")
        onOpenChange(false)
      })
      .catch((err)=>{
        toast.error(err?.response?.data?.message)
      })
      .finally(()=>{
        setLoading(false)
      })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>

      <DialogContent className="sm:max-w-[480px] rounded-2xl p-6 border border-gray-200 bg-gradient-to-br from-white to-gray-50 shadow-2xl">
        <VisuallyHidden>
          <DialogTitle>Edit User</DialogTitle>
        </VisuallyHidden>

        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold text-gray-800 text-center">
            Add New User
          </DialogTitle>
          <DialogDescription className="text-center text-gray-500">
            Fill in the details below to create a new account.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 mt-4">
          {/* Name */}
          <div>
            <Label htmlFor="name" className="text-gray-700 font-medium flex items-center gap-2">
              <User className="h-4 w-4" />
              Name
            </Label>
            <Input
              id="name"
              name="name"
              value={form.name}
              onChange={handleChange}
              className="mt-1 border-gray-300 focus:ring-2 focus:ring-indigo-400"
              placeholder="John Doe"
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>

          {/* Email */}
          <div>
            <Label htmlFor="email" className="text-gray-700 font-medium flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Email
            </Label>
            <Input
              id="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="mt-1 border-gray-300 focus:ring-2 focus:ring-indigo-400"
              placeholder="john@example.com"
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>

          {/* Password */}
          <div>
            <Label htmlFor="password" className="text-gray-700 font-medium flex items-center gap-2">
              <KeyRound className="h-4 w-4" />
              Password
            </Label>
            <div className="relative mt-1">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={handleChange}
                className="w-full pr-10 border-gray-300 focus:ring-2 focus:ring-indigo-400"
                placeholder="••••••••"
              />
              <button
                type="button"
                aria-label={showPassword ? "Hide password" : "Show password"}
                onClick={() => setShowPassword(p => !p)}
                className="absolute inset-y-0 right-3 flex items-center justify-center focus:outline-none"
              >
                {showPassword ? <EyeOff className="h-4 w-4 text-gray-500" /> : <Eye className="h-4 w-4 text-gray-500" />}
              </button>
            </div>
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
          </div>

          {/* Confirm Password */}
          <div>
            <Label htmlFor="confirmPassword" className="text-gray-700 font-medium flex items-center gap-2">
              <KeyRound className="h-4 w-4" />
              Confirm Password
            </Label>
            <div className="relative mt-1">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                className="w-full pr-10 border-gray-300 focus:ring-2 focus:ring-indigo-400"
                placeholder="••••••••"
              />
              <button
                type="button"
                aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                onClick={() => setShowConfirmPassword(p => !p)}
                className="absolute inset-y-0 right-3 flex items-center justify-center focus:outline-none"
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4 text-gray-500" /> : <Eye className="h-4 w-4 text-gray-500" />}
              </button>
            </div>
            {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
          </div>
        </div>

        <DialogFooter className="mt-6">
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 rounded-lg shadow transition-all"
          >
            {loading ? "Saving..." : "Save User"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------- Edit User Dialog ----------------------
export function EditUserDialog({ user, open, onOpenChange }: { user: any, open: boolean; onOpenChange: (v: boolean) => void }) {
  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    address: user?.address || "",
    mobile: user?.phone || "",
  })
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setErrors({ ...errors, [e.target.name]: "" })
  }

  const validate = () => {
    let newErrors: { [key: string]: string } = {}
    if (!form.name) newErrors.name = "Name is required"
    if (!form.email) newErrors.email = "Email is required"
    else if (!isValidEmail(form.email)) newErrors.email = "Invalid email format"
    if (!form.address) newErrors.address = "Address is required"
    if (!form.mobile) newErrors.mobile = "Mobile is required"
    else if (!/^\d{10}$/.test(form.mobile)) newErrors.mobile = "Mobile must be 10 digits"
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit =async() => {
    if (!validate()) return
    setLoading(true)

    try{
      const { error } = await supabase
        .from('profiles')
        .update({
            full_name: form.name,
            email: form.email,
            phone: form.mobile,
            address: form.address,
        })
        .eq('id', user?.id);
    
      if (error) throw error;
      toast.success("User profile updated successfully!")
      onOpenChange(false)
    }
    catch(err: any){
      toast.error(err.message)
    }
    finally{
      setLoading(false)
    }
  }

  return (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="sm:max-w-[520px] rounded-2xl p-0 border border-gray-200 shadow-2xl">
      <VisuallyHidden>
        <DialogTitle>Edit User</DialogTitle>
      </VisuallyHidden>

      <Card className="border-0 shadow-none">
        <CardHeader className="text-center pt-6">
          <CardTitle className="text-2xl font-semibold text-gray-800">Edit User</CardTitle>
          <DialogDescription className="text-gray-500">
            Update the user details and save your changes below.
          </DialogDescription>
        </CardHeader>

        <CardContent className="space-y-6 px-6 pb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Full Name
              </Label>
              <Input
                id="name"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="John Doe"
                className="border-gray-300 focus:ring-2 focus:ring-indigo-400"
              />
              {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email Address
              </Label>
              <Input
                id="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="john@example.com"
                className="border-gray-300 focus:ring-2 focus:ring-indigo-400"
              />
              {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
            </div>

            {/* Address */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="address" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Address
              </Label>
              <Input
                id="address"
                name="address"
                value={form.address}
                onChange={handleChange}
                placeholder="123 Main Street"
                className="border-gray-300 focus:ring-2 focus:ring-indigo-400"
              />
              {errors.address && <p className="text-sm text-red-500">{errors.address}</p>}
            </div>

            {/* Mobile */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="mobile" className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Mobile Number
              </Label>
              <Input
                id="mobile"
                name="mobile"
                value={form.mobile}
                onChange={handleChange}
                placeholder="+1 234 567 8900"
                className="border-gray-300 focus:ring-2 focus:ring-indigo-400"
              />
              {errors.mobile && <p className="text-sm text-red-500">{errors.mobile}</p>}
            </div>
          </div>
        </CardContent>

        <DialogFooter className="px-6 pb-6">
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 rounded-lg shadow transition-all"
          >
            {loading ? "Saving Changes..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </Card>
    </DialogContent>
  </Dialog>
);

}

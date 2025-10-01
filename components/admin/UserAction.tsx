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
import { Eye, EyeOff } from "lucide-react"
import { toast } from "react-toastify"
import { supabase } from "@/lib/supabase/client"
import { signUp } from "@/supabase/auth"
import axios from "axios"

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
      <DialogTrigger asChild>
        <Button variant="default">Add User</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add User</DialogTitle>
          <DialogDescription>
            Enter details to create a new user.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              name="name"
              value={form.name}
              onChange={handleChange}
            />
            {errors.name && (
              <p className="text-red-500 text-sm">{errors.name}</p>
            )}
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              value={form.email}
              onChange={handleChange}
            />
            {errors.email && (
              <p className="text-red-500 text-sm">{errors.email}</p>
            )}
          </div>
          <div className="relative">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              name="password"
              value={form.password}
              onChange={handleChange}
            />
            <button
              type="button"
              className="absolute right-2 top-8"
              onClick={() => setShowPassword((prev) => !prev)}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4 text-gray-500" />
              ) : (
                <Eye className="h-4 w-4 text-gray-500" />
              )}
            </button>
            {errors.password && (
              <p className="text-red-500 text-sm">{errors.password}</p>
            )}
          </div>
          <div className="relative">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
            />
            <button
              type="button"
              className="absolute right-2 top-8"
              onClick={() => setShowConfirmPassword((prev) => !prev)}
            >
              {showConfirmPassword ? (
                <EyeOff className="h-4 w-4 text-gray-500" />
              ) : (
                <Eye className="h-4 w-4 text-gray-500" />
              )}
            </button>
            {errors.confirmPassword && (
              <p className="text-red-500 text-sm">{errors.confirmPassword}</p>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
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
      <DialogTrigger asChild>
        <Button variant="outline">Edit User</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
          <DialogDescription>
            Update the user details and save changes.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" value={form.name} onChange={handleChange} />
            {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" value={form.email} onChange={handleChange} />
            {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
          </div>
          <div>
            <Label htmlFor="address">Address</Label>
            <Input id="address" name="address" value={form.address} onChange={handleChange} />
            {errors.address && <p className="text-red-500 text-sm">{errors.address}</p>}
          </div>
          <div>
            <Label htmlFor="mobile">Mobile</Label>
            <Input id="mobile" name="mobile" value={form.mobile} onChange={handleChange} />
            {errors.mobile && <p className="text-red-500 text-sm">{errors.mobile}</p>}
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Saving Changes..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

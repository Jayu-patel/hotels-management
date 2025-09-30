"use client"
import React, { useState } from 'react'
import { Button } from './ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Hotel, User, Calendar, Settings, LogOut, LayoutDashboard, Search, Loader2 } from 'lucide-react';
import Link from 'next/link'
import { useAuth } from '@/contexts/auth-context';
import { useConfirm } from '@/contexts/confirmation';
import { toast } from 'react-toastify';

export default function navbar() {
  const { user, logout } = useAuth();
  const confirm = useConfirm();
  const [loading, setLoading] = useState(false);
  const getInitials = (name: string) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';
  }

  const handleLogout=async()=>{
    const ok = await confirm({
      title: "Logout",
      description: "You will need to login again to access your account.",
      confirmText: "Logout",
      intent: "danger"
    });

    if (!ok) return;

    try{
      setLoading(true);
      await logout()
    }
    catch(err: any){
      toast.error(err.message)
    }
    finally{
      setLoading(false);
    }
  }

  return (
    <header className="bg-gray-900 text-white px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href={"/"} className='text-2xl font-bold cursor-pointer'>HotelBook</Link>
        </div>

        {/* <nav className="hidden md:flex items-center gap-8">
            <Link href={"/"}>Home</Link>
            <Link href={"/hotels"}>Hotels</Link>
            <Link href={"/bookings"} prefetch={true}>My Bookings</Link>
        </nav> */}

        <div className="flex items-center gap-4">
          {/* <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
            <Search className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
            <User className="h-5 w-5" />
          </Button> */}
          {/* <Link href={"/login"} className='text-sm px-4 py-2 rounded-md bg-white text-gray-900 hover:bg-gray-100'>Login</Link> */}
          <div className="flex items-center gap-4">
            {!user ? (
              <Button>
                <Link prefetch href={"/login"}>
                  Login
                </Link>
              </Button>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="relative h-10 w-10 rounded-full cursor-pointer hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                    <Avatar className="h-10 w-10">
                      {user.avatar_url && (
                        <AvatarImage src={user.avatar_url} alt={user.full_name} />
                      )}
                      <AvatarFallback className="bg-blue-600 text-white">
                        {getInitials(user.full_name || "Jay")}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  <div className="flex flex-col space-y-1 p-2">
                    <p className="text-sm">{user.full_name}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  
                  <DropdownMenuItem>
                    <Link href={"/profile"} className='flex gap-3 w-full h-full'>
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  
                  {user.role !== 'admin' && (
                    <DropdownMenuItem>
                      <Link href={"/bookings"} className='flex gap-3 w-full h-full'>
                        <Calendar className="mr-2 h-4 w-4" />
                        My Bookings
                      </Link>
                    </DropdownMenuItem>
                  )}
                  
                  {user.role === 'admin' && (
                    <DropdownMenuItem>
                      <Link href={"/admin"} className='flex gap-3 w-full h-full'>
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        Admin Dashboard
                      </Link>
                    </DropdownMenuItem>
                  )}
                  
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} disabled={loading} className='cursor-pointer'>
                    {
                      loading ? <Loader2 className='animate-spin mr-2 h-4 w-4' /> : 
                      <LogOut className="mr-2 h-4 w-4" />
                    }
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

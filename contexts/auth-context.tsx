"use client"
import React, { createContext, useContext, useEffect, useState } from 'react';
import {supabase} from "@/lib/supabase/client"
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';

export type UserRole = 'user' | 'admin';


interface User {
  id: string;
  email: string;
  full_name?: string;
  phone?: string;
  avatar_url?: string | null;
  created_at?: string;
  role: UserRole;
  address?: string | null;
  dob?: string | null;
}

interface AuthContextType {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  loading: boolean;
  logout: () => Promise<void>;
  getUserSession: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const router = useRouter()
  const[user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(false);

  const getUserSession=async()=>{
    if(!user){
      setLoading(true)
      const {data: {user}} = await supabase.auth.getUser()
      if(user){
        const { data } = await supabase.from("profiles").select("*").eq("id", user?.id).single();
        setUser(data)
        console.log(data)
      }
    }
  }

  useEffect(() => {
    getUserSession()
  }, []);

  const logout = async () => {
    setUser(null)
    const {error} = await supabase.auth.signOut()
    if(error){
      throw error
    }
    router.push("/")
  };

  const value = {
    user,
    setUser,
    loading,
    logout,
    getUserSession
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
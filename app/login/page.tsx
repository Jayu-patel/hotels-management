'use client';

import { useAuth } from '@/contexts/auth-context';
import { LoginPage } from '@/components/login/Login';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { toast } from 'react-toastify';

export default function Login() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const redirectTo = searchParams.get("redirectTo");
    if (user) {
      if (user.role === 'admin') {
        router.push('/admin');
      } else {
          if (redirectTo) {
            toast.success("Continue you booking proccess")
            router.push(decodeURIComponent(redirectTo));
          } else {
            router.push("/"); // fallback
          }
      }
    }
  }, [user, router, searchParams]);

  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecting...</p>
        </div>
      </div>
    );
  }

  return( 
    <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-indigo-200 p-4'>
      <LoginPage onForgotPassword={()=>{router.push("/forget")}} />
    </div>
  )
}
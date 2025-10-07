'use client';

import { useAuth } from '@/contexts/auth-context';
import { LoginPage } from '@/components/login/Login';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Login() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      if (user.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/');
      }
    }
  }, [user, router]);

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
      <LoginPage onForgotPassword={()=>{router.push("/forget")}} />;
    </div>
  )
}
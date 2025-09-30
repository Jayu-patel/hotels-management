'use client';

import { useAuth } from '@/contexts/auth-context';
import { LoginPage } from './Login';
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

  const handleAuthSuccess = () => {
  };

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

  return <LoginPage onAuthSuccess={handleAuthSuccess} />;
}
// "use client"

// import type React from "react"

// import { useState } from "react"
// import Link from "next/link"
// import { useRouter } from "next/navigation"

// export default function LoginPage() {
//   const [userType, setUserType] = useState<"user" | "admin">("user")
//   const [email, setEmail] = useState("")
//   const [password, setPassword] = useState("")
//   const [isLoading, setIsLoading] = useState(false)
//   const router = useRouter()

//   const handleLogin = async (e: React.FormEvent) => {
//     e.preventDefault()
//     setIsLoading(true)

//     setTimeout(() => {
//       if (userType === "admin") {
//         router.push("/admin")
//       } else {
//         router.push("/")
//       }
//       setIsLoading(false)
//     }, 1000)
//   }

//   return (
//     <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
//       <div className="sm:mx-auto sm:w-full sm:max-w-md">
//         <Link href="/" className="flex justify-center">
//           <div className="flex items-center space-x-2">
//             <span className="text-2xl font-bold text-gray-900">{"<"}Site Logo{">"}</span>
//           </div>
//         </Link>
//         <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">Sign in to your account</h2>
//         <p className="mt-2 text-center text-sm text-gray-600">
//           Or{" "}
//           <Link href="/signup" className="font-medium text-purple-600 hover:text-purple-500">
//             create a new account
//           </Link>
//         </p>
//       </div>

//       <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
//         <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
//           {/* User Type Toggle */}
//           <div className="mb-6">
//             <div className="flex rounded-lg bg-gray-100 p-1">
//               <button
//                 type="button"
//                 onClick={() => setUserType("user")}
//                 className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors cursor-pointer ${
//                   userType === "user" ? "bg-white text-purple-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
//                 }`}
//               >
//                 User Login
//               </button>
//               <button
//                 type="button"
//                 onClick={() => setUserType("admin")}
//                 className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors cursor-pointer ${
//                   userType === "admin" ? "bg-white text-purple-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
//                 }`}
//               >
//                 Admin Login
//               </button>
//             </div>
//           </div>

//           <form className="space-y-6" onSubmit={handleLogin}>
//             <div>
//               <label htmlFor="email" className="block text-sm font-medium text-gray-700">
//                 Email address
//               </label>
//               <div className="mt-1">
//                 <input
//                   id="email"
//                   name="email"
//                   type="email"
//                   autoComplete="email"
//                   required
//                   value={email}
//                   onChange={(e) => setEmail(e.target.value)}
//                   className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-purple-500 focus:border-purple-500"
//                   placeholder="Enter your email"
//                 />
//               </div>
//             </div>

//             <div>
//               <label htmlFor="password" className="block text-sm font-medium text-gray-700">
//                 Password
//               </label>
//               <div className="mt-1">
//                 <input
//                   id="password"
//                   name="password"
//                   type="password"
//                   autoComplete="current-password"
//                   required
//                   value={password}
//                   onChange={(e) => setPassword(e.target.value)}
//                   className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-purple-500 focus:border-purple-500"
//                   placeholder="Enter your password"
//                 />
//               </div>
//             </div>

//             <div className="flex items-center justify-between">
//               <div className="flex items-center">
//                 <input
//                   id="remember-me"
//                   name="remember-me"
//                   type="checkbox"
//                   className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
//                 />
//                 <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
//                   Remember me
//                 </label>
//               </div>

//               <div className="text-sm">
//                 <a href="#" className="font-medium text-purple-600 hover:text-purple-500">
//                   Forgot your password?
//                 </a>
//               </div>
//             </div>

//             <div>
//               <button
//                 type="submit"
//                 disabled={isLoading}
//                 className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
//               >
//                 {isLoading ? "Signing in..." : `Sign in as ${userType === "admin" ? "Admin" : "User"}`}
//               </button>
//             </div>
//           </form>

//           {userType === "user" && (
//             <div className="mt-6">
//               <div className="relative">
//                 <div className="absolute inset-0 flex items-center">
//                   <div className="w-full border-t border-gray-300" />
//                 </div>
//                 <div className="relative flex justify-center text-sm">
//                   <span className="px-2 bg-white text-gray-500">New to QuickStay?</span>
//                 </div>
//               </div>

//               <div className="mt-6">
//                 <Link
//                   prefetch
//                   href="/signup"
//                   className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
//                 >
//                   Create new account
//                 </Link>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   )
// }

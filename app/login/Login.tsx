// 'use client';

// import React, { useState } from 'react';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// import { Hotel, User } from 'lucide-react';
// import { login, signUp } from '@/supabase/auth';
// import { toast } from 'sonner';
// import { useRouter } from 'next/navigation';

// interface LoginPageProps {
//   onAuthSuccess?: () => void;
// }

// export function LoginPage({ onAuthSuccess }: LoginPageProps) {
//   const [loginEmail, setLoginEmail] = useState('');
//   const [loginPassword, setLoginPassword] = useState('');
//   const [signupEmail, setSignupEmail] = useState('');
//   const [signupPassword, setSignupPassword] = useState('');
//   const [signupName, setSignupName] = useState('');
//   const [error, setError] = useState('');
//   const [loading, setLoading] = useState(false);
//   const router = useRouter()
  
//   const handleLogin = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setError('');
//     setLoading(true);
    
//     try {
//       const {data} = await login(loginEmail, loginPassword);
//       if(data){
//         // router.push("/")
//         if(document)
//         if (typeof window !== "undefined" && window.location) {
//           window.location.reload();
//         }
//       }
//     } 
//     catch (err: any) {
//       setError('Invalid email or password');
//       toast(err)
//     } 
//     finally {
//       setLoading(false);
//     }
//   };

//   const handleSignup = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setError('');
//     setLoading(true);
    
//     try {
//       const {data} = await signUp(signupEmail, signupPassword, signupName, "user");
//       if (onAuthSuccess) {
//         onAuthSuccess();
//       }
//     } catch (err: any) {
//       setError('Failed to create account');
//       toast(err)
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fillDemoCredentials = (type: 'user' | 'admin') => {
//     if (type === 'admin') {
//       setLoginEmail('admin@hotel.com');
//       setLoginPassword('admin123');
//     } else {
//       setLoginEmail('user@test.com');
//       setLoginPassword('user123');
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
//       <div className="w-full max-w-md">
//         <Card>
//           <CardHeader>
//             <CardTitle>Access Your Account</CardTitle>
//             <CardDescription>
//               Login to your account or create a new one
//             </CardDescription>
//           </CardHeader>
//           <CardContent>
//             <Tabs defaultValue="login" className="w-full">
//               <TabsList className="grid w-full grid-cols-2">
//                 <TabsTrigger value="login">Login</TabsTrigger>
//                 <TabsTrigger value="signup">Sign Up</TabsTrigger>
//               </TabsList>
              
//               <TabsContent value="login">
//                 <form onSubmit={handleLogin} className="space-y-4">
//                   <div className="space-y-2">
//                     <Label htmlFor="email">Email</Label>
//                     <Input
//                       id="email"
//                       type="email"
//                       value={loginEmail}
//                       onChange={(e) => setLoginEmail(e.target.value)}
//                       required
//                     />
//                   </div>
//                   <div className="space-y-2">
//                     <Label htmlFor="password">Password</Label>
//                     <Input
//                       id="password"
//                       type="password"
//                       value={loginPassword}
//                       onChange={(e) => setLoginPassword(e.target.value)}
//                       required
//                     />
//                   </div>
                  
//                   {error && (
//                     <div className="text-red-600 text-sm">{error}</div>
//                   )}
                  
//                   <Button 
//                     type="submit" 
//                     className="w-full cursor-pointer" 
//                     disabled={loading}
//                   >
//                     {loading ? 'Signing in...' : 'Sign In'}
//                   </Button>
//                 </form>
//               </TabsContent>
              
//               <TabsContent value="signup">
//                 <form onSubmit={handleSignup} className="space-y-4">
//                   <div className="space-y-2">
//                     <Label htmlFor="signup-name">Full Name</Label>
//                     <Input
//                       id="signup-name"
//                       type="text"
//                       value={signupName}
//                       onChange={(e) => setSignupName(e.target.value)}
//                       required
//                     />
//                   </div>
//                   <div className="space-y-2">
//                     <Label htmlFor="signup-email">Email</Label>
//                     <Input
//                       id="signup-email"
//                       type="email"
//                       value={signupEmail}
//                       onChange={(e) => setSignupEmail(e.target.value)}
//                       required
//                     />
//                   </div>
//                   <div className="space-y-2">
//                     <Label htmlFor="signup-password">Password</Label>
//                     <Input
//                       id="signup-password"
//                       type="password"
//                       value={signupPassword}
//                       onChange={(e) => setSignupPassword(e.target.value)}
//                       required
//                     />
//                   </div>
                  
//                   {error && (
//                     <div className="text-red-600 text-sm">{error}</div>
//                   )}
                  
//                   <Button 
//                     type="submit" 
//                     className="w-full" 
//                     disabled={loading}
//                   >
//                     {loading ? 'Creating account...' : 'Create Account'}
//                   </Button>
//                 </form>
//               </TabsContent>
//             </Tabs>
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   );
// }

'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Eye, EyeOff } from 'lucide-react';
import { login, signUp } from '@/supabase/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// Utility to check email format
const isValidEmail = (email: string) => /\S+@\S+\.\S+/.test(email);

interface LoginPageProps {
  onAuthSuccess?: () => void;
}

export function LoginPage({ onAuthSuccess }: LoginPageProps) {
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [signupName, setSignupName] = useState('');
  const [loginErrors, setLoginErrors] = useState<{ email?: string; password?: string }>({});
  const [signupErrors, setSignupErrors] = useState<{ name?: string; email?: string; password?: string; confirmPassword?: string }>({});
  const [loading, setLoading] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();

  const validateLogin = () => {
    let errors: { email?: string; password?: string } = {};
    if (!loginEmail) errors.email = 'Email is required';
    else if (!isValidEmail(loginEmail)) errors.email = 'Invalid email format';
    if (!loginPassword) errors.password = 'Password is required';
    setLoginErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateSignup = () => {
    let errors: { name?: string; email?: string; password?: string; confirmPassword?: string } = {};
    if (!signupName) errors.name = 'Name is required';
    if (!signupEmail) errors.email = 'Email is required';
    else if (!isValidEmail(signupEmail)) errors.email = 'Invalid email format';
    if (!signupPassword) errors.password = 'Password is required';
    else if (signupPassword.length < 6) errors.password = 'Password must be at least 6 characters';
    if (!signupConfirmPassword) errors.confirmPassword = 'Confirm password is required';
    else if (signupPassword !== signupConfirmPassword) errors.confirmPassword = "Passwords don't match";
    setSignupErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateLogin()) return;

    setLoading(true);
    try {
      const { data } = await login(loginEmail, loginPassword);
      if (data && typeof window !== 'undefined' && window.location) {
        window.location.reload();
      }
    } catch (err) {
      setLoginErrors({ password: 'Invalid email or password' });
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateSignup()) return;

    setLoading(true);
    try {
      const { data } = await signUp(signupEmail, signupPassword, signupName, 'user');
      if (onAuthSuccess) onAuthSuccess();
    } catch (err: any) {
      setSignupErrors({ email: `Failed to create account ${err}` });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-indigo-200 p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-lg border border-indigo-200">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-indigo-700">Welcome Back</CardTitle>
            <CardDescription className="text-gray-600">
              Login to your account or create a new one
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>

              {/* Login Form */}
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      required
                    />
                    {loginErrors.email && <p className="text-red-600 text-sm">{loginErrors.email}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <div className="relative">
                      <Input
                        id="login-password"
                        type={showLoginPassword ? 'text' : 'password'}
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowLoginPassword(!showLoginPassword)}
                        className="absolute right-2 top-2 text-gray-500 hover:text-gray-700"
                      >
                        {showLoginPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    {loginErrors.password && <p className="text-red-600 text-sm">{loginErrors.password}</p>}
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Signing in...' : 'Sign In'}
                  </Button>
                </form>
              </TabsContent>

              {/* Signup Form */}
              <TabsContent value="signup">
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Full Name</Label>
                    <Input
                      id="signup-name"
                      type="text"
                      value={signupName}
                      onChange={(e) => setSignupName(e.target.value)}
                      required
                    />
                    {signupErrors.name && <p className="text-red-600 text-sm">{signupErrors.name}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      required
                    />
                    {signupErrors.email && <p className="text-red-600 text-sm">{signupErrors.email}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <div className="relative">
                      <Input
                        id="signup-password"
                        type={showSignupPassword ? 'text' : 'password'}
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowSignupPassword(!showSignupPassword)}
                        className="absolute right-2 top-2 text-gray-500 hover:text-gray-700"
                      >
                        {showSignupPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    {signupErrors.password && <p className="text-red-600 text-sm">{signupErrors.password}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-confirm">Confirm Password</Label>
                    <div className="relative">
                      <Input
                        id="signup-confirm"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={signupConfirmPassword}
                        onChange={(e) => setSignupConfirmPassword(e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-2 top-2 text-gray-500 hover:text-gray-700"
                      >
                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    {signupErrors.confirmPassword && (
                      <p className="text-red-600 text-sm">{signupErrors.confirmPassword}</p>
                    )}
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Creating account...' : 'Create Account'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
          <div className="p-4 flex justify-center">
            <Link href="/" passHref>
              <Button variant="outline" className="w-full">⬅ Back to Home</Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}

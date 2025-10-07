'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Eye, EyeOff, MoveLeft } from 'lucide-react';
import { login, signUp } from '@/supabase/auth';
import Link from 'next/link';

const isValidEmail = (email: string) => /\S+@\S+\.\S+/.test(email);

export function LoginPage({ onForgotPassword, onAuthSuccess }: { onForgotPassword?: () => void; onAuthSuccess?: () => void }) {
  // Login states
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginErrors, setLoginErrors] = useState<{ email?: string; password?: string }>({});
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [isLoginLoading, setIsLoginLoading] = useState(false);

  // Signup states
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [signupErrors, setSignupErrors] = useState<{ name?: string; email?: string; password?: string; confirmPassword?: string }>({});
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSignupLoading, setIsSignupLoading] = useState(false);

  // Validation functions
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

  // Handlers
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateLogin()) return;
    setIsLoginLoading(true);
    try {
      const { data } = await login(loginEmail, loginPassword);
      if (data && typeof window !== 'undefined') window.location.reload();
    } catch {
      setLoginErrors({ password: 'Invalid email or password' });
    } finally {
      setIsLoginLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateSignup()) return;
    setIsSignupLoading(true);
    try {
      const { data } = await signUp(signupEmail, signupPassword, signupName, 'user');
    } catch (err: any) {
      setSignupErrors({ email: `Failed to create account ${err}` });
    } finally {
      setIsSignupLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1 text-center">
        <CardTitle>Welcome</CardTitle>
        <CardDescription>Sign in to your account or create a new one</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="login" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login" className='cursor-pointer'>Sign In</TabsTrigger>
            <TabsTrigger value="signup" className='cursor-pointer'>Sign Up</TabsTrigger>
          </TabsList>

          {/* Login Form */}
          <TabsContent value="login" className="space-y-4">
            <form onSubmit={handleLogin} className="space-y-4" noValidate>
              <div className="space-y-2">
                <Label htmlFor="login-email">Email</Label>
                <Input
                  id="login-email"
                  type="email"
                  placeholder="Enter your email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                />
                {loginErrors.email && <p className="text-destructive text-sm">{loginErrors.email}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="login-password">Password</Label>
                <div className="relative">
                  <Input
                    id="login-password"
                    type={showLoginPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-2 top-2 text-gray-500 hover:text-gray-700"
                  >
                    {showLoginPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {loginErrors.password && <p className="text-destructive text-sm">{loginErrors.password}</p>}
              </div>

              <Button type="submit" className="w-full cursor-pointer" disabled={isLoginLoading}>
                {isLoginLoading ? 'Signing in...' : 'Sign in'}
              </Button>
            </form>
          </TabsContent>

          {/* Signup Form */}
          <TabsContent value="signup" className="space-y-4">
            <form onSubmit={handleSignup} className="space-y-4" noValidate>
              <div className="space-y-2">
                <Label htmlFor="signup-name">Full Name</Label>
                <Input
                  id="signup-name"
                  type="text"
                  placeholder="Enter your full name"
                  value={signupName}
                  onChange={(e) => setSignupName(e.target.value)}
                />
                {signupErrors.name && <p className="text-destructive text-sm">{signupErrors.name}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-email">Email</Label>
                <Input
                  id="signup-email"
                  type="email"
                  placeholder="Enter your email"
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                />
                {signupErrors.email && <p className="text-destructive text-sm">{signupErrors.email}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-password">Password</Label>
                <div className="relative">
                  <Input
                    id="signup-password"
                    type={showSignupPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowSignupPassword(!showSignupPassword)}
                    className="absolute right-2 top-2 text-gray-500 hover:text-gray-700"
                  >
                    {showSignupPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {signupErrors.password && <p className="text-destructive text-sm">{signupErrors.password}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-confirm">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="signup-confirm"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirm your password"
                    value={signupConfirmPassword}
                    onChange={(e) => setSignupConfirmPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-2 top-2 text-gray-500 hover:text-gray-700"
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {signupErrors.confirmPassword && <p className="text-destructive text-sm">{signupErrors.confirmPassword}</p>}
              </div>

              <Button type="submit" className="w-full cursor-pointer" disabled={isSignupLoading}>
                {isSignupLoading ? 'Creating account...' : 'Create account'}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter>
        <div className='w-full flex flex-col justify-center items-center gap-3'>
        <Button variant="link" className="w-full p-0 h-auto cursor-pointer" onClick={onForgotPassword}>
          Forgot your password?
        </Button>
        <Link href="/" passHref>
            <Button variant="outline" className="w-full cursor-pointer"> <MoveLeft className='mb-[-2px]' /> Back to Home</Button>
        </Link>
        </div>
      </CardFooter>
    </Card>
  );
}

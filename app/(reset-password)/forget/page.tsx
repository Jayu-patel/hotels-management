"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { toast } from "react-toastify";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleForgot = async () => {
    if (!email) return toast.error("Email is required");

    setLoading(true);

    const { data: users, error: userError } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", email)
      .single();

    if (userError || !users) {
      setLoading(false);
      return toast.error("No account found with this email");
    }
    const { error, data } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${location.origin}/reset-password`,
    });
    setLoading(false);

    console.log({
      error,data
    })
    if (error) toast.error(error.message);
    else toast.success("Password reset link sent to your email");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-indigo-100 px-4">
      <div className="w-full max-w-md bg-white p-10 rounded-2xl shadow-lg border border-gray-200">
        <h2 className="text-3xl font-bold mb-6 text-center text-primary">
          Forgot Password
        </h2>
        <p className="text-gray-500 mb-6 text-center">
          Enter your email to receive a password reset link
        </p>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Your email"
          className="w-full p-3 border border-gray-300 rounded-lg mb-6 focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
        <Button
          onClick={handleForgot}
          disabled={loading}
          className="w-full disabled:opacity-60 flex justify-center items-center cursor-pointer"
        >
          {loading ? (
            <svg
              className="animate-spin h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8H4z"
              />
            </svg>
          ) : (
            "Send Reset Link"
          )}
        </Button>
        <p className="mt-6 text-center text-gray-500 text-sm">
          Remember your password?{" "}
          <Link href={"/login"} className="text-indigo-600 hover:underline">Login</Link>
        </p>
      </div>
    </div>
  );
}

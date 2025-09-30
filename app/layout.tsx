import type React from "react"
import type { Metadata } from "next"
// import { Space_Grotesk, DM_Sans } from "next/font/google"
import "./globals.css"
import { AuthProvider2 } from "@/contexts/AuthProvider"
import { AuthProvider } from "@/contexts/auth-context"
import { HotelsProvider } from "@/contexts/hotels-context"
import {ToastContainer} from "react-toastify"
import ConfirmProvider from "@/contexts/confirmation"

// const spaceGrotesk = Space_Grotesk({
//   subsets: ["latin"],
//   display: "swap",
//   variable: "--font-space-grotesk",
// })

// const dmSans = DM_Sans({
//   subsets: ["latin"],
//   display: "swap",
//   variable: "--font-dm-sans",
// })

export const metadata: Metadata = {
  title: "QuickStay - Discover Your Perfect Getaway Destination",
  description: "Find and book luxury hotels and resorts worldwide. Start your journey today with QuickStay.",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`antialiased`}>
      <body>
        <ToastContainer/>
        <AuthProvider2>
          <AuthProvider>
            <ConfirmProvider>
              <HotelsProvider>
                {children}
              </HotelsProvider>
            </ConfirmProvider>
          </AuthProvider>
        </AuthProvider2>
      </body>
    </html>
  )
}

import type React from "react"
import type { Metadata } from "next"
// import { Space_Grotesk, DM_Sans } from "next/font/google"
import "./globals.css"
import { AuthProvider2 } from "@/contexts/AuthProvider"
import { AuthProvider } from "@/contexts/auth-context"
import { HotelsProvider } from "@/contexts/hotels-context"
import {ToastContainer} from "react-toastify"
import ConfirmProvider from "@/contexts/confirmation"
import { CurrencyProvider } from "@/contexts/currency-context"

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
  title: "HotelBook - Discover Your Perfect Getaway Destination",
  description: "Find and book luxury hotels and resorts worldwide. Start your journey today with HotelBook.",
  generator: "figma",
  icons: {
    icon: "hotel-logo.svg"
  }
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
            <CurrencyProvider>
              <ConfirmProvider>
                <HotelsProvider>
                  {children}
                </HotelsProvider>
              </ConfirmProvider>
            </CurrencyProvider>
          </AuthProvider>
        </AuthProvider2>
      </body>
    </html>
  )
}

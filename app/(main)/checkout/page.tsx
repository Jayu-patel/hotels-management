// // app/checkout/page.tsx (Next.js 13+)

// "use client";
// import { useState } from "react";

// export default function CheckoutPage() {
//   const [paymentType, setPaymentType] = useState<"full" | "partial">("full");

//   const bookingData = {
//     hotelName: "Sunset Beach Resort",
//     roomType: "Deluxe Room",
//     checkIn: "2025-11-10",
//     checkOut: "2025-11-13",
//     guests: 2,
//     totalPrice: 68467,
//   };

//   const payableAmount =
//     paymentType === "partial" ? (bookingData.totalPrice * 0.2).toFixed(2) : bookingData.totalPrice;

//   return (
//     <div className="max-w-2xl mx-auto mt-10 p-6 bg-white dark:bg-gray-900 shadow-lg rounded-lg">
//       <h2 className="text-2xl font-semibold mb-4 text-center">Checkout</h2>

//       {/* Booking summary */}
//       <div className="space-y-2 border p-4 rounded-md mb-6">
//         <p><span className="font-semibold">Hotel:</span> {bookingData.hotelName}</p>
//         <p><span className="font-semibold">Room:</span> {bookingData.roomType}</p>
//         <p><span className="font-semibold">Check-in:</span> {bookingData.checkIn}</p>
//         <p><span className="font-semibold">Check-out:</span> {bookingData.checkOut}</p>
//         <p><span className="font-semibold">Guests:</span> {bookingData.guests}</p>
//         <p><span className="font-semibold">Total Price:</span> ${bookingData.totalPrice}</p>
//       </div>

//       {/* Payment options */}
//       <div className="space-y-3 mb-6">
//         <h3 className="font-semibold text-lg">Choose Payment Type</h3>
//         <div className="flex flex-col gap-2">
//           <label className="flex items-center gap-2">
//             <input
//               type="radio"
//               name="paymentType"
//               value="full"
//               checked={paymentType === "full"}
//               onChange={() => setPaymentType("full")}
//               className="accent-blue-600"
//             />
//             Full Payment (100%)
//           </label>

//           <label className="flex items-center gap-2">
//             <input
//               type="radio"
//               name="paymentType"
//               value="partial"
//               checked={paymentType === "partial"}
//               onChange={() => setPaymentType("partial")}
//               className="accent-blue-600"
//             />
//             Partial Payment (20%)
//           </label>
//         </div>
//       </div>

//       {/* Payment summary */}
//       <div className="text-center mb-6">
//         <p className="text-lg font-semibold">
//           Amount to Pay Now: <span className="text-green-600">${payableAmount}</span>
//         </p>
//       </div>

//       {/* Buttons */}
//       <div className="flex justify-center">
//         <button
//           onClick={() => alert(`Redirecting to Stripe (${paymentType} payment)...`)}
//           className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
//         >
//           Proceed to Pay
//         </button>
//       </div>
//     </div>
//   );
// }

// app/checkout/page.tsx
"use client";
import { useEffect, useState } from "react";
import { CreditCard, Calendar, Users } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useHotels } from "@/contexts/hotels-context";
import { toast } from "react-toastify";

export default function CheckoutPage() {
    const params = useSearchParams();
    const router = useRouter()
    const {bookingData, setBookingData} = useHotels()
    const [paymentType, setPaymentType] = useState<"full" | "partial">("full");
    const [payable, setPayable] = useState(bookingData.total_amount ?? 0)

    useEffect(()=>{
        if (!bookingData || Object.keys(bookingData).length === 0) {
            router.push("/")
            toast.error("No Booking selected!!")
        }
    },[])

    const advanceRate = 0.2;
    useEffect(()=>{
        if(paymentType == "partial"){
            setPayable((bookingData.total_amount * advanceRate).toFixed(2))
        }
        else{
            setPayable(bookingData.total_amount)
        }
    },[bookingData, paymentType])

    return (
        <main className="min-h-[calc(100vh-72px)] flex justify-center items-center bg-gray-50 dark:bg-gray-900 p-4">
            <div className="max-w-3xl w-full bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
            
            {/* Header */}
            <div className="bg-primary text-white px-6 py-4 flex items-center justify-between">
                <h1 className="text-2xl font-semibold">Confirm Your Booking</h1>
                <CreditCard className="h-6 w-6" />
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
                
                {/* Booking Summary */}
                <section>
                <h2 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-100">
                    Booking Summary
                </h2>
                <div className="grid md:grid-cols-2 gap-4 text-gray-700 dark:text-gray-300">
                    <div>
                    <p className="font-medium">{bookingData.hotel_name}</p>
                    <p>{bookingData.room_name}</p>
                    </div>
                    <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {/* <span>{bookingData.check_in} → {bookingData.check_out}</span> */}
                        <span>{(new Date(bookingData.check_in)).toLocaleDateString("en-GB")} → {(new Date(bookingData.check_out).toLocaleDateString("en-GB"))}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        <span>{bookingData.guest_count} Guests</span>
                    </div>
                    </div>
                </div>
                </section>

                {/* Payment Type */}
                <section>
                <h2 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-100">
                    Select Payment Type
                </h2>
                <div className="flex flex-col md:flex-row gap-4">
                    <label
                    className={`flex-1 border rounded-xl p-4 cursor-pointer transition ${
                        paymentType === "full"
                        ? "border-blue-600 bg-blue-50 dark:bg-blue-900/40"
                        : "border-gray-300 dark:border-gray-700"
                    }`}
                    >
                    <input
                        type="radio"
                        name="paymentType"
                        value="full"
                        checked={paymentType === "full"}
                        onChange={() => setPaymentType("full")}
                        className="hidden"
                    />
                    <p className="font-semibold text-gray-900 dark:text-gray-100">
                        Full Payment
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Pay 100% now</p>
                    </label>

                    <label
                    className={`flex-1 border rounded-xl p-4 cursor-pointer transition ${
                        paymentType === "partial"
                        ? "border-blue-600 bg-blue-50 dark:bg-blue-900/40"
                        : "border-gray-300 dark:border-gray-700"
                    }`}
                    >
                    <input
                        type="radio"
                        name="paymentType"
                        value="partial"
                        checked={paymentType === "partial"}
                        onChange={() => setPaymentType("partial")}
                        className="hidden"
                    />
                    <p className="font-semibold text-gray-900 dark:text-gray-100">
                        Partial Payment
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Pay {advanceRate * 100}% now
                    </p>
                    </label>
                </div>
                </section>

                {/* Payment Summary */}
                <section className="bg-gray-100 dark:bg-gray-700 rounded-xl p-4 flex justify-between items-center">
                <div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Amount to Pay Now</p>
                    <p className="text-2xl font-semibold text-green-600">${payable}</p>
                </div>
                <div className="text-right">
                    <p className="text-sm text-gray-500">Total Price</p>
                    <p className="text-lg font-medium">${bookingData.total_amount}</p>
                </div>
                </section>

                {/* Pay button */}
                <div className="flex justify-end gap-3">
                <button
                    onClick={() => {
                        router.push('/')
                        setBookingData({})
                    }}
                    className="px-8 py-3 bg-red-500 hover:bg-red-700 text-white font-medium rounded-xl transition cursor-pointer"
                >
                    Cancel Booking
                </button>

                <button
                    className="px-8 py-3 bg-primary hover:bg-blue-700 text-white font-medium rounded-xl transition cursor-pointer"
                >
                    Proceed to Pay
                </button>
                </div>
            </div>
            </div>
        </main>
    );
}

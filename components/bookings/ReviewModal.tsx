"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Star } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "react-toastify"
import { reviewBooking } from "@/supabase/review"

interface Booking {
  id: string
  user_id?: string
  room_id?: string
  room_name: string
  status: "Confirmed" | "Checked In" | "Checked Out" | "Cancelled"
  reviewed?: boolean
  review?: { rating: number; comment: string }
}

export default function ReviewPopup({ booking }: { booking: Booking }) {
  const [open, setOpen] = useState(false)
  const [rating, setRating] = useState(booking.review?.rating || 0)
  const [comment, setComment] = useState(booking.review?.comment || "")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open) {
      setRating(booking.review?.rating || 0)
      setComment(booking.review?.comment || "")
    }
  }, [open, booking.review])

  async function handleSubmit() {
    if (!rating) return toast.error("Select a rating")
    setLoading(true)

    try {
      await reviewBooking({
        bookingId: booking.id,
        user_id: booking.user_id,
        room_id: booking.room_id,
        rating,
        comment
      })

      toast.success(booking.review ? "Review updated" : "Review submitted")
      setOpen(false)
    } 
    catch(err: any) {
      toast.error(err.message)
    } 
    finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          disabled={booking.status !== "Checked Out"}
          className={cn(
            "bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold cursor-pointer"
          )}
        >
          {booking.reviewed ? "Edit Review" : "Review"}
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-md rounded-2xl p-6 bg-white shadow-xl border border-gray-200">
        <DialogHeader className="text-center mb-1">
          <DialogTitle className="text-lg font-medium text-gray-700">Rate Your Stay</DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          <p className="text-2xl font-bold text-cyan-600 text-center">{booking.room_name}</p>

          <div className="flex justify-center gap-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star
                key={i}
                onClick={() => setRating(i)}
                className={cn(
                  "w-9 h-9 cursor-pointer transition-transform duration-200 hover:scale-110",
                  i <= rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                )}
              />
            ))}
          </div>

          <Textarea
            placeholder="Share your experience..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            className="resize-none border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-cyan-400 focus:border-transparent shadow-sm"
          />

          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-bold py-3 rounded-2xl shadow-lg transition-transform hover:scale-105"
          >
            {loading ? "Submitting..." : booking.review ? "Update Review" : "Submit Review"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

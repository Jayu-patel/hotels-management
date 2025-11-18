"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Star } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "react-toastify"
import { reviewBooking } from "@/supabase/review"
import { supabase } from "@/lib/supabase/client"

interface Booking {
  id: string
  user_id?: string
  room_id?: string
  room_name: string
  status: "Confirmed" | "Checked In" | "Checked Out" | "Cancelled"
  reviewed?: boolean
  review?: { title?: string; rating: number; comment: string }
}

export default function ReviewPopup({ booking }: { booking: Booking }) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState(booking.review?.title || "")
  const [rating, setRating] = useState(booking.review?.rating || 0)
  const [comment, setComment] = useState(booking.review?.comment || "")
  const [loading, setLoading] = useState(false)

  const getReview=async()=>{
    const {data, error} = await supabase
      .from("reviews")
      .select("*")
      .eq("user_id", booking.user_id)
      .eq("room_id", booking.room_id)
      .eq("booking_id", booking.id)
      .single()
    
    if(error){
      throw error
    }
    
    if(data){
      setTitle(data.title)
      setRating(data.rating)
      setComment(data.comment)
    }
  }

useEffect(() => {
  if (open && booking.reviewed) {
    try{
      getReview()
    }
    catch(err: any){
      toast.error(err.message)
    }
  }
}, [open, booking])



  async function handleSubmit() {
    if (!rating) return toast.error("Select a rating")
    if (!title.trim()) return toast.error("Enter a review title")
    if (!comment.trim()) return toast.error("Write your review")

    setLoading(true)
    try {
      await reviewBooking({
        bookingId: booking.id,
        user_id: booking.user_id,
        room_id: booking.room_id,
        title,
        rating,
        comment,
        is_edited: !!booking.review,
      })
      toast.success(booking.review ? "Review updated" : "Review submitted")
      setOpen(false)
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          disabled={booking.status !== "Checked Out"}
          className="bg-neutral-800 hover:bg-neutral-700 text-white rounded-md px-4 py-2 text-sm font-medium cursor-pointer"
        >
          {booking.reviewed ? "Edit Review" : "Write Review"}
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-md rounded-lg border border-neutral-200 bg-white shadow-lg p-6">
        <DialogHeader className="text-center mb-4">
          <DialogTitle className="text-lg font-semibold text-neutral-800">Share Your Stay Experience</DialogTitle>
          <p className="text-sm text-neutral-500 mt-1">{booking.room_name}</p>
        </DialogHeader>

        <div className="space-y-5">
          <Input
            placeholder="Short title (e.g. Comfortable and clean)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="border border-neutral-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-neutral-400"
          />

          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star
                key={i}
                onClick={() => setRating(i)}
                className={cn(
                  "w-7 h-7 cursor-pointer transition-transform hover:scale-110",
                  i <= rating ? "text-amber-400 fill-amber-400" : "text-neutral-300"
                )}
              />
            ))}
          </div>

          <Textarea
            placeholder="Write your detailed feedback..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            className="border border-neutral-300 rounded-md text-sm px-3 py-2 focus:outline-none focus:ring-1 focus:ring-neutral-400 resize-none"
          />

          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-neutral-800 hover:bg-neutral-700 text-white text-sm font-medium py-2.5 rounded-md transition-all cursor-pointer"
          >
            {loading ? "Submitting..." : booking.review ? "Update Review" : "Submit Review"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

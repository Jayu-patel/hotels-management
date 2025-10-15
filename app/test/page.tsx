"use client"
import { TourManagementForm } from '@/components/admin/AddHotelForm'
import React, { useState } from 'react'

export default function page() {
    const [open, setOpen] = useState(false)
    const [tour, setTour] = useState([])
    const [mode, setMode] = useState<'add' | 'edit' | 'view'>('add')
    return (
        <div>
            <div>
                <button onClick={()=>{setOpen(!open)}}>Open/Close</button>
            </div>
            <TourManagementForm 
                tour={tour}
                setTours={setTour}
                isAddDialogOpen={open}
                setIsAddDialogOpen={setOpen}
                mode={mode}
                setFormMode={setMode}
            />
        </div>
    )
}

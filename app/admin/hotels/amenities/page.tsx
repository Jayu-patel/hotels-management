'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Pencil, Trash, Plus } from 'lucide-react';
import { getAmenities } from '@/supabase/hotels';
import ResponsiveSkeleton from '@/components/responsiveSkeleton'
import { toast } from 'react-toastify';
import { useConfirm } from '@/contexts/confirmation';
import { supabase } from '@/lib/supabase/client';

interface Amenity {
  id: string;
  name: string;
}

export default function AdminAmenitiesPage() {
  const [amenities, setAmenities] = useState<Amenity[] | []>([]);
  const [editingAmenity, setEditingAmenity] = useState<Amenity | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newAmenityName, setNewAmenityName] = useState('');
  const [fetchLoad, setFetchLoad] = useState(true)
  const [loading, setLoading] = useState(false)
  const confirm = useConfirm();

  const openAddDialog = () => {
    setEditingAmenity(null);
    setNewAmenityName('');
    setIsDialogOpen(true);
  };

  const openEditDialog = (amenity: Amenity) => {
    setEditingAmenity(amenity);
    setNewAmenityName(amenity.name);
    setIsDialogOpen(true);
  };

  const handleSave=async()=>{
    if(!newAmenityName){
      toast.error("Please enter an amenity")
      return
    }

    setLoading(true)
    try{
      const {data, error} = await supabase
        .from("amenities")
        .upsert({
          id: editingAmenity?.id != "" ? editingAmenity?.id : "",
          name: newAmenityName
        })
        .select("id, name")
        .single()
      
      if(error) throw error

      if(editingAmenity){
        toast.success("Amenity updated")
        setAmenities((prev) =>
          prev.map((a) =>
            a.id === editingAmenity.id ? data : a
          )
        );
      }
      else{
        toast.success("New amenity added")
        setAmenities([ data, ...amenities]);
      }
    }
    catch(err: any){
      if(err.code === "23505"){
        toast.error("Cannot add duplicate values")
      }
      else{
        toast.error(err.message)
      }
    }
    finally{
      setIsDialogOpen(false);
      setLoading(false);
      setNewAmenityName("")
    }
  }

  const handleDelete=async(id: string) => {
    const ok = await confirm({
      title: "Remove Amenity",
      description:
        "This will remove the amenity. This action cannot be undone.",
      confirmText: "Remove",
      intent: "danger" as const,
      cancelText: "Cancel",
    })
    if (!ok) return;

    setLoading(true)
    try{
      const {error} = await supabase.from("amenities").delete().eq("id", id)
      if(error){
        throw error
      }
      else{
        toast.success("Amenity deleted successfully")
        setAmenities((prev) => prev.filter((a) => a.id !== id));
      }
    }
    catch(err: any){
      toast.error(err.message)
    }
    finally{
      setLoading(false)
    }
  };

  const firstLoad=async()=>{
    setFetchLoad(true)
    try{
      const {data} = await getAmenities()
      if(data){
        setAmenities(data)
      }
    }
    catch(err: any){
      toast.error(err.message)
    }
    finally{
      setFetchLoad(false)
    }
  }

  useEffect(()=>{
    firstLoad()
  },[])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Manage Amenities</h2>
        <Button onClick={openAddDialog} className="flex items-center gap-2">
          <Plus className="h-4 w-4" /> Add Amenity
        </Button>
      </div>

      {
        fetchLoad ?
        <ResponsiveSkeleton variant="grid" count={4} responsive /> :
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {amenities.map((amenity) => (
            <Card
              key={amenity.id}
              className="hover:shadow-md transition-shadow duration-200"
            >
              <CardContent className="flex flex-col justify-between p-4">
                <div className="flex items-center gap-2 mb-4">
                  {/* Icon placeholder */}
                  <div className="h-8 w-8 bg-muted rounded-lg flex items-center justify-center text-sm font-semibold">
                    {amenity.name[0].toUpperCase()}
                  </div>
                  <span className="text-sm font-medium">{amenity.name}</span>
                </div>

                <Separator className="my-2" />

                <div className="flex justify-start gap-2 mt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditDialog(amenity)}
                    // className="flex items-center gap-1 cursor-pointer"
                    className="flex items-center gap-1 rounded-md transition-colors text-blue-600 hover:text-blue-600 border-blue-200 hover:bg-blue-100 cursor-pointer"
                  >
                    <Pencil className="h-4 w-4" /> Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(amenity.id)}
                    // className="flex items-center gap-1 rounded-md transition-colors hover:bg-red-600 cursor-pointer"
                    className="flex items-center gap-1 rounded-md transition-colors text-rose-600 hover:text-rose-600 border-rose-200 hover:bg-rose-100 cursor-pointer"
                  >
                    <Trash className="h-4 w-4" /> Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      }

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md w-full">
          <DialogHeader>
            <DialogTitle>{editingAmenity ? 'Edit Amenity' : 'Add Amenity'}</DialogTitle>
            <DialogDescription>
              {editingAmenity
                ? 'Update the name of the amenity.'
                : 'Enter the details for the new amenity.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <Input
              placeholder="Amenity Name"
              value={newAmenityName}
              onChange={(e) => setNewAmenityName(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={loading} className='cursor-pointer'>
                {
                  editingAmenity ? 
                  loading ? 'Updating...' : 'Update' : 
                  loading ? 'Adding...' : 'Add'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

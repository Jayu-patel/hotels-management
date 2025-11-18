"use client"
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Search, Edit, Trash } from 'lucide-react';
import { bookingStatistics, getAllBookings, getBookingsById } from '@/supabase/bookings';
import { toast } from 'react-toastify';
import Loader from '@/components/loader'
import { supabase } from '@/lib/supabase/client';
import PaginationComponent from "@/components/pagination"
import { useDebounce } from "@/hooks/debounce";
import { Button } from '@/components/ui/button';
import { SlabManagementForm } from '@/components/hotels/slab/SlabForm';
import { getAllSlabs } from '@/supabase/slabs';
import { useConfirm } from '@/contexts/confirmation';

export interface Booking {
  id: string;
  check_in: string;
  check_out: string;
  created_at: string;
  updated_at: string;
  guest_count: number;
  room_booked: number;
  total_amount: number;
  inr_amount: number;
  status: "Confirmed" | "Checked In" | "Checked Out" | "Cancelled";
  payment_status: "Paid" | "Pending" | "Refunded";

  users: {
    id: string;
    full_name: string;
    email: string;
  } | null;

  hotels: {
    id: string;
    name: string;
  } | null;

  rooms: {
    id: string;
    name: string;
  } | null;
}

type PriceSlab = {
  id: string
  name: string
  type: "seasonal" | "duration"
  start_date: string | null
  end_date: string | null
  price_multiplier: number | null
  min_days: number | null
  max_days: number | null
  discount_percent: number | null
  created_at?: string
}

export default function BookingsManagement() {
  const confirm = useConfirm();
  const [bookings, setBookings] = useState<Booking[] | null>(null);
  const [slabFilter, setSlabFilter] = useState('All');

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [slabs, setSlabs] = useState<PriceSlab[]>([])
  
  const [search, setSearch] = useState("");
  const debounceSearch = useDebounce(search, 500)
  const [loading, setLoading] = useState(true);

  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<'add' | 'edit' | 'view'>("add")
  const [editingSlab, setEditingSlab] = useState(null)

  function truncateString(str: string, maxLength: number): string {
    if (str.length <= maxLength) return str;
    return str.slice(0, maxLength) + "....";
  }
  
  async function commonFetch(currentPage: number, totalSize: number){
    try{
        const {slabs, totalPages} = await getAllSlabs({page: currentPage, size: totalSize, searchTerm: debounceSearch, slabFilter})
        if(slabs){
            setSlabs(slabs)
            setTotalPages(totalPages)
        }
    }
    catch(err: any){
      toast.error(err.message)
    }
  }

  async function fetchBookings() {
    setLoading(true);
    try{
        const {slabs, totalPages} = await getAllSlabs({page, size: 6, searchTerm: debounceSearch, slabFilter})
        if(slabs){
            setSlabs(slabs)
            setTotalPages(totalPages)
        }
    }
    catch(err: any){
      toast.error(err.message)
      setLoading(false);
    }
    setLoading(false);
  }

  useEffect(()=>{
      commonFetch(1,6);
      setPage(1)
  },[slabFilter, debounceSearch])

  useEffect(() => {
    commonFetch(page,6);
  }, [page]);

  useEffect(()=>{
    fetchBookings()
  },[])

  useEffect(() => {
    const channel = supabase.channel("slab_update");

    channel
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "price_slabs" },
        async (payload: any) => {
          try {
            const updatedSlabId = payload.new?.id || payload.old?.id;
            if (!updatedSlabId) return;

            let slab;

            if (payload.eventType === "DELETE") {
              slab = payload.old;
            } else {
              const { data, error } = await supabase
                .from("price_slabs")
                .select("*")
                .eq("id", updatedSlabId)
                .single();

              if (error) throw error;
              slab = data;
            }

            if (payload.eventType === "INSERT") {
              setSlabs((prev: any) => [slab, ...prev]);
              toast.success(`New price slab ${slab.id} added!`);
            } else if (payload.eventType === "UPDATE") {
              setSlabs((prev: any) =>
                prev?.map((s: any) => (s.id === slab.id ? slab : s))
              );
              toast.info(`Price slab ${slab.id} updated!`);
            } else if (payload.eventType === "DELETE") {
              setSlabs((prev: any) =>
                prev?.filter((s: any) => s.id !== slab.id)
              );
              toast.warn(`Price slab ${slab.id} deleted!`);
            }
          } catch (err: any) {
            toast.error(err.message);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);


  const handleEdit = (slab: any) => {
    setEditingSlab(slab)
    setMode("edit")
    setOpen(true)
  };

const handleDelete = async (id: string) => {
  const ok = await confirm({
        title: "Remove Slab",
        description:
          "This will remove the slab. This action cannot be undone.",
        confirmText: "Remove",
        intent: "danger" as const,
        cancelText: "Close",
      })
  if (!ok) return;

  const { error } = await supabase.from("price_slabs").delete().eq("id", id);
  if (error){
    toast.error(error.message)
  } 
};



  if(loading) 
  return <div className="flex justify-center items-center h-[calc(100vh-65px)]"> <Loader/> </div>
  return (
    <div className="space-y-6 max-w-[90vw] sm:max-w-[100vw]">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <h2 className="text-2xl">Slab Management</h2>
            <Button
              className="cursor-pointer"
              onClick={() => {
                setOpen(true);
              }}
            >
              <Plus className="w-4 h-4" />
              New Slab
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  className="pl-10"
                />
              </div>
            </div>

            <Select value={slabFilter} onValueChange={setSlabFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by slab type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Types</SelectItem>
                <SelectItem value="duration">Duration</SelectItem>
                <SelectItem value="seasonal">Seasonal</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead>Price Multiplier</TableHead>
                  <TableHead>Min Days</TableHead>
                  <TableHead>Max Days</TableHead>
                  <TableHead>Discount (%)</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {slabs?.length > 0 ? (
                  slabs.map((slab) => (
                    <TableRow key={slab.id}>
                      <TableCell>{slab.name}</TableCell>
                      <TableCell className="capitalize">{slab.type}</TableCell>
                      <TableCell>
                        {slab.start_date
                          ? new Date(slab.start_date).toLocaleDateString("en-GB")
                          : "-"}
                      </TableCell>
                      <TableCell>
                        {slab.end_date
                          ? new Date(slab.end_date).toLocaleDateString("en-GB")
                          : "-"}
                      </TableCell>
                      <TableCell>{slab.price_multiplier ?? "-"}</TableCell>
                      <TableCell>{slab.min_days ?? "-"}</TableCell>
                      <TableCell>{slab.max_days ?? "-"}</TableCell>
                      <TableCell>{slab.discount_percent ?? "-"}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            className='cursor-pointer'
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(slab)}
                          >
                            <Edit className='w-4 h-4' />
                          </Button>
                          <Button
                            className='cursor-pointer'
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(slab.id)}
                          >
                            <Trash className='w-4 h-4' />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={9}
                      className="text-center text-sm text-muted-foreground py-4"
                    >
                      No slabs found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center mt-6">
              <PaginationComponent
                page={page}
                totalPages={totalPages}
                onPageChange={(newPage) => {
                  setPage(newPage);
                }}
              />
            </div>
          )}

          {bookings?.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No bookings found</p>
            </div>
          )}
        </CardContent>
      </Card>

      <SlabManagementForm
        isAddDialogOpen={open}
        setIsAddDialogOpen={setOpen}
        room={editingSlab}
        setRoom={setEditingSlab}
        mode={mode}
        setFormMode={setMode}
      />
    </div>
  );
}
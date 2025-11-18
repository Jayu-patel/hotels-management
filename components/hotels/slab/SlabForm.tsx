"use client";
import { useEffect, useState, useRef, ChangeEvent, FormEvent } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "react-toastify";
import { supabase } from "@/lib/supabase/client";
import { CitySelector } from "../../city-selector";
import { v4 as uuidv4 } from "uuid";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import { formatDate } from "date-fns";
import { DateRange } from "react-day-picker";
import { Calendar } from "@/components/ui/calendar";

interface RoomFormProps {
  room?: any;
  setRoom: (data: any) => void;
  setIsAddDialogOpen: (open: boolean) => void;
  isAddDialogOpen: boolean;
  mode?: "add" | "edit" | "view";
  setFormMode?: (mode: "add" | "edit" | "view") => void;
}

type SlabType = "seasonal" | "duration";

interface SlabFormData {
  name: string;
  start_date: string;
  end_date: string;
  price_multiplier: string;
  min_days: string;
  max_days: string;
  discount_percent: string;
}

export function SlabManagementForm({
  room,
  setRoom,
  setIsAddDialogOpen,
  isAddDialogOpen,
  mode = room ? "edit" : "add",
  setFormMode,
}: RoomFormProps) {

  const handleClose = () => {
    setIsAddDialogOpen(false);
    setRoom(null);

    setType("seasonal");
    setName("");
    setDateRange(undefined);
    setPriceMultiplier("");
    setMinDays("");
    setMaxDays("");
    setDiscountPercent("");

    setErrors({
      name: "",
      dateRange: "",
      priceMultiplier: "",
      minDays: "",
      maxDays: "",
      discountPercent: "",
    });
  };

  const [errors, setErrors] = useState({
    name: "",
    dateRange: "",
    priceMultiplier: "",
    minDays: "",
    maxDays: "",
    discountPercent: "",
  });

  const validateFields = () => {
    const newErrors = {
      name: "",
      dateRange: "",
      priceMultiplier: "",
      minDays: "",
      maxDays: "",
      discountPercent: "",
    };

    if (!name.trim()) newErrors.name = "Please enter a name";

    if (type === "seasonal") {
      if (!dateRange?.from || !dateRange?.to)
        newErrors.dateRange = "Select a valid date range";
      if (!priceMultiplier || Number(priceMultiplier) <= 0)
        newErrors.priceMultiplier = "Enter valid price multiplier";
    }

    if (type === "duration") {
      if (minDays == "" || Number(minDays) < 0)
        newErrors.minDays = "Enter valid minimum days";
      if (!maxDays || Number(maxDays) <= 0)
        newErrors.maxDays = "Enter valid maximum days";
      if (discountPercent == "" || Number(discountPercent) < 0)
        newErrors.discountPercent = "Enter valid discount percent";
    }

    setErrors(newErrors);
    return Object.values(newErrors).every((err) => err === "");
  };

  const [type, setType] = useState<"seasonal" | "duration">("seasonal");
  const [name, setName] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

  const [priceMultiplier, setPriceMultiplier] = useState("");
  const [minDays, setMinDays] = useState("");
  const [maxDays, setMaxDays] = useState("");
  const [discountPercent, setDiscountPercent] = useState("");
  const [loading, setLoading] = useState(false)

  useEffect(()=>{
    setName(room?.name ?? "")
    setType(room?.type ?? "seasonal")
    setPriceMultiplier(room?.price_multiplier ?? "")
    setMinDays(room?.min_days ?? "")
    setMaxDays(room?.max_days ?? "")
    setDiscountPercent(room?.discount_percent ?? "")

    if (room?.start_date && room?.end_date) {
      setDateRange({
        from: new Date(room.start_date),
        to: new Date(room.end_date),
      });
    } else {
      setDateRange(undefined);
    }
  }, [room])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateFields()){
      toast.error("Fill required fields")
      return; // stop if validation fails
    } 

    const payload =
      type === "seasonal"
        ? {
            type,
            name,
            start_date: dateRange?.from
              ? new Date(dateRange.from).toISOString()
              : null,
            end_date: dateRange?.to
              ? new Date(dateRange.to).toISOString()
              : null,
            price_multiplier: Number(priceMultiplier),
            min_days: null,
            max_days: null,
            discount_percent: null,
          }
        : {
            type,
            name,
            start_date: null,
            end_date: null,
            price_multiplier: null,
            min_days: Number(minDays),
            max_days: Number(maxDays),
            discount_percent: Number(discountPercent),
          };
    
    setLoading(true)
    try{
      const { data, error } = await supabase.from("price_slabs").insert(payload);
      if(error){
        throw error
      }

      setName("");
      setDateRange(undefined);
      setPriceMultiplier("");
      setMinDays("");
      setMaxDays("");
      setDiscountPercent("");
      setIsAddDialogOpen(false)
    }
    catch(err: any){
      toast.error("Error inserting slab:", err?.message);
    }
    finally{
      setLoading(false)
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateFields()) {
      toast.error("Fill required fields");
      return;
    }

    const payload =
      type === "seasonal"
        ? {
            type,
            name,
            start_date: dateRange?.from
              ? new Date(dateRange.from).toISOString()
              : null,
            end_date: dateRange?.to
              ? new Date(dateRange.to).toISOString()
              : null,
            price_multiplier: Number(priceMultiplier),
            min_days: null,
            max_days: null,
            discount_percent: null,
          }
        : {
            type,
            name,
            start_date: null,
            end_date: null,
            price_multiplier: null,
            min_days: Number(minDays),
            max_days: Number(maxDays),
            discount_percent: Number(discountPercent),
          };

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("price_slabs")
        .update(payload)
        .eq("id", room.id);

      if (error) throw error;

      setIsAddDialogOpen(false);
    } catch (err: any) {
      toast.error("Error updating slab: " + err?.message);
    } finally {
      setLoading(false);
    }
  };


  return (
    <Dialog
      open={isAddDialogOpen}
      onOpenChange={(open) => {
        setIsAddDialogOpen(open);
        if (!open) handleClose();
      }}
    >
      <DialogContent className="max-w-[90vw] w-full lg:max-w-[80vw] h-[90vh] max-h-[90vh] overflow-hidden">
        <div className="h-full overflow-y-auto p-2">
          <DialogHeader>
            <DialogTitle className="text-xl flex justify-between font-semibold text-[var(--admin-text-primary)]">
              Slabs
            </DialogTitle>
          </DialogHeader>

          <div className="md:p-10 mt-10 md:mt-0">

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Slab Name</Label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter slab name"
                    className="border-2 border-gray-300 bg-gray-50 focus:border-primary focus:ring-0 text-gray-800"
                  />
                  {errors?.name && (
                    <p className="text-sm text-red-600">{errors?.name}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Slab Type</Label>
                  <Select
                    value={type}
                    onValueChange={(val) =>
                      setType(val as "seasonal" | "duration")
                    }
                  >
                    <SelectTrigger className="w-full border-2 border-gray-300 bg-gray-50 focus:border-primary focus:ring-0 text-gray-800">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="seasonal">Seasonal</SelectItem>
                      <SelectItem value="duration">Duration</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {type === "seasonal" && (
                <>
                  <div className="space-y-2">
                    <Label>Date Range</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !dateRange?.from && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {dateRange?.from ? (
                            dateRange?.to ? (
                              <>
                                {formatDate(dateRange.from, "PPP")} -{" "}
                                {formatDate(dateRange.to, "PPP")}
                              </>
                            ) : (
                              formatDate(dateRange.from, "PPP")
                            )
                          ) : (
                            <span>Pick a date range</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="range"
                          selected={dateRange}
                          onSelect={setDateRange}
                          numberOfMonths={2}
                        />
                      </PopoverContent>
                    </Popover>
                    {errors?.dateRange && (
                      <p className="text-sm text-red-600">{errors?.dateRange}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Price Multiplier</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={priceMultiplier}
                      onChange={(e) => setPriceMultiplier(e.target.value)}
                      placeholder="e.g., 1.3 for 30% higher"
                      className="border-2 border-gray-300 bg-gray-50 focus:border-primary focus:ring-0 text-gray-800"
                    />
                    {errors?.priceMultiplier && (
                      <p className="text-sm text-red-600">{errors?.priceMultiplier}</p>
                    )}
                  </div>
                </>
              )}

              {type === "duration" && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Min Days</Label>
                      <Input
                        type="number"
                        value={minDays}
                        onChange={(e) => setMinDays(e.target.value)}
                        min={0}
                        placeholder="Enter min day"
                        className="border-2 border-gray-300 bg-gray-50 focus:border-primary focus:ring-0 text-gray-800"
                      />
                      {errors?.minDays && (
                        <p className="text-sm text-red-600">{errors?.minDays}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label>Max Days</Label>
                      <Input
                        type="number"
                        value={maxDays}
                        onChange={(e) => setMaxDays(e.target.value)}
                        min={0}
                        placeholder="Enter max day"
                        className="border-2 border-gray-300 bg-gray-50 focus:border-primary focus:ring-0 text-gray-800"
                      />
                      {errors?.maxDays && (
                        <p className="text-sm text-red-600">{errors?.maxDays}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label>Discount (%)</Label>
                      <Input
                        type="number"
                        step="0.1"
                        value={discountPercent}
                        onChange={(e) => setDiscountPercent(e.target.value)}
                        min={0}
                        placeholder="e.g., 10 for 10% off"
                        className="border-2 border-gray-300 bg-gray-50 focus:border-primary focus:ring-0 text-gray-800"
                      />
                      {errors?.discountPercent && (
                        <p className="text-sm text-red-600">{errors?.discountPercent}</p>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="fixed bottom-0 right-0 py-3 px-6 flex justify-between items-center">
            <Button
              type="submit"
              onClick={mode === "edit" ? handleUpdate : handleSubmit}
              className="bg-[var(--primary)] text-white cursor-pointer px-10 py-2"
              disabled={loading}
            >
              {loading
                ? mode === "edit"
                  ? "Updating..."
                  : "Adding..."
                : mode === "edit"
                  ? "Update"
                  : "Add"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

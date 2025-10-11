"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { User, Mail, Hotel, CalendarDays, DollarSign, Info, IndianRupee } from "lucide-react";

interface DataModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  data: Record<string, any> | null;
}

export default function DataModal({ open, onClose, title, data }: DataModalProps) {
  if (!data) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl p-0 border-none shadow-2xl rounded-2xl overflow-hidden bg-white">
        {/* Header */}
        <DialogHeader className="p-6 bg-gradient-to-r from-indigo-50 to-purple-50 border-b">
          <DialogTitle className="text-2xl font-bold text-gray-900">{title}</DialogTitle>
        </DialogHeader>

        <Separator className="my-2" />

        {/* Content */}
        <ScrollArea className="max-h-[70vh] p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            {Object.entries(data).map(([key, value]) => (
              <div
                key={key}
                className="flex flex-col border rounded-lg p-4 hover:shadow-md transition bg-gray-50"
              >
                <div className="flex items-center gap-2 mb-1 text-gray-500 font-medium">
                  {getIcon(key,value)}
                  <span className="capitalize">{key.replace(/_/g, " ")}</span>
                </div>

                {Array.isArray(value) ? (
                  <div className="flex flex-wrap gap-2">
                    {value.map((v: any, i: number) => (
                      <Badge key={i} variant="secondary" className="px-2 py-1 text-sm">
                        {String(v)}
                      </Badge>
                    ))}
                  </div>
                ) : typeof value === "object" && value !== null ? (
                  <pre className="text-sm text-gray-700 max-w-full overflow-x-auto">
                    {JSON.stringify(value, null, 2)}
                  </pre>
                ) : (
                  <p className="text-gray-900 font-semibold text-sm break-words">{String(value)}</p>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

// Icon mapper for better visuals
function getIcon(key: string, value?: string) {
  const k = key.toLowerCase();
  if (k.includes("user") || k.includes("guest")) return <User size={16} className="text-blue-500" />;
  if (k.includes("email")) return <Mail size={16} className="text-purple-500" />;
  if (k.includes("hotel") || k.includes("room")) return <Hotel size={16} className="text-indigo-500" />;
  if (k.includes("checkin") || k.includes("checkout") || k.includes("date")) return <CalendarDays size={16} className="text-green-500" />;
  if (k.includes("amount") || k.includes("currency")){
        console.log(value)
        if(value && value[0] == "$") return <DollarSign size={16} className="text-amber-500" />;
        else return <IndianRupee size={16} className="text-amber-500" />;
  } 
  return <Info size={16} className="text-gray-400" />;
}

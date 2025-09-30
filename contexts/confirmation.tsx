"use client"
import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AlertTriangle, Loader2 } from "lucide-react";

type ConfirmOptions = {
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  intent?: 'danger' | 'default';
};

type ConfirmContextType = (opts?: ConfirmOptions) => Promise<boolean>;

const ConfirmContext = createContext<ConfirmContextType | null>(null);

export const useConfirm = () => {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error("useConfirm must be used within a ConfirmProvider");
  return ctx;
};

export const ConfirmProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmOptions>({});

  const resolverRef = React.useRef<(value: boolean) => void | null>(null);

  const confirm = useCallback((opts: ConfirmOptions = {}) => {
    setOptions(opts);
    setOpen(true);
    return new Promise<boolean>((resolve) => {
      resolverRef.current = resolve;
    });
  }, []);

  const onConfirm = useCallback(() => {
    // resolve immediately when user presses confirm
    setOpen(false);
    resolverRef.current?.(true);
    resolverRef.current = null;
  }, []);

  const onCancel = useCallback(() => {
    setOpen(false);
    resolverRef.current?.(false);
    resolverRef.current = null;
  }, []);

  const value = useMemo(() => confirm, [confirm]);

  return (
    <ConfirmContext.Provider value={value}>
      {children}

      <Dialog open={open} onOpenChange={(o) => { if (!o) onCancel(); setOpen(o); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-100">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <DialogTitle className="text-lg font-semibold">{options.title ?? "Are you sure?"}</DialogTitle>
            </div>
            <DialogDescription className="mt-2 text-sm text-muted-foreground">
              {options.description ?? "This action cannot be undone."}
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button variant="ghost" onClick={onCancel}>{options.cancelText ?? "Cancel"}</Button>
            <Button
              onClick={onConfirm}
              className={options.intent === 'danger' ? 'bg-red-600 hover:bg-red-700 text-white cursor-pointer' : 'cursor-pointer'}
            >
              {options.confirmText ?? (options.intent === 'danger' ? 'Delete' : 'Confirm')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ConfirmContext.Provider>
  );
};

export default ConfirmProvider;

/* ================= EXAMPLES =================

1) Wrap in root layout (app/layout.tsx)

import ConfirmProvider from "@/components/confirm-provider";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ConfirmProvider>
          {children}
        </ConfirmProvider>
      </body>
    </html>
  );
}


2) Logout button (client component) - shows how to use confirm and show loading on the action button

// components/LogoutButton.tsx
"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useConfirm } from "@/components/confirm-provider";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export function LogoutButton() {
  const confirm = useConfirm();
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    const ok = await confirm({
      title: "Logout",
      description: "You will need to login again to access your account.",
      confirmText: "Logout"
    });

    if (!ok) return;

    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      // redirect to login or home
      router.push("/login");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button onClick={handleLogout} disabled={loading}>
      {loading ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : null}
      Logout
    </Button>
  );
}


3) Cancel Booking Button (client component) - confirms then calls supabase to update booking status

// components/CancelBookingButton.tsx
"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useConfirm } from "@/components/confirm-provider";
import { Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

export function CancelBookingButton({ bookingId }: { bookingId: string }) {
  const confirm = useConfirm();
  const [loading, setLoading] = useState(false);

  const handleCancel = async () => {
    const ok = await confirm({
      title: "Cancel booking?",
      description: "This will cancel the booking and may trigger a refund.",
      intent: "danger",
      confirmText: "Yes, cancel"
    });

    if (!ok) return;

    try {
      setLoading(true);
      const { error } = await supabase
        .from("bookings")
        .update({ status: "Cancelled" })
        .eq("id", bookingId);

      if (error) throw error;
      // optionally trigger revalidation / refetch / toast
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button variant="destructive" onClick={handleCancel} disabled={loading}>
      {loading ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : null}
      Cancel Booking
    </Button>
  );
}


Notes:
- The provider resolves the confirm promise when the user clicks confirm. The calling component is responsible for showing loading state while performing the async operation (e.g. API call, supabase update).
- Keep ConfirmProvider at the top level so any component can call `useConfirm()`.
- You can customize the dialog UI (icons, colors) as needed.

===========================================*/

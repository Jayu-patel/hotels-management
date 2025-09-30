"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { BarChart3, Hotel, Users, Calendar, LogOut, Menu, ArrowLeft } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useConfirm } from '@/contexts/confirmation';
import { toast } from "react-toastify";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const router = useRouter()
  const pathname = usePathname();
  const confirm = useConfirm();

  const menuItems = [
    { href: "/admin", label: "Dashboard", icon: BarChart3 },
    { href: "/admin/hotels", label: "Hotels", icon: Hotel },
    { href: "/admin/bookings", label: "Bookings", icon: Calendar },
    { href: "/admin/users", label: "Users", icon: Users },
  ];

  const AdminLogout=async()=>{
    const ok = await confirm({
      title: "Logout",
      description: "You will need to login again to access your account.",
      confirmText: "Logout",
      intent: "danger"
    });

    if (!ok) return;

    try{
      await logout()
    }
    catch(err: any){
      toast.error(err.message)
    }
    finally{
      router.push("/")
    }
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        {/* Sidebar */}
        <Sidebar className="border-r">
          <SidebarHeader className="border-b p-4">
            <div className="flex items-center gap-2">
              <Hotel className="h-6 w-6 text-blue-600" />
              <span className="text-lg font-semibold">HotelBook Admin</span>
            </div>
          </SidebarHeader>

          <SidebarContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                let isActive = false;

                if (item.href === "/admin") {
                  isActive = pathname === "/admin";
                } else {
                  isActive =
                    pathname === item.href || pathname.startsWith(item.href + "/");
                }

                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild>
                      <Link
                        href={item.href}
                        className={`flex items-center gap-2 rounded-md px-2 py-1 transition-colors ${
                          isActive
                            ? "bg-blue-100 text-blue-700"
                            : "hover:bg-gray-100 text-gray-700"
                        }`}
                      >
                        <item.icon
                          className={`h-4 w-4 ${
                            isActive ? "text-blue-700" : "text-gray-500"
                          }`}
                        />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarContent>

          <div className="p-4 border-t mt-auto">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
              <span>{user?.full_name ?? "Admin User"}</span>
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                Admin
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={AdminLogout}
              className="w-full flex items-center gap-2 cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </Sidebar>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          <header className="bg-white border-b px-6 py-4">
            <div className="flex items-center gap-4 relative">
              <SidebarTrigger className="lg:hidden">
                <Menu className="h-6 w-6" />
              </SidebarTrigger>
              <h1 className="text-2xl font-semibold">Admin Panel</h1>

              <Link href={"/"} className="absolute right-0 top-0">
                <Button variant="outline" className="cursor-pointer">
                  <ArrowLeft className="h-4 w-4" />
                  Back to home
                </Button>
              </Link>
            </div>
          </header>

          <main className="flex-1 p-6 bg-gray-50">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}

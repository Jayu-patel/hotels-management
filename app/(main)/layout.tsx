import Navbar from "@/components/navbar"

export default function AdminLayout({children,}: {children: React.ReactNode;})
{
  return (
    <div>
        <Navbar />
        {children}
    </div>
  );
}

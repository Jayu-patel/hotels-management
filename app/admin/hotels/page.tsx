import { HotelsManagement } from "@/components/admin/HotelsManagement";
import { getAmenities } from "@/supabase/hotels";

export default async function HotelsPage() {
  const {data} = await getAmenities()
  return <HotelsManagement  amenityData={data ?? []} />;
}

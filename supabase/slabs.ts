import {supabase} from "@/lib/supabase/client"

export async function getAllSlabs({
  page = 1,
  size = 5,
  searchTerm = "",
  slabFilter = ""
}: {
  page?: number
  size?: number
  searchTerm?: string
  slabFilter?: string
}): Promise<{ slabs: any[]; totalPages: number }> {
  const { data, error } = await supabase
    .from("price_slabs")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) throw error

  let slabs = (data ?? []) as any[]

  if (searchTerm && searchTerm.trim() !== "") {
    const term = searchTerm.toLowerCase()
    slabs = slabs.filter((s) => s.name?.toLowerCase().includes(term))
  }

  if (slabFilter && slabFilter !== "All") {
    slabs = slabs.filter(b => b.type === slabFilter);
  }

  // Pagination
  const totalPages = Math.ceil(slabs.length / size)
  const from = (page - 1) * size
  const to = from + size
  const paginatedSlabs = slabs.slice(from, to)

  // Map result
  const mappedSlabs = paginatedSlabs.map((s) => ({
    id: s.id,
    name: s.name,
    type: s.type,
    start_date: s.start_date ? new Date(s.start_date) : null,
    end_date: s.end_date ? new Date(s.end_date) : null,
    price_multiplier: s.price_multiplier,
    min_days: s.min_days,
    max_days: s.max_days,
    discount_percent: s.discount_percent,
    created_at: s.created_at ? new Date(s.created_at) : null,
  }))

  return { slabs: mappedSlabs, totalPages }
}

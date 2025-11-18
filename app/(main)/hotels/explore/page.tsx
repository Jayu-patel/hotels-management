// interface ExploreHotelsProps {
//   searchParams: { country?: string; city?: string };
// }

// const ExploreHotelsPage = ({ searchParams }: ExploreHotelsProps) => {
//   const { country, city } = searchParams;

//   const hotels = [
//     {
//         id: 1,
//         name: "Aksari Villa Seminyak",
//         address: "Jalan Sunset Road, Bali",
//         image: "link",
//     },
//     {
//         id: 2,
//         name: "Amankila",
//         address: "Manggis, Bali, Indonesia",
//         image: "link",
//     },
//     {
//         id: 3,
//         name: "Adiwana Unagi Suites",
//         address: "Jl. Suweta, Bali",
//         image: "link",
//     },
//     {
//         id: 4,
//         name: "Green Lake Sunter",
//         address: "Jl. Danau Sunter Selatan No.15, Jakarta",
//         image: "link",
//     },
//     {
//         id: 5,
//         name: "The Ritz-Carlton",
//         address: "Marina Bay, Singapore",
//         image: "link",
//     },
//     {
//         id: 6,
//         name: "Hotel Paradise",
//         address: "Paris, France",
//         image: "link",
//     },
//     {
//         id: 7,
//         name: "Ocean View Resort",
//         address: "Malibu, California",
//         image: "link",
//     },
//     {
//         id: 8,
//         name: "Mountain Retreat",
//         address: "Swiss Alps, Switzerland",
//         image: "link",
//     },
//   ];

//   return (
//     <div className="w-[80%] mx-auto py-5">
//       <h1 className="text-3xl font-bold mb-6">
//         {city
//           ? `Most Popular Hotels in ${city}, ${country}`
//           : country
//           ? `Most Popular Hotels in ${country}`
//           : "All Hotels"}
//       </h1>

//       <div className="grid grid-cols-1 res:grid-cols-2 lg:grid-cols-4 gap-6">
//         {hotels.map((hotel) => (
//           <div
//             key={hotel.id}
//             className="border rounded-lg shadow hover:shadow-lg overflow-hidden transition"
//           >
//             <img
//               src={hotel.image}
//               alt={hotel.name}
//               className="w-full h-48 object-cover"
//             />
//             <div className="p-4 flex flex-col justify-between h-40">
//               <div>
//                 <h2 className="font-semibold text-lg">{hotel.name}</h2>
//                 <p className="text-gray-500 text-sm mt-1">{hotel.address}</p>
//               </div>
//               <button className="mt-4 bg-primary text-white px-4 py-2 rounded hover:bg-blue-600 transition cursor-pointer">
//                 See Details
//               </button>
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default ExploreHotelsPage;

"use client"
import { supabase } from "@/lib/supabase/client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Loader from "@/components/loader"

export default function ExploreHotelsPage() {
  const searchParams = useSearchParams();
  const city = searchParams.get("city")
  const country = searchParams.get("country")
  const [hotels, setHotels] = useState<any>([])
  const [locationName,setLocationName] = useState("")
  const [loading, setLoading] = useState(true)

  const getHotels=async()=>{
    try{
      setLoading(true)
      let query = supabase
      .from("hotels")
      .select("id, name, address, images: hotel_images(*), city_code, country_code, cities(name), countries(name)");

      if (city) query = query.eq("city_code", city);
      else if (country) query = query.eq("country_code", country);

      const { data: hotels, error } = await query;

      if(error) throw error
      setHotels(hotels)
    }
    catch(err: any){
      toast.error(err.message)
    }
    finally{
      setLoading(false)
    }
  }

  useEffect(()=>{
    getHotels()
    scroll({top: 0, behavior: "instant"})
  },[])

  useEffect(()=>{
    if (hotels?.length) {
      if (city) {
        setLocationName(hotels[0]?.cities?.name ?? "")
      } else if (country) {
        setLocationName(hotels[0]?.countries?.name ?? "")
      }
    }
  },[hotels])

  if(hotels.length == 0 && loading) 
  return(
      <div className="flex justify-center items-center h-screen">
          <Loader/>
      </div>
  ) 
  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="text-center mb-10">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">
          {city
            ? `Explore Top Hotels in ${locationName}`
            : country
            ? `Explore Top Hotels in ${locationName}`
            : "Discover Our Hotels"}
        </h1>
        <p className="text-gray-500 mt-2 text-base">
          Choose from handpicked stays offering comfort, luxury, and great value.
        </p>
      </div>

      {hotels?.length ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {hotels.map((hotel: any) => (
            <div
              key={hotel.id}
              className="group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100"
            >
              <div className="overflow-hidden">
                <img
                  src={hotel?.images[0]?.image_url || "/placeholder.jpg"}
                  alt={hotel.name}
                  className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              <div className="p-5 flex flex-col justify-between h-48">
                <div>
                  <h2 className="font-semibold text-lg text-gray-800 group-hover:text-primary transition-colors">
                    {hotel.name}
                  </h2>
                  <p className="text-gray-500 text-sm mt-2 line-clamp-2">{hotel.address}</p>
                </div>

                <Link
                  href={`/hotels/${hotel.id}`}
                  className="mt-4 inline-block text-center w-full bg-primary text-white font-medium py-2.5 rounded-xl hover:bg-blue-600 transition-colors duration-300"
                >
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-center mt-16 text-lg">No hotels found.</p>
      )}
    </div>
  );
}


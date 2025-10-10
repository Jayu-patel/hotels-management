import HotelsPage from "@/components/hotels/HotelsClient";
import Navbar from "@/components/navbar"

export default function SearchPage() {
  return (
    <div>
      <Navbar/>
      <div className="sm:w-[80%] mx-auto mt-5">
        <HotelsPage />
      </div>
    </div>
  )
  
}
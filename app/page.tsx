import Navbar from "@/components/navbar"
import HomePage from "@/components/home";
export default function page() {

  return (
    <div>
      <Navbar/>
      <div className="w-[95%] sm:w-[85%] mx-auto mt-5 sm:mt-10">
        <HomePage />
      </div>
    </div>
  );
}
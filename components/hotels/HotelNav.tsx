// app/components/HotelNav.tsx
"use client";
import { useState, useRef, useEffect } from "react";

export default function HotelNav() {
  const [active, setActive] = useState("Overview");

  const sections = [
    { id: "overview", label: "Overview" },
    // { id: "about", label: "About" },
    { id: "rooms", label: "Rooms" },
    // { id: "accessibility", label: "Accessibility" },
    { id: "facility", label: "Facility" },
    { id: "policies", label: "Policies" },
  ];

  // Scroll refs for page sections
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  // useEffect(() => {
  //   sections.forEach((s) => {
  //     sectionRefs.current[s.id] = document.getElementById(s.id);
  //   });

  //   const handleScroll = () => {
  //     const scrollY = window.scrollY;
  //     let current = "Overview";
  //     for (const s of sections) {
  //       const el = sectionRefs.current[s.id];
  //       if (el && scrollY >= el.offsetTop - 130) {
  //         current = s.label;
  //       }
  //     }
  //     setActive(current);
  //   };

  //   window.addEventListener("scroll", handleScroll);
  //   return () => window.removeEventListener("scroll", handleScroll);
  // }, []);

//   const scrollToSection = (id: string) => {
//     const element = sectionRefs.current[id];
//     element?.scrollIntoView({ behavior: "smooth", block: "start" });
//   };
const scrollToSection = (id: string) => {
  const element = sectionRefs.current[id];
  if (!element) return;

  const yOffset = -130; // adjust based on your nav height
  const y =
    element.getBoundingClientRect().top + window.scrollY + yOffset;

  window.scrollTo({ top: y, behavior: "smooth" });
};

useEffect(() => {
  sections.forEach((s) => {
    sectionRefs.current[s.id] = document.getElementById(s.id);
  });

  const handleScroll = () => {
    let current = "Overview";
    const threshold = window.innerHeight * 0.2; // 20% from top

    for (const s of sections) {
      const el = sectionRefs.current[s.id];
      if (el) {
        const rect = el.getBoundingClientRect();
        if (rect.top <= threshold && rect.bottom >= threshold) {
          current = s.label;
          break;
        }
      }
    }
    setActive(current);
  };

  window.addEventListener("scroll", handleScroll);
  handleScroll(); // initialize
  return () => window.removeEventListener("scroll", handleScroll);
}, [sections]);



  return (
    <nav className="sticky top-18 z-50 bg-white border-b">
      <div className="flex items-center justify-between max-w-6xl mx-auto px-6 h-14">
        {/* Left: Tabs */}
        <div className="flex items-center gap-6">
          {sections.map((s) => (
            <button
              key={s.id}
              onClick={() => scrollToSection(s.id)}
              className={`relative cursor-pointer pb-1 text-base font-medium transition-colors ${
                active === s.label
                  ? "text-blue-600 font-semibold"
                  : "text-gray-800 hover:text-blue-600"
              }`}
            >
              {s.label}
              {active === s.label && (
                <span className="absolute left-0 bottom-0 w-full h-[2px] bg-blue-600 rounded-full" />
              )}
            </button>
          ))}
        </div>

        {/* Right: Save + Select */}
        {/* <div>
          <button className="bg-blue-600 text-white font-semibold px-5 py-2 rounded-full hover:bg-blue-700">
            Select a room
          </button>
        </div> */}
      </div>
    </nav>
  );
}

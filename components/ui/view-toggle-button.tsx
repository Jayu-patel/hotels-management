"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { LayoutGrid, List } from "lucide-react";

export default function ViewToggleButton({ onToggle }: { onToggle?: (view: "grid" | "list") => void }) {
  const [view, setView] = useState<"grid" | "list">("list");

  const toggleView = () => {
    const newView = view === "grid" ? "list" : "grid";
    setView(newView);
    onToggle?.(newView);
  };

  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={toggleView}
      className="relative flex items-center gap-2 px-4 py-2 rounded-2xl bg-primary text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
    >
      <motion.div
        key={view}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="flex items-center gap-2"
      >
        {view === "grid" ? (
          <>
            <LayoutGrid size={18} />
            <span>Grid View</span>
          </>
        ) : (
          <>
            <List size={18} />
            <span>List View</span>
          </>
        )}
      </motion.div>

      {/* Animated highlight behind icon */}
      <motion.span
        layoutId="view-highlight"
        className="absolute inset-0 rounded-2xl bg-white/10"
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
      />
    </motion.button>
  );
}

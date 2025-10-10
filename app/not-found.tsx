"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function NotFound() {
  return (
    <main className="relative flex h-screen flex-col items-center justify-center overflow-hidden bg-white text-gray-900">
      {/* Background shapes */}
      <div className="absolute inset-0 -z-10">
        {/* Animated circles */}
        <motion.div
          className="absolute top-10 left-1/4 h-40 w-40 rounded-full bg-blue-200 opacity-50"
          animate={{ y: [0, 20, 0], x: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 6 }}
        />
        <motion.div
          className="absolute bottom-20 right-1/3 h-48 w-48 rounded-full bg-purple-200 opacity-40"
          animate={{ y: [0, -15, 0], x: [0, -10, 0] }}
          transition={{ repeat: Infinity, duration: 7 }}
        />

        {/* Animated triangles */}
        <motion.div
          className="absolute top-1/3 right-1/4 h-24 w-24 bg-yellow-200 rotate-45 clip-triangle opacity-40"
          animate={{ rotate: [45, 60, 45] }}
          transition={{ repeat: Infinity, duration: 6 }}
        />
        <motion.div
          className="absolute bottom-1/4 left-1/5 h-20 w-20 bg-pink-200 rotate-45 clip-triangle opacity-30"
          animate={{ rotate: [45, 30, 45] }}
          transition={{ repeat: Infinity, duration: 5 }}
        />

        {/* Repeating small pattern */}
        <div className="absolute inset-0 bg-[repeating-radial-gradient(circle,rgba(0,0,0,0.03)_1px,transparent_3px)]" />
      </div>

      <motion.h1
        className="text-[8rem] font-extrabold leading-none text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600 drop-shadow-sm"
        initial={{ opacity: 0, y: -60 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        404
      </motion.h1>

      <motion.p
        className="mt-4 text-lg text-gray-600 text-center px-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        The page you’re looking for doesn’t exist or has been moved.
      </motion.p>

      <motion.div
        className="mt-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <Link
          href="/"
          className="rounded-xl bg-blue-600 px-6 py-2 text-sm font-medium text-white shadow-md transition hover:shadow-lg hover:bg-blue-700"
        >
          Go Home
        </Link>
      </motion.div>
    </main>
  );
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: false,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com", // allow Unsplash
      },
      {
        protocol: "https",
        hostname: "sb-gwjcwwirpjwizjidkmip.supabase.co", // Supabase storage bucket
      },
    ],
  },
}

export default nextConfig

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true, // Supabase images ke liye optimization off
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
      {
        protocol: 'https', 
        hostname: '*.supabase.in',
      },
    ],
  },
  reactStrictMode: false,
}

export default nextConfig

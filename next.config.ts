import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        // Thay chuỗi bên dưới bằng URL Backend Render thực tế của bạn
        destination: "https://shinobi-aa3i.onrender.com/:path*",
      },
    ];
  },
};

export default nextConfig;

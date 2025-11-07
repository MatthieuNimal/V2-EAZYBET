/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true,
    domains: ['res.cloudinary.com', 'upload.wikimedia.org'],
  },
  reactStrictMode: true,
};

module.exports = nextConfig;

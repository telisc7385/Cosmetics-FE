// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        // Optional: you can add port and pathname here if needed for more specific control
        // port: '',
        // pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'img.icons8.com',
      },
      {
        protocol: 'https',
        hostname: 'cdn-icons-png.flaticon.com',
      },
      {
        protocol: 'https',
        hostname: 'readymadeui-nextjs-ecommerce-site-3.vercel.app',
      },
      {
        protocol: 'https', // IMPORTANT: Add this for the placeholder images
        hostname: 'via.placeholder.com',
        // You generally need pathname: '/**' to allow any path on that hostname
        pathname: '/**',
      },
      // You should also consider adding your own backend/API domain if it serves images directly,
      // for example, if your `NEXT_PUBLIC_BASE_URL` serves images:
      // {
      //   protocol: 'https',
      //   hostname: 'cosmaticadmin.twilightparadox.com', // Replace with your actual backend/image server domain
      //   pathname: '/**',
      // },
    ],
  },
};

module.exports = nextConfig;
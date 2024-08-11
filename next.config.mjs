/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  env: {
    ZOHO_EMAIL: process.env.ZOHO_EMAIL,
    ZOHO_PASSWORD: process.env.ZOHO_PASSWORD,
  },
};

export default nextConfig;
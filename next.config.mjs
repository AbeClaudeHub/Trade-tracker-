/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // firebase-admin uses Node APIs; keep it external to the server bundle.
  serverExternalPackages: ["firebase-admin"],
};

export default nextConfig;

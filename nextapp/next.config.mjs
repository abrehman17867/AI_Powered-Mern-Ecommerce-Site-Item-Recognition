/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    // The ported CRA components are not linted with Next's rules yet.
    ignoreDuringBuilds: true,
  },
  // mongoose must not be bundled into the serverless output (Next 14 option name).
  experimental: {
    serverComponentsExternalPackages: ["mongoose"],
  },
};

export default nextConfig;

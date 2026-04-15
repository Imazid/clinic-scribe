import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // @react-pdf/renderer relies on Node built-ins and font binaries that
  // should not be bundled by Turbopack/webpack for the server runtime.
  serverExternalPackages: ["@react-pdf/renderer"],
};

export default nextConfig;

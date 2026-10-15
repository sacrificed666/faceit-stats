import type { NextConfig } from "next";

const isDevelopment = process.env.NODE_ENV === "development";

const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDevelopment ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://distribution.faceit-cdn.net https://assets.faceit-cdn.net",
  "font-src 'self'",
  `connect-src 'self'${isDevelopment ? " ws: wss:" : ""}`,
  "manifest-src 'self'",
  "worker-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");

const securityHeaders = [
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()",
  },
  ...(isDevelopment ? [] : [{ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" }]),
];

const imageHeaders = [
  { key: "Content-Security-Policy", value: "default-src 'none'; style-src 'unsafe-inline'; sandbox" },
  { key: "Cache-Control", value: "public, max-age=604800, stale-while-revalidate=2592000" },
];

const nextConfig: NextConfig = {
  // Docker ships a self-contained server, see docker/Dockerfile
  output: process.env.NEXT_OUTPUT === "standalone" ? "standalone" : undefined,
  reactCompiler: true,
  cacheComponents: true,
  // Links prefetch one shared shell per route; player stats follow the click
  partialPrefetching: true,
  typedRoutes: true,
  poweredByHeader: false,
  agentRules: false,
  experimental: {
    globalNotFound: true,
    useOffline: true,
    staticGenerationMinPagesPerWorker: 500,
  },
  cacheLife: {
    faceit: {
      stale: 300,
      revalidate: 300,
      expire: 86_400,
    },
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "distribution.faceit-cdn.net", pathname: "/images/**" },
      { protocol: "https", hostname: "assets.faceit-cdn.net", pathname: "/**" },
    ],
    qualities: [75],
  },
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      // Every path but the offline page, which sends a stricter policy of its own
      { source: "/:path((?!offline/).*)", headers: [{ key: "Content-Security-Policy", value: contentSecurityPolicy }] },
      { source: "/flags/:path*", headers: imageHeaders },
      { source: "/pwa/:path*", headers: imageHeaders },
    ];
  },
};

export default nextConfig;

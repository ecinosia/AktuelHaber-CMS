/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    // Next clones proxied (rewrite) request bodies and silently truncates them at 10 MB, which
    // leaves the BE waiting forever on a video upload. Must stay above the BE video cap
    // (MAX_VIDEO_BYTES = 300 MB) plus multipart overhead. Default proxyTimeout is 30 s.
    middlewareClientMaxBodySize: "320mb",
    proxyTimeout: 10 * 60_000,
  },

  // Browser -> BE goes through here (see src/lib/api.ts). API_BASE_URL is the BE's
  // internal address, read at build time.
  async rewrites() {
    const apiBaseUrl = process.env.API_BASE_URL ?? "http://localhost:4000";
    return [{ source: "/api/:path*", destination: `${apiBaseUrl}/:path*` }];
  },
};

export default nextConfig;

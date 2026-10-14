import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Public profiles live at /@username. A folder can't be named "@username" (that's a parallel-route slot), so the
  // pretty URL is served by app/(profile)/u/[username] while the address bar keeps /@username.
  async rewrites() {
    return [{ source: "/@:username", destination: "/u/:username" }];
  },
};

export default nextConfig;

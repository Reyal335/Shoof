import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Public profiles live at /@username and posts at /@username/posts/:postId. A folder can't be named "@username"
  // (that's a parallel-route slot), so the pretty URLs are served by app/(profile)/u/[username] and
  // app/(post-view)/u/[username]/posts/[postId] while the address bar keeps the /@ form.
  async rewrites() {
    return [
      { source: "/@:username", destination: "/u/:username" },
      { source: "/@:username/posts/:postId", destination: "/u/:username/posts/:postId" },
    ];
  },
};

export default nextConfig;

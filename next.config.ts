import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Serve the Firebase Auth handler from our own domain, so Google sign-in works in
  // browsers that block third-party storage (Safari, every iOS browser). Production sets
  // NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN to the app's own domain (apphosting.yaml).
  async rewrites() {
    return [
      {
        source: "/__/auth/:path*",
        destination: "https://neuraos.firebaseapp.com/__/auth/:path*",
      },
    ];
  },
};

export default nextConfig;

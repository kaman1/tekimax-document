import "./src/env.mjs";
import { withSentryConfig } from "@sentry/nextjs";

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ucarecdn.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "industrious-narwhal-216.convex.cloud",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "assets.aceternity.com",
        port: "",
        pathname: "/**",
      }, {
        protocol: "https",
        hostname: "framerusercontent.com",
        port: "",
        pathname: "/**",
      }, {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
      {
        protocol: 'https',
        hostname: 'ui-avatars.com',
      },
      {
        protocol: 'https',
        hostname: 'framerusercontent.com',
        pathname: '/**',

      },{
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },{
        protocol: 'https',
        hostname: 'industrious-narwhal-216.convex.cloud',
        pathname: '/**',
      },{
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '/**',
      },{
        protocol: 'https',
        hostname: 'images.pexels.com',
        pathname: '/**',
      },{
        protocol: 'https',
        hostname: 'media.defense.gov',
        pathname: '/**',
      }
    ],
  },
};

export default withSentryConfig(nextConfig, {
  silent: !process.env.CI,
  telemetry: false,
  widenClientFileUpload: true,
  hideSourceMaps: true,
  disableLogger: true,
  tunnelRoute: "/monitoring",

});

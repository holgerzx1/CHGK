

const nextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://sdk.scdn.co",
              "style-src 'self' 'unsafe-inline'",
              "connect-src 'self' https://api.spotify.com wss://dealer.spotify.com https://api.anthropic.com",
              "img-src 'self' data: https://i.scdn.co https://mosaic.scdn.co",
              "media-src 'self' blob:",
              "frame-src 'self'",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
  // 빌드 최적화
  swcMinify: true,
  compress: true,
  
  // 타입 체크 완화
  typescript: {
    ignoreBuildErrors: false,
  },
  
  // ESLint 완화
  eslint: {
    ignoreDuringBuilds: false,
  },
  
  // 이미지 최적화
  images: {
    domains: ['t1.daumcdn.net', 'map.daumcdn.net'],
    unoptimized: true,
  },
  
  // API 프록시
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/:path*`,
      },
    ];
  },
  
  // Webpack 설정
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
    };
    return config;
  },
  
  // 환경변수 설정 (필요시 추가)
  // env: {
  //   CUSTOM_KEY: process.env.CUSTOM_KEY,
  // },
};

module.exports = nextConfig;

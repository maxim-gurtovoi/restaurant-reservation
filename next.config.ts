import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  // Картинки: AVIF/WebP с долгим immutable-кешем — дешёвая победа на главной.
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },
  // Tree-shake крупных barrel-файлов lucide-react: грузятся только реально использованные иконки.
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
};

export default nextConfig;

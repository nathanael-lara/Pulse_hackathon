import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'CorVas',
    short_name: 'CorVas',
    description: 'A calm cardiac recovery companion built as a senior-friendly progressive web app.',
    start_url: '/app',
    display: 'standalone',
    background_color: '#f5faf9',
    theme_color: '#eff7f4',
    orientation: 'portrait',
    icons: [
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'maskable',
      },
    ],
  };
}

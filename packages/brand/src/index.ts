export const brandAssets = {
  logo: '/brand/min-egenkontroll-logo2.png',
  icon: '/brand/min-egenkontroll-icon.png',
  openGraph: '/brand/OGImage.png',
  pwaIcon192: '/brand/pwa-icon-192.png',
  pwaIcon512: '/brand/pwa-icon-512.png',
} as const;

export type BrandAsset = keyof typeof brandAssets;

import { useState } from 'react';
import type { IconAsset } from '../../config/assets';

type AssetIconProps = {
  icon: IconAsset;
  fallback?: string;
  className?: string;
};

export function AssetIcon({ icon, fallback, className }: AssetIconProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);

  if (failedSrc === icon.src) {
    return <>{fallback ?? icon.fallback}</>;
  }

  return (
    <img
      alt=""
      className={className}
      src={icon.src}
      onError={() => setFailedSrc(icon.src)}
    />
  );
}

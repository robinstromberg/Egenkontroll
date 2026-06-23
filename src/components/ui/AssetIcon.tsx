import { useState } from 'react';

type AssetIconProps = {
  src: string;
  fallback: string;
  className?: string;
};

export function AssetIcon({ src, fallback, className }: AssetIconProps) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return <>{fallback}</>;
  }

  return (
    <img
      alt=""
      className={className}
      src={src}
      onError={() => setFailed(true)}
    />
  );
}

import { QRCodeSVG } from 'qrcode.react';

type LocalQrCodeProps = {
  className?: string;
  value: string;
};

export default function LocalQrCode({ className, value }: LocalQrCodeProps) {
  return (
    <QRCodeSVG
      aria-label="QR-kod for inspektorslank"
      bgColor="#ffffff"
      className={className}
      fgColor="#111827"
      level="M"
      marginSize={4}
      role="img"
      size={260}
      value={value}
    />
  );
}

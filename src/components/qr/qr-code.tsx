'use client';

import { QRCodeSVG } from 'qrcode.react';

export function QrCode({
  value,
  size = 220,
}: {
  value: string;
  size?: number;
}) {
  return (
    <div className="inline-flex rounded-xl bg-background p-3">
      <QRCodeSVG value={value} size={size} />
    </div>
  );
}


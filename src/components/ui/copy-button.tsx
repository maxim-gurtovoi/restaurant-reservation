'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

type CopyButtonProps = {
  value: string;
  label?: string;
  small?: boolean;
};

export function CopyButton({ value, label = 'Copy', small }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // swallow error in UI; copy is best-effort
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      onClick={handleCopy}
      className={small ? 'px-2 py-1 text-xs h-7' : 'px-3 py-1 text-xs h-8'}
    >
      {copied ? 'Copied' : label}
    </Button>
  );
}


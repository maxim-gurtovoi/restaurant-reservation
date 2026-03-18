'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const onLogout = async () => {
    if (loading) return;
    setLoading(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.replace('/auth/login');
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button type="button" variant="outline" onClick={onLogout} disabled={loading}>
      {loading ? 'Signing out…' : 'Sign out'}
    </Button>
  );
}


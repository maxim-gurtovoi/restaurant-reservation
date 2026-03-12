'use client';

import { useEffect, useState } from 'react';
import type { JwtPayloadUser } from '@/types/auth';

export function useAuth() {
  const [user, setUser] = useState<JwtPayloadUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: implement /api/auth/me and load real session state
    setUser(null);
    setLoading(false);
  }, []);

  return { user, loading };
}


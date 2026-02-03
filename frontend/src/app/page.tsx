'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.push('/restaurants');
      } else {
        router.push('/login');
      }
    }
  }, [user, loading, router]);

  return <div className="loading">Redirecting...</div>;
}

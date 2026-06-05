'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useStore } from '@/store/useStore';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { setFirebaseUser } = useStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is signed in.
        setFirebaseUser(user);
        if (pathname === '/login') {
          router.push('/');
        }
      } else {
        // User is signed out.
        setFirebaseUser(null);
        if (pathname !== '/login') {
          router.push('/login');
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [pathname, router, setFirebaseUser]);

  if (loading) {
    return (
      <div style={{ height: '100vh', width: '100vw', background: '#020209', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 14, fontFamily: 'monospace' }}>Loading OS...</div>
      </div>
    );
  }

  return <>{children}</>;
}

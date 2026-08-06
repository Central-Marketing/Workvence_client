"use client";

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useUserStore } from '@/store/userStore';

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const user = useUserStore((state) => state.user);
  const router = useRouter();
  const pathname = usePathname();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const storedUser = localStorage.getItem('user');
    if (!user && !storedUser) {
      router.push(`/login?redirect=${pathname}`);
    }
  }, [user, router, pathname]);

  if (!isMounted) return null;

  return (user || localStorage.getItem('user')) ? <>{children}</> : null;
};

export default PrivateRoute;

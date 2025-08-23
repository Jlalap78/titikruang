'use client';

import { useEffect } from 'react';
import { initAuth } from '../lib/firebase'; // ✅ Make sure this matches actual path

export default function ClientLayout({ children }) {
  useEffect(() => {
    initAuth();
  }, []);

  return <>{children}</>;
}
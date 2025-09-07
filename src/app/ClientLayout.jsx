'use client';

import { useEffect } from 'react';
import { initAuth } from '../lib/firebase'; // ✅ Make sure this matches actual path

export default function ClientLayout({ children }) {
  useEffect(() => {
    initAuth();
  }, []);

  return <>{children}</>;
<<<<<<< HEAD
}
=======
}
>>>>>>> 2bd6121dc2e1eb7e350515c27c240d2799bc5034

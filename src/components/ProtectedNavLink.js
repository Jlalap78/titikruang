"use client";

import { useRouter } from "next/navigation";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";

export default function ProtectedNavLink({
  href = "/diskusi",
  children,
  className = "",
  asButton = false,
}) {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const auth = getAuth();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, [auth]);

  const handleClick = (e) => {
    e?.preventDefault?.();
    if (!user || user.isAnonymous) {
      router.push("/login");
    } else {
      router.push(href);
    }
  };

  if (asButton) {
    return (
      <button onClick={handleClick} className={className}>
        {children}
      </button>
    );
  }

  return (
    <a href={href} onClick={handleClick} className={className}>
      {children}
    </a>
  );
}

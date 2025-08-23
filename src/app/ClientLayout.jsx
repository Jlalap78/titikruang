'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { initAuth } from '../lib/firebase'; // ✅ Make sure this matches actual path

export default function ClientLayout({ children }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    initAuth();
  }, []);

  return (
    <div>
      <header className="container header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link href="/">
            <a style={{ fontWeight: 700 }}>TitikRuang</a>
          </Link>
          <button
            className="hamburger"
            aria-label="Toggle menu"
            onClick={() => setOpen((v) => !v)}
          >
            {/* simple hamburger icon */}
            <svg
              width="20"
              height="14"
              viewBox="0 0 20 14"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect y="1" width="20" height="2" rx="1" fill="currentColor" />
              <rect y="6" width="20" height="2" rx="1" fill="currentColor" />
              <rect y="11" width="20" height="2" rx="1" fill="currentColor" />
            </svg>
          </button>
        </div>

        <nav className="nav nav--desktop">
          <Link className="nav-link" href="/diskusi">
            Diskusi
          </Link>
          <Link className="nav-link" href="/pembelajaran">
            Pembelajaran
          </Link>
          <Link className="nav-link" href="/kuisbintang">
            Kuis
          </Link>
          <Link className="nav-link" href="/login">
            Login
          </Link>
        </nav>
      </header>

      {/* mobile panel */}
      {open && (
        <div
          style={{
            position: 'absolute',
            top: 64,
            left: 0,
            right: 0,
            background: 'white',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            zIndex: 50,
            padding: '1rem',
          }}
        >
          <nav style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Link href="/diskusi">
              <a onClick={() => setOpen(false)}>Diskusi</a>
            </Link>
            <Link href="/pembelajaran">
              <a onClick={() => setOpen(false)}>Pembelajaran</a>
            </Link>
            <Link href="/kuisbintang">
              <a onClick={() => setOpen(false)}>Kuis</a>
            </Link>
            <Link href="/login">
              <a onClick={() => setOpen(false)}>Login</a>
            </Link>
          </nav>
        </div>
      )}

      <main className="container main-grid">
        {/* optional sidebar if needed */}
        <div className="content">{children}</div>
      </main>
    </div>
  );
}

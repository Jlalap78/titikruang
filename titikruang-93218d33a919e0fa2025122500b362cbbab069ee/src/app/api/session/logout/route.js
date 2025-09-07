// src/app/api/session/logout/route.js
import { cookies } from 'next/headers';
import { getAuth, signOut } from 'firebase-admin/auth';
import { getApp, getApps, initializeApp, cert } from 'firebase-admin/app';

// Inisialisasi Firebase Admin (hanya sekali)
if (!getApps().length) {
  if (
    !process.env.FIREBASE_PROJECT_ID ||
    !process.env.FIREBASE_CLIENT_EMAIL ||
    !process.env.FIREBASE_PRIVATE_KEY
  ) {
    throw new Error(
      "FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY must be set in .env"
    );
  }

  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    }),
  });
}

export async function POST(req) {
  try {
    // Hapus cookie __session
    const cookieStore = cookies();
    cookieStore.set('__session', '', {
      httpOnly: true,
      secure: true,
      path: '/',
      expires: new Date(0),
      sameSite: 'lax',
    });

    // Jika ada user saat ini, sign out via Firebase Admin
    const auth = getAuth(getApp());
    // Note: di server admin, kita biasanya tidak punya client user, jadi signOut di client lebih penting
    // Tapi bisa hapus refresh token supaya user invalidated:
    // await auth.revokeRefreshTokens(uid); // opsional

    return new Response(JSON.stringify({ success: true, message: 'Logged out' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Logout failed', err);
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

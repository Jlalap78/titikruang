import admin from 'firebase-admin';

// Inisialisasi admin SDK sekali (pakai service account atau GOOGLE_APPLICATION_CREDENTIALS)
if (!admin.apps?.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(), // atau supply cert dari env
  });
}

export async function POST(req) {
  const { idToken } = await req.json();
  if (!idToken) return new Response(JSON.stringify({ error: 'no token' }), { status: 400 });

  const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days in ms
  try {
    const sessionCookie = await admin.auth().createSessionCookie(idToken, { expiresIn });
    const options = [
      `session=${sessionCookie}`,
      'HttpOnly',
      'Path=/',
      `Max-Age=${Math.floor(expiresIn / 1000)}`,
      'SameSite=Lax',
      process.env.NODE_ENV === 'production' ? 'Secure' : ''
    ].filter(Boolean).join('; ');

    return new Response(JSON.stringify({ status: 'success' }), {
      status: 200,
      headers: { 'Set-Cookie': options, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 401 });
  }
}
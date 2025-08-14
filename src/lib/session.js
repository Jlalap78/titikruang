import { cookies } from "next/headers";
import { getAuth } from "firebase-admin/auth";
import { getApps, initializeApp, cert } from "firebase-admin/app";

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}

export async function getSessionUser() {
  const cookie = cookies().get("__session")?.value;
  if (!cookie) return null;
  try {
    return await getAuth().verifySessionCookie(cookie, true); // check revoked
  } catch {
    return null;
  }
}

import { getApps, initializeApp, applicationDefault, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import * as admin from "firebase-admin";

const app = getApps().length
  ? getApps()[0]
  : initializeApp({
      credential: process.env.FIREBASE_CLIENT_EMAIL
        ? cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
          })
        : applicationDefault(),
    });

export const adminAuth = getAuth(app);

// ✅ Export default supaya bisa di-import sebagai "admin"
export default admin;

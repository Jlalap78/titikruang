import { NextResponse } from "next/server";
import admin from "firebase-admin";

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
  });
}

// Handle GET request
export async function GET() {
  try {
    const listUsersResult = await admin.auth().listUsers(1000);

    const users = listUsersResult.users.map((user) => ({
      uid: user.uid,
      email: user.email || null,
      provider: (user.providerData || []).map((p) => p.providerId),
      created: user.metadata?.creationTime || null,
      name: user.displayName || null,
    }));

    return NextResponse.json(users, { status: 200 });
  } catch (err) {
    console.error("Error listing users:", err);
    return NextResponse.json(
      { error: err?.message || "Server error" },
      { status: 500 }
    );
  }
}

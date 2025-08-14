import { NextResponse } from "next/server";
import { getAuth } from "firebase-admin/auth";
import { initializeApp, cert, getApps } from "firebase-admin/app";

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: "anonymouschatforum",
      clientEmail: "firebase-adminsdk-fbsvc@anonymouschatforum.iam.gserviceaccount.com",
      privateKey: "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDAVPSE6+jAWFsE\nMCm37MV1SKqQeUsIaayinUZLnBP+3lFGW3rVSkLIZLhy8n994j3ELZx/q/glte4z\nb6th+a74JKAsJKLfrYhO8sTCZnIm4Xz6h/zdUPT5MilKx1Tw5EJpGNHqvO1YlJqq\nt4JG+dHJtxNi2DMUvW0NiXuzFZhPYyxxcpWBq2ibdXhv1PLFmAZ9l2ZMOTJkZJX/\nYkNVkAXaototGBhWNgYepfiZrtBPH2eY7kXm/CI9Jdi5VNJdzJxhP1EA7SxOPi9S\nvnAA13rk8oqYDXOPakmDXD00mpNh621OLPwtzD7DJv6F6JWunNDerpBNEKOmbPXb\nK0yGcJh/AgMBAAECggEAG7F/3c3MHzn5rQI0V5ffnLIgYRod7DGvGmET+JoaJPYk\n9MECUEjXkdwy1NZG9jzH0QISSS3dVqy6Biz7m+lkQLWhXInP6+4kNN3u5+DxadjI\n8pf3GHTqOSF4YZyPBfqP92sL+sVGVZ1cId23g/m/s9BJGc/wlvlphOv5ZEFlQ3TP\nVKGb5tkttNQZiIL/16kUxB7EYfrU3cNn1hQvYXaZp7qlsxQabE/SeUJvr6rWklZ6\nk0f+OlS8WeDkRw0wiH92kIWIIyK+USFu6WSILCCjt+/TIUWUhntmzmF9Ms46GY9z\nc2VFC7CK6mjfCoc94IQfwALcaHwnv1PPuE22MyYqJQKBgQD66JT5z8F1jQIpvCvL\nsIJ3a8p/36QUWDWKz6zUU5Y7KesxVwpxuz82yMTnKBYUZgHvnd8dWQAeOFooeiIz\nem76xhT7hqSoRmWvN7sy/C+P90WyZGNdhwSdUPKmsxprTWTveF0sqgkTrg0VBHM8\nF6exa+gcN1DDRrNu6IpOUZHOUwKBgQDEPBRaXsaZaNJGc59gcRDvd0Y/J8q23GqT\nLtcMFDF05oFj9rw13FnnP0iNUvsw8GXWO3l2RQJb3zc/4Z5AYVaFmJzW/8X1zFv3\nB2ZuxJVB37PlbKf2Q25i/vtjk8mRxAvzbcDunm1wUPB5cJOgzyChS9Q1u9tZ/gvV\nlzvwQKlPpQKBgQCBQgRNVYwSZNwyZ/Af9QShRPSDP9ElcfPTWP1uPMluHUA+oNqO\nkKoWLQPTGcGWLJ7etHPWiJ0Y9Grt401vO6mkoxr4IPr+fZWw2IMl1ukhv382UaUm\n74GfEa6P1kDL+oj/HQDTG52ld8rhgvNih8UqD675qj1+/BNAFaf6hOcaZQKBgQC1\nyZJxRWtlop1pdqMmjJfLvwrsZsh8LiTsxG+jWPGYAhHLsT8aBk+i0hU8Fqts4sb0\nd5RF5BgTU+2y2CfqLEIi8QYahke1NOPdLJXP93zt0XauCsJueHlCbEQmMzqANsV7\ndSlN5KYtbk3XslqQllD8G2szfBvwelAsRjXYk45FoQKBgFNz7C6oyNUn3VdPiDf7\n7GL6P9CNaw1XkVSBEa55WqfD4OblBlJ55UfrDfZHYvyestDOjEg1XeLI1eoOUmO0\nAuedJUbdWwryWctGgWgjBmpK5xBbhwcGxQtJdPX6yaRI/s31fLM/CtSzsWgHcEN2\niC0+Vp7zm1Vw4RyYvsH+0uJA\n-----END PRIVATE KEY-----\n",
    }),
  });
}
export async function POST(req) {
  try {
    const { idToken } = await req.json();
    if (!idToken) return NextResponse.json({ error: "Missing idToken" }, { status: 400 });

    const expiresIn = 14 * 24 * 60 * 60 * 1000; // max 14 hari
    const sessionCookie = await getAuth().createSessionCookie(idToken, { expiresIn });

    const res = NextResponse.json({ ok: true });
    res.cookies.set("__session", sessionCookie, { httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge: expiresIn / 1000 });
    return res;
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

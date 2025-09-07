"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
<<<<<<< HEAD
  updateProfile,
} from "firebase/auth";
import { initializeApp, getApps } from "firebase/app";
import { setDoc, doc } from "firebase/firestore";
import { db } from "../../lib/firebase";
=======
  signInWithRedirect, // <-- added
} from "firebase/auth";
import { auth, googleProvider } from "../../lib/firebase";
>>>>>>> 2bd6121dc2e1eb7e350515c27c240d2799bc5034
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { FaGoogle } from "react-icons/fa";

<<<<<<< HEAD
// --- Firebase Client Config ---
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
};

// ✅ Prevent duplicate app initialization
const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export default function LoginPage() {
=======
export default function Page() {
>>>>>>> 2bd6121dc2e1eb7e350515c27c240d2799bc5034
  const [isLogin, setIsLogin] = useState(true);
  const [agree, setAgree] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
<<<<<<< HEAD
=======
  const [isProcessing, setIsProcessing] = useState(false);
>>>>>>> 2bd6121dc2e1eb7e350515c27c240d2799bc5034
  const router = useRouter();
  const emailInputRef = useRef(null);
  const passwordInputRef = useRef(null);

  // inline error states (hindari ReferenceError)
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [formError, setFormError] = useState("");

  // lupa password states
  const [showReset, setShowReset] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [resetMessage, setResetMessage] = useState(null);
  // helper to send reset email
  const handlePasswordReset = async (e) => {
    e?.preventDefault?.();
    const mail = (resetEmail || email || "").trim();
    if (!mail) {
      setResetMessage("Masukkan email terlebih dahulu.");
      return;
    }
    setResetLoading(true);
    setResetMessage(null);
    try {
      await sendPasswordResetEmail(auth, mail);
      setResetMessage("Link reset password telah dikirim ke email Anda.");
    } catch (err) {
      console.error("reset error", err);
      setResetMessage("Gagal mengirim link: " + (err?.message || err));
    } finally {
      setResetLoading(false);
    }
  };

  // ✅ Auto-focus input email saat di halaman login
  useEffect(() => {
    if (isLogin && emailInputRef.current) {
      emailInputRef.current.focus();
    }
  }, [isLogin]);

  // --- Handle Login ---
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setEmailError("");
    setPasswordError("");
    setFormError("");

    // simple client-side validation
    if (!email) {
      setEmailError("Masukkan email");
      setLoading(false);
      return;
    }
    if (!password) {
      setPasswordError("Masukkan password");
      setLoading(false);
      return;
    }

    try {
      // gunakan try/catch tunggal — jangan chain .catch pada await
      const userCred = await signInWithEmailAndPassword(auth, email, password);

      const idToken = await userCred.user.getIdToken();
      const res = await fetch("/api/session/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });

      if (!res.ok) {
        setFormError("Gagal membuat session. Coba lagi.");
        return;
      }

      router.push("/");
    } catch (err) {
      const code = err?.code || "";
      // prioritaskan pesan spesifik
      if (code.includes("auth/user-not-found")) {
        setEmailError("Email tidak terdaftar");
        emailInputRef.current?.focus?.();
      } else if (code.includes("auth/wrong-password")) {
        setPasswordError("Password salah");
        passwordInputRef.current?.focus?.();
      } else if (code.includes("auth/invalid-email")) {
        setEmailError("Format email tidak valid");
        emailInputRef.current?.focus?.();
      } else if (code.includes("auth/invalid-credential") || code.includes("auth/invalid-assertion")) {
        // Banyak server / provider mengembalikan 'invalid-credential' untuk kredensial salah:
        setPasswordError("Email atau password salah");
        passwordInputRef.current?.focus?.();
      } else {
        // fallback ramah
        setFormError("Email atau password salah");
      }
      console.error("Login error handled:", err);
    } finally {
      setLoading(false);
    }
  };

  // --- Handle Register ---
  const handleRegister = async (e) => {
    e.preventDefault();
    if (!agree) return;
    setLoading(true);
    setFormError("");
    try {
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
<<<<<<< HEAD
  // Set displayName to the name entered during registration
  await updateProfile(userCred.user, { displayName: name });
      // Save name to Firestore user profile
      await setDoc(doc(db, "userProfiles", userCred.user.uid), {
        name: name,
        createdAt: new Date()
      }, { merge: true });
=======
>>>>>>> 2bd6121dc2e1eb7e350515c27c240d2799bc5034
      const idToken = await userCred.user.getIdToken();
      await fetch("/api/session/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });
      router.push("/");
    } catch (err) {
      console.error("Register error:", err);
      const code = err?.code || "";
      if (code.includes("auth/email-already-in-use")) {
<<<<<<< HEAD
        setEmailError("Email sudah terdaftar, silakan login.");
=======
        setEmailError("Email sudah terdaftar");
>>>>>>> 2bd6121dc2e1eb7e350515c27c240d2799bc5034
      } else if (code.includes("auth/weak-password")) {
        setPasswordError("Password terlalu lemah");
      } else {
        setFormError(err?.message || "Registrasi gagal");
      }
    } finally {
      setLoading(false);
    }
  };

  // --- Handle Google Login ---
  const handleGoogleLogin = async () => {
<<<<<<< HEAD
    setFormError("");
    setLoading(true);
=======
    if (isProcessing) return;
    setIsProcessing(true);
    setFormError("");

    // debug quick-check (lihat console)
    console.debug("DEBUG auth / googleProvider:", { auth, googleProvider });

    // guard: pastikan kedua instance tersedia
    if (!auth || !googleProvider) {
      console.error("auth or googleProvider is undefined", { auth, googleProvider });
      setFormError("Internal error: auth/provider tidak tersedia. Cek konfigurasi Firebase.");
      setIsProcessing(false);
      return;
    }

>>>>>>> 2bd6121dc2e1eb7e350515c27c240d2799bc5034
    try {
      // sign in with popup
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
<<<<<<< HEAD

      // get ID token and create server session (same flow as email login)
      const idToken = await user.getIdToken();
      const res = await fetch("/api/session/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });

      if (!res.ok) {
        console.error("session API response", res.status, await res.text());
        throw new Error("Gagal membuat session. Coba lagi.");
      }

      router.push("/");
=======
      const idToken = await user.getIdToken();

      // kirim ke server untuk buat session cookie
      await fetch("/api/sessionLogin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ idToken }),
      });

      // sekarang cookie session sudah diset oleh server, redirect ke /diskusi
      window.location.href = "/diskusi";
>>>>>>> 2bd6121dc2e1eb7e350515c27c240d2799bc5034
    } catch (err) {
      console.error("Google login error:", err);
      const code = err?.code || "";
      if (code.includes("auth/popup-closed-by-user")) {
        setFormError("Proses masuk dibatalkan.");
      } else if (code.includes("auth/cancelled-popup-request") || code.includes("auth/popup-blocked")) {
        setFormError("Popup diblokir. Izinkan popup pada browser atau coba lagi.");
      } else if (code.includes("auth/unauthorized-domain")) {
        setFormError("Domain tidak diizinkan di Firebase Auth. Tambahkan domain ke Authorized domains di Firebase Console.");
      } else {
        setFormError(err?.message || "Login Google gagal. Periksa console untuk detail.");
      }
<<<<<<< HEAD
    } finally {
      setLoading(false);
=======

      // fallback ke redirect bila popup bermasalah
      if (code === "auth/cancelled-popup-request" || code === "auth/popup-blocked") {
        try {
          await signInWithRedirect(auth, googleProvider);
        } catch (redirectErr) {
          console.error("Redirect fallback failed", redirectErr);
        }
      }
    } finally {
      setIsProcessing(false);
>>>>>>> 2bd6121dc2e1eb7e350515c27c240d2799bc5034
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-500 to-blue-700 p-4">
      {/* Tulisan Selamat Datang */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: -40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.7, type: "spring" }}
        className="mb-8 text-center"
      >
        <motion.h1
          initial={{ rotate: -5 }}
          animate={{ rotate: 0 }}
          transition={{ duration: 0.7, type: "spring" }}
          className="text-3xl md:text-4xl font-extrabold text-white drop-shadow-lg"
        >
          SELAMAT DATANG di{" "}
          <span className="text-yellow-300 animate-pulse">Titik Ruang</span>
        </motion.h1>
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="mx-auto mt-2 h-1 w-32 bg-yellow-300 rounded-full origin-left"
        />
      </motion.div>

      <div className="flex items-center justify-center">
        {/* Maskot */}
        <div className="hidden md:flex flex-col items-center mr-10">
          <img
            src="/mascot4.gif"
            alt="Maskot TitikRuang"
            className="max-w-[220px] w-full h-auto"
          />
        </div>

        {/* Card Form */}
        <div className="w-full max-w-md bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl p-6 relative overflow-hidden">
          {/* Tombol Kembali */}
          <div className="mb-4">
            <Link href="/">
              <button className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium px-3 py-2 rounded-lg hover:bg-blue-100 transition">
                ← Kembali ke Beranda
              </button>
            </Link>
          </div>

          <AnimatePresence mode="wait">
            {isLogin ? (
              <motion.div
                key="login"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 50 }}
                transition={{ duration: 0.4 }}
              >
                <h2 className="text-xl font-semibold text-center mb-4">Login</h2>
                <form className="space-y-4" onSubmit={handleLogin}>
                  <div>
                    <input
                      ref={emailInputRef}
                      type="email"
                      placeholder="Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none ${
                        emailError
                          ? "border-red-500 focus:ring-red-300"
                          : "focus:ring-2 focus:ring-blue-400"
                      }`}
                    />
                    {emailError && (
                      <p className="mt-1 text-xs text-red-600">{emailError}</p>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      ref={passwordInputRef}
                      type={showPassword ? "text" : "password"}
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none ${
                        passwordError
                          ? "border-red-500 focus:ring-red-300"
                          : "focus:ring-2 focus:ring-blue-400"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                    {passwordError && (
                      <p className="mt-1 text-xs text-red-600">{passwordError}</p>
                    )}
                  </div>
                  {formError && (
                    <p className="text-center text-sm text-red-600">{formError}</p>
                  )}

                  {/* Tombol Login Google */}
                  <button
                    type="button"
                    onClick={handleGoogleLogin}
<<<<<<< HEAD
                    className="w-full flex items-center justify-center gap-2 border border-gray-300 bg-white py-2 rounded-lg hover:bg-gray-100 transition"
                  >
                    <FaGoogle className="w-5 h-5" />
                    Login dengan Google
=======
                    disabled={isProcessing}
                    className="w-full flex items-center justify-center gap-2 border border-gray-300 bg-white py-2 rounded-lg hover:bg-gray-100 transition"
                  >
                    <FaGoogle className="w-5 h-5" />
                    {isProcessing ? "Memproses..." : "Login dengan Google"}
>>>>>>> 2bd6121dc2e1eb7e350515c27c240d2799bc5034
                  </button>

                  {/* lupa password link */}
                  <div className="text-right mt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowReset(true);
                        setResetEmail(email);
                      }}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      Lupa password?
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
                  >
                    {loading ? "Memproses..." : "Masuk"}
                  </button>
                </form>
                <p className="text-center text-sm mt-4">
                  Belum punya akun?{" "}
                  <button
                    onClick={() => setIsLogin(false)}
                    className="text-blue-600 hover:underline"
                  >
                    Daftar
                  </button>
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="register"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.4 }}
              >
                <h2 className="text-xl font-semibold text-center mb-4">Daftar</h2>
                <form className="space-y-4" onSubmit={handleRegister}>
                  <input
                    type="text"
                    placeholder="Nama Lengkap"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="agree"
                      checked={agree}
                      onChange={() => setAgree(!agree)}
                      className="accent-blue-600"
                    />
                    <label htmlFor="agree" className="text-sm">
                      Saya menyetujui{" "}
                      <a
                        href="/policy"
                        target="_blank"
                        className="text-blue-600 underline"
                      >
                        Syarat dan Ketentuan
                      </a>
                    </label>
                  </div>
                  <button
                    type="submit"
                    disabled={!agree || loading}
                    className={`w-full py-2 rounded-lg transition ${
                      agree
                        ? "bg-blue-600 text-white hover:bg-blue-700"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    {loading ? "Memproses..." : "Daftar"}
                  </button>
                </form>
                <p className="text-center text-sm mt-4">
                  Sudah punya akun?{" "}
                  <button
                    onClick={() => setIsLogin(true)}
                    className="text-blue-600 hover:underline"
                  >
                    Login
                  </button>
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* reset password panel (tampil bila user klik 'Lupa password?') */}
          {showReset && (
            <div className="mt-4 p-4 bg-white/90 rounded-lg shadow-inner border">
              <h3 className="font-semibold text-sm mb-1">Reset Password</h3>
              <p className="text-xs text-gray-600 mb-2">
                Masukkan email yang terdaftar, kami akan mengirimkan link untuk merubah password.
              </p>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Email untuk reset"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  className="flex-1 px-3 py-2 border rounded-md"
                />
                <button
                  onClick={handlePasswordReset}
                  disabled={resetLoading}
                  className="px-3 py-2 bg-blue-600 text-white rounded-md"
                >
                  {resetLoading ? "Mengirim..." : "Kirim"}
                </button>
                <button
                  onClick={() => {
                    setShowReset(false);
                    setResetMessage(null);
                  }}
                  className="px-3 py-2 text-sm text-gray-600"
                >
                  Batal
                </button>
              </div>
              {resetMessage && (
                <p className="mt-2 text-sm text-gray-700">{resetMessage}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

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
} from "firebase/auth";
import { initializeApp, getApps } from "firebase/app";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { FaGoogle } from "react-icons/fa";

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

export default function Page() {
  const [isLogin, setIsLogin] = useState(true);
  const [agree, setAgree] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const emailInputRef = useRef(null);

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
    try {
      const userCred = await signInWithEmailAndPassword(auth, email, password);
      const idToken = await userCred.user.getIdToken();
      await fetch("/api/session/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });
      router.push("/"); // ✅ redirect ke halaman utama
    } catch (err) {
      alert("Login gagal: " + err.message);
    }
    setLoading(false);
  };

  // --- Handle Register ---
  const handleRegister = async (e) => {
    e.preventDefault();
    if (!agree) return;
    setLoading(true);
    try {
      const userCred = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const idToken = await userCred.user.getIdToken();
      await fetch("/api/session/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });
      router.push("/"); // ✅ redirect ke halaman utama
    } catch (err) {
      alert("Registrasi gagal: " + err.message);
    }
    setLoading(false);
  };

  // --- Handle Google Login ---
  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      router.push("/"); // ✅ redirect ke halaman utama
    } catch (err) {
      alert("Login Google gagal: " + err.message);
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
                  <input
                    ref={emailInputRef}
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

                  {/* Tombol Login Google */}
                  <button
                    type="button"
                    onClick={handleGoogleLogin}
                    className="w-full flex items-center justify-center gap-2 border border-gray-300 bg-white py-2 rounded-lg hover:bg-gray-100 transition"
                  >
                    <FaGoogle className="w-5 h-5" />
                    Login dengan Google
                  </button>

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
        </div>
      </div>
    </div>
  );
}

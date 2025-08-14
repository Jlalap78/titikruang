"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

export default function Page() {
  const [isLogin, setIsLogin] = useState(true);
  const [agree, setAgree] = useState(false);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-500 to-blue-700 p-4">
      {/* Tulisan Selamat Datang di luar form, di atas */}
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
        {/* Animasi garis bawah */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="mx-auto mt-2 h-1 w-32 bg-yellow-300 rounded-full origin-left"
        />
      </motion.div>
      <div className="flex items-center justify-center">
        {/* Maskot di luar form, di samping */}
        <div className="hidden md:flex flex-col items-center mr-10">
          <img
            src="/mascot4.gif"
            alt="Maskot TitikRuang"
            className="max-w-[220px] w-full h-auto"
          />
        </div>
        {/* Card Form */}
        <div className="w-full max-w-md bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl p-6 relative overflow-hidden">
          {/* Tombol Kembali ke Beranda */}
          <div className="mb-4">
            <Link href="/">
              <button className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium px-3 py-2 rounded-lg hover:bg-blue-100 transition">
                ← Kembali ke Beranda
              </button>
            </Link>
          </div>
          {/* Animasi Pergantian Form */}
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
                <form className="space-y-4">
                  <input
                    type="email"
                    placeholder="Email"
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                  <input
                    type="password"
                    placeholder="Password"
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                  <button
                    type="submit"
                    className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
                  >
                    Masuk
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
                <form className="space-y-4">
                  <input
                    type="text"
                    placeholder="Nama Lengkap"
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                  <input
                    type="password"
                    placeholder="Password"
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
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
                    className={`w-full py-2 rounded-lg transition ${
                      agree
                        ? "bg-blue-600 text-white hover:bg-blue-700"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                    disabled={!agree}
                  >
                    Daftar
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

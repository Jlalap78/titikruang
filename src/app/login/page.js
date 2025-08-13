"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Page() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-500 to-blue-700 p-4">
      <div className="w-full max-w-md bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl p-6 relative overflow-hidden">
        
        {/* Tulisan Selamat Datang */}
        <motion.h1
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center text-2xl font-bold text-blue-700 mb-6"
        >
          SELAMAT DATANG di <span className="text-blue-500">Titik Ruang</span>
        </motion.h1>

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
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
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
  );
}

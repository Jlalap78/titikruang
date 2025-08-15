"use client";

import { motion, useAnimationControls } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Lottie from "lottie-react";
import animationData from "../animations/hero-animation.json";
import { animateScroll as scroll } from "react-scroll";
import Link from "next/link";
import {
  FaEnvelope,
  FaPhoneAlt,
  FaWhatsapp,
  FaInstagram,
  FaFacebook,
  FaTwitter,
  FaYoutube,
  FaLinkedin,
  FaTiktok,
} from "react-icons/fa";

// Firebase auth imports (integrasi AuthButton)
import {
  getAuth,
  signInAnonymously,
  onAuthStateChanged,
  signOut,
  signInWithCustomToken,
  getIdTokenResult,
} from "firebase/auth";
import { app } from "../lib/firebase"; // sesuaikan path jika perlu

function LandingPage() {
  const [faqOpen, setFaqOpen] = useState(null);
  const [activeMenu, setActiveMenu] = useState(null);
  const [hoveredMenu, setHoveredMenu] = useState(null);
  const [hoverTimeout, setHoverTimeout] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const dropdownRef = useRef(null);

  const { ref: heroRef, inView: inViewHero } = useInView({ threshold: 0.3 });
  const { ref: supportRef, inView: inViewSupport } = useInView({
    threshold: 0.3,
  });
  const { ref: aboutRef, inView: inViewAbout } = useInView({ threshold: 0.3 });

  const dropdowns = {
    support: ["🗣️ Ruang Curhat", "🤝 Diskusi Komunitas"],
    learning: ["🎧 Konten Edukatif", "💰 Simulasi Pinjaman"],
    tools: ["⭐ Kuis Bintang", "🤖 TIKUBOT"],
  };

  const isMenuOpen = (key) => hoveredMenu === key;

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleMenuToggle = (key) => {
    setHoveredMenu((prev) => (prev === key ? null : key));
  };

  // ------------------ AUTH (integrated AuthButton) ------------------
  const auth = getAuth(app);
  const [user, setUser] = useState(null);
  // isGuest: true jika user anonymous asli Firebase ATAU mode-guest via custom token dengan claim { guest: true }
  const [isGuest, setIsGuest] = useState(true);

  // Modal / loading states already used in UI
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const ANON_UID_KEY = "ANON_UID";

  /**
   * Meminta custom token dari server untuk UID tamu tertentu.
   * Harapkan endpoint Next.js API (server) seperti: /api/auth/guest-token?uid=<uid>
   * yang di-backend membuat custom token via Admin SDK dengan custom claim { guest: true }.
   * Response JSON: { token: string }
   */
  const fetchGuestToken = async (uid) => {
    if (!uid) return null;
    try {
      const res = await fetch(
        `/api/auth/guest-token?uid=${encodeURIComponent(uid)}`,
        {
          method: "GET",
          credentials: "include",
          headers: { Accept: "application/json" },
        }
      );
      if (!res.ok) return null;
      const data = await res.json();
      return data?.token || null;
    } catch (err) {
      console.error("Gagal mengambil guest custom token:", err);
      return null;
    }
  };

  // Mencoba sign-in dengan custom token untuk ANON_UID yang tersimpan
  const signInAsStoredGuest = async () => {
    try {
      const storedUid =
        typeof window !== "undefined"
          ? localStorage.getItem(ANON_UID_KEY)
          : null;
      if (!storedUid) return false;
      const token = await fetchGuestToken(storedUid);
      if (!token) return false;
      await signInWithCustomToken(auth, token);
      return true;
    } catch (err) {
      console.error("signInWithCustomToken gagal:", err);
      return false;
    }
  };

  // Pastikan ada sesi guest aktif. Prioritas: custom token ANON_UID -> fallback anonymous.
  const ensureGuestSignedIn = async () => {
    const ok = await signInAsStoredGuest();
    if (ok) return;
    try {
      const cred = await signInAnonymously(auth);
      const uid = cred?.user?.uid;
      // Simpan ANON_UID hanya jika belum ada. Sekali terset, tidak diubah walau fallback lain menghasilkan UID baru.
      if (
        typeof window !== "undefined" &&
        uid &&
        !localStorage.getItem(ANON_UID_KEY)
      ) {
        localStorage.setItem(ANON_UID_KEY, uid);
      }
    } catch (err) {
      console.error("Anonymous sign-in failed:", err);
    }
  };

  useEffect(() => {
    let mounted = true;

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!mounted) return;

      if (currentUser) {
        setUser(currentUser);

        // Tentukan status guest: anonymous native atau custom token dengan claim guest
        let guest = !!currentUser.isAnonymous;
        try {
          const idTokenResult = await getIdTokenResult(currentUser, true);
          if (
            idTokenResult?.claims &&
            typeof idTokenResult.claims.guest !== "undefined"
          ) {
            guest = !!idTokenResult.claims.guest;
          }
        } catch (err) {
          // Abaikan error; gunakan isAnonymous saja
        }
        setIsGuest(guest);

        // Jika ini anonymous pertama kali dan ANON_UID belum ada, simpan.
        if (guest && typeof window !== "undefined") {
          const stored = localStorage.getItem(ANON_UID_KEY);
          if (!stored) {
            localStorage.setItem(ANON_UID_KEY, currentUser.uid);
          }
        }
      } else {
        // Tidak ada user -> pastikan masuk sebagai guest sesuai mekanisme.
        await ensureGuestSignedIn();
      }
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, [auth]);

  // Logout workflow: sign out lalu coba masuk lagi sebagai guest dg ANON_UID (custom token). Fallback: anonymous.
  const handleConfirmLogout = async () => {
    setIsLoggingOut(true);
    setShowLogoutModal(false);

    try {
      await signOut(auth);
    } catch (err) {
      console.error("Sign-out error:", err);
      // lanjut ke percobaan sign-in guest meski signOut error
    }

    try {
      const ok = await signInAsStoredGuest();
      if (!ok) {
        await signInAnonymously(auth);
      }
    } catch (err) {
      console.error("Anonymous re-signin failed:", err);
    } finally {
      setIsLoggingOut(false);
    }
  };
  // ---------------- end AUTH integration ----------------

  return (
    <main>
      <div className="min-h-screen bg-gradient-to-br from-[#3061F2] via-white to-[#F2BF27]/10 text-gray-800">
        {/* Header */}
        <motion.header
          className="bg-white text-gray-900 shadow sticky top-0 z-50"
          initial={{ y: 0 }}
          animate={{ y: scrollY > 100 ? -100 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="max-w-7xl mx-auto flex items-center justify-between p-4 relative">
            <div className="flex items-center gap-2">
              <Image
                src="/logo.png"
                alt="TitikRuang Logo"
                width={40}
                height={40}
              />
              <div className="text-2xl font-bold whitespace-nowrap">
                TitikRuang
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav
              className="hidden md:flex gap-6 text-sm relative z-50"
              ref={dropdownRef}
            >
              {Object.entries({
                support: "Pusat Dukungan Anonim",
                learning: "Pusat Pembelajaran",
                tools: "Alat Pendukung",
              }).map(([key, label]) => (
                <div
                  key={key}
                  className="relative"
                  onMouseEnter={() => {
                    if (hoverTimeout) clearTimeout(hoverTimeout);
                    setHoveredMenu(key);
                  }}
                  onMouseLeave={() => {
                    const timeout = setTimeout(() => setHoveredMenu(null), 200);
                    setHoverTimeout(timeout);
                  }}
                >
                  <div className="relative">
                    <div className="absolute inset-0 bg-[#F25050] rounded-xl -z-10"></div>
                    <button
                      onClick={() => setHoveredMenu(key)}
                      className="text-white hover:text-[#F2BF27] transition-colors duration-300 px-2 py-1 rounded-xl"
                    >
                      {label}
                    </button>
                  </div>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={
                      isMenuOpen(key)
                        ? { opacity: 1, scale: 1, y: 0 }
                        : { opacity: 0, scale: 0.95, y: -10 }
                    }
                    transition={{ duration: 0.3 }}
                    className={`absolute left-0 bg-white text-black rounded-xl mt-2 py-2 px-4 shadow-lg min-w-max z-50 ${
                      isMenuOpen(key) ? "block" : "hidden"
                    }`}
                  >
                    {dropdowns[key].map((item, i) => {
                      const parts = item.split(" ");
                      const label = (parts[1] || parts[0]).toLowerCase();
                      const isDiskusi = item.includes("Diskusi");
                      const isCurhat = item.includes("Ruang Curhat");
                      const isBelajar = item.includes("Konten Edukatif");
                      const isSimulasi = item.includes("Simulasi Pinjaman");
                      const isKuis = item.includes("Kuis Bintang");
                      const href = isDiskusi
                        ? "/diskusi"
                        : isCurhat
                        ? "/ruang"
                        : isBelajar
                        ? "/pembelajaran"
                        : isSimulasi
                        ? "/simulasipinjaman"
                        : isKuis
                        ? "/kuisbintang"
                        : `#${label}`;
                      return (
                        <a
                          key={i}
                          href={href}
                          className="block py-1 px-2 hover:bg-[#F2BF27]/20 hover:text-[#F2780C] rounded"
                        >
                          {item}
                        </a>
                      );
                    })}
                  </motion.div>
                </div>
              ))}

              {/* ✅ Tombol Tentang Kami langsung */}
              <a
                href="/tentangkami"
                className="text-white hover:text-[#F2BF27] transition-colors duration-300 px-2 py-1 rounded-xl relative"
              >
                <span className="absolute inset-0 bg-[#F25050] rounded-xl -z-10"></span>
                Tentang Kami
              </a>
            </nav>

            {/* Tombol Masuk / Keluar Desktop (based on isGuest) */}
            <div className="hidden md:block">
              {isGuest ? (
                <Link
                  href="/login"
                  className="bg-[#F25050] text-white px-4 py-2 rounded-xl hover:bg-[#F2780C]"
                >
                  Masuk
                </Link>
              ) : (
                <button
                  onClick={() => setShowLogoutModal(true)}
                  className="bg-[#F25050] text-white px-4 py-2 rounded-xl hover:bg-[#F2780C]"
                >
                  Keluar
                </button>
              )}
            </div>

            {/* Tombol Hamburger */}
            <button
              className="md:hidden"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              <span className="text-black text-xl">
                {mobileOpen ? "✕" : "☰"}
              </span>
            </button>
          </div>

          {/* Mobile Navigation */}
          {mobileOpen && (
            <div className="md:hidden bg-white text-black px-4 pb-4 pt-2 space-y-2">
              {Object.entries({
                support: "Pusat Dukungan Anonim",
                learning: "Pusat Pembelajaran",
                tools: "Alat Pendukung",
              }).map(([key, label]) => (
                <details
                  key={key}
                  className="border rounded-md overflow-hidden"
                >
                  <summary className="px-3 py-2 cursor-pointer font-medium hover:bg-gray-100">
                    {label}
                  </summary>
                  <div className="px-4 pb-2 pt-1 text-sm space-y-1">
                    {dropdowns[key].map((item, i) => {
                      const parts = item.split(" ");
                      const label = (parts[1] || parts[0]).toLowerCase();
                      const isDiskusi = item.includes("Diskusi");
                      const isCurhat = item.includes("Ruang Curhat");
                      const isBelajar = item.includes("Konten Edukatif");
                      const isSimulasi = item.includes("Simulasi Pinjaman");
                      const isKuis = item.includes("Kuis Bintang");
                      const href = isDiskusi
                        ? "/diskusi"
                        : isCurhat
                        ? "/ruang"
                        : isBelajar
                        ? "/pembelajaran"
                        : isSimulasi
                        ? "/simulasipinjaman"
                        : isKuis
                        ? "/kuisbintang"
                        : `#${label}`;
                      return (
                        <a
                          key={i}
                          href={href}
                          className="block hover:text-[#F2780C] text-black"
                        >
                          {item}
                        </a>
                      );
                    })}
                  </div>
                </details>
              ))}

              {/* ✅ Tombol Tentang Kami di versi Mobile */}
              <a
                href="/tentangkami"
                className="block text-center font-medium py-2 rounded-lg text-[#F25050] hover:text-[#F2780C] border border-[#F25050]"
              >
                Tentang Kami
              </a>

              {/* Tombol Masuk / Keluar Mobile */}
              {isGuest ? (
                <Link
                  href="/login"
                  className="w-full block text-center bg-[#F25050] text-white py-2 rounded-lg hover:bg-[#F2780C]"
                >
                  Masuk
                </Link>
              ) : (
                <button
                  onClick={() => {
                    setMobileOpen(false);
                    setShowLogoutModal(true);
                  }}
                  className="w-full bg-[#F25050] text-white py-2 rounded-lg hover:bg-[#F2780C]"
                >
                  Keluar
                </button>
              )}
            </div>
          )}
        </motion.header>

        {/* Hero */}
        <section
          ref={heroRef}
          id="hero"
          className="bg-[#3061F2] text-white py-20"
        >
          <motion.div
            className="max-w-7xl mx-auto grid md:grid-cols-2 gap-10 px-4 items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: inViewHero ? 1 : 0 }}
            transition={{ duration: 0.8 }}
          >
            <div>
              <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-4">
                Platform Aman & Anonim Untuk Pemulihan Psikososial
              </h1>
              <p className="text-lg mb-6">
                Berbagi cerita, akses edukasi, dan pulih bersama komunitas yang
                memahami."DENGAR, PULIH, BANGKIT"
              </p>
              <div className="flex gap-4">
                <a
                  href="#support"
                  className="bg-white text-[#3061F2] px-6 py-3 rounded-xl font-semibold hover:bg-gray-100"
                >
                  Mulai Sekarang
                </a>
                <a
                  href="#about"
                  className="border border-white px-6 py-3 rounded-xl hover:bg-white hover:text-[#3061F2]"
                >
                  Pelajari Lebih Lanjut
                </a>
              </div>
            </div>
            <div className="mt-5">
              <img
                src="/mascot4.gif"
                alt="Animasi Maskot"
                className="w-full h-full max-w-[400px] mx-auto "
                reverse
              />
            </div>
          </motion.div>
        </section>

        {/* Hero → Support Gradient Transition */}
        <div className="h-20 bg-gradient-to-b from-[#3061F2] to-white" />

        {/* Support Section with animated icons */}
        <section
          id="support"
          ref={supportRef}
          className="py-20 bg-white text-gray-900"
        >
          <motion.div
            className="max-w-7xl mx-auto px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: inViewSupport ? 1 : 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl font-bold text-center mb-12 text-[#3061F2]">
              Pusat Layanan TitikRuang
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  title: "Ruang Curhat",
                  desc: "Curhat bebas & anonim",
                  icon: "🗣️",
                  href: "/ruang",
                },
                {
                  title: "Diskusi Komunitas",
                  desc: "Dukungan teman senasib",
                  icon: "🤝",
                  href: "/diskusi",
                },
                {
                  title: "Konten Edukatif",
                  desc: "Pelajari bahaya & risikonya",
                  icon: "🎧",
                  href: "/pembelajaran",
                },
                {
                  title: "Simulasi Pinjaman",
                  desc: "Hitung dulu, baru putuskan",
                  icon: "💰",
                  href: "/simulasipinjaman",
                },
                {
                  title: "Kuis Bintang",
                  desc: "Tes pengetahuanmu & dapatkan wawasan baru",
                  icon: "⭐",
                  href: "/kuisbintang",
                },
                {
                  title: "TIKUBOT",
                  desc: "Asisten AI",
                  icon: "🤖",
                },
              ].map((f, i) => {
                const iconControls = useAnimationControls();
                const handleHoverStart = () => {
                  if (f.icon === "🎧") iconControls.start({ rotate: 20 });
                  else if (f.icon === "⭐") iconControls.start({ rotate: 360 });
                  else if (f.icon === "🤝") iconControls.start({ scale: 1.2 });
                  else iconControls.start({ scale: 1.1 });
                };
                const handleHoverEnd = () =>
                  iconControls.start({ rotate: 0, scale: 1 });

                const card = (
                  <motion.div
                    key={i}
                    className="group bg-gradient-to-br from-[#F2F6FF] to-white p-6 rounded-xl border border-[#3061F2]/20 text-center shadow-md hover:shadow-xl transition-shadow duration-300"
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: i * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    onMouseEnter={handleHoverStart}
                    onMouseLeave={handleHoverEnd}
                  >
                    <motion.span
                      className="text-4xl mb-3 block"
                      animate={iconControls}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 15,
                      }}
                    >
                      {f.icon}
                    </motion.span>
                    <h3 className="text-xl font-bold mb-2 text-[#F25050]">
                      {f.title}
                    </h3>
                    <p className="text-gray-600">{f.desc}</p>
                  </motion.div>
                );
                return f.href ? (
                  <Link href={f.href} key={i} className="block">
                    {card}
                  </Link>
                ) : (
                  <div key={i}>{card}</div>
                );
              })}
            </div>
          </motion.div>
        </section>

        {/* Support → About Gradient Transition */}
        <div className="h-20 bg-gradient-to-b from-white to-[#F2BF27]" />

        {/* About */}
        <section
          id="about"
          ref={aboutRef}
          className="bg-gradient-to-b from-[#F2BF27] via-[#F28907] to-white py-20 -mt-4"
        >
          <motion.div
            className="max-w-5xl mx-auto px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: inViewAbout ? 1 : 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl font-bold text-center mb-10 text-white drop-shadow-md">
              Cerita dari Pengguna
            </h2>
            <div className="space-y-6">
              {[
                "Saya merasa tidak sendirian setelah berbagi di TitikRuang.",
                "Kuis bintangnya membantu saya mengenali diri sendiri.",
                "Podcast-nya informatif dan menenangkan.",
              ].map((text, i) => (
                <motion.div
                  key={i}
                  className="p-6 border border-[#F2BF27] rounded-xl shadow hover:shadow-md bg-white"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                >
                  <div className="flex items-center gap-4 mb-3">
                    <div className="w-10 h-10 bg-[#F2BF27] rounded-full"></div>
                    <span className="text-sm text-gray-500">Anonim</span>
                  </div>
                  <p className="text-gray-700 italic">"{text}"</p>
                  <div className="flex gap-3 mt-4 text-[#F2780C] text-sm">
                    <span>👍</span>
                    <span>❤️</span>
                    <span>🙌</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* Footer */}
        <footer className="text-white bg-gradient-to-r from-[#3061F2] via-[#27A4F2] to-[#F2780C] relative pt-0">
          <svg
            className="w-full h-20 md:h-28 block"
            viewBox="0 0 1440 320"
            preserveAspectRatio="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fill="#ffffff"
              d="M0,64 C480,160 960,0 1440,96 L1440,0 L0,0 Z"
            />
          </svg>
          <div className="max-w-7xl mx-auto px-4 pb-6 text-white text-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2 border-b border-white/30 pb-4">
              {/* Kolom 1: Logo */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Image
                    src="/logo3.png"
                    alt="TitikRuang Logo"
                    width={32}
                    height={32}
                    className="transition duration-300 hover:animate-glow"
                  />
                  <h3 className="text-xl font-bold">TitikRuang</h3>
                </div>
                <p>DENGAR, PULIH, BANGKIT</p>
              </div>

              {/* Kolom 2: Tentang */}
              <div>
                <h4 className="text;base font-semibold mb-2">Tentang</h4>
                <ul className="space-y-1">
                  <li>
                    <a href="/tentangkami" className="hover:underline">
                      Visi & Misi
                    </a>
                  </li>
                  <li>
                    <a href="/tentangkami" className="hover:underline">
                      Penelitian
                    </a>
                  </li>
                  <li>
                    <a href="/tentangkami" className="hover:underline">
                      Tim
                    </a>
                  </li>
                </ul>
              </div>

              {/* Kolom 3: Bantuan */}
              <div>
                <h4 className="text-base font-semibold mb-2">Bantuan</h4>
                <ul className="space-y-1">
                  <li>
                    <a href="/policy" className="hover:underline">
                      Syarat dan Ketentuan
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://forms.gle/tSPWuMTtUTF3pRHv8"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline"
                    >
                      Laporkan Penyalahgunaan
                    </a>
                  </li>
                  <li>
                    <a href="/Kontakkami" className="hover:underline">
                      Kontak
                    </a>
                  </li>
                </ul>
              </div>

              {/* Kolom 4: Hubungi Kami */}
              <div>
                <h4 className="text-base font-semibold mb-2">Hubungi Kami</h4>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <FaEnvelope />
                    <a
                      href="mailto:info@ruangguru.com"
                      className="hover:underline"
                    >
                      titikruangofficial@gmail.com
                    </a>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaWhatsapp />
                    <a
                      href="https://wa.me/10000"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline"
                    >
                      0815 7441 0000
                    </a>
                  </div>
                </div>
              </div>

              {/* Kolom 5: Ikuti Kami */}
              <div>
                <h4 className="text-base font-semibold mb-2">Ikuti Kami</h4>
                <div className="flex gap-3 text-xl">
                  <a
                    href="https://www.instagram.com/officialtitikruang"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FaInstagram className="hover:text-pink-500" />
                  </a>
                  <a
                    href="https://www.facebook.com/akunmu"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FaFacebook className="hover:text-blue-600" />
                  </a>
                  <a
                    href="https://www.youtube.com/@TitikRuangOfficial"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FaYoutube className="hover:text-red-600" />
                  </a>
                  <a
                    href="https://www.linkedin.com/company/titikruang/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FaLinkedin className="hover:text-blue-700" />
                  </a>
                </div>
              </div>
            </div>

            {/* Bottom Section */}
            <div className="mt-1 flex flex-col sm:flex-row items-center justify-between text-sm">
              <div className="mt-1 sm:mt-0 flex items-center gap-2">
                <span>Dibina oleh</span>
                <img src="/logofooter.png" className="h-20" />
              </div>
            </div>
          </div>
        </footer>

        {/* Logout Confirmation Modal */}
        {showLogoutModal && (
          <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-[1000] flex items-center justify-center"
            onClick={() => setShowLogoutModal(false)}
          >
            <div className="absolute inset-0 bg-black/40" />
            <div
              className="relative bg-white rounded-xl max-w-md w-full p-6 mx-4 shadow-xl z-10"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold mb-2 text-[#3061F2]">
                Konfirmasi Keluar
              </h3>
              <p className="text-sm text-gray-700 mb-4">
                Apakah yakin ingin keluar?
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowLogoutModal(false)}
                  className="px-4 py-2 rounded-lg border hover:bg-gray-100"
                  disabled={isLoggingOut}
                >
                  Tidak
                </button>
                <button
                  onClick={handleConfirmLogout}
                  className="px-4 py-2 rounded-lg bg-[#F25050] text-white hover:bg-[#F2780C] disabled:opacity-60"
                  disabled={isLoggingOut}
                >
                  {isLoggingOut ? "Keluar..." : "Iya"}
                </button>
              </div>
            </div>
          </div>
        )}

        <button
          onClick={() => scroll.scrollToTop()}
          className="fixed bottom-20 right-6 z-[99] bg-[#F2780C] text-white p-3 rounded-full shadow-lg hover:bg-[#F25050]"
          aria-label="Back to Top"
        >
          ⬆️
        </button>
      </div>
    </main>
  );
}

export default LandingPage;

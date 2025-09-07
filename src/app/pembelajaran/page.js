// Improved layout and visual gradient transitions for better UX
"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { animateScroll as scroll } from "react-scroll";
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

const videos = [
  {
    url: "https://youtu.be/6808T0axIMw",
    title: "TitikRuang: Bangkit Bersama Kami dari Ancaman Pinjol dan Judol",
    type: "🎬 Video Edukasi",
    duration: "1.49 Minutes",
    level: "Pemula",
    views: "10"
  },
  
];

export default function PembelajaranPage() {
  const dropdownRef = useRef(null);
  const [hoveredMenu, setHoveredMenu] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [hoverTimeout, setHoverTimeout] = useState(null);
  const [scrollY, setScrollY] = useState(0);

  const dropdowns = {
    support: ["🗣 Ruang Curhat", "🤝 Diskusi Komunitas"],
    learning: ["🎧 Konten Edukatif", "💰 Simulasi Pinjaman"],
    tools: ["⭐ Kuis Bintang", "🤖 HelpBot", "🚨 Emergency Connect"],
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

  return (
    <div>
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
            <Link href="/" className="flex items-center gap-2 cursor-pointer">
              <Image
                src="/logo.png"
                alt="TitikRuang Logo"
                width={40}
                height={40}
              />
              <div className="text-2xl font-bold whitespace-nowrap">
                TitikRuang
              </div>
            </Link>
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

            {/* Tombol Masuk Desktop */}
            <div className="hidden md:block">
              <button className="bg-[#F25050] text-white px-4 py-2 rounded-xl hover:bg-[#F2780C]">
                Masuk
              </button>
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

              {/* Tombol Masuk Mobile */}
              <button className="w-full bg-[#F25050] text-white py-2 rounded-lg hover:bg-[#F2780C]">
                Masuk
              </button>
            </div>
          )}
        </motion.header>
        {/* Hero */}
        {/* NOTE: made the hero bg transparent so it inherits the page gradient and connects seamlessly with the Video Grid section */}
        <section className="bg-transparent text-center py-20 px-6">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 drop-shadow">
            Siap Belajar, Mendengar & Bertumbuh?
          </h1>
          <p className="text-lg text-white/80 mb-6">
            Jelajahi podcast, ikuti webinar, dan tetap update dengan berita
            terbaru.
          </p>
        </section>

        {/* Video Grid */}
        {/* Make Video Grid also transparent so both sections share same background */}
        <section className="bg-transparent py-16 px-6 max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-10">
          <motion.div
            className="bg-white p-4 rounded-lg border border-gray-200 shadow-md hover:shadow-xl hover:scale-105 transition"
            whileHover={{ scale: 1.03 }}
          >
            <div className="aspect-video mb-4 relative">
              <iframe
                src="https://www.youtube.com/embed/6808T0axIMw"
                className="w-full h-full rounded-md"
                title="TitikRuang: Bangkit Bersama Kami dari Ancaman Pinjol dan Judol"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
            <div className="text-sm text-blue-500 font-semibold mb-1">🎬 Video Edukasi</div>
            <h3 className="text-lg font-bold text-black mb-2">TitikRuang: Bangkit Bersama Kami dari Ancaman Pinjol dan Judol</h3>
            <div className="text-xs text-gray-500 flex gap-4">
              <span>1.49 Minutes</span>
              <span>Pemula</span>
              <span>10 penayangan</span>
            </div>
            <a
              href="https://youtu.be/6808T0axIMw"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-4 px-4 py-2 bg-[#3061F2] text-white rounded-full font-semibold shadow hover:bg-[#F2BF27] hover:text-[#3061F2] transition"
            >
              Tonton di YouTube
            </a>
          </motion.div>
        </section>

        {/* Fitur Layanan */}
  <section className="bg-white py-14 px-6">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-8 text-center">
            Belajar Seru dengan{" "}
            <span className="text-blue-600">TitikRuang Super App</span>
          </h2>
          <div className="flex overflow-x-auto space-x-4 pb-4 scroll-smooth snap-x snap-mandatory">
            {[
              {
                title: "Ruang Curhat",
                desc: "curhat bebas & anonim ",
                color: "from-pink-200 to-pink-100",
              },
              {
                title: "Kuis Bintang",
                desc: "tes pengetahuan &  dapatkan wawasan baru",
                color: "from-yellow-200 to-yellow-100",
              },
              {
                title: "Simulasi Pinjaman ",
                desc: "Hitung Dulu, Baru Putuskan",
                color: "from-purple-200 to-purple-100",
              },
              {
                title: "Linaloop",
                desc: "Asisten AI yang selalu hadir, menjaga tetap aman dan nyaman.",
                color: "from-indigo-200 to-indigo-100",
              },
              {
                title: "Diskusi Komunitas",
                desc: "Bergabung dengan komunitas dukungan teman senasib",
                color: "from-green-200 to-green-100",
              },
            ].map((item, i) => (
              <div
                key={i}
                className={`min-w-[220px] snap-start bg-gradient-to-tr ${item.color} rounded-xl p-4 shadow-sm`}
              >
                <div className="h-10 w-10 rounded-full bg-white/40 flex items-center justify-center mb-3">
                  📘
                </div>
                <h3 className="font-semibold text-md mb-1">{item.title}</h3>
                <p className="text-sm text-gray-600">{item.desc}</p>
                <button className="mt-4 bg-white text-sm px-4 py-1 rounded-full font-medium text-blue-600 hover:bg-blue-100">
                  Lihat Detail
                </button>
              </div>
            ))}
          </div>
  </section>

        {/* Artikel Terbaru */}
        <section className="bg-white py-14 px-6">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-8 text-center">
            Artikel <span className="text-blue-600">Terbaru</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {[
              {
                image: "/artikel1.png",
                title: "Pinjol & Judol: Dua Masalah Digital yang Bisa Jadi “Duo Maut” Penghancur  Kehidupan Kita",
                date: "14 Agustus 2025",
                time: "13 minutes read",
                slug: "artikel1",
              },
              
            ].map((item, i) => (
              <Link
                key={i}
                href={`/pembelajaran/artikel/${item.slug}`}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition block"
              >
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-auto object-contain bg-white"
                />
                <div className="p-4">
                  <h3 className="font-semibold text-lg text-gray-800">
                    {item.title}
                  </h3>
                  <p className="text-sm text-gray-500 mt-2">
                    {item.date && `${item.date} • `}
                    {item.time}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>

  {/* CTA Section */}
  <section className="bg-gradient-to-b from-white to-[#f3f4f6] text-center py-20">
          <h2 className="text-3xl font-bold text-black mb-4">
            Bergabunglah bersama ribuan korban, pendengar, dan agen perubahan
          </h2>
          <p className="text-md mb-6 text-gray-700">
            Dapatkan akses ke podcast, webinar, dan berita terbaru — semuanya
            dalam satu platform.
          </p>
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
                    width={64}
                    height={64}
                    className="transition duration-300 hover:animate-glow"
                  />
                  <h3 className="text-xl font-bold h-30">TitikRuang</h3>
                </div>
                <p>DENGAR, PULIH, BANGKIT</p>
              </div>

              {/* Kolom 2: Tentang */}
              <div>
                <h4 className="text-base font-semibold mb-2">Tentang</h4>
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
                    <a href="/kontakkami" className="hover:underline">
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
                      href="https://wa.me/6281959730664"
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
                    href="https://youtube.com/@officialtitikruang?si=Go4uHC14HTPqusI8"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FaYoutube className="hover:text-red-600" />
                  </a>
                  <a
                    href="http://linkedin.com/in/titik-ruang-860043379"
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
                <img src="/logofooter.png" className="h-24" />
              </div>
            </div>
          </div>
        </footer>

        <button
          onClick={() => scroll.scrollToTop()}
          className="fixed bottom-20 right-6 z-[99] bg-[#F2780C] text-white p-3 rounded-full shadow-lg hover:bg-[#F25050] z-50"
          aria-label="Back to Top"
        >
          ⬆
        </button>
      </div>
      </main>
    </div>
  );
}

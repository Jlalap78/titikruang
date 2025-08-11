"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { MapPin, Phone, Mail } from "lucide-react";
import { scroller } from "react-scroll";
import HelpBot from "/src/components/HelpBot.jsx";
import {
  FaInstagram,
  FaFacebook,
  FaTwitter,
  FaYoutube,
  FaLinkedin,
  FaTiktok,
  FaEnvelope,
  FaPhoneAlt,
  FaWhatsapp,
} from "react-icons/fa";

export default function KontakKami() {
  const [scrollY, setScrollY] = useState(0);
  const [hoveredMenu, setHoveredMenu] = useState(null);
  const [hoverTimeout, setHoverTimeout] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const dropdownRef = useRef(null);

  const dropdowns = {
    support: ["🗣️ Ruang Curhat", "🤝 Diskusi Kelompok"],
    learning: ["🎧 Podcast & Webinar", "📰 Berita"],
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
            <span className="text-black text-xl">{mobileOpen ? "✕" : "☰"}</span>
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
              <details key={key} className="border rounded-md overflow-hidden">
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

      {/* Main Kontak Section */}
      <section className="py-16 px-6">
        <h1 className="text-3xl font-bold text-center text-[#F2780C] mb-10">
          Kontak Kami
        </h1>
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8 bg-white rounded-xl shadow-xl p-8">
          <div className="w-full h-96 rounded-xl overflow-hidden">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1272.871672000545!2d112.78359452852212!3d-7.268716199544253!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2dd7fa21a3515291%3A0x3edf1522ff735924!2sUniversitas%20Airlangga%20-%20Kampus%20MERR%20C!5e1!3m2!1sid!2sid!4v1753429696023!5m2!1sid!2sid"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Lokasi"
            ></iframe>
          </div>
          <div className="flex flex-col justify-center gap-6">
            <h2 className="text-2xl font-semibold text-gray-800">
              Hubungi Kami
            </h2>
            <div className="flex items-start gap-4">
              <Phone className="text-blue-600 mt-1" />
              <div>
                <p className="text-gray-600">Telepon</p>
                <p className="font-semibold">021-0930000</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <Mail className="text-blue-600 mt-1" />
              <div>
                <p className="text-gray-600">Email</p>
                <p className="font-semibold">titikruangofficial@gmail.com</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <MapPin className="text-blue-600 mt-1" />
              <div>
                <p className="text-gray-600">Alamat</p>
                <p className="font-semibold">
                  Jl. Dr. Ir. H. Soekarno, Mulyorejo, Kec. Mulyorejo, Surabaya,
                  Jawa Timur 60115
                </p>
              </div>
            </div>
          </div>
        </div>
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
              <p>DENGAR PULIH BANGKIT</p>
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
                  <a href="#" className="hover:underline">
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
              <img src="/logofooter.png" className="h-24"/>
            </div>
          </div>
        </div>
      </footer>

      <button
        onClick={() => scroll.scrollToTop()}
        className="fixed bottom-20 right-6 z-[99] bg-[#F2780C] text-white p-3 rounded-full shadow-lg hover:bg-[#F25050] z-50"
        aria-label="Back to Top"
      >
        ⬆️
      </button>
    </div>
  );
}

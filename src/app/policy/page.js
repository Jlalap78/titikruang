"use client";

import { motion } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
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

export default function LandingPage() {
  const [faqOpen, setFaqOpen] = useState(null);
  const [activeMenu, setActiveMenu] = useState(null);
  const [hoveredMenu, setHoveredMenu] = useState(null);
  const [hoverTimeout, setHoverTimeout] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [openSection, setOpenSection] = useState("ruangguru");
  const [activeGroup, setActiveGroup] = useState("ruangguru");
  const contentRef = useRef(null);
  const dropdownRef = useRef(null);

  const dropdowns = {
    support: ["🗣️ Ruang Curhat", "🤝 Diskusi Kelompok"],
    learning: ["🎧 Konten Edukatif", "💰 Simulasi Pinjaman"],
    tools: ["⭐ Kuis Bintang", "🤖 HelpBot", "🚨 Emergency Connect"],
  };

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isMenuOpen = (key) => hoveredMenu === key;

  const toggleSection = (section) => {
    setOpenSection((prev) => (prev === section ? null : section));
    setActiveGroup(section);
    setTimeout(() => {
      contentRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 50);
  };

  const handleScrollTo = (group, id) => {
    if (activeGroup === group) {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    } else {
      setActiveGroup(group);
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: "smooth" });
      }, 50);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#3061F2] via-white to-[#F2BF27]/10 text-gray-800">
      {/* Header */}
      <header
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

          {/* Desktop Nav */}
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
                    const href = item.includes("Diskusi")
                      ? "/diskusi"
                      : item.includes("Ruang Curhat")
                      ? "/ruang"
                      : item.includes("Konten Edukatif")
                      ? "/pembelajaran"
                      : item.includes("Simulasi Pinjaman")
                      ? "/simulasipinjaman"
                      : item.includes("Kuis Bintang")
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

            {/* Tentang Kami */}
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

          {/* Hamburger */}
          <button
            className="md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            <span className="text-black text-xl">{mobileOpen ? "✕" : "☰"}</span>
          </button>
        </div>

        {/* Mobile Nav */}
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
                    const href = item.includes("Diskusi")
                      ? "/diskusi"
                      : item.includes("Ruang Curhat")
                      ? "/ruang"
                      : item.includes("Konten Edukatif")
                      ? "/pembelajaran"
                      : item.includes("Simulasi Pinjaman")
                      ? "/simulasipinjaman"
                      : item.includes("Kuis Bintang")
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

            {/* Tentang Kami */}
            <a
              href="/tentangkami"
              className="block text-center font-medium py-2 rounded-lg text-[#F25050] hover:text-[#F2780C] border border-[#F25050]"
            >
              Tentang Kami
            </a>

            <button className="w-full bg-[#F25050] text-white py-2 rounded-lg hover:bg-[#F2780C]">
              Masuk
            </button>
          </div>
        )}
      </header>

      {/* Layout */}
      <div className="flex flex-row bg-white">
        {/* Sidebar */}
        <aside className="w-64 p-4 sticky top-20 h-[calc(100vh-5rem)] overflow-y-auto bg-white shadow hidden md:block">
          <nav className="space-y-4 text-sm">
            {/* Tentang TitikRuang */}
            <div>
              <button
                onClick={() => {
                  toggleSection("tentang");
                  setActiveGroup("tentang");
                }}
                className={`w-full text-left font-bold text-base ${
                  activeGroup === "tentang" ? "text-blue-700" : "text-gray-800"
                }`}
              >
                Tentang TitikRuang
              </button>
              <ul
                className={`mt-2 space-y-2 overflow-hidden transition-all duration-300 ease-in-out ${
                  openSection === "tentang"
                    ? "max-h-96 opacity-100"
                    : "max-h-0 opacity-0"
                }`}
              >
                <li
                  className="cursor-pointer hover:text-blue-700"
                  onClick={() => handleScrollTo("tentang", "tentang-umum")}
                >
                  Tentang TitikRuang
                </li>
                <li
                  className="cursor-pointer hover:text-blue-700"
                  onClick={() => handleScrollTo("tentang", "nilai-prinsip")}
                >
                  Nilai dan Prinsip Dasar Platform
                </li>
              </ul>
            </div>

            {/* Ketentuan Penggunaan */}
            <div>
              <button
                onClick={() => {
                  toggleSection("ketentuan");
                  setActiveGroup("ketentuan");
                }}
                className={`w-full text-left font-bold text-base ${
                  activeGroup === "ketentuan"
                    ? "text-blue-700"
                    : "text-gray-800"
                }`}
              >
                Ketentuan Penggunaan
              </button>
              <ul
                className={`mt-2 space-y-2 overflow-hidden transition-all duration-300 ease-in-out ${
                  openSection === "ketentuan"
                    ? "max-h-96 opacity-100"
                    : "max-h-0 opacity-0"
                }`}
              >
                <li
                  className="cursor-pointer hover:text-blue-700"
                  onClick={() =>
                    handleScrollTo("ketentuan", "akses-registrasi")
                  }
                >
                  Akses dan Registrasi
                </li>
                <li
                  className="cursor-pointer hover:text-blue-700"
                  onClick={() => handleScrollTo("ketentuan", "batas-usia")}
                >
                  Batas Usia Pengguna
                </li>
                <li
                  className="cursor-pointer hover:text-blue-700"
                  onClick={() =>
                    handleScrollTo("ketentuan", "komitmen-pengguna")
                  }
                >
                  Komitmen Pengguna
                </li>
              </ul>
            </div>

            {/* Kebijakan Privasi */}
            <div>
              <button
                onClick={() => {
                  toggleSection("privasi");
                  setActiveGroup("privasi");
                }}
                className={`w-full text-left font-bold text-base ${
                  activeGroup === "privasi" ? "text-blue-700" : "text-gray-800"
                }`}
              >
                Kebijakan Privasi
              </button>
              <ul
                className={`mt-2 space-y-2 overflow-hidden transition-all duration-300 ease-in-out ${
                  openSection === "privasi"
                    ? "max-h-96 opacity-100"
                    : "max-h-0 opacity-0"
                }`}
              >
                <li
                  className="cursor-pointer hover:text-blue-700"
                  onClick={() => handleScrollTo("privasi", "data-dikumpulkan")}
                >
                  Jenis Data yang Dikumpulkan
                </li>
                <li
                  className="cursor-pointer hover:text-blue-700"
                  onClick={() => handleScrollTo("privasi", "penggunaan-data")}
                >
                  Penggunaan Data
                </li>
                <li
                  className="cursor-pointer hover:text-blue-700"
                  onClick={() => handleScrollTo("privasi", "manajemen-privasi")}
                >
                  Manajemen Privasi dan Kendali
                </li>
              </ul>
            </div>

            {/* Dasar Hukum & Kepatuhan */}
            <div>
              <button
                onClick={() => {
                  toggleSection("hukum");
                  setActiveGroup("hukum");
                }}
                className={`w-full text-left font-bold text-base ${
                  activeGroup === "hukum" ? "text-blue-700" : "text-gray-800"
                }`}
              >
                Dasar Hukum & Kepatuhan
              </button>
              <ul
                className={`mt-2 space-y-2 overflow-hidden transition-all duration-300 ease-in-out ${
                  openSection === "hukum"
                    ? "max-h-96 opacity-100"
                    : "max-h-0 opacity-0"
                }`}
              >
                <li
                  className="cursor-pointer hover:text-blue-700"
                  onClick={() => handleScrollTo("hukum", "uu-ite")}
                >
                  UU ITE
                </li>
                <li
                  className="cursor-pointer hover:text-blue-700"
                  onClick={() => handleScrollTo("hukum", "uu-pdp")}
                >
                  UU Perlindungan Data Pribadi
                </li>
                <li
                  className="cursor-pointer hover:text-blue-700"
                  onClick={() => handleScrollTo("hukum", "kuhp")}
                >
                  KUHP
                </li>
                <li
                  className="cursor-pointer hover:text-blue-700"
                  onClick={() => handleScrollTo("hukum", "uu-anak")}
                >
                  UU Perlindungan Anak
                </li>
              </ul>
            </div>

            {/* FAQ */}
            <div>
              <button
                onClick={() => {
                  setActiveGroup("faq");
                  toggleSection("faq");
                }}
                className={`w-full text-left font-bold text-base ${
                  activeGroup === "faq" ? "text-blue-700" : "text-gray-800"
                }`}
              >
                FAQ
              </button>
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-h-screen px-4 py-6">
          <section ref={contentRef} className="max-w-3xl mx-auto">
            {/* Bagian 1 */}
            {activeGroup === "tentang" && (
              <>
                <h2 id="tentang-umum" className="text-2xl font-bold mb-4">
                  Tentang TitikRuang
                </h2>
                <p className="mb-4 text-gray-700">
                  TitikRuang merupakan platform digital yang dirancang sebagai
                  ruang aman yang nyaman dan anonim untuk individu-individu yang
                  mengalami dampak psikososial, khususnya akibat keterlibatan
                  dalam praktik judi online (judol) dan pinjaman online
                  (pinjol). Platform ini menyediakan berbagai fasilitas untuk
                  berbagi cerita, mengekspresikan perasaan, beserta wadah dalam
                  mengakses informasi edukatif seputar pemulihan mental, sosial,
                  maupun finansial. Pengguna dapat bergabung dalam komunitas
                  yang relevan dengan pengalaman atau kebutuhan pemulihannya,
                  serta berpartisipasi secara aktif dalam ruang diskusi tanpa
                  harus mengungkapkan identitas pribadi.
                </p>

                <h3
                  id="nilai-prinsip"
                  className="text-xl font-semibold mt-6 mb-2"
                >
                  Nilai dan Prinsip Dasar Platform
                </h3>
                <ul className="list-disc ml-6 space-y-2 text-gray-700">
                  <li>
                    Menjunjung tinggi kebebasan berpendapat dengan tetap
                    menghormati hak orang lain.
                  </li>
                  <li>
                    Mengutamakan keamanan, privasi, dan kenyamanan pengguna.
                  </li>
                  <li>
                    Mendorong pertukaran informasi yang bermanfaat dan
                    membangun.
                  </li>
                  <li>
                    Memastikan aksesibilitas untuk semua kalangan tanpa
                    diskriminasi.
                  </li>
                </ul>
              </>
            )}

            {activeGroup === "ketentuan" && (
              <>
                <h2 id="akses-registrasi" className="text-2xl font-bold mb-4">
                  Akses dan Registrasi
                </h2>
                <p className="mb-4 text-gray-700">
                  Untuk menggunakan layanan TitikRuang, pengguna dapat melakukan
                  registrasi...
                </p>

                <h3 id="batas-usia" className="text-xl font-semibold mt-6 mb-2">
                  Batas Usia Pengguna
                </h3>
                <p className="mb-4 text-gray-700">
                  Platform ini diperuntukkan bagi pengguna berusia minimal 13
                  tahun...
                </p>

                <h3
                  id="komitmen-pengguna"
                  className="text-xl font-semibold mt-6 mb-2"
                >
                  Komitmen Pengguna
                </h3>
                <ul className="list-disc ml-6 space-y-2 text-gray-700">
                  <li>Menggunakan platform dengan itikad baik...</li>
                  <li>Tidak menyebarkan konten SARA...</li>
                  <li>Mematuhi semua peraturan...</li>
                </ul>
              </>
            )}

            {/* Bagian 2 */}
            {activeGroup === "privasi" && (
              <>
                <h2 id="data-dikumpulkan" className="text-2xl font-bold mb-4">
                  Jenis Data yang Dikumpulkan
                </h2>
                <p className="mb-4 text-gray-700">
                  TitikRuang mengumpulkan data yang diperlukan...
                </p>

                <h3
                  id="penggunaan-data"
                  className="text-xl font-semibold mt-6 mb-2"
                >
                  Penggunaan Data
                </h3>
                <ul className="list-decimal ml-6 space-y-2 text-gray-700">
                  <li>Menjamin keamanan akun pengguna.</li>
                  <li>Memberikan layanan yang dipersonalisasi.</li>
                  <li>Melakukan analisis fitur.</li>
                  <li>Memenuhi kewajiban hukum.</li>
                </ul>

                <h3
                  id="manajemen-privasi"
                  className="text-xl font-semibold mt-6 mb-2"
                >
                  Manajemen Privasi dan Kendali
                </h3>
                <p className="mb-4 text-gray-700">
                  Pengguna memiliki hak penuh untuk mengatur privasi...
                </p>
              </>
            )}

            {activeGroup === "hukum" && (
              <>
                <h2 id="uu-ite" className="text-2xl font-bold mb-4">
                  UU ITE
                </h2>
                <p className="mb-4 text-gray-700">
                  Semua aktivitas di TitikRuang tunduk pada UU ITE...
                </p>

                <h3 id="uu-pdp" className="text-xl font-semibold mt-6 mb-2">
                  UU Perlindungan Data Pribadi
                </h3>
                <p className="mb-4 text-gray-700">
                  Kami mematuhi UU Perlindungan Data Pribadi...
                </p>

                <h3 id="kuhp" className="text-xl font-semibold mt-6 mb-2">
                  KUHP
                </h3>
                <p className="mb-4 text-gray-700">
                  Pelanggaran hukum pidana akan diproses sesuai KUHP...
                </p>

                <h3 id="uu-anak" className="text-xl font-semibold mt-6 mb-2">
                  UU Perlindungan Anak
                </h3>
                <p className="mb-4 text-gray-700">
                  TitikRuang melarang segala bentuk eksploitasi anak...
                </p>
              </>
            )}

            {/* Bagian 3 */}
            {activeGroup === "faq" && (
              <>
                <h2 className="text-2xl font-bold mb-4">FAQ</h2>
                <div className="space-y-4 text-gray-700">
                  <div>
                    <p className="font-semibold">
                      1. Apa itu TitikRuang dan siapa saja yang bisa
                      menggunakannya?
                    </p>
                    <p>
                      TitikRuang merupakan platform digital berbasis komunitas
                      yang menyediakan ruang aman, anonim, dan inklusif untuk
                      berbagi cerita, edukasi, dan pemulihan psikososial bagi
                      siapa pun, khususnya bagi korban yang sedang/pernah
                      terdampak aktivitas judi online (judol) atau pinjaman
                      online (pinjol).
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold">
                      2. Apakah Saya harus menggunakan identitas asli untuk
                      mendaftar di platform ini?
                    </p>
                    <p>
                      Tidak. TitikRuang menjunjung tinggi prinsip anonimitas.
                      Pengguna umum dapat mengakses layanan cukup dengan
                      username (nama pengguna) dan password (kata sandi) tanpa
                      mengisi data pribadi. Namun, untuk mendapatkan akses penuh
                      (misalnya untuk bergabung dalam komunitas diskusi),
                      verifikasi tambahan atas informasi terbatas dibutuhkan
                      dengan persetujuan privasi yang dijaga ketat.
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold">
                      3. Apakah platform ini bisa digunakan secara gratis?
                    </p>
                    <p>
                      Ya. Seluruh layanan dan fitur utama TitikRuang dapat
                      diakses secara gratis oleh semua pengguna, baik akun umum
                      maupun terverifikasi. Kami tidak menarik biaya langganan
                      atau pendaftaran dalam bentuk apa pun. Namun, untuk
                      layanan konseling profesional, kami memfasilitasi pengguna
                      agar dapat terhubung langsung dengan psikolog atau tenaga
                      kesehatan mental yang relevan.
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold">
                      4. Apa saja perbedaan antara akun umum dan akun
                      terverifikasi?
                    </p>
                    <p>Data dikelola sesuai UU PDP.</p>
                  </div>
                </div>
              </>
            )}
          </section>
        </main>
      </div>

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
              <img
                src="/logo_of_ministry_of_education_and_culture_of_republic_of_indonesia.svg.webp"
                className="h-10"
              />
              <img src="/logounairbiru.png" className="h-10" />
              <img
                src="/logodiktisaintekberdampak_horizontallogo.png"
                className="h-10"
              />
              <img src="/logobelmawabersinergi-warna.png" className="h-20" />
              <img src="/logopkm-bg.png" className="h-10" />
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

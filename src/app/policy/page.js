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
                  Fokus dan Tujuan
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

                <h2 id="fokus-tujuan" className="text-2xl font-bold mb-4">
                  Fokus dan Tujuan
                </h2>
                <p className="mb-4 text-gray-700">
                  TitikRuang bertujuan menjadi media pemulihan berbasis
                  komunitas (community-driven recovery), bukan layanan terapi
                  atau konseling profesional. Oleh karena itu, peran platform
                  ini adalah menyediakan ruang yang suportif, inklusif, dan
                  non-judgmental bagi mereka yang ingin memulai langkah
                  pemulihan dari rasa malu, keterpurukan, stigma sosial, dan
                  isolasi emosional. Kami percaya bahwa pemulihan bukan proses
                  yang bisa dipaksakan, maka dari itu TitikRuang hadir dalam
                  memberikan dan menyediakan tempat untuk setiap langkah kecil,
                  baik itu membaca, mendengar, menulis (berkomentar), ataupun
                  hanya sekadar melihat dan mengamati di sana.
                </p>

                <h3
                  id="ketentuan-penggunaan"
                  className="text-xl font-semibold mt-6 mb-2"
                >
                  Nilai dan Prinsip Dasar Platform
                </h3>
                <p className="text-gray-700 mb-4">
                  Platform ini dibangun di atas nilai-nilai dasar sebagai
                  berikut:
                </p>

                <h4 className="text-lg font-semibold mt-4 mb-2">
                  1. Anonimitas
                </h4>
                <p className="mb-4 text-gray-700">
                  TitikRuang menjunjung tinggi prinsip anonimitas sebagai
                  fondasi utama. Pengguna dapat mengakses fitur-fitur layanan di
                  dalam platform tanpa harus mengungkapkan identitas pribadi
                  secara terbuka. Pendekatan ini dirancang untuk menciptakan
                  rasa aman, mereduksi rasa malu, serta mendorong keberanian
                  untuk dapat berbagi pengalaman secara otentik, tanpa tekanan
                  sosial atau kekhawatiran akan penghakiman.
                </p>

                <h4 className="text-lg font-semibold mt-4 mb-2">
                  2. Inklusivitas
                </h4>
                <p className="mb-4 text-gray-700">
                  TitikRuang membuka ruang bagi siapa pun yang terdampak secara
                  langsung maupun tidak langsung, sedang/pernah terlibat dalam
                  praktik judi online atau pinjaman online tanpa diskriminasi,
                  pelabelan, ataupun prasangka. Setiap suara, pengalaman, dan
                  bentuk eskpresi (selama tidak melanggar ketentuan) akan
                  dianggap valid, setara, dan dihargai.
                </p>

                <h4 className="text-lg font-semibold mt-4 mb-2">
                  2. Resiliensi Kolektif
                </h4>
                <p className="mb-4 text-gray-700">
                  TitikRuang mendorong proses pemulihan secara kolektif melalui
                  interaksi suportif antarpengguna. Prinsip ini dibangun tidak
                  bersifat individual semata, melainkan melalui penguatan
                  jejaring, solidaritas, dan keberdayaan bersama sebagai
                  komunitas yang sedang/pernah terlibat dalam praktik judi
                  online atau pinjaman online.
                </p>
              </>
            )}

            {activeGroup === "ketentuan" && (
              <>
                <h2 id="akses-registrasi" className="text-2xl font-bold mb-4">
                  Akses dan Registrasi
                </h2>
                <p className="mb-4 text-gray-700">
                  TitikRuang menyediakan dua jenis akses bagi pengguna untuk
                  menjamin keamanan, anonimitas, dan kualitas interaksi dalam
                  platform.
                </p>

                <h4 className="text-lg font-semibold mt-4 mb-2">
                  1. Pengguna Umum
                </h4>
                <ul className="list-disc ml-6 space-y-2 text-gray-700">
                  <li>
                    Registrasi pendaftaran cukup dengan <em>username</em> (nama
                    pengguna) dan
                    <em> password</em> (kata sandi);
                  </li>
                  <li>
                    Tidak diminta memberikan data pribadi ataupun identitas yang
                    bersifat resmi;
                  </li>
                  <li>
                    Memiliki akses penuh ke fitur layanan a) ruang curhat b)
                    konten edukatif c) kuis bintang d) layanan simulasi, dan e)
                    bantuan cepat;
                  </li>
                  <li>
                    Akses terbatas pada fitur <em>diskusi komunitas</em> (hanya
                    dapat memberikan reaksi tanpa mengunggah file/gambar/video
                    dan atau menulis komentar/opini) dan fitur{" "}
                    <em>layanan konseling</em>;
                  </li>
                  <li>Dapat diakses 24 jam.</li>
                </ul>

                <h4 className="text-lg font-semibold mt-4 mb-2">
                  2. Pengguna Terverifikasi
                </h4>
                <ul className="list-disc ml-6 space-y-2 text-gray-700">
                  <li>
                    Registrasi pendaftaran berbasis formulir data diri terbatas
                    dan persetujuan penggunaan;
                  </li>
                  <li>
                    Proses verifikasi dilakukan oleh tim moderator sebelum
                    pengguna memperoleh status aktif;
                  </li>
                  <li>
                    Memiliki tanda khusus sebagai akun terverifikasi yang
                    menunjukkan keterlibatan aktif dan kredibel;
                  </li>
                  <li>
                    Memiliki akses penuh ke fitur layanan a) ruang curhat b)
                    diskusi komunitas c) konten edukatif d) kuis bintang e)
                    layanan simulasi, dan e) bantuan cepat, termasuk akses untuk
                    membuat ruang diskusi (admin komunitas), mengunggah konten
                    berupa file/gambar/video dan atau menulis komentar/opini
                    (selama tidak melanggar ketentuan) dalam fitur layanan yang
                    tersedia di dalam platform;
                  </li>
                  <li>
                    Memiliki akses terbatas ke fitur <em>layanan konseling</em>;
                  </li>
                  <li>Dapat diakses 24 jam.</li>
                </ul>
                <p className="mb-4 text-gray-700"></p>

                <h2 id="akses-registrasi" className="text-3xl font-bold mb-4">
                  Batas Usia Pengguna
                </h2>

                <h4 className="text-lg font-semibold mt-4 mb-2">
                  1. Minimum Usia Pengguna
                </h4>
                <ul className="list-disc ml-6 space-y-2 text-gray-700">
                  <li>
                    Platform ini hanya dapat digunakan oleh individu dengan
                    minimal usia 18 tahun dan maksimal usia tidak terbatas
                  </li>
                  <li>
                    Dengan mengakses atau menggunakan platform, pengguna
                    menyatakan bahwa ia berusia legal secara hukum dan
                    bertanggung jawab secara pribadi atas aktivitasnya di dalam
                    platform.
                  </li>
                </ul>

                <h4 className="text-lg font-semibold mt-4 mb-2">
                  2. Dasar Pembatasan Usia
                </h4>
                <ul className="list-disc ml-6 space-y-2 text-gray-700">
                  <li>
                    Menjaga pengguna rentan (anak di bawah umur) dari konten dan
                    ruang yang bersifat emosional, sensitif, atau mengandung
                    trauma psikososial;
                  </li>
                  <li>
                    Memastikan pengguna memiliki kematangan emosional dan sosial
                    untuk terlibat dalam diskusi yang mungkin memuat pengalaman
                    personal terkait trauma, hutang, kecanduan, dan tekanan
                    mental;
                  </li>
                  <li>
                    Menyesuaikan dengan ketentuan hukum perlindungan anak, serta
                    informasi dan transaksi elektronik (UU Nomor 35 Tahun 2014
                    dan UU Nomor 1 Tahun 2024).
                  </li>
                </ul>

                <p className="mb-4 text-gray-700">
                  Akun yang teridentifikasi milik pengguna di bawah usia 18
                  tahun dapat ditangguhkan atau dinonaktifkan. TitikRuang berhak
                  melakukan tindakan penyaringan tambahan (age gate) jika
                  diperlukan.
                </p>

                <h2 id="akses-registrasi" className="text-3xl font-bold mb-4">
                  Komitmen Pengguna
                </h2>
                <p className="mb-4 text-gray-700">
                  Untuk menciptakan ruang yang aman, suportif, dan sehat bagi
                  seluruh pengguna, setiap individu yang mengakses dan
                  menggunakan platform ini wajib mematuhi komitmen-komitmen
                  berikut:
                </p>

                <h4 className="text-lg font-semibold mt-4 mb-2">
                  1. Prinsip Dasar Pengguna:
                </h4>
                <ul className="list-disc ml-6 space-y-2 text-gray-700">
                  <li>
                    Tidak menyebarkan data diri, identitas pengguna lain, atau
                    bentuk informasi apapun yang mengarah pada pelanggaran
                    privasi;
                  </li>
                  <li>
                    Menjaga anonimitas dan privasi pribadi maupun pengguna lain;
                  </li>
                  <li>
                    Menghormati pengguna lain tanpa memandang latar belakang
                    agama, ras, gender, orientasi seksual, status sosial,
                    kondisi ekonomi, maupun pengalaman pribadi.
                  </li>
                </ul>

                <h4 className="text-lg font-semibold mt-4 mb-2">
                  2. Larangan Mutlak:
                </h4>
                <ul className="list-disc ml-6 space-y-2 text-gray-700">
                  <li>
                    Segala bentuk aktivitas yang mengarah pada ujaran kebencian,
                    ancaman, diskriminasi, provokasi, dan konten SARA (suku,
                    agama, ras, dan antargolongan);
                  </li>
                  <li>
                    Penyebaran hoaks (berita bohong), disinformasi, atau segala
                    bentuk apa pun yang mengarah pada informasi palsu yang
                    menyesatkan;
                  </li>
                  <li>
                    Kata-kata kasar, kotor, atau penghinaan verbal, termasuk
                    dalam bentuk singkatan, simbol, maupun bahasa terselubung
                    (coded words);
                  </li>
                  <li>
                    Konten vulgar atau pornografi dalam bentuk tulisan, gambar,
                    tautan, atau media lainnya;
                  </li>
                  <li>
                    Promosi dan iklan, baik secara eksplisit maupun terselubung,
                    termasuk ajakan berjudi (online/offline), pinjaman ilegal,
                    investasi bodong, serta produk/jasa apa pun yang tidak
                    relevan dengan visi-misi platform;
                  </li>
                  <li>
                    Spam pesan, phising (penipuan), atau aktivitas berbahaya
                    lainnya.
                  </li>
                </ul>
                <p className="mb-4 text-gray-700">
                  Sistem secara otomatis akan memblokir konten yang mengandung
                  kata, simbol, atau ekspresi yang masuk dalam daftar hitam di
                  atas (blocked words list).{" "}
                </p>

                <h4 className="text-lg font-semibold mt-4 mb-2">
                  3. Tindakan Pelanggaran:
                </h4>
                <ul className="list-disc ml-6 space-y-2 text-gray-700">
                  <li>Peringatan otomatis dari sistem atau moderator;</li>
                  <li>Penghapusan konten yang melanggar;</li>
                  <li>Pembekuan atau pemblokiran akun, sementara/permanen.</li>
                </ul>

                <p className="mb-4 text-gray-700">
                  Jika pelanggaran bersifat berat dan berulang, atau mengandung
                  unsur pidana, maka TitikRuang berhak mengambil tindakan hukum
                  sesuai dengan ketentuan perundang-undangan yang berlaku di
                  Indonesia.
                </p>
              </>
            )}

            {/* Bagian 2 */}
            {activeGroup === "privasi" && (
              <>
                <h2 id="data-dikumpulkan" className="text-3xl font-bold mb-4">
                  KEBIJAKAN PRIVASI
                </h2>

                <h2 id="" className="text-2xl font-bold mb-4">
                  Jenis Data yang Dikumpulkan
                </h2>
                <h3
                  id="penggunaan-data"
                  className="text-xl font-semibold mt-6 mb-2"
                >
                  1. Pengguna Umum:
                </h3>
                <ul className="list-disc ml-6 space-y-2 text-gray-700">
                  <li>Tidak diwajibkan memberikan informasi pribadi;</li>
                  <li>
                    Hanya menyimpan: username (nama pengguna), password (kata
                    sandi terenkripsi), dan data aktivitas pengguna di dalam
                    platform meliputi: komentar, reaksi, dan riwayat kunjungan
                    (history).
                  </li>
                </ul>

                <h3
                  id="penggunaan-data"
                  className="text-xl font-semibold mt-6 mb-2"
                >
                  2. Pengguna Terverifikasi:
                </h3>
                <ul className="list-disc ml-6 space-y-2 text-gray-700">
                  <li>
                    Diminta memberikan data pribadi terbatas melalui formulir
                    persetujuan;
                  </li>
                  <li>
                    Data pribadi terbatas meliputi: nama pengguna, email, nomor
                    kontak (jika diperlukan verifikasi lanjutan), dan motivasi
                    penggunaan/riwayat singkat (untuk kurasi tahap awal).
                  </li>
                </ul>
                <p className="mb-4 text-gray-700">
                  Data disimpan secara terenkripsi dan tidak akan dipublikasikan
                  atau dibagikan tanpa izin tertulis dan persetujuan dari
                  pengguna.
                </p>

                <h2 id="" className="text-2xl font-bold mb-4">
                  Penggunaan Data
                </h2>
                <p className="mb-2 text-gray-700">
                  Penggunaan data pengguna dilakukan secara terbatas dan
                  bertanggung jawab dengan tujuan sebagai berikut:
                </p>
                <h3
                  id="penggunaan-data"
                  className="text-xl font-semibold mt-6 mb-2"
                >
                  1. Fungsionalitas Akun
                </h3>
                <ul className="list-disc ml-6 space-y-2 text-gray-700">
                  <p className="mb-4 text-gray-700">
                    Untuk mengelola akses pengguna berdasarkan tipe akun (umum
                    atau terverifikasi), menyimpan preferensi, dan mencatat
                    riwayat interaksi.
                  </p>
                </ul>

                <h3
                  id="penggunaan-data"
                  className="text-xl font-semibold mt-6 mb-2"
                >
                  2. Keamanan dan Moderasi
                </h3>
                <ul className="list-disc ml-6 space-y-2 text-gray-700">
                  <p className="mb-4 text-gray-700">
                    Untuk mendeteksi pelanggaran, menjalankan sistem blokir
                    otomatis terhadap konten terlarang, serta menjaga lingkungan
                    platform senantiasa aman dan suportif.
                  </p>
                </ul>

                <h3
                  id="penggunaan-data"
                  className="text-xl font-semibold mt-6 mb-2"
                >
                  3. Pengembangan Platform
                </h3>
                <ul className="list-disc ml-6 space-y-2 text-gray-700">
                  <p className="mb-4 text-gray-700">
                    Riwayat aktivitas pengguna (secara anonim) digunakan sebagai
                    dasar untuk melakukan pemetaan kebutuhan, mengevaluasi pola
                    penggunaan, dan merancang konten atau fitur-fitur baru yang
                    lebih urgensi dan relevan.
                  </p>
                </ul>

                <h3
                  id="penggunaan-data"
                  className="text-xl font-semibold mt-6 mb-2"
                >
                  4. Layanan Komunikasi
                </h3>
                <ul className="list-disc ml-6 space-y-2 text-gray-700">
                  <p className="mb-4 text-gray-700">
                    Untuk memberikan notifikasi/pemberitahuan terkait pembaruan
                    platform, kebijakan, atau informasi penting lainnya.
                  </p>
                </ul>
                <p className="mb-4 text-gray-700">
                  Data yang dikumpulkan tidak digunakan untuk pengiklanan atau
                  keperluan komersial, serta tidak dibagikan ke pihak ketiga
                  tanpa dasar hukum atau persetujuan eksplisit.
                </p>

                <h2 id="" className="text-2xl font-bold mb-4">
                  Manajemen Privasi dan Kendali
                </h2>
                <h3
                  id="penggunaan-data"
                  className="text-xl font-semibold mt-6 mb-2"
                >
                  1. Penyimpanan dan Keamanan Data
                </h3>
                <ul className="list-disc  ml-6 space-y-2 text-gray-700">
                  <li>
                    Semua data disimpan secara terenkripsi di server yang aman;
                  </li>
                  <li>
                    Sistem dilindungi oleh protokol keamanan terkini untuk
                    mencegah akses tidak sah, manipulasi, atau kebocoran data;
                  </li>
                  <li>
                    Akses internal terhadap data hanya dimiliki oleh tim
                    terbatas yang terikat kontrak kerahasiaan;{" "}
                  </li>
                  <li>
                    Penerapan fitur pembatasan akses berdasarkan tipe pengguna
                    untuk meminimalkan risiko.{" "}
                  </li>
                </ul>

                <h3
                  id="penggunaan-data"
                  className="text-xl font-semibold mt-6 mb-2"
                >
                  2. Hak Pengguna
                </h3>
                <ul className="list-disc ml-6 space-y-2 text-gray-700">
                  <li>
                    Mengakses dan memperbarui informasi pribadinya (untuk akun
                    umum maupun terverifikasi);
                  </li>
                  <li>
                    Menghapus akun dan meminta seluruh datanya dihapus secara
                    permanen;
                  </li>
                  <li>
                    Melakukan pelaporan terkait pelanggaran privasi atau
                    penyalahgunaan platform kepada tim moderator melalui kanal
                    resmi yang tersedia.{" "}
                  </li>
                </ul>

                <h3
                  id="penggunaan-data"
                  className="text-xl font-semibold mt-6 mb-2"
                >
                  3. Retensi Data
                </h3>
                <ul className="list-disc ml-6 space-y-2 text-gray-700">
                  <li>Data pengguna akan disimpan selama akun masih aktif;</li>
                  <li>
                    Jika akun dihapus atau tidak aktif selama lebih dari 12
                    bulan, data akan otomatis dihapus dari sistem secara
                    permanen;
                  </li>
                  <li>
                    Riwayat log aktivitas (non-pribadi) dapat disimpan untuk
                    keperluan keamanan dan analitik.
                  </li>
                </ul>
                <p className="mb-4 text-gray-700">
                  Kebijakan ini dapat diperbarui dari waktu ke waktu untuk
                  menyesuaikan dengan regulasi baru atau kebutuhan teknis
                  platform. Pengguna akan diberitahu melalui notifikasi dalam
                  platform jika terdapat perubahan signifikan.
                </p>
              </>
            )}

            {activeGroup === "hukum" && (
              <>
                <h3
                  id="dasar-hukum"
                  className="text-xl font-semibold mt-6 mb-2"
                >
                  D. Dasar Hukum dan Kepatuhan
                </h3>

                <h4 className="font-semibold mt-4 mb-2">
                  1. Undang-Undang Informasi dan Transaksi Elektronik
                  (Undang-Undang Nomor 1 Tahun 2024, Perubahan Kedua atas
                  Undang-Undang Nomor 11 Tahun 2008)
                </h4>
                <ul className="list-disc ml-6 space-y-2 text-gray-700">
                  <li>
                    <strong>Pasal 27 ayat (1):</strong> Setiap Orang dengan
                    sengaja dan tanpa hak menyiarkan, mempertunjukkan,
                    mendistribusikan, mentransmisikan, dan/atau membuat dapat
                    diaksesnya Informasi Elektronik dan/atau Dokumen Elektronik
                    yang memiliki muatan yang melanggar kesusilaan untuk
                    diketahui umum;
                  </li>
                  <li>
                    <strong>Pasal 27 ayat (2):</strong> Setiap Orang dengan
                    sengaja dan tanpa hak mendistribusikan, mentransmisikan,
                    dan/atau membuat dapat diaksesnya Informasi Elektronik
                    dan/atau Dokumen Elektronik yang memiliki muatan perjudian;
                  </li>
                  <li>
                    <strong>Pasal 27A:</strong> Setiap Orang dengan sengaja
                    menyerang kehormatan atau nama baik orang lain dengan cara
                    menuduhkan suatu hal, dengan maksud supaya hal tersebut
                    diketahui umum dalam bentuk Informasi Elektronik dan/atau
                    Dokumen Elektronik yang dilakukan melalui Sistem Elektronik;
                  </li>
                  <li>
                    <strong>Pasal 28 ayat (2):</strong> Setiap Orang dengan
                    sengaja dan tanpa hak mendistribusikan dan/atau
                    mentransmisikan Informasi Elektronik dan/atau Dokumen
                    Elektronik yang sifatnya menghasut, mengajak, atau
                    memengaruhi orang lain sehingga menimbulkan rasa kebencian
                    atau permusuhan terhadap individu dan/atau kelompok
                    masyarakat tertentu berdasarkan ras, kebangsaan, etnis,
                    warna kulit, agama, kepercayaan, jenis kelamin, disabilitas
                    mental, atau disabilitas fisik;
                  </li>
                  <li>
                    <strong>Pasal 28 ayat (3):</strong> Setiap Orang dengan
                    sengaja menyebarkan Informasi Elektronik dan/atau Dokumen
                    Elektronik yang diketahuinya memuat pemberitahuan bohong
                    yang menimbulkan kerusuhan di masyarakat;
                  </li>
                  <li>
                    <strong>Pasal 45 ayat (1):</strong> Setiap Orang yang dengan
                    sengaja dan tanpa hak menyiarkan, mempertunjukkan,
                    mendistribusikan, mentransmisikan, dan/atau membuat dapat
                    diaksesnya Informasi Elektronik dan/atau Dokumen Elektronik
                    yang memiliki muatan yang melanggar kesusilaan untuk
                    diketahui umum sebagaimana dimaksud dalam Pasal 27 ayat (1)
                    dipidana dengan pidana penjara paling lama 6 (enam) tahun
                    dan/atau denda paling banyak Rp1.000.000.000,00 (satu miliar
                    rupiah);
                  </li>
                  <li>
                    <strong>Pasal 45 ayat (3):</strong> Setiap Orang yang dengan
                    sengaja dan tanpa hak mendistribusikan, mentransmisikan,
                    dan/atau membuat dapat diaksesnya Informasi Elektronik
                    dan/atau Dokumen Elektronik yang memiliki muatan perjudian
                    sebagaimana dimaksud dalam Pasal 27 ayat (2) dipidana dengan
                    pidana penjara paling lama 10 (sepuluh) tahun dan/atau denda
                    paling banyak Rp10.000.000.000,00 (sepuluh miliar rupiah).
                  </li>
                </ul>

                <p className="mt-3 text-sm text-blue-600 underline">
                  <a
                    href="https://peraturan.bpk.go.id/details/274494/uu-no-1-tahun-2024"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    (https://peraturan.bpk.go.id/details/274494/uu-no-1-tahun-2024)
                  </a>
                </p>

                <h4 className="font-semibold mt-4 mb-2">
                  2. Undang-Undang Perlindungan Data Pribadi (Undang-Undang
                  Nomor 27 Tahun 2022)
                </h4>

                <ul className="list-disc ml-6 space-y-2 text-gray-700">
                  <li>
                    <strong>Pasal 5:</strong> Subjek Data Pribadi berhak
                    mendapatkan informasi tentang kejelasan identitas, dasar
                    kepentingan hukum, tujuan permintaan dan penggunaan Data
                    Pribadi, dan akuntabilitas pihak yang meminta Data Pribadi.
                  </li>
                  <li>
                    <strong>Pasal 6 ayat (1):</strong> Subjek Data Pribadi
                    berhak menarik kembali persetujuan pemrosesan Data Pribadi
                    tentang dirinya yang telah diberikan kepada Pengendali Data
                    Pribadi.
                  </li>
                  <li>
                    <strong>Pasal 6 ayat (2):</strong> Pengendali Data Pribadi
                    wajib memiliki dasar pemrosesan Data Pribadi yang sah.
                  </li>
                  <li>
                    <strong>Pasal 6 ayat (3):</strong> Dasar pemrosesan Data
                    Pribadi sebagaimana dimaksud pada ayat (1) meliputi:
                    <ul className="list-[lower-alpha] ml-6 space-y-1">
                      <li>
                        persetujuan yang sah secara eksplisit dari Subjek Data
                        Pribadi untuk satu atau beberapa tujuan tertentu yang
                        telah disampaikan oleh Pengendali Data Pribadi kepada
                        Subjek Data Pribadi;
                      </li>
                      <li>
                        pemenuhan kewajiban perjanjian yang sah yang dilakukan
                        Subjek Data Pribadi sebagai pihak, atau untuk memenuhi
                        permintaan Subjek Data Pribadi pada saat akan melakukan
                        perjanjian;
                      </li>
                      <li>
                        pemenuhan kewajiban hukum dari Pengendali Data Pribadi
                        sesuai dengan ketentuan peraturan perundang-undangan;
                      </li>
                      <li>
                        pemenuhan kepentingan yang vital untuk Subjek Data
                        Pribadi;
                      </li>
                      <li>
                        pelaksanaan tugas dalam kepentingan umum, atau
                        pelaksanaan kewenangan yang dimiliki oleh Pengendali
                        Data Pribadi sesuai ketentuan peraturan
                        perundang-undangan;
                      </li>
                      <li>
                        pemenuhan kepentingan sah lainnya dengan tetap
                        memperhatikan tujuan, kebutuhan, dan keseimbangan
                        kepentingan antara Pengendali Data Pribadi dan hak
                        Subjek Data Pribadi.
                      </li>
                    </ul>
                  </li>
                  <li>
                    <strong>Pasal 21 ayat (1):</strong> Dalam hal pemrosesan
                    Data Pribadi berdasarkan persetujuan sebagaimana dimaksud
                    pada Pasal 20 ayat (2) huruf a, Pengendali Data Pribadi
                    wajib menyampaikan informasi mengenai:
                    <ul className="list-[lower-alpha] ml-6 space-y-1">
                      <li>legalitas dari pemrosesan Data Pribadi;</li>
                      <li>tujuan pemrosesan Data Pribadi;</li>
                      <li>
                        jenis dan relevansi Data Pribadi yang akan diproses;
                      </li>
                      <li>
                        jangka waktu retensi dokumen yang memuat Data Pribadi;
                      </li>
                      <li>rincian mengenai informasi yang dikumpulkan;</li>
                      <li>periode waktu pemrosesan Data Pribadi; dan</li>
                      <li>hak Subjek Data Pribadi.</li>
                    </ul>
                  </li>
                  <li>
                    <strong>Pasal 21 ayat (2):</strong> Dalam hal terjadi
                    perubahan informasi sebagaimana dimaksud pada ayat (1),
                    Pengendali Data Pribadi wajib memberitahukan kepada Subjek
                    Data Pribadi secara tertulis sebelum perubahan informasi.
                  </li>
                  <li>
                    <strong>Pasal 22 ayat (1):</strong> Persetujuan pemrosesan
                    Data Pribadi dilakukan melalui pernyataan tertulis atau
                    terekam.
                  </li>
                  <li>
                    <strong>Pasal 22 ayat (2):</strong> Persetujuan sebagaimana
                    pada ayat (1) dapat disampaikan secara elektronik atau
                    non-elektronik.
                  </li>
                  <li>
                    <strong>Pasal 22 ayat (3):</strong> Persetujuan sebagaimana
                    dimaksud pada ayat (1) mempunyai nilai yang sama.
                  </li>
                  <li>
                    <strong>Pasal 22 ayat (4):</strong> Dalam hal persetujuan
                    sebagaimana dimaksud pada ayat (1) dilakukan secara
                    elektronik, Pengendali Data Pribadi wajib menyediakan:
                    <ul className="list-[lower-alpha] ml-6 space-y-1">
                      <li>
                        pernyataan persetujuan yang dapat dipahami dan mudah
                        diakses, serta dapat ditarik kembali dengan mudah oleh
                        Subjek Data Pribadi;
                      </li>
                      <li>
                        catatan persetujuan yang diberikan oleh Subjek Data
                        Pribadi; dan
                      </li>
                      <li>
                        catatan penarikan kembali persetujuan yang dilakukan
                        oleh Subjek Data Pribadi.
                      </li>
                    </ul>
                  </li>
                  <li>
                    <strong>Pasal 35:</strong> Pengendali Data Pribadi wajib
                    melindungi dan memastikan keamanan Data Pribadi yang
                    diproses.
                  </li>
                  <li>
                    <strong>Pasal 36:</strong> Pengendali Data Pribadi wajib
                    mencegah terjadinya pemrosesan Data Pribadi yang
                    bertentangan dengan ketentuan peraturan perundang-undangan.
                  </li>
                  <li>
                    <strong>Pasal 37 ayat (1):</strong> Subjek Data Pribadi
                    berhak mengajukan keberatan terhadap:
                    <ul className="list-[lower-alpha] ml-6 space-y-1">
                      <li>
                        pengambilan keputusan yang hanya didasarkan pada
                        pemrosesan Data Pribadi secara otomatis, termasuk
                        pembuatan profil; dan
                      </li>
                      <li>
                        pemrosesan Data Pribadi yang tidak sesuai dengan tujuan
                        pengumpulan Data Pribadi dan yang haknya harus
                        dilindungi dalam pemrosesan Data Pribadi.
                      </li>
                    </ul>
                  </li>
                  <li>
                    <strong>Pasal 42 ayat (1):</strong> Subjek Data Pribadi
                    wajib melakukan penarikan kembali persetujuan pemrosesan
                    Data Pribadi jika:
                    <ul className="list-[lower-alpha] ml-6 space-y-1">
                      <li>
                        terdapat permintaan dari Subjek Data Pribadi; atau
                      </li>
                      <li>
                        Data Pribadi diperoleh dan/atau diproses dengan cara
                        melawan hukum.
                      </li>
                    </ul>
                  </li>
                  <li>
                    <strong>Pasal 42 ayat (2):</strong> Penghapusan Data Pribadi
                    sebagaimana dimaksud pada ayat (1) dilakukan sesuai dengan
                    ketentuan peraturan perundang-undangan.
                  </li>
                </ul>

                <p className="mt-3 text-sm text-blue-600 underline">
                  <a
                    href="https://peraturan.bpk.go.id/Details/212671/uu-no-27-tahun-2022"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    (https://peraturan.bpk.go.id/Details/212671/uu-no-27-tahun-2022)
                  </a>
                </p>

                <h3 id="kuhp" class="text-xl font-semibold mt-6 mb-2">
                  3. Kitab Undang-Undang Hukum Pidana (Undang-Undang Nomor 1
                  Tahun 2023)
                </h3>
                <ul class="list-disc ml-6 space-y-2 text-gray-700">
                  <li>
                    <strong>Pasal 242:</strong> Setiap Orang Di Muka Umum
                    menyatakan perasaan permusuhan, kebencian, atau penghinaan
                    terhadap atau atas beberapa golongan atau kelompok penduduk
                    Indonesia berdasarkan ras, kebangsaan, etnis, warna kulit,
                    jenis kelamin, disabilitas mental, atau disabilitas fisik,
                    dipidana dengan pidana penjara paling lama 3 (tiga) tahun
                    atau pidana denda paling banyak kategori IV;
                  </li>
                  <li>
                    <strong>Pasal 243 ayat (1):</strong> Setiap Orang yang
                    menyiarkan, mempertunjukkan, atau menempelkan tulisan atau
                    gambar sehingga terlihat oleh umum atau memperdengarkan
                    rekaman sehingga terdengar oleh umum atau menyebarluaskan
                    dengan sarana teknologi informasi, yang berisi pernyataan
                    perasaan permusuhan dengan maksud agar isinya diketahui atau
                    lebih diketahui oleh umum, terhadap satu atau beberapa
                    golongan atau kelompok penduduk Indonesia berdasarkan ras,
                    kebangsaan, etnis, warna kulit, agama, kepercayaan, jenis
                    kelamin, disabilitas mental, atau disabilitas fisik yang
                    berakibat timbulnya Kekerasan terhadap orang atau Barang,
                    dipidana dengan pidana penjara paling lama 4 (empat) tahun
                    atau pidana denda paling banyak kategori IV;
                  </li>
                  <li>
                    <strong>Pasal 263 ayat (1):</strong> Setiap Orang yang
                    menyiarkan atau menyebarluaskan berita atau pemberitahuan
                    padahal diketahuinya bahwa berita atau pemberitahuan
                    tersebut bohong yang mengakibatkan kerusuhan dalam
                    masyarakat, dipidana dengan pidana penjara paling lama 6
                    (enam) tahun atau pidana denda paling banyak kategori V;
                  </li>
                  <li>
                    <strong>Pasal 263 ayat (2):</strong> Setiap Orang yang
                    menyiarkan atau menyebarluaskan berita atau pemberitahuan
                    padahal patut diduga bahwa berita atau pemberitahuan
                    tersebut adalah bohong yang dapat mengakibatkan kerusuhan
                    dalam masyarakat, dipidana dengan pidana penjara paling lama
                    4 (empat) tahun atau pidana denda paling banyak kategori IV;
                  </li>
                  <li>
                    <strong>Pasal 492:</strong> Setiap Orang yang dengan maksud
                    menguntungkan diri sendiri atau orang lain secara melawan
                    hukum dengan memakai nama palsu atau kedudukan palsu,
                    menggunakan tipu muslihat atau rangkaian kata bohong,
                    menggerakkan orang supaya menyerahkan suatu Barang, memberi
                    utang, membuat pengakuan utang, atau menghapus piutang,
                    dipidana karena penipuan, dengan pidana penjara paling lama
                    4 (empat) tahun atau pidana denda paling banyak kategori V.
                  </li>
                </ul>
                <p class="mt-2 text-sm text-blue-600 underline">
                  <a
                    href="https://peraturan.bpk.go.id/Details/234935/uu-no-1-tahun-2023"
                    target="_blank"
                  >
                    (https://peraturan.bpk.go.id/Details/234935/uu-no-1-tahun-2023)
                  </a>
                </p>

                <h3
                  id="perlindungan-anak"
                  class="text-xl font-semibold mt-6 mb-2"
                >
                  4. Undang-Undang Perlindungan Anak (Undang-Undang Nomor 35
                  Tahun 2014, Perubahan atas Undang-Undang Nomor 23 Tahun 2002)
                </h3>
                <ul class="list-disc ml-6 space-y-2 text-gray-700">
                  <li>
                    <strong>Pasal 1 ayat (1):</strong> Anak adalah seseorang
                    yang belum berusia 18 (delapan belas) tahun, termasuk anak
                    yang masih dalam kandungan;
                  </li>
                  <li>
                    <strong>Pasal 15:</strong> Setiap Anak berhak untuk
                    memperoleh perlindungan dari:
                    <ol type="a" class="ml-6 list-[lower-alpha] space-y-1">
                      <li>penyalahgunaan dalam kegiatan politik;</li>
                      <li>pelibatan dalam sengketa bersenjata;</li>
                      <li>pelibatan dalam kerusuhan sosial;</li>
                      <li>
                        pelibatan dalam peristiwa yang mengandung unsur
                        Kekerasan;
                      </li>
                      <li>pelibatan dalam peperangan; dan</li>
                      <li>kejahatan seksual;</li>
                    </ol>
                  </li>
                </ul>
                <p class="mt-2 text-sm text-blue-600 underline">
                  <a
                    href="https://peraturan.bpk.go.id/Details/38723/uu-no-35-tahun-2014"
                    target="_blank"
                  >
                    (https://peraturan.bpk.go.id/Details/38723/uu-no-35-tahun-2014)
                  </a>
                </p>
              </>
            )}

            {/* Bagian 3 */}
            {activeGroup === "faq" && (
              <>
                <h3 id="faq" className="text-xl font-semibold mt-6 mb-2">
                  E. Pertanyaan yang Sering Diajukan (FAQ)
                </h3>

                <h4 className="font-semibold mt-4 mb-2">
                  1. Apa itu TitikRuang dan siapa saja yang bisa menggunakannya?
                </h4>
                <p className="text-gray-700 mb-4">
                  TitikRuang merupakan platform digital berbasis komunitas yang
                  menyediakan ruang aman, anonim, dan inklusif untuk berbagi
                  cerita, edukasi, dan pemulihan psikososial bagi siapa pun,
                  khususnya bagi korban yang sedang/pernah terdampak aktivitas
                  judi online (judol) atau pinjaman online (pinjol).
                </p>

                <h4 className="font-semibold mt-4 mb-2">
                  2. Apakah Saya harus menggunakan identitas asli untuk
                  mendaftar di platform ini?
                </h4>
                <p className="text-gray-700 mb-4">
                  Tidak. TitikRuang menjunjung tinggi prinsip anonimitas.
                  Pengguna umum dapat mengakses layanan cukup dengan{" "}
                  <em>username</em> (nama pengguna) dan <em>password</em> (kata
                  sandi) tanpa mengisi data pribadi. Namun, untuk mendapatkan
                  akses penuh (misalnya untuk bergabung dalam komunitas
                  diskusi), verifikasi tambahan atas informasi terbatas
                  dibutuhkan dengan persetujuan privasi yang dijaga ketat.
                </p>

                <h4 className="font-semibold mt-4 mb-2">
                  3. Apakah platform ini bisa digunakan secara gratis?
                </h4>
                <p className="text-gray-700 mb-4">
                  Ya. Seluruh layanan dan fitur utama TitikRuang dapat diakses
                  secara gratis oleh semua pengguna, baik akun umum maupun
                  terverifikasi. Kami tidak menarik biaya langganan atau
                  pendaftaran dalam bentuk apa pun. Namun, untuk layanan
                  konseling profesional, kami memfasilitasi pengguna agar dapat
                  terhubung langsung dengan psikolog atau tenaga kesehatan
                  mental yang relevan.
                </p>

                <h4 className="font-semibold mt-4 mb-2">
                  4. Apa saja perbedaan antara akun umum dan akun terverifikasi?
                </h4>
                <ul className="list-disc ml-6 space-y-1 text-gray-700">
                  <li>
                    <strong>Akun Umum:</strong>
                    <ul className="list-[lower-alpha] ml-6 space-y-1">
                      <li>
                        mengisi <em>username</em> (nama pengguna) dan{" "}
                        <em>password</em> (kata sandi) sebagai persyaratan
                        registrasi akun;
                      </li>
                      <li>akses ke fitur dasar;</li>
                      <li>
                        dapat membaca, memberi reaksi, dan berkomentar dalam{" "}
                        <em>single-fitur</em>;
                      </li>
                      <li>
                        tidak dapat berkomentar, mengunggah konten visual,
                        dan/membuat ruang dalam fitur <em>diskusi komunitas</em>
                        .
                      </li>
                    </ul>
                  </li>
                  <li>
                    <strong>Akun Terverifikasi:</strong>
                    <ul className="list-[lower-alpha] ml-6 space-y-1">
                      <li>
                        mengisi formulir identitas terbatas, termasuk{" "}
                        <em>username</em> dan <em>password</em> sebagai
                        persyaratan registrasi akun;
                      </li>
                      <li>akses penuh ke seluruh fitur;</li>
                      <li>
                        bisa mengunggah konten, bergabung/membuat komunitas,
                        dan/berdiskusi secara aktif;
                      </li>
                      <li>
                        melalui proses kurasi dan persetujuan privasi oleh
                        moderator platform.
                      </li>
                    </ul>
                  </li>
                </ul>

                <h4 className="font-semibold mt-4 mb-2">
                  5. Fitur layanan apa saja yang tersedia di TitikRuang?
                </h4>
                <ul className="list-disc ml-6 space-y-1 text-gray-700">
                  <li>
                    <strong>Ruang Curhat:</strong> Ruang aman untuk berbagi
                    cerita dan pengalaman personal secara anonim.
                  </li>
                  <li>
                    <strong>Diskusi Komunitas:</strong> Forum tematik yang
                    mempertemukan pengguna terverifikasi maupun pengguna umum
                    untuk berdiskusi dan saling menguatkan.
                  </li>
                  <li>
                    <strong>Konten Edukatif:</strong> Fasilitas
                    artikel/audio/video/visual seputar literasi keuangan,
                    manajemen stres, pemulihan trauma, hingga{" "}
                    <em>support-system</em>.
                  </li>
                  <li>
                    <strong>Kuis Bintang:</strong> Kuis reflektif dengan sistem
                    poin untuk mengasah pemahaman dan kepekaan diri.
                  </li>
                  <li>
                    <strong>Layanan Simulasi</strong>
                  </li>
                </ul>
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

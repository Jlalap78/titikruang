"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
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

export default function KuisBintang() {
  const [harga, setHarga] = useState(10000000);
  const [tenor, setTenor] = useState(6);
  const [bunga, setBunga] = useState(0.4); // persen per hari
  const [danaPribadi, setDanaPribadi] = useState(5000000);
  const [pengeluaranList, setPengeluaranList] = useState([
    { nama: "", jumlah: 0 },
  ]);
  const [scrollY, setScrollY] = useState(0);
  const [hoveredMenu, setHoveredMenu] = useState(null);
  const [hoverTimeout, setHoverTimeout] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const dropdownRef = useRef(null);

  const dropdowns = {
    support: ["🗣️ Ruang Curhat", "🤝 Diskusi Komunitas"],
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

  const handlePengeluaranChange = (index, field, value) => {
    const newList = [...pengeluaranList];
    newList[index][field] = field === "jumlah" ? Number(value) : value;
    setPengeluaranList(newList);
  };

  const addPengeluaran = () => {
    setPengeluaranList([...pengeluaranList, { nama: "", jumlah: 0 }]);
  };

  const removePengeluaran = (index) => {
    const newList = pengeluaranList.filter((_, i) => i !== index);
    setPengeluaranList(newList);
  };

  const hari = tenor * 30;
  const totalPengeluaran = pengeluaranList.reduce(
    (acc, cur) => acc + (Number(cur.jumlah) || 0),
    0
  );
  const sisaDana = danaPribadi - totalPengeluaran;
  const pinjaman = harga;
  const bungaTotal = pinjaman * (bunga / 100) * hari;
  const totalPembayaran = pinjaman + bungaTotal;
  const pembayaranPerBulan = tenor > 0 ? totalPembayaran / tenor : 0;
  const evaluasiSisa = sisaDana - pembayaranPerBulan;

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

      <div className="py-10 px-6">
        <h1 className="text-3xl font-bold text-center mb-8 text-[#F2780C]">
          Simulasi Pinjaman Online
        </h1>

        <div className="max-w-3xl mx-auto space-y-6 bg-white p-6 rounded-xl shadow-xl">
          <div>
            <label className="block font-semibold mb-2">
              Jumlah Pinjaman (Rp)
            </label>
            <input
              type="range"
              min={1000000}
              max={100000000}
              step={1000000}
              value={harga}
              onChange={(e) => setHarga(Number(e.target.value))}
              className="w-full"
            />
            <p className="mt-1 text-blue-600 font-semibold">
              Rp {harga.toLocaleString()}
            </p>
          </div>

          <div>
            <label className="block font-semibold mb-2">Tenor (bulan)</label>
            <input
              type="range"
              min={1}
              max={24}
              value={tenor}
              onChange={(e) => setTenor(Number(e.target.value))}
              className="w-full"
            />
            <p className="mt-1 text-blue-600 font-semibold">
              {tenor} bulan ({hari} hari)
            </p>
          </div>

          <div>
            <label className="block font-semibold mb-2">
              Bunga per Hari (%)
            </label>
            <input
              type="range"
              min={0.1}
              max={1}
              step={0.1}
              value={bunga}
              onChange={(e) => setBunga(Number(e.target.value))}
              className="w-full"
            />
            <p className="mt-1 text-blue-600 font-semibold">
              {bunga.toFixed(1)}% per hari
            </p>
          </div>

          <div>
            <label className="block font-semibold mb-2">
              Dana Pribadi (Rp)
            </label>
            <input
              type="range"
              min={0}
              max={100000000}
              step={500000}
              value={danaPribadi}
              onChange={(e) => setDanaPribadi(Number(e.target.value))}
              className="w-full"
            />
            <p className="mt-1 text-blue-600 font-semibold">
              Rp {danaPribadi.toLocaleString()}
            </p>
            <p className="text-sm text-gray-500 mt-1">*Gaji tiap Bulan</p>
          </div>

          <div>
            <label className="block font-semibold mb-2 mt-4">
              Rincian Pengeluaran Pribadi
            </label>
            {pengeluaranList.map((item, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="text"
                  placeholder="Nama Pengeluaran"
                  value={item.nama}
                  onChange={(e) =>
                    handlePengeluaranChange(index, "nama", e.target.value)
                  }
                  className="flex-1 border p-2 rounded"
                />
                <input
                  type="number"
                  placeholder="Jumlah (Rp)"
                  value={item.jumlah}
                  onChange={(e) =>
                    handlePengeluaranChange(index, "jumlah", e.target.value)
                  }
                  className="w-40 border p-2 rounded"
                />
                {index > 0 && (
                  <button
                    onClick={() => removePengeluaran(index)}
                    className="text-red-600 font-bold px-2"
                  >
                    −
                  </button>
                )}
              </div>
            ))}
            <button
              onClick={addPengeluaran}
              className="mt-2 text-blue-600 font-semibold"
            >
              + Tambah Pengeluaran
            </button>
            <p className="mt-2 text-sm text-gray-600">
              Total Pengeluaran: Rp {totalPengeluaran.toLocaleString()}
            </p>
            <p className="text-sm text-gray-600">
              Sisa Dana Bersih: Rp {sisaDana.toLocaleString()}
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h2 className="text-lg font-bold text-blue-700">Hasil Simulasi</h2>
            <p className="mt-2">
              Jumlah Pinjaman: <strong>Rp {pinjaman.toLocaleString()}</strong>
            </p>
            <p>
              Total Bunga ({hari} hari):{" "}
              <strong>Rp {Math.round(bungaTotal).toLocaleString()}</strong>
            </p>
            <p>
              Total yang Harus Dibayar:{" "}
              <strong className="text-red-600 text-xl">
                Rp {Math.round(totalPembayaran).toLocaleString()}
              </strong>
            </p>
            <p>
              Pembayaran Per Bulan:{" "}
              <strong className="text-blue-600 text-xl">
                {" "}
                Rp {Math.round(pembayaranPerBulan).toLocaleString()}
              </strong>
            </p>
          </div>

          <div className="mt-4 p-4 bg-white border rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-2">
              Evaluasi Kemampuan Dana Pribadi
            </h3>
            {evaluasiSisa >= 0 ? (
              <p className="text-green-600 font-semibold">
                ✅ Dana kamu cukup untuk membayar tiap bulan. Sisa bulanan: Rp{" "}
                {Math.round(evaluasiSisa).toLocaleString()} Apa Kamu yakin Masih
                ingin Meminjam?. Coba kamu Pertimbangkan lagi
              </p>
            ) : (
              <p className="text-red-600 font-semibold">
                ❌ Dana kamu tidak memenuhi untuk melakukan pembayaran tiap
                bulannya. uang yang masih kamu perlu bayarkan: Rp{" "}
                {Math.abs(Math.round(evaluasiSisa)).toLocaleString()} apa kamu
                yakin masih ingin meminjam?
              </p>
            )}
          </div>
        </div>
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
        ⬆️
      </button>
    </div>
  );
}

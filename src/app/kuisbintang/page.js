'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { scroller } from 'react-scroll';
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
} from 'react-icons/fa';

export default function KuisBintang() {
  
  const questions = [
    {
      question: 'What is a water cycle?',
      options: [
        'A water cycle describes the process of how water moves through Earth’s environment.',
        'A water cycle forms because of the sun.',
        'A water cycle is formed because of the greenhouse gases.',
        'A water cycle is when all of earth’s components mix, and it forms a cycle.'
      ],
      correctIndex: 0
    },
    {
      question: 'What causes rain?',
      options: [
        'The sun pulling water back to the sky.',
        'Condensation of water vapor in clouds.',
        'The earth absorbing too much heat.',
        'Water moving underground.'
      ],
      correctIndex: 1
    },
    {
      question: 'Which part of the cycle is evaporation?',
      options: [
        'When clouds turn into snow.',
        'When water vapor cools down.',
        'When water turns into vapor due to heat.',
        'When rain collects into rivers.'
      ],
      correctIndex: 2
    },
    {
      question: 'What is precipitation?',
      options: [
        'Water moving underground.',
        'Rain, snow, sleet or hail that falls from clouds.',
        'Water turning into gas.',
        'Water vapor cooling down to form clouds.'
      ],
      correctIndex: 1
    }
  ];

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [selected, setSelected] = useState(null);
  const [scrollY, setScrollY] = useState(0);
  const [hoveredMenu, setHoveredMenu] = useState(null);
  const isMenuOpen = (key) => hoveredMenu === key;
  const [hoverTimeout, setHoverTimeout] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  const dropdowns = {
    support: ['🗣️ Ruang Curhat', '🤝 Diskusi Kelompok'],
    learning: ['🎧 Konten Edukatif', '💰 Simulasi Pinjaman'],
    tools: ['⭐ Kuis Bintang', '🤖 HelpBot', '🚨 Emergency Connect'],
  };

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleAnswer = (index) => {
    if (selected !== null) return;
    setSelected(index);
    const isCorrect = index === questions[currentQuestion].correctIndex;
    if (isCorrect) setScore((prev) => prev + 1);
    setTimeout(() => {
      setSelected(null);
      if (currentQuestion + 1 < questions.length) {
        setCurrentQuestion((prev) => prev + 1);
      } else {
        setFinished(true);
      }
    }, 1000);
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
                <Image src="/logo.png" alt="TitikRuang Logo" width={40} height={40} />
                <div className="text-2xl font-bold whitespace-nowrap">TitikRuang</div>
                </div>
                
                {/* Desktop Navigation */}
                <nav className="hidden md:flex gap-6 text-sm relative z-50" ref={dropdownRef}>
                  {Object.entries({
                    support: 'Pusat Dukungan Anonim',
                    learning: 'Pusat Pembelajaran',
                    tools: 'Alat Pendukung',
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
                animate={isMenuOpen(key) ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.95, y: -10 }}
                transition={{ duration: 0.3 }}
                className={`absolute left-0 bg-white text-black rounded-xl mt-2 py-2 px-4 shadow-lg min-w-max z-50 ${
                  isMenuOpen(key) ? 'block' : 'hidden'
                }`}
              >
                {dropdowns[key].map((item, i) => {
                  const parts = item.split(' ');
                  const label = (parts[1] || parts[0]).toLowerCase();
                  const isDiskusi = item.includes('Diskusi');
                  const isCurhat = item.includes('Ruang Curhat');
                  const isBelajar = item.includes('Konten Edukatif');
                  const isSimulasi  = item.includes('Simulasi Pinjaman');
                  const isKuis = item.includes('Kuis Bintang');
                  const href = isDiskusi ? '/diskusi'
                    : isCurhat ? '/ruang'
                    : isBelajar ? '/pembelajaran'
                    : isSimulasi ? '/simulasipinjaman'
                    : isKuis ? '/kuisbintang'
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
          <button className="bg-[#F25050] text-white px-4 py-2 rounded-xl hover:bg-[#F2780C]">Masuk</button>
        </div>
    
        {/* Tombol Hamburger */}
        <button className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
          <span className="text-black text-xl">{mobileOpen ? '✕' : '☰'}</span>
        </button>
      </div>
    
      {/* Mobile Navigation */}
      {mobileOpen && (
        <div className="md:hidden bg-white text-black px-4 pb-4 pt-2 space-y-2">
          {Object.entries({
            support: 'Pusat Dukungan Anonim',
            learning: 'Pusat Pembelajaran',
            tools: 'Alat Pendukung',
          }).map(([key, label]) => (
            <details key={key} className="border rounded-md overflow-hidden">
              <summary className="px-3 py-2 cursor-pointer font-medium hover:bg-gray-100">{label}</summary>
              <div className="px-4 pb-2 pt-1 text-sm space-y-1">
                {dropdowns[key].map((item, i) => {
                  const parts = item.split(' ');
                  const label = (parts[1] || parts[0]).toLowerCase();
                  const isDiskusi = item.includes('Diskusi');
                  const isCurhat = item.includes('Ruang Curhat');
                  const isBelajar = item.includes('Konten Edukatif');
                  const isSimulasi  = item.includes('Simulasi Pinjaman');
                  const isKuis = item.includes('Kuis Bintang');
                  const href = isDiskusi ? '/diskusi'
                    : isCurhat ? '/ruang'
                    : isBelajar ? '/pembelajaran'
                    : isSimulasi ? '/simulasipinjaman'
                    : isKuis ? '/kuisbintang'
                    : `#${label}`;
                  return (
                    <a key={i} href={href} className="block hover:text-[#F2780C] text-black">
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
          <button className="w-full bg-[#F25050] text-white py-2 rounded-lg hover:bg-[#F2780C]">Masuk</button>
        </div>
      )}
    </motion.header>

      {/* Kuis */}
      <div className="py-10 px-6 flex flex-col items-center">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="max-w-3xl w-full bg-white p-6 rounded-xl shadow-lg"
        >
          {!finished ? (
            <>
              <h2 className="text-2xl font-bold text-center text-[#F2780C] mb-4">
                Soal {currentQuestion + 1} dari {questions.length}
              </h2>
              <p className="text-lg font-semibold mb-6 text-center">{questions[currentQuestion].question}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {questions[currentQuestion].options.map((option, index) => {
                  const isCorrect = index === questions[currentQuestion].correctIndex;
                  const isSelected = selected === index;
                  const bgColor = selected !== null
                    ? isCorrect
                      ? 'bg-green-500'
                      : isSelected
                      ? 'bg-red-500'
                      : 'bg-gray-200'
                    : 'bg-blue-500 hover:bg-blue-600';
                  return (
                    <button
                      key={index}
                      onClick={() => handleAnswer(index)}
                      className={`${bgColor} text-white font-medium py-4 px-4 rounded-lg text-left shadow-lg transition-all duration-200`}
                      disabled={selected !== null}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold text-green-600">Kuis Selesai! 🎉</h2>
              <p className="text-xl">
                Skor kamu: <strong>{score}</strong> dari <strong>{questions.length}</strong>
              </p>
              <button
                onClick={() => {
                  setCurrentQuestion(0);
                  setScore(0);
                  setFinished(false);
                }}
                className="mt-4 bg-[#F2780C] text-white px-6 py-2 rounded-lg hover:bg-[#F25050]"
              >
                Ulangi Kuis
              </button>
            </div>
          )}
        </motion.div>
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
                            src="/logo.png"
                            alt="TitikRuang Logo"
                            width={32}
                            height={32}
                            className="transition duration-300 hover:animate-glow"
                          />
                          <h3 className="text-xl font-bold">TitikRuang</h3>
                        </div>
                        <p>DENGAR PULIH BANGKIT</p>
                      </div>
              
                      {/* Kolom 2: Tentang */}
                      <div>
                        <h4 className="text-base font-semibold mb-2">Tentang</h4>
                        <ul className="space-y-1">
                          <li><a href="/tentangkami" className="hover:underline">Visi & Misi</a></li>
                          <li><a href="/tentangkami" className="hover:underline">Penelitian</a></li>
                          <li><a href="/tentangkami" className="hover:underline">Tim</a></li>
                        </ul>
                      </div>
              
                      {/* Kolom 3: Bantuan */}
                      <div>
                        <h4 className="text-base font-semibold mb-2">Bantuan</h4>
                        <ul className="space-y-1">
                          <li><a href="#" className="hover:underline">Privasi</a></li>
                          <li><a href="#" className="hover:underline">Laporkan Penyalahgunaan</a></li>
                          <li><a href="/Kontakkami" className="hover:underline">Kontak</a></li>
                        </ul>
                      </div>
              
                      {/* Kolom 4: Hubungi Kami */}
                      <div>
                        <h4 className="text-base font-semibold mb-2">Hubungi Kami</h4>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <FaEnvelope />
                            <a href="mailto:info@ruangguru.com" className="hover:underline">
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
                          <a href="https://www.instagram.com/officialtitikruang" target="_blank" rel="noopener noreferrer">
                            <FaInstagram className="hover:text-pink-500" />
                          </a>
                          <a href="https://www.facebook.com/akunmu" target="_blank" rel="noopener noreferrer">
                            <FaFacebook className="hover:text-blue-600" />
                          </a>
                          <a href="https://www.youtube.com/@TitikRuangOfficial" target="_blank" rel="noopener noreferrer">
                            <FaYoutube className="hover:text-red-600" />
                          </a>
                          <a href="http://linkedin.com/in/titik-ruang-860043379" target="_blank" rel="noopener noreferrer">
                            <FaLinkedin className="hover:text-blue-700" />
                          </a>
                        </div>
                      </div>
                    </div>
              
                  {/* Bottom Section */}
                  <div className="mt-1 flex flex-col sm:flex-row items-center justify-between text-sm">
                    <div className="mt-1 sm:mt-0 flex items-center gap-2">
                      <span>Dibina oleh</span>
                      <img src="/logo_of_ministry_of_education_and_culture_of_republic_of_indonesia.svg.webp"  className="h-10" />
                      <img src="/logounairbiru.png" className="h-10" />
                      <img src="/logodiktisaintekberdampak_horizontallogo.png" className="h-10" />
                    </div>
                  </div>
                </div>
              </footer>
             
             
                   <button onClick={() => scroll.scrollToTop()} className="fixed bottom-20 right-6 z-[99] bg-[#F2780C] text-white p-3 rounded-full shadow-lg hover:bg-[#F25050] z-50" aria-label="Back to Top">
                     ⬆️
                   </button>
            </div>
          
          );
}

'use client';

import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';


import {
  Smile,
  Image as ImageIcon,
  Send,
  Hash,
} from 'lucide-react';
import {
  initAuth,
  listenAuth,
  getMessagesQuery,
  sendMessage,
  toggleReaction,
  toggleReaction1,
  getMessagesQuery1,
  sendMessage1,
} from '../../lib/firebase';
import { onSnapshot, serverTimestamp } from 'firebase/firestore';

export default function DiskusiPage() {
  const [messages, setMessages] = useState([]);
  const [user, setUser] = useState(null);
  const [input, setInput] = useState('');
  const [scrollY, setScrollY] = useState(0);
  const [hoveredMenu, setHoveredMenu] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [hoverTimeout, setHoverTimeout] = useState(null);
  const messagesEndRef = useRef(null);
  const dropdownRef = useRef(null);

  const activeChannel = 'general';

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const getOrCreateAnonName = (uid) => {
    const key = `anon-name-${uid}`;
    let storedName = localStorage.getItem(key);
    if (!storedName) {
      const random = Math.random().toString(36).substring(2, 6).toUpperCase();
      storedName = `Anon-${random}`;
      localStorage.setItem(key, storedName);
    }
    return storedName;
  };

  useEffect(() => {
    initAuth();
    const unsub = listenAuth(setUser);
    return () => unsub();
  }, []);

  useEffect(() => {
    const q = getMessagesQuery1(activeChannel);
    const unsub = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, [activeChannel]);

  const handleSend = async () => {
    if (!input.trim() || !user) return;

   
    const senderName = getOrCreateAnonName(user.uid);

    await sendMessage1(activeChannel, {
      text: input.trim(),
      uid: user.uid,
      senderName,
      reactions: {},
      timestamp: serverTimestamp(),
    });

    setInput('');
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };


  const handleReaction = async (msgId, emoji) => {
    if (!user) return;
    await toggleReaction1(activeChannel, msgId, emoji, user.uid);
  };

  const dropdowns = {
    support: ['🗣️ Ruang Curhat', '🤝 Diskusi Kelompok'],
    learning: ['🎧 Konten Edukatif', '💰 Simulasi Pinjaman'],
    tools: ['⭐ Kuis Bintang', '🤖 HelpBot', '🚨 Emergency Connect'],
  };

  const isMenuOpen = (key) => hoveredMenu === key;



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
                    animate={
                      isMenuOpen(key)
                        ? { opacity: 1, scale: 1, y: 0 }
                        : { opacity: 0, scale: 0.95, y: -10 }
                    }
                    transition={{ duration: 0.3 }}
                    className={`absolute left-0 bg-white text-black rounded-xl mt-2 py-2 px-4 shadow-lg min-w-max z-50 ${isMenuOpen(key) ? 'block' : 'hidden'
                      }`}
                  >
                    {dropdowns[key].map((item, i) => {
                      const parts = item.split(' ');
                      const label = (parts[1] || parts[0]).toLowerCase();
                      const isDiskusi = item.includes('Diskusi');
                      const isCurhat = item.includes('Ruang Curhat');
                      const isBelajar = item.includes('Konten Edukatif');
                      const isSimulasi = item.includes('Simulasi Pinjaman');
                      const isKuis = item.includes('Kuis Bintang');
                      const href = isDiskusi
                        ? '/diskusi'
                        : isCurhat
                          ? '/ruang'
                          : isBelajar
                            ? '/pembelajaran'
                            : isSimulasi
                              ? '/simulasipinjaman'
                              : isKuis
                                ? '/KuisBintang'
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

              <a
                href="/tentangkami"
                className="text-white hover:text-[#F2BF27] transition-colors duration-300 px-2 py-1 rounded-xl relative"
              >
                <span className="absolute inset-0 bg-[#F25050] rounded-xl -z-10"></span>
                Tentang Kami
              </a>
            </nav>

            <div className="hidden md:block">
              <button className="bg-[#F25050] text-white px-4 py-2 rounded-xl hover:bg-[#F2780C]">Masuk</button>
            </div>

            <button className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
              <span className="text-black text-xl">{mobileOpen ? '✕' : '☰'}</span>
            </button>
          </div>

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
                      const isSimulasi = item.includes('Simulasi Pinjaman');
                      const isKuis = item.includes('Kuis Bintang');
                      const href = isDiskusi
                        ? '/diskusi'
                        : isCurhat
                          ? '/ruang'
                          : isBelajar
                            ? '/pembelajaran'
                            : isSimulasi
                              ? '/simulasipinjaman'
                              : isKuis
                                ? '/KuisBintang'
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

              <a
                href="/tentangkami"
                className="block text-center font-medium py-2 rounded-lg text-[#F25050] hover:text-[#F2780C] border border-[#F25050]"
              >
                Tentang Kami
              </a>
              <button className="w-full bg-[#F25050] text-white py-2 rounded-lg hover:bg-[#F2780C]">Masuk</button>
            </div>
          )}
        </motion.header>

        {/* Chat Section */}
        <div className="flex flex-col h-screen bg-[#EAF0FA] text-black font-sans">
          {/* Header Chat */}
          <div className="flex items-center justify-between px-6 py-4 bg-white/60 backdrop-blur-md border-b border-[#F2BF27] sticky top-0 z-10">
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-1 px-3 py-1 rounded-md text-sm font-medium bg-[#3061F2] text-white">
                <Hash className="w-4 h-4" />
                {activeChannel}
              </button>
            </div>
            <input
              type="text"
              placeholder="Search"
              className="bg-white text-sm px-3 py-1 rounded-md border border-[#F2BF27] shadow-sm focus:outline-none"
            />
          </div>

          {/* Message Feed */}
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className="flex flex-col gap-2 bg-white rounded-xl shadow p-4 hover:shadow-md transition"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#F28907] flex items-center justify-center font-bold text-white text-sm uppercase shadow">
                    {msg.uid?.slice(-2) ?? '??'}
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">
                      <span className="font-semibold text-black">
                        {msg.senderName ?? 'Anon'}
                      </span>{' '}
                      {msg.timestamp?.toDate?.().toLocaleString?.() ?? '...'}
                    </p>
                    <p className="text-gray-800">{msg.text}</p>
                  </div>
                </div>

                {/* Emoji Reactions */}
                <div className="flex gap-2 pl-14 pt-1">
                  {['👍', '😂', '🔥'].map((emoji) => {
                    const count = msg.reactions?.[emoji]?.length || 0;
                    const hasReacted = msg.reactions?.[emoji]?.includes(user?.uid);
                    return (
                      <button
                        key={emoji}
                        onClick={() => handleReaction(msg.id, emoji)}
                        className={`flex items-center gap-1 text-sm px-2 py-1 rounded-full border transition ${hasReacted
                            ? 'bg-[#3061F2] text-white border-[#3061F2]'
                            : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                          }`}
                      >
                        {emoji}
                        {count > 0 && <span>{count}</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="bg-white/80 backdrop-blur-md px-6 py-4 border-t border-[#F2BF27]">
            <div className="flex items-center gap-3">
              <button className="text-[#3061F2] hover:text-[#F2780C] transition">
                <ImageIcon className="w-5 h-5" />
              </button>
              <button className="text-[#3061F2] hover:text-[#F2780C] transition">
                <Smile className="w-5 h-5" />
              </button>
              <input
                type="text"
                placeholder={`Message #${activeChannel}`}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                className="flex-1 px-4 py-2 text-sm rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#27A4F2]"
              />
              <button
                onClick={handleSend}
                className="bg-[#3061F2] hover:bg-[#27A4F2] text-white p-2 rounded-lg transition"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

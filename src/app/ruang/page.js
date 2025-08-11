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
  getMessagesQuery1,
  sendMessage1,
  toggleReaction1,
} from '../../lib/firebase';

import { onSnapshot, serverTimestamp } from 'firebase/firestore';

// 🔹 Tambahan filter kata (tetap dipakai)
import { filterMessage, containsBlockedWord } from '../../lib/filterMessage';

// 🔹 List kata lucu untuk nama
const adjectives = [
  'Happy', 'Blue', 'Mighty', 'Sneaky', 'Brave', 'Chill', 'Silly', 'Witty', 'Lucky', 'Zany'
];
const animals = [
  'Tiger', 'Panda', 'Otter', 'Eagle', 'Penguin', 'Koala', 'Fox', 'Shark', 'Bear', 'Cat'
];

// 🔹 List emoji untuk avatar
const avatarEmojis = ['🐯', '🐼', '🦊', '🦈', '🐻', '🐧', '🦅', '🐨', '🐱', '🦦'];

// 🔹 Fungsi generate nama random tapi konsisten per UID
function getOrCreateFunnyName(uid) {
  const key = `funny-name-${uid}`;
  let storedName = localStorage.getItem(key);
  if (!storedName) {
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const animal = animals[Math.floor(Math.random() * animals.length)];
    const number = Math.floor(Math.random() * 90) + 10; // dua digit
    storedName = `${adj}${animal}${number}`;
    localStorage.setItem(key, storedName);
  }
  return storedName;
}

// 🔹 Fungsi generate emoji avatar unik & konsisten per UID
function getOrCreateEmojiAvatar(uid) {
  const key = `emoji-avatar-${uid}`;
  let storedEmoji = localStorage.getItem(key);
  if (!storedEmoji) {
    const emoji = avatarEmojis[Math.floor(Math.random() * avatarEmojis.length)];
    storedEmoji = emoji;
    localStorage.setItem(key, storedEmoji);
  }
  return storedEmoji;
}

export default function DiskusiPage() {
  const [messages, setMessages] = useState([]);
  const [user, setUser] = useState(null);
  const [input, setInput] = useState('');
  const [scrollY, setScrollY] = useState(0);
  const messagesEndRef = useRef(null);

  const activeChannel = 'general';

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

    const senderName = getOrCreateFunnyName(user.uid);
    const avatar = getOrCreateEmojiAvatar(user.uid);

    await sendMessage1(activeChannel, {
      text: filterMessage(input.trim()),
      uid: user.uid,
      senderName,
      avatar,
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

  return (
    <main>
      <div className="min-h-screen bg-gradient-to-br from-[#3061F2] via-white to-[#F2BF27]/10 text-gray-800">
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
                  <div className="w-10 h-10 rounded-full bg-[#F28907] flex items-center justify-center text-lg shadow">
                    {msg.avatar || getOrCreateEmojiAvatar(msg.uid)}
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">
                      <span className="font-semibold text-black">
                        {msg.senderName || getOrCreateFunnyName(msg.uid)}
                      </span>{' '}
                      {msg.timestamp?.toDate?.().toLocaleString?.() ?? '...'}
                    </p>
                    <p className="text-gray-800">
                      {filterMessage(msg.text)}
                    </p>
                  </div>
                </div>

                {/* Emoji Reactions */}
                <div className="flex gap-2 pl-14 pt-1">
                  {['👍', '😂', '🔥','😁','☹','🥲','😭',].map((emoji) => {
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

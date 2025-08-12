'use client';

import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import Picker from '@emoji-mart/react';
import data from '@emoji-mart/data';

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
  storage
} from '../../lib/firebase';

import {
  onSnapshot,
  doc,
  getDoc,
  setDoc,
  serverTimestamp
} from 'firebase/firestore';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db } from '../../lib/firebase';

import { filterMessage, containsBlockedWord } from '../../lib/filterMessage';

const adjectives = ['Happy', 'Blue', 'Mighty', 'Sneaky', 'Brave', 'Chill', 'Silly', 'Witty', 'Lucky', 'Zany'];
const animals = ['Tiger', 'Panda', 'Otter', 'Eagle', 'Penguin', 'Koala', 'Fox', 'Shark', 'Bear', 'Cat'];
const avatarEmojis = ['🐯', '🐼', '🦊', '🦈', '🐻', '🐧', '🦅', '🐨', '🐱', '🦦'];

function makeRandomNameAndEmoji() {
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const animal = animals[Math.floor(Math.random() * animals.length)];
  const number = Math.floor(Math.random() * 90) + 10;
  const name = `${adj}${animal}${number}`;
  const emoji = avatarEmojis[Math.floor(Math.random() * avatarEmojis.length)];
  return { name, emoji };
}

async function ensureUserProfile(uid) {
  try {
    const ref = doc(db, 'userProfiles', uid);
    const snap = await getDoc(ref);

    if (snap.exists()) {
      const data = snap.data();
      return {
        funnyName: data.funnyName || data.name || data.displayName || `${uid.slice(0, 6)}`,
        avatar: data.avatar || data.emoji || '🙂',
      };
    } else {
      const { name, emoji } = makeRandomNameAndEmoji();
      await setDoc(ref, { funnyName: name, avatar: emoji }, { merge: true });
      return { funnyName: name, avatar: emoji };
    }
  } catch (err) {
    console.error('ensureUserProfile error', err);
    return { funnyName: `${uid.slice(0, 6)}`, avatar: '🙂' };
  }
}

export default function DiskusiPage() {
  const [messages, setMessages] = useState([]);
  const [user, setUser] = useState(null);
  const [input, setInput] = useState('');
  const [profiles, setProfiles] = useState({});
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const activeChannel = 'general';

  useEffect(() => {
    initAuth();
    const unsub = listenAuth(async (loggedInUser) => {
      setUser(loggedInUser);
      if (loggedInUser) {
        const profile = await ensureUserProfile(loggedInUser.uid);
        setProfiles(prev => ({ ...prev, [loggedInUser.uid]: profile }));
      }
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const q = getMessagesQuery1(activeChannel);
    const unsub = onSnapshot(q, async (snapshot) => {
      const docs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      setMessages(docs);

      const uids = Array.from(new Set(docs.map(m => m.uid).filter(Boolean)));
      const missing = uids.filter(uid => !profiles[uid]);

      if (missing.length > 0) {
        const results = await Promise.all(missing.map(uid => ensureUserProfile(uid)));
        const map = {};
        missing.forEach((uid, idx) => {
          map[uid] = results[idx];
        });
        setProfiles(prev => ({ ...prev, ...map }));
      }
    });
    return () => unsub();
  }, [activeChannel]);

  const handleSend = async (extraData = {}) => {
    if ((!input.trim() && !extraData.imageUrl) || !user) return;

    if (containsBlockedWord(input)) {
      alert('Pesan mengandung kata yang tidak diperbolehkan.');
      return;
    }

    if (!profiles[user.uid]) {
      const p = await ensureUserProfile(user.uid);
      setProfiles(prev => ({ ...prev, [user.uid]: p }));
    }

    const senderProfile = profiles[user.uid] || (await ensureUserProfile(user.uid));

    await sendMessage1(activeChannel, {
      text: input ? filterMessage(input.trim()) : '',
      uid: user.uid,
      senderName: senderProfile.funnyName,
      avatar: senderProfile.avatar,
      reactions: {},
      imageUrl: extraData.imageUrl || null,
      timestamp: serverTimestamp(),
    });

    setInput('');
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleReaction = async (msgId, emoji) => {
    if (!user) return;
    await toggleReaction1(activeChannel, msgId, emoji, user.uid);
  };

  const handleEmojiSelect = (emoji) => {
    setInput(prev => prev + emoji.native);
    setShowEmojiPicker(false);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      const imgRef = storageRef(storage, `chatImages/${Date.now()}-${file.name}`);
      await uploadBytes(imgRef, file);
      const url = await getDownloadURL(imgRef);

      await handleSend({ imageUrl: url });
    } catch (err) {
      console.error('Upload image error:', err);
    } finally {
      setUploadingImage(false);
    }
  };

  return (
    <main>
      <div className="min-h-screen bg-gradient-to-br from-[#3061F2] via-white to-[#F2BF27]/10 text-gray-800">
        <div className="flex flex-col h-screen bg-[#EAF0FA] text-black font-sans">
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

          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
            {messages.map((msg) => {
              const profile = profiles[msg.uid] || { funnyName: msg.senderName || 'Anon', avatar: msg.avatar || '🙂' };
              return (
                <div key={msg.id} className="flex flex-col gap-2 bg-white rounded-xl shadow p-4 hover:shadow-md transition">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-[#F28907] flex items-center justify-center text-lg shadow">
                      {profile.avatar}
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">
                        <span className="font-semibold text-black">
                          {profile.funnyName}
                        </span>{' '}
                        {msg.timestamp?.toDate?.().toLocaleString?.() ?? '...'}
                      </p>
                      {msg.text && <p className="text-gray-800">{filterMessage(msg.text)}</p>}
                      {msg.imageUrl && (
                        <div className="mt-2">
                          <Image src={msg.imageUrl} alt="Sent image" width={200} height={200} className="rounded-lg" />
                        </div>
                      )}
                    </div>
                  </div>
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
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          <div className="bg-white/80 backdrop-blur-md px-6 py-4 border-t border-[#F2BF27] relative">
{showEmojiPicker && (
  <div className="absolute bottom-16 left-0 z-50">
    <Picker
      data={data}
      onEmojiSelect={(emoji) => {
        setInput(prev => prev + emoji.native);
        setShowEmojiPicker(false);
      }}
      theme="light"
    />
  </div>
)}

            <div className="flex items-center gap-3">
              <button
                className="text-[#3061F2] hover:text-[#F2780C] transition"
                onClick={() => fileInputRef.current.click()}
                disabled={uploadingImage}
              >
                <ImageIcon className="w-5 h-5" />
              </button>
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={handleImageUpload}
              />
              <button
                className="text-[#3061F2] hover:text-[#F2780C] transition"
                onClick={() => setShowEmojiPicker(prev => !prev)}
              >
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
                onClick={() => handleSend()}
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

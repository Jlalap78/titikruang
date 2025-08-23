'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Send, Smile } from 'lucide-react';
import Picker from '@emoji-mart/react';
import data from '@emoji-mart/data';

import {
  initAuth,
  listenAuth,
  toggleReplyReaction1,
  listenReplies1,
  sendReply1,
} from '../../../../lib/firebase';

import { db } from '../../../../lib/firebase';
import { doc, getDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { filterMessage } from '../../../../lib/filterMessage';
import styles from './page.module.css';

// helper untuk UID anonymous yang disimpan di localStorage
function getOrCreateAnonUid() {
  try {
    if (typeof window === 'undefined') return 'anon_offline';
    let id = localStorage.getItem('anonUid');
    if (!id) {
      id = 'anon_' + Math.random().toString(36).slice(2, 9);
      localStorage.setItem('anonUid', id);
    }
    return id;
  } catch {
    return 'anon_offline';
  }
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
    }
    return { funnyName: `${uid.slice(0, 6)}`, avatar: '🙂' };
  } catch {
    return { funnyName: `${uid.slice(0, 6)}`, avatar: '🙂' };
  }
}

export default function ReplyPage() {
  const { id } = useParams(); // messageId
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [parent, setParent] = useState(null);
  const [replies, setReplies] = useState([]);
  const [profiles, setProfiles] = useState({});
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [showAllReplies, setShowAllReplies] = useState(false);
  const endRef = useRef(null);

  const channelId = 'general';
  // tidak lagi memaksa login untuk melihat / berinteraksi
  const isGuest = false;

  // auth
  useEffect(() => {
    initAuth();
    const unsub = listenAuth(async (u) => {
      setUser(u || null);
      if (u) {
        const p = await ensureUserProfile(u.uid);
        setProfiles(prev => ({ ...prev, [u.uid]: p }));
      }
    });
    return () => unsub();
  }, []);

  // parent message realtime
  useEffect(() => {
    const ref = doc(db, 'channels', channelId, 'messages', id);
    const unsub = onSnapshot(ref, async (snap) => {
      if (snap.exists()) {
        const data = { id: snap.id, ...snap.data() };
        setParent(data);
        if (data.uid && !profiles[data.uid]) {
          const p = await ensureUserProfile(data.uid);
          setProfiles(prev => ({ ...prev, [data.uid]: p }));
        }
      } else {
        setParent(null);
      }
    });
    return () => unsub();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // replies realtime
  useEffect(() => {
    const unsub = listenReplies1(channelId, id, async (list) => {
      setReplies(list);
      const uids = Array.from(new Set(list.map(r => r.uid).filter(Boolean)));
      const missing = uids.filter(uid => !profiles[uid]);
      if (missing.length > 0) {
        const results = await Promise.all(missing.map(uid => ensureUserProfile(uid)));
        const map = {};
        missing.forEach((uid, idx) => (map[uid] = results[idx]));
        setProfiles(prev => ({ ...prev, ...map }));
      }
    });
    return () => unsub && unsub();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // auto-scroll
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [replies.length]);

  const handleSendReply = async () => {
    if (sending) {
      return;
    }
    const text = input.trim();
    if (!text) return;

    setSending(true); // Mulai loading

    const actorUid = user?.uid || getOrCreateAnonUid();
    const userProfile = profiles[actorUid] || { funnyName: user?.displayName || actorUid.slice(0,6), avatar: '🙂' };

    // ensure anon profile stored locally for display
    if (!profiles[actorUid]) {
      setProfiles(prev => ({ ...prev, [actorUid]: userProfile }));
    }

    try {
      await sendReply1(channelId, id, {
        text: filterMessage(text),
        uid: actorUid,
        senderName: userProfile.funnyName,
        avatar: userProfile.avatar,
        imageUrl: null,
        timestamp: serverTimestamp(),
      });
      setInput('');
    } catch (e) {
      console.error(e);
      alert('Gagal mengirim balasan');
    }
    setSending(false); // Selesai loading
  };

  const handleReplyReaction = async (replyId, emoji) => {
    try {
      const actor = user?.uid || getOrCreateAnonUid();
      await toggleReplyReaction1(channelId, id, replyId, emoji, actor);
    } catch (e) {
      console.error(e);
    }
  };

  // Emoji select handler
  const handleEmojiSelect = (emoji) => {
    const char = emoji.native || emoji.emoji || '';
    setInput(prev => prev + char);
    setShowEmojiPicker(false);
  };

  const parentProfile = parent?.uid ? (profiles[parent.uid] || { funnyName: 'Anon', avatar: '🙂' }) : { funnyName: 'Anon', avatar: '🙂' };

  // Ambil balasan dengan reaksi terbanyak
  const sortedReplies = replies
    .slice()
    .sort((a, b) => {
      const aCount = Object.values(a.reactions || {}).reduce((sum, arr) => sum + arr.length, 0);
      const bCount = Object.values(b.reactions || {}).reduce((sum, arr) => sum + arr.length, 0);
      return bCount - aCount;
    });

  const visibleReplies = showAllReplies ? sortedReplies : sortedReplies.slice(0, 2);

  return (
    <main>
      {/* Konten utama (popup login dihapus) */}
      <div>
        <div className="min-h-screen bg-[#EAF0FA]">
          <div className="max-w-2xl mx-auto p-4">
            <div className="flex items-center justify-between mb-4">
              <Link href="/ruang" className="text-[#3061F2] hover:underline">← Kembali</Link>
              <div className="text-sm text-gray-500">Thread</div>
            </div>

            {/* Parent message */}
            {parent ? (
              <div className="bg-white rounded-xl shadow p-4 mb-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#F28907] flex items-center justify-center text-lg">
                    {parentProfile.avatar}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-500 mb-1">
                      <span className="font-semibold text-black">{parentProfile.funnyName}</span>{' '}
                      {parent.timestamp?.toDate?.().toLocaleString?.() ?? '...'}
                    </p>
                    {parent.text && <p className="text-gray-800">{filterMessage(parent.text)}</p>}
                    {parent.imageUrl && (
                      <div className="mt-2">
                        <Image src={parent.imageUrl} alt="image" width={400} height={400} className="rounded-lg object-cover" unoptimized />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-sm text-gray-500 mb-4">Pesan tidak ditemukan.</div>
            )}

            {/* Replies list */}
            <div className="space-y-3 mt-4">
              {visibleReplies.length === 0 && (
                <div className="text-sm text-gray-500">Belum ada balasan.</div>
              )}
              {visibleReplies.map((rep) => {
                const p = rep.uid ? (profiles[rep.uid] || { funnyName: 'Anon', avatar: '🙂' }) : { funnyName: 'Anon', avatar: '🙂' };
                const rReactions = rep.reactions || {};
                return (
                  <div key={rep.id} className="p-3 rounded-xl bg-gray-100 flex flex-col shadow">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#F2BF27]/60 flex items-center justify-center text-base">
                        {p.avatar}
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-gray-500">
                          <span className="font-semibold text-black">{p.funnyName}</span>{' '}
                          {rep.timestamp?.toDate?.().toLocaleString?.() ?? '...'}
                        </p>
                        {rep.text && <p className="text-sm text-gray-800">{filterMessage(rep.text)}</p>}

                        {/* reactions */}
                        <div className="flex items-center gap-2 pt-1">
                          {['👍', '❤', '😥'].map((emoji) => {
                            const actor = user?.uid || getOrCreateAnonUid();
                            const arr = rep.reactions?.[emoji] || [];
                            const hasReacted = arr.includes(actor);
                            const count = arr.length;
                            return (
                              <button
                                key={emoji}
                                onClick={() => handleReplyReaction(rep.id, emoji)}
                                className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border transition ${hasReacted
                                  ? 'bg-[#3061F2] text-white border-[#3061F2]'
                                  : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                                  }`}
                                title="Reaksi balasan"
                              >
                                {emoji}
                                {count > 0 && <span>{count}</span>}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              {!showAllReplies && sortedReplies.length > 2 && (
                <div className="text-center mt-2">
                  <button
                    className="text-xs text-blue-600 hover:underline"
                    onClick={() => setShowAllReplies(true)}
                  >
                    Lihat lebih lanjut →
                  </button>
                </div>
              )}
              <div ref={endRef} />
            </div>

            {/* Composer */}
            <div className="mt-4 bg-white rounded-xl shadow p-3 flex items-center gap-2">
              <div className="flex items-center gap-2 w-full">
                <button
                  className="text-[#3061F2] hover:text-[#F2780C] transition"
                  onClick={() => setShowEmojiPicker(prev => !prev)}
                  title="Pilih emoji"
                >
                  <Smile className="w-5 h-5" />
                </button>
                {showEmojiPicker && (
                  <div className="absolute z-50">
                    <Picker
                      data={data}
                      onEmojiSelect={handleEmojiSelect}
                      theme="light"
                    />
                  </div>
                )}
                <input
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder={'Tulis balasan...'}
                  className={`flex-1 px-4 py-3 text-sm rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#27A4F2]`}
                  style={{ minWidth: 0, width: '100%' }} // agar responsif dan panjang
                  onKeyDown={e => {
                    if (e.key === 'Enter') handleSendReply();
                  }}
                />
                <button
                  onClick={handleSendReply}
                  disabled={sending}
                  className={`bg-[#3061F2] hover:bg-[#27A4F2] text-white px-4 py-3 rounded-lg transition flex items-center justify-center ${sending ? 'opacity-60 cursor-not-allowed' : ''}`}
                  title={sending ? 'Mengirim...' : 'Kirim balasan'}
                >
                  {sending ? (
                    <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}



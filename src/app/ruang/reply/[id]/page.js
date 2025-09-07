'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Send, Smile, Pencil, Trash2 } from 'lucide-react';
import Picker from '@emoji-mart/react';
import data from '@emoji-mart/data';

import {
  initAuth,
  listenAuth,
  toggleReplyReaction1,
  listenReplies1,
  sendReply1,
  updateReply1,
  deleteReply1,
} from '../../../../lib/firebase';

import { db } from '../../../../lib/firebase';
import { doc, getDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { filterMessage } from '../../../../lib/filterMessage';
import styles from './page.module.css';

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
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [sending, setSending] = useState(false);
  const [showAllReplies, setShowAllReplies] = useState(false);
  const [editingReplyId, setEditingReplyId] = useState(null);
  const [replyEditText, setReplyEditText] = useState('');
  const endRef = useRef(null);

  const channelId = 'general';
  const isGuest = !user || user.isAnonymous;

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

  // Setelah user state didapat
  useEffect(() => {
    if (user && user.isAnonymous) {
      setShowLoginPopup(true);
    } else {
      setShowLoginPopup(false);
    }
  }, [user]);

  const handleSendReply = async () => {
    if (isGuest || sending) {
      alert('Hanya user login non-anonymous yang bisa reply');
      return;
    }
    const text = input.trim();
    if (!text) return;

    setSending(true); // Mulai loading

    const userProfile = profiles[user.uid] || { funnyName: user.displayName || 'Anon', avatar: '🙂' };

    try {
      await sendReply1(channelId, id, {
        text: filterMessage(text),
        uid: user.uid,
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
      const actor = user?.uid;
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
      {/* Overlay dan popup jika anonymous */}
      {showLoginPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-8 flex flex-col items-center gap-4 animate-fade-in">
            <div className="text-5xl">🔒</div>
            <div className="text-xl font-semibold text-gray-800 mb-2">Harap Login untuk Comment</div>
            <div className="text-sm text-gray-500 mb-4 text-center">
              Untuk berkomentar dan membalas thread, silakan login terlebih dahulu.<br />
              Fitur ini hanya tersedia untuk user yang sudah login.
            </div>
            <Link href="/login">
              <button className="bg-[#3061F2] hover:bg-[#27A4F2] text-white px-6 py-2 rounded-xl font-bold shadow transition">
                Login Sekarang
              </button>
            </Link>
            <Link href="/ruang">
              <button className="mt-2 text-[#3061F2] hover:underline bg-transparent px-6 py-2 rounded-xl font-bold transition shadow-none">
                Kembali
              </button>
            </Link>
          </div>
        </div>
      )}

      {/* Konten utama */}
      <div className={showLoginPopup ? 'pointer-events-none blur-sm select-none' : ''}>
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
                  <div
                    key={rep.id}
                    className="group p-3 rounded-xl bg-white flex flex-col shadow hover:shadow-md transition"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-base ring-2 ring-offset-2 ring-yellow-300/40">
                        {p.avatar}
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-gray-500 flex items-center gap-2">
                          <span className="font-semibold text-black">{p.funnyName}</span>
                          <span>{rep.timestamp?.toDate?.().toLocaleString?.() ?? '...'}</span>
                          {rep.editedAt && (
                            <span className="text-[10px] italic text-gray-400">(edited)</span>
                          )}
                        </p>

                        {editingReplyId === rep.id ? (
                          <div className="space-y-2 mt-1">
                            <textarea
                              className="w-full border rounded p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                              value={replyEditText}
                              onChange={(e) => setReplyEditText(e.target.value)}
                              rows={2}
                            />
                            <div className="flex gap-2 text-xs">
                              <button
                                onClick={async () => {
                                  if (!replyEditText.trim()) return;
                                  await updateReply1(channelId, id, rep.id, {
                                    text: filterMessage(replyEditText.trim()),
                                    editedAt: serverTimestamp(),
                                  });
                                  setEditingReplyId(null);
                                  setReplyEditText('');
                                }}
                                className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                              >Save</button>
                              <button
                                onClick={() => { setEditingReplyId(null); setReplyEditText(''); }}
                                className="px-3 py-1 bg-gray-200 rounded-md hover:bg-gray-300"
                              >Cancel</button>
                            </div>
                          </div>
                        ) : (
                          <p className="text-sm text-gray-800 mt-1">{filterMessage(rep.text)}</p>
                        )}

                        {/* reactions */}
                        <div className="flex items-center gap-2 pt-2">
                          {['👍', '😂', '🔥'].map((emoji) => {
                            const actor = user?.uid;
                            const arr = rep.reactions?.[emoji] || [];
                            const hasReacted = arr.includes(actor);
                            const count = arr.length;
                            return (
                              <button
                                key={emoji}
                                onClick={() => handleReplyReaction(rep.id, emoji)}
                                className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border transition ${hasReacted
                                  ? 'bg-[#3061F2] text-white border-[#3061F2]'
                                  : 'bg-gray-50 text-gray-700 border-gray-300 hover:bg-gray-100'
                                  }`}
                                title="Reaksi balasan"
                              >
                                {emoji}
                                {count > 0 && <span>{count}</span>}
                              </button>
                            );
                          })}
                        </div>

                        {/* actions (edit/delete) */}
                        {!editingReplyId && user && !user.isAnonymous && rep.uid === user.uid && (
                          <div className="opacity-0 group-hover:opacity-100 flex gap-2 mt-2 text-xs transition">
                            <button
                              onClick={() => { setEditingReplyId(rep.id); setReplyEditText(rep.text || ''); }}
                              className="flex items-center gap-1 text-blue-500 hover:underline"
                            >
                              <Pencil className="w-3 h-3" /> Edit
                            </button>
                            <button
                              onClick={async () => {
                                if (!confirm('Hapus balasan ini?')) return;
                                await deleteReply1(channelId, id, rep.id);
                              }}
                              className="flex items-center gap-1 text-red-500 hover:underline"
                            >
                              <Trash2 className="w-3 h-3" /> Delete
                            </button>
                          </div>
                        )}
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
                  disabled={isGuest}
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
                  placeholder={isGuest ? '🔒 Login untuk membalas' : 'Tulis balasan...'}
                  readOnly={isGuest}
                  className={`flex-1 px-4 py-3 text-sm rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#27A4F2] ${isGuest ? 'opacity-60 cursor-not-allowed' : ''}`}
                  style={{ minWidth: 0, width: '100%' }}
                  onKeyDown={e => {
                    if (e.key === 'Enter') handleSendReply();
                  }}
                />
                <button
                  onClick={handleSendReply}
                  disabled={isGuest || sending}
                  className={`bg-[#3061F2] hover:bg-[#27A4F2] text-white px-4 py-3 rounded-lg transition flex items-center justify-center ${isGuest || sending ? 'opacity-60 cursor-not-allowed' : ''}`}
                  title={isGuest ? '🔒 Login untuk membalas' : (sending ? 'Mengirim...' : 'Kirim balasan')}
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
